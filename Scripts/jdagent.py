import os
import json
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
from difflib import get_close_matches

# Load environment variables
load_dotenv()

# Initialize APIs
openai_key = os.getenv("OPENAI_API_KEY")
groq_key = os.getenv("XAI_GROQ_API")
pinecone_key = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")

openai_client = OpenAI(api_key=openai_key)
groq_client = OpenAI(api_key=groq_key, base_url="https://api.groq.com/openai/v1")
pinecone_client = Pinecone(api_key=pinecone_key)
index = pinecone_client.Index(pinecone_index)
EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

DEFAULT_CATEGORIES = ["interview_qa", "skills", "projects", "experience", "certifications"]
MAX_CONTEXT = 5


class JobAwareAgent:
    def __init__(self, qa_csv_path):
        self.qa_df = pd.read_csv(qa_csv_path)

    def get_embedding(self, text):
        response = openai_client.embeddings.create(input=text, model=EMBEDDING_MODEL)
        return response.data[0].embedding

    def plan_retrieval(self, question, jd_text=None):
        system_prompt = (
            "You are a retrieval planner for an interview assistant.\n"
            "Given a candidate question and optional job description, decide:\n"
            "1. Which knowledge-base categories to search (choose from: interview_qa, skills, projects, experience, certifications).\n"
            "2. Which keywords or themes to emphasise during retrieval.\n"
            "3. Whether we are missing critical info and should ask the user to provide more context before answering.\n"
            "Respond as a JSON object like: {\"categories\": [...], \"keywords\": \"text\", \"needs_additional_context\": false, \"reasoning\": \"...\"}."
        )
        user_input = {
            "question": question,
            "job_description": jd_text or ""
        }
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_input, ensure_ascii=False)}
        ]
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=200,
                temperature=0.2,
            )
            content = completion.choices[0].message.content.strip()
            plan = json.loads(content)
        except Exception as exc:  # Fallback if parsing fails
            plan = {
                "categories": DEFAULT_CATEGORIES,
                "keywords": question,
                "needs_additional_context": False,
                "reasoning": f"Fallback plan due to error: {exc}"
            }
        categories = plan.get("categories") or DEFAULT_CATEGORIES
        plan["categories"] = [cat.strip().lower() for cat in categories if cat]
        plan.setdefault("keywords", question)
        plan.setdefault("needs_additional_context", False)
        plan.setdefault("reasoning", "")
        return plan

    def query_pinecone(self, embedding, categories, top_k=5):
        try:
            result = index.query(
                vector=embedding,
                top_k=top_k,
                include_metadata=True,
                filter={"category": {"$in": categories}},
            )
        except Exception:
            return []

        matches = []
        for match in result.get("matches", []):
            metadata = match.get("metadata", {})
            matches.append({
                "id": match.get("id"),
                "score": match.get("score", 0.0),
                "category": metadata.get("category", "unknown"),
                "data_text": metadata.get("data_text", ""),
                "hash": metadata.get("hash"),
            })
        return matches

    def blended_retrieval(self, user_question, jd_text, categories):
        queries = [
            user_question,
            "\n".join(filter(None, [jd_text, user_question]))
        ]
        all_matches = {}
        for query_text in queries:
            if not query_text:
                continue
            embedding = self.get_embedding(query_text)
            results = self.query_pinecone(embedding, categories, top_k=MAX_CONTEXT)
            for res in results:
                match_id = res.get("id")
                if not match_id:
                    continue
                existing = all_matches.get(match_id)
                if not existing or res["score"] > existing["score"]:
                    all_matches[match_id] = res
        matches = sorted(all_matches.values(), key=lambda r: r.get("score", 0.0), reverse=True)
        if len(matches) < 3 and set(categories) != set(DEFAULT_CATEGORIES):
            broadened = self.query_pinecone(
                self.get_embedding(user_question or (jd_text or "")),
                DEFAULT_CATEGORIES,
                top_k=MAX_CONTEXT
            )
            for res in broadened:
                match_id = res.get("id")
                if not match_id:
                    continue
                existing = all_matches.get(match_id)
                if not existing or res["score"] > existing["score"]:
                    all_matches[match_id] = res
            matches = sorted(all_matches.values(), key=lambda r: r.get("score", 0.0), reverse=True)
        return matches[:MAX_CONTEXT]

    def retrieve_qa(self, question, keywords=None):
        if keywords:
            candidates = get_close_matches(question, self.qa_df["Question"].tolist(), n=1, cutoff=0.3)
            if candidates:
                match = self.qa_df[self.qa_df["Question"] == candidates[0]]
                if not match.empty:
                    return match["Answer"].values[0]
        matched = self.qa_df[self.qa_df["Question"].str.lower().str.contains(question.lower())]
        return matched["Answer"].values[0] if not matched.empty else ""

    def grok_completion(self, prompt, max_tokens=300, temperature=0.7):
        messages = [
            {"role": "system", "content": "You are a job-aware assistant that crafts tailored answers using candidate profile and job description."},
            {"role": "user", "content": prompt}
        ]
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return completion.choices[0].message.content.strip()

    def chatgpt_completion(self, prompt, max_tokens=500, temperature=0.7):
        messages = [
            {"role": "system", "content": (
                "You are Bhushan Mahajan's AI representative. Respond in first person as Bhushan,"
                " stay professional, JD-aware, and ground every statement in the supplied evidence."
            )},
            {"role": "user", "content": prompt}
        ]
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content.strip()

    def generate_response(self, user_question, jd_text=None):
        plan = self.plan_retrieval(user_question, jd_text)
        categories = plan.get("categories", DEFAULT_CATEGORIES)
        embed_space_input = "\n".join(filter(None, [jd_text, user_question, plan.get("keywords")]))
        query_embedding = self.get_embedding(embed_space_input)
        profile_contexts = self.blended_retrieval(user_question, jd_text, categories)
        context_block = "\n".join(
            f"- ({ctx['category']} | score {ctx['score']:.3f}) {ctx['data_text']}"
            for ctx in profile_contexts
            if ctx.get("data_text")
        )
        matched_answer = self.retrieve_qa(user_question)
        prompt = (
            f"Job Description (optional):\n{jd_text or 'N/A'}\n\n"
            f"Retrieval Plan Reasoning: {plan.get('reasoning', '')}\n"
            f"Needs Additional Context: {plan.get('needs_additional_context')}\n"
            f"Candidate Profile Context:\n{context_block or 'None found'}\n\n"
            f"User Question: {user_question}\n\n"
            f"Personalized Answer (if any): {matched_answer or 'N/A'}\n\n"
            f"Provide a JD-aware, category-relevant, professional response."
        )
        return self.grok_completion(prompt)

    def generate_chatgpt_response(self, user_question, jd_text=None):
        plan = self.plan_retrieval(user_question, jd_text)
        categories = plan.get("categories", DEFAULT_CATEGORIES)
        embed_space_input = "\n".join(filter(None, [jd_text, user_question, plan.get("keywords")]))
        query_embedding = self.get_embedding(embed_space_input)
        profile_contexts = self.blended_retrieval(user_question, jd_text, categories)
        matched_answer = self.retrieve_qa(user_question, plan.get("keywords"))

        context_summary = "\n".join(
            f"{idx+1}. ({ctx['category']}, score {ctx['score']:.3f}) {ctx['data_text']}"
            for idx, ctx in enumerate(profile_contexts)
            if ctx.get("data_text")
        )

        instructions = (
            "Role: You are Bhushan Mahajan answering directly in first person for interview-style questions.\n"
            f"Planner focus: categories={', '.join(categories)} | keywords={plan.get('keywords', '')} | needs_more={plan.get('needs_additional_context')}\n"
            f"Evidence:\n{context_summary or 'No matching evidence retrieved.'}\n"
            f"Interview QA:\n{matched_answer or 'No direct QA match.'}\n"
            "Guidelines:\n- Lead with a direct answer grounded in evidence.\n"
            "- Mention relevant projects/skills if they appear above.\n"
            "- If evidence is missing, ask for the missing detail before concluding.\n"
            "- Stay under 160 words, professional tone, first-person.\n"
            "- Finish with `Confidence: High/Medium/Low` based on evidence strength.\n"
            f"Question: {user_question}\n"
            f"Job Description: {jd_text or 'Not provided.'}"
        )
        return self.chatgpt_completion(instructions)

# Example usage:
# if __name__ == "__main__":
#     agent = JobAwareAgent("interview_questions_cleaned.csv")
#     jd = """At Scale, our mission is to accelerate the development of AI applications. For 8 years, Scale has been the leading AI data foundry, helping fuel the most exciting advancements in AI, including: generative AI, defense applications, and autonomous vehicles. With our recent Series F round, we’re accelerating the abundance of frontier data to pave the road to Artificial General Intelligence (AGI), and building upon our prior model evaluation work with enterprise customers and governments, to deepen our capabilities and offerings for both public and private evaluations.
#     Example Projects:
#     Ship tools to accelerate the growth of new qualified contributors on Scale’s labeling platform
#     Build methodical fraud-detection systems to remove bad actors and keep Scale’s contributor base safe and trusted. 
#     Use models to estimate the quality of tasks and labelers, and guarantee quality on requests at large scale.
#     Devise advanced matching algorithms to match labelers to customers for optimal turnaround and accuracy.
#     Build methods to automatically measure, train, and optimally match labelers to tasks based on performance
#     Create optimized and efficient UI/UX tooling, in combination with ML algorithms, for 100k+ labelers to complete billions of complex tasks
#     Develop new AI infrastructure products to visualize, query, and explore Scale data
    
#     Requirements:
#     A graduation date in Fall 2024 or Spring 2025 with a Bachelor’s degree (or equivalent) in a relevant field (Computer Science, EECS, Computer Engineering, Statistics) 
#     Product engineering experience such as building web apps full-stack, integrating with relevant APIs and services, talking to customers, figuring out ‘what’ to build and then iterating
#     Previous Computer Science/Software Engineering Internship experience 
#     Track record of shipping high-quality products and features at scale
#     Experience building systems that process large volumes of data
#     Experience with Python, React, typescript and/or MongoDB
#     Compensation packages at Scale for eligible roles include base salary, equity, and benefits. The range displayed on each job posting reflects the minimum and maximum target for new hire salaries for the position, determined by work location and additional factors, including job-related skills, experience, interview performance, and relevant education or training. Scale employees in eligible roles are also granted equity based compensation, subject to Board of Director approval. Your recruiter can share more about the specific salary range for your preferred location during the hiring process, and confirm whether the hired role will be eligible for equity grant. You’ll also receive benefits including, but not limited to: Comprehensive health, dental and vision coverage, retirement benefits, a learning and development stipend, and generous PTO. Additionally, this role may be eligible for additional benefits such as a commuter stipend.

#     Please reference the job posting's subtitle for where this position will be located. For pay transparency purposes, the base salary range for this full-time position in the locations of San Francisco, New York, Seattle is:
#     $124,000—$145,000 USD"""
#     response = agent.generate_response(jd, "What is your experience with AI?")
#     # print(agent.generate_response(jd, "Tell me about yourself"))
#     print("\n🤖 Response:")
#     print(response)

#Exposing API to be accessed.

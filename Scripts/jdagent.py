import os
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone

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


class JobAwareAgent:
    def __init__(self, qa_csv_path):
        self.qa_df = pd.read_csv(qa_csv_path)

    def get_embedding(self, text):
        response = openai_client.embeddings.create(input=text, model="text-embedding-3-large")
        return response.data[0].embedding

    def infer_categories(self, question, jd_text=None):
        system_prompt = (
            "You are an AI assistant that maps a question (and optional job description) to relevant categories. "
            "Choose from: interview_qa, skills, projects, experience, certifications. Return a comma-separated list."
        )
        user_input = f"Question: {question}\n\nJob Description: {jd_text or 'None'}"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=50,
        )
        categories = completion.choices[0].message.content.strip()
        return [cat.strip().lower() for cat in categories.replace("\n", ",").split(",") if cat.strip()]

    def query_pinecone(self, embedding, categories, top_k=5):
        result = index.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True,
            filter={"category": {"$in": categories}}
        )
        return [match["metadata"]["data_text"] for match in result.get("matches", [])]

    def retrieve_qa(self, question):
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

    def generate_response(self, user_question, jd_text=None):
        # Step 1: Infer relevant categories based on question (and JD if available)
        categories = self.infer_categories(user_question, jd_text)

        # Step 2: Use JD or fallback to question for vector search
        embed_input = jd_text if jd_text else user_question
        query_embedding = self.get_embedding(embed_input)

        # Step 3: Retrieve from Pinecone using inferred categories
        profile_contexts = self.query_pinecone(query_embedding, categories, top_k=7)
        context_block = "\n".join(profile_contexts)

        # Step 4: Pull personalized answer from interview QA if applicable
        matched_answer = self.retrieve_qa(user_question)

        # Step 5: Construct and send to Groq LLM
        prompt = (
            f"Job Description (optional):\n{jd_text or 'N/A'}\n\n"
            f"Candidate Profile Context:\n{context_block}\n\n"
            f"User Question: {user_question}\n\n"
            f"Personalized Answer (if any): {matched_answer}\n\n"
            f"Provide a JD-aware, category-relevant, professional response."
        )
        return self.grok_completion(prompt)

# Example usage:
if __name__ == "__main__":
    agent = JobAwareAgent("interview_questions_cleaned.csv")
    jd = """At Scale, our mission is to accelerate the development of AI applications. For 8 years, Scale has been the leading AI data foundry, helping fuel the most exciting advancements in AI, including: generative AI, defense applications, and autonomous vehicles. With our recent Series F round, we’re accelerating the abundance of frontier data to pave the road to Artificial General Intelligence (AGI), and building upon our prior model evaluation work with enterprise customers and governments, to deepen our capabilities and offerings for both public and private evaluations.
    Example Projects:
    Ship tools to accelerate the growth of new qualified contributors on Scale’s labeling platform
    Build methodical fraud-detection systems to remove bad actors and keep Scale’s contributor base safe and trusted. 
    Use models to estimate the quality of tasks and labelers, and guarantee quality on requests at large scale.
    Devise advanced matching algorithms to match labelers to customers for optimal turnaround and accuracy.
    Build methods to automatically measure, train, and optimally match labelers to tasks based on performance
    Create optimized and efficient UI/UX tooling, in combination with ML algorithms, for 100k+ labelers to complete billions of complex tasks
    Develop new AI infrastructure products to visualize, query, and explore Scale data
    
    Requirements:
    A graduation date in Fall 2024 or Spring 2025 with a Bachelor’s degree (or equivalent) in a relevant field (Computer Science, EECS, Computer Engineering, Statistics) 
    Product engineering experience such as building web apps full-stack, integrating with relevant APIs and services, talking to customers, figuring out ‘what’ to build and then iterating
    Previous Computer Science/Software Engineering Internship experience 
    Track record of shipping high-quality products and features at scale
    Experience building systems that process large volumes of data
    Experience with Python, React, typescript and/or MongoDB
    Compensation packages at Scale for eligible roles include base salary, equity, and benefits. The range displayed on each job posting reflects the minimum and maximum target for new hire salaries for the position, determined by work location and additional factors, including job-related skills, experience, interview performance, and relevant education or training. Scale employees in eligible roles are also granted equity based compensation, subject to Board of Director approval. Your recruiter can share more about the specific salary range for your preferred location during the hiring process, and confirm whether the hired role will be eligible for equity grant. You’ll also receive benefits including, but not limited to: Comprehensive health, dental and vision coverage, retirement benefits, a learning and development stipend, and generous PTO. Additionally, this role may be eligible for additional benefits such as a commuter stipend.

    Please reference the job posting's subtitle for where this position will be located. For pay transparency purposes, the base salary range for this full-time position in the locations of San Francisco, New York, Seattle is:
    $124,000—$145,000 USD"""
    response = agent.generate_response(jd, "What is your experience with AI?")
    # print(agent.generate_response(jd, "Tell me about yourself"))
    print("\n🤖 Response:")
    print(response)
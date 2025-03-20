import os
import pandas as pd
import requests
import openai
from pinecone import Pinecone
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()

# Configure API keys and Pinecone settings
openai.api_key = os.getenv("OPENAI_API_KEY")  # Using OpenAI for embeddings
pinecone_api = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")

# Create a Pinecone client instance and get the index.
pc = Pinecone(api_key=pinecone_api)
index = pc.Index(pinecone_index)

# Configure Grok API details (Grok is used for LLM completions)
GROK_API_KEY = os.getenv("XAI_GROQ_API")
GROK_ENDPOINT = "https://api.x.ai/v1"  # Update if needed
grok_client = OpenAI(api_key=GROK_API_KEY, base_url="https://api.x.ai/v1")
def grok_completion(prompt, max_tokens=150, temperature=0.7):
    """
    Call the Grok API using the official client to generate a completion for the given prompt.
    """
    system_message = {
        "role": "system",
        "content": (
            "You are a personalized interview coach for Bhushan. "
            "You have extensive knowledge of [Your Industry/Technology] "
            "and understand the candidate's unique background, including projects, skills, and certifications. "
            "Provide thoughtful, professional, and tailored answers to interview questions, "
            "highlighting relevant experiences and strengths."
        )
    }
    user_message = {"role": "user", "content": prompt}
    completion = grok_client.chat.completions.create(
        model="grok-2-latest",  # Use the appropriate Grok model
        messages=[system_message, user_message],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return completion.choices[0].message.content

def get_embedding(text):
    """
    Compute an embedding using OpenAI's embedding API.
    """
    client = openai.OpenAI(api_key=openai.api_key)  # Ensure the correct client is used
    response = client.embeddings.create(input=text, model="text-embedding-3-large")
    embedding = response.data[0].embedding
    return embedding

def query_pinecone_context(question, top_k=3):
    """
    Query Pinecone to retrieve the most relevant context based on the question.
    """
    question_embedding = get_embedding(question)
    result = index.query(vector=question_embedding, top_k=top_k, include_metadata=True)
    contexts = []
    for match in result['matches']:
        contexts.append(match['metadata']['data_text'])
    combined_context = "\n".join(contexts)
    return combined_context

def generate_answer(question, additional_context=""):
    """
    Generate an initial answer using the Grok API.
    """
    prompt = (
        f"Based on my background and experience, answer the following interview question:\n\n"
        f"Question: {question}\n\n"
        f"Context: {additional_context}\n\n"
        "Answer:"
    )
    answer = grok_completion(prompt, max_tokens=150, temperature=0.7)
    return answer

def refine_answer(question, current_answer, user_description, additional_context=""):
    """
    Refine the answer using user-provided details and additional context via the Grok API.
    """
    prompt = (
        f"Here is an initial answer to the interview question:\n{current_answer}\n\n"
        f"The user has provided the following additional details: {user_description}\n\n"
        f"Question: {question}\n\n"
        f"Context: {additional_context}\n\n"
        "Please refine the answer incorporating these details:"
    )
    refined_answer = grok_completion(prompt, max_tokens=150, temperature=0.7)
    return refined_answer

def interactive_update(row):
    """
    Process one CSV row: if an answer exists, ask if you want to update it;
    if not, offer to generate one. Retrieve context from Pinecone and optionally
    allow custom context. Then generate/refine the answer interactively.
    """
    question = row['Question']
    existing_answer = row.get('answer', "").strip()
    
    print(f"\nProcessing question:\n{question}")
    
    if existing_answer:
        print("\nExisting answer:")
        print(existing_answer)
        update_choice = input("Do you want to update this answer? (yes/no): ").strip().lower()
        if update_choice == "no":
            return existing_answer
    else:
        generate_choice = input("No answer exists for this question. Do you want to generate one? (yes/no): ").strip().lower()
        if generate_choice == "no":
            return ""
    
    vector_context = query_pinecone_context(question)
    print("\nRetrieved context from Pinecone:")
    print(vector_context)
    
    custom_context = input("\nEnter any additional custom context for personalization (or press Enter to skip): ").strip()
    additional_context = vector_context
    if custom_context:
        additional_context += "\n" + custom_context
    
    if not existing_answer:
        current_answer = generate_answer(question, additional_context)
        print("\nGenerated answer:")
        print(current_answer)
    else:
        current_answer = existing_answer

    while True:
        refine_choice = input("\nDo you want to refine the answer? (yes/no): ").strip().lower()
        if refine_choice == "no":
            return current_answer
        elif refine_choice == "yes":
            user_description = input("Enter additional details for refining the answer: ").strip()
            refined_answer = refine_answer(question, current_answer, user_description, additional_context)
            print("\nRefined answer:")
            print(refined_answer)
            confirm = input("Do you accept this refined answer? (yes/no): ").strip().lower()
            if confirm == "yes":
                return refined_answer
            else:
                print("Let's try refining again with new input.")
        else:
            print("Please type 'yes' or 'no'.")

def process_csv(csv_file):
    """
    Load the CSV file, process each question interactively, and save the updated answers.
    """
    df = pd.read_csv(csv_file, encoding='latin1')
    if 'Answer' not in df.columns:
        df['Answer'] = ""
    
    for index, row in df.iterrows():
        print(f"\n--- Processing question {index + 1} of {len(df)} ---")
        updated_answer = interactive_update(row)
        df.at[index, 'Answer'] = updated_answer
    
    output_csv = "interview_questions_updated.csv"
    df.to_csv(output_csv, index=False)
    print(f"\nAll questions processed. Updated CSV saved as {output_csv}.")

def main():
    csv_file = "interview_questions.csv"  # Replace with your CSV file path if needed.
    process_csv(csv_file)

if __name__ == "__main__":
    main()

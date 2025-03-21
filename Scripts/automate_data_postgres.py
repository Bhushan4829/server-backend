# import os
# import pandas as pd
# import openai
# from pinecone import Pinecone
# from dotenv import load_dotenv
# from openai import OpenAI

# load_dotenv()

# # Configure API keys and Pinecone settings
# openai.api_key = os.getenv("OPENAI_API_KEY")  
# pinecone_api = os.getenv("PINECONE_API_KEY")
# pinecone_index = os.getenv("PINECONE_INDEX")

# # Create a Pinecone client instance and get the index.
# pc = Pinecone(api_key=pinecone_api)
# index = pc.Index(pinecone_index)

# # Configure Grok API details
# GROK_API_KEY = os.getenv("XAI_GROQ_API")
# GROK_ENDPOINT = "https://api.groq.com/openai/v1"

# if not GROK_API_KEY:
#     raise ValueError("Missing Grok API Key. Please set 'XAI_GROQ_API' in environment variables.")

# grok_client = OpenAI(api_key=GROK_API_KEY, base_url=GROK_ENDPOINT)

# def grok_completion(prompt, max_tokens=None, temperature=0.7):
#     """
#     Call the Grok API dynamically adjusting max_tokens.
#     """
#     if max_tokens is None:
#         max_tokens = min(300, len(prompt.split()) * 2)  

#     system_message = {
#         "role": "system",
#         "content": (
#             "You are a personalized interview coach for Bhushan. "
#             "You have expertise in AI, Data Engineering, and Business Intelligence. "
#             "Provide structured, concise, and tailored answers highlighting relevant skills and projects."
#         )
#     }
#     user_message = {"role": "user", "content": prompt}

#     completion = grok_client.chat.completions.create(
#         model="llama-3.3-70b-versatile",
#         messages=[system_message, user_message],
#         max_tokens=max_tokens,
#         temperature=temperature,
#     )

#     return completion.choices[0].message.content.strip()

# def check_completion(full_answer):
#     """
#     Detects if an answer seems incomplete and requests continuation.
#     """
#     if len(full_answer.split()) > 20 and not full_answer.strip().endswith(('.', '!', '?')):  
#         print("Detected incomplete answer. Requesting continuation...")
#         follow_up_prompt = f"Continue the response concisely:\n\n{full_answer}..."
#         continuation = grok_completion(follow_up_prompt, max_tokens=100)
#         full_answer += " " + continuation
#     return full_answer

# def get_embedding(text):
#     """
#     Compute an embedding using OpenAI's API.
#     """
#     response = openai.embeddings.create(input=text, model="text-embedding-3-large")
#     return response.data[0].embedding

# def query_pinecone_context(question, categories=None, top_k=3):
#     """
#     Retrieve relevant context from Pinecone based on the question, considering user-selected categories.
#     """
#     question_embedding = get_embedding(question)

#     # If categories are selected, filter results by categories
#     filter_conditions = {}
#     if categories:
#         filter_conditions = {"category": {"$in": categories}}  

#     result = index.query(vector=question_embedding, top_k=top_k, include_metadata=True, filter=filter_conditions)

#     contexts = [match['metadata']['data_text'] for match in result.get('matches', [])]

#     if not contexts:
#         return "No relevant context found."

#     return "\n".join(contexts)

# def generate_answer(question, additional_context=""):
#     """
#     Generate an interview answer using Grok.
#     """
#     prompt = (
#         f"Question: {question}\n\n"
#         f"Context: {additional_context}\n\n"
#         "Provide a structured, complete response:"
#     )
#     return check_completion(grok_completion(prompt))

# def refine_answer(question, current_answer, user_description, additional_context=""):
#     """
#     Refine an existing answer with additional details.
#     """
#     prompt = (
#         f"Refine this answer:\n{current_answer}\n\n"
#         f"Additional Details: {user_description}\n\n"
#         f"Question: {question}\n\n"
#         f"Context: {additional_context}\n\n"
#         "Provide a concise but complete improvement:"
#     )
#     return check_completion(grok_completion(prompt))

# def interactive_update(row):
#     """
#     Process one CSV row: Allow updating, generating, or refining an answer.
#     """
#     question = row['Question']
#     existing_answer = str(row.get('Answer', "")).strip()  # Convert to string to handle NaN

#     print(f"\nProcessing question:\n{question}")

#     if existing_answer:
#         print("\nExisting answer:")
#         print(existing_answer)
#         update_choice = input("Do you want to update this answer? (yes/no): ").strip().lower()
#         if update_choice == "no":
#             return existing_answer

#     generate_choice = input("Do you want to generate a new answer? (yes/no): ").strip().lower()
#     if generate_choice == "no":
#         return existing_answer if existing_answer else ""

#     # ✅ Ask user for categories
#     available_categories = ["projects", "experience", "certifications", "content", "skills"]
#     print(f"\nAvailable Categories: {', '.join(available_categories)}")
#     category_input = input("Select categories to prioritize (comma-separated, or press Enter for random): ").strip()

#     if category_input:
#         selected_categories = [c.strip() for c in category_input.split(",") if c.strip() in available_categories]
#     else:
#         selected_categories = None  # Random selection

#     vector_context = query_pinecone_context(question, categories=selected_categories)
#     print("\nRetrieved context from Pinecone:")
#     print(vector_context)

#     custom_context = input("\nEnter any additional custom context (or press Enter to skip): ").strip()
#     additional_context = f"{vector_context}\n{custom_context}" if custom_context else vector_context

#     current_answer = generate_answer(question, additional_context)
#     print("\nGenerated answer:")
#     print(current_answer)

#     while True:
#         refine_choice = input("\nDo you want to refine the answer? (yes/no): ").strip().lower()
#         if refine_choice == "no":
#             return current_answer
#         elif refine_choice == "yes":
#             user_description = input("Enter additional details for refining the answer: ").strip()
#             refined_answer = refine_answer(question, current_answer, user_description, additional_context)
#             print("\nRefined answer:")
#             print(refined_answer)
#             confirm = input("Do you accept this refined answer? (yes/no): ").strip().lower()
#             if confirm == "yes":
#                 return refined_answer
#             print("Let's refine again.")
#         else:
#             print("Please type 'yes' or 'no'.")

# def process_csv(csv_file):
#     """
#     Load a CSV file, process each question interactively, and save the updated answers.
#     """
#     df = pd.read_csv(csv_file, encoding='latin1')
#     if 'Answer' not in df.columns:
#         df['Answer'] = ""

#     for index, row in df.iterrows():
#         print(f"\n--- Processing question {index + 1} of {len(df)} ---")
#         updated_answer = interactive_update(row)
#         df.at[index, 'Answer'] = updated_answer

#     output_csv = "interview_questions_updated.csv"
#     df.to_csv(output_csv, index=False)
#     print(f"\nAll questions processed. Updated CSV saved as {output_csv}.")

# def main():
#     csv_file = "interview_questions.csv"
#     process_csv(csv_file)

# if __name__ == "__main__":
#     main()
import pandas as pd
# def clean_and_save_final_output(file_path="interview_questions_updated.csv", output_path="interview_questions_cleaned.csv"):
#     df = pd.read_csv(file_path)
    
#     # Remove rows with empty or NaN answers
#     df['Answer'] = df['Answer'].astype(str).str.strip()
#     df = df[~df['Answer'].isin(['', 'nan', 'NaN', 'None'])]

#     df.to_csv(output_path, index=False)
#     print(f"\n✅ Cleaned file saved as: {output_path}")

# # After all questions processed
# clean_and_save_final_output()
# df = pd.read_csv("interview_questions_cleaned.csv")
# df1 = pd.read_csv("interview_questions_updated.csv")
# print(sum(df["Answer"] == "nan"))
# print(sum(df1["Answer"] == "nan"))
# print(df["Answer"][65])
# print(df1["Answer"][65])
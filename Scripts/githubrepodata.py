# import requests
# import base64
# from dotenv import load_dotenv
# import os

# load_dotenv()  # Take environment variables from .env.

# def fetch_and_structure_repo_data(user):
#     token = os.getenv('GITHUB_TOKEN')  # Get the GitHub token from environment
#     base_url = "https://api.github.com"
#     headers = {'Authorization': f'token {token}'}
    
#     repos_response = requests.get(f"{base_url}/users/{user}/repos", headers=headers)
#     repositories = repos_response.json()

#     structured_data = []
    
#     for repo in repositories:
#         repo_data = {'name': repo['name'], 'description': repo['description'], 'readme': ''}
        
#         readme_response = requests.get(f"{base_url}/repos/{user}/{repo['name']}/readme", headers=headers)
#         readme_data = readme_response.json()

#         if 'content' in readme_data:
#             readme_content = base64.b64decode(readme_data['content']).decode('utf-8')
#             repo_data['readme'] = readme_content[:500]
        
#         structured_data.append(repo_data)

#     return structured_data

# # Example usage
# user = 'Bhushan4829'
# complete_repo_data = fetch_and_structure_repo_data(user)
# for repo in complete_repo_data:
#     print(f"Repo: {repo['name']}\nDescription: {repo['description']}\nREADME excerpt: {repo['readme']}\n")
import openai
from pinecone import Pinecone
from dotenv import load_dotenv
from openai import OpenAI
import os
load_dotenv()

# Configure API keys and Pinecone settings
openai.api_key = os.getenv("OPENAI_API_KEY")  
pinecone_api = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")

# Create a Pinecone client instance and get the index.
pc = Pinecone(api_key=pinecone_api)
index = pc.Index(pinecone_index)
query_result = index.query(vector=[0] * 3072, top_k=10, include_metadata=True)
for match in query_result['matches']:
    print(match['metadata'])

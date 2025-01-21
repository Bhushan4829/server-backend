import requests
import base64
from dotenv import load_dotenv
import os

load_dotenv()  # Take environment variables from .env.

def fetch_and_structure_repo_data(user):
    token = os.getenv('GITHUB_TOKEN')  # Get the GitHub token from environment
    base_url = "https://api.github.com"
    headers = {'Authorization': f'token {token}'}
    
    repos_response = requests.get(f"{base_url}/users/{user}/repos", headers=headers)
    repositories = repos_response.json()

    structured_data = []
    
    for repo in repositories:
        repo_data = {'name': repo['name'], 'description': repo['description'], 'readme': ''}
        
        readme_response = requests.get(f"{base_url}/repos/{user}/{repo['name']}/readme", headers=headers)
        readme_data = readme_response.json()

        if 'content' in readme_data:
            readme_content = base64.b64decode(readme_data['content']).decode('utf-8')
            repo_data['readme'] = readme_content[:500]
        
        structured_data.append(repo_data)

    return structured_data

# Example usage
user = 'Bhushan4829'
complete_repo_data = fetch_and_structure_repo_data(user)
for repo in complete_repo_data:
    print(f"Repo: {repo['name']}\nDescription: {repo['description']}\nREADME excerpt: {repo['readme']}\n")

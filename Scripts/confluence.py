# import requests



# # Replace with your Confluence URL and API token

# url = "https://bhushan4829.atlassian.net/wiki/rest/api/content/21364737?expand=body.storage"

# headers = {

#     "Authorization": "Bearer token",

#     "Content-Type": "application/json"

# }



# response = requests.get(url, headers=headers)



# if response.status_code == 200:

#     page_data = response.json() 

#     page_title = page_data["title"]

#     page_content = page_data["body"]["storage"]["value"]  # Access the raw content

#     print(f"Page title: {page_title}, Content: {page_content}") 

# else:

#     print(f"Error fetching page: {response.status_code}") 
import requests
from base64 import b64encode
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
load_dotenv()
# User credentials
username = os.getenv("CONFLUENCE_USERNAME") # Use your Confluence email
api_token =  os.getenv("CONFLUENCE_API_KEY")# Use API token from your Confluence user settings

# Encode credentials
credentials = b64encode(f"{username}:{api_token}".encode()).decode('utf-8')

headers = {
    "Authorization": f"Basic {credentials}",
    "Content-Type": "application/json"
}

# Confluence API endpoint
url = "https://bhushan4829.atlassian.net/wiki/rest/api/content/21364737?expand=body.storage"

# Make the request
response = requests.get(url, headers=headers)

if response.status_code == 200:
    page_data = response.json() 
    page_title = page_data["title"]
    page_content = page_data["body"]["storage"]["value"]
    print(f"Page title: {page_title}\nContent: {page_content}")
    soup = BeautifulSoup(response.content, 'html.parser')
    text_content = ' '.join(p.get_text(strip=True) for p in soup.find_all('p'))
    text_content = ' '.join(text_content.split())
    print("processed_text",text_content)
else:
    print(f"Error fetching page: {response.status_code}, Details: {response.text}")

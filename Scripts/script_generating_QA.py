import requests
from bs4 import BeautifulSoup
from sqlalchemy import create_engine, Table, MetaData, Column, Integer, String, Text, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select
from base64 import b64encode
from dotenv import load_dotenv
import os
from openai import OpenAI
import argparse
# Setup the database connection
load_dotenv()
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/portfolio_db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()
# Bind the metadata to an engine
metadata.bind = engine
metadata.reflect(bind=engine)

# Check if 'content' table exists, if not, create it
if 'content' not in metadata.tables:
    content_table = Table('content', metadata,
                          Column('id', Integer, primary_key=True, autoincrement=True),
                          Column('source', String),
                          Column('url', String),
                          Column('content_text', Text),
                          Column('summary', Text),
                          Column('label', String))
    # Create the table in the database
    content_table.create(bind=engine)
else:
    content_table = metadata.tables['content']
def fetch_confluence_content(url):
    username = os.getenv('CONFLUENCE_USERNAME')
    api_token = os.getenv('CONFLUENCE_API_KEY')
    base64_creds = b64encode(f"{username}:{api_token}".encode()).decode('utf-8')
    headers = {
        "Authorization": f"Basic {base64_creds}",
        "Content-Type": "application/json"
    }
    # url = f"https://bhushan4829.atlassian.net/wiki/rest/api/content/{page_id}?expand=body.storage"
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        text_content = ' '.join(p.get_text(strip=True) for p in soup.find_all('p'))
        text_content = ' '.join(text_content.split())
        return text_content
    else:
        print(f"Failed to fetch Confluence content: {response.status_code}")
        return None
# Function to fetch data
def fetch_medium_content(source, url, headers=None):
    
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    response = requests.get(url, headers=headers)
    print("Status Code:", response.status_code)  # Debugging line
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        paragraphs = [p.text for p in soup.find_all('p')]
        full_text = ' '.join(paragraphs)
        # Remove unwanted starting and ending parts
        # Define start and end indicators
        start_indicator = "Sign up Sign in Sign up Sign in Bhushan Mahajan Follow -- Listen Share"
        end_indicator = "-- -- Help Status About Careers Press Blog Privacy Terms Text to speech Teams"
        # Trim the text
        if full_text.startswith(start_indicator):
            full_text = full_text[len(start_indicator):]
        if full_text.endswith(end_indicator):
            full_text = full_text[:-len(end_indicator)]
        full_text = full_text.strip()  # Remove any leading or trailing whitespace
        print("Extracted Length:", len(full_text))  # Debugging line
        print("Content:", full_text)  # Debugging line to show the trimmed content
        return full_text
    else:
        print(f"Failed to fetch content from {source}: {response.status_code}")
    return None

# Function to generate a summary using Hugging Face's Inference API
def generate_summary(source, label, text):
    prompt = f"""Summarize the following content with an emphasis on highlighting the key skills and technologies used, their application in the project or role, and any significant outcomes or innovations that resulted from their usage:
Source: {source} Context: {text} Topic: {label} Please ensure the summary is concise yet detailed, focusing on the problem statement, technical skills, technologies involved, and their impact on the project or role’s success."""
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    try:
        # Use the chat/completions endpoint for chat models
        response = client.chat.completions.create(model="gpt-4o",
        messages=[{"role": "system", "content": prompt}],
        max_tokens=300,
        n=1,
        stop=None,
        temperature=0.5)
        messages = response.choices[0].message.content  # Extract the message content
        return messages
    except Exception as e:
        print(f"Error: {e}")
        return None

# Function to store data in the database
def store_data(source, url, content_text, summary, label, force_update=False):
    """Insert or update content data into the database."""
    with engine.connect() as conn:
        # Prepare the query to check if the URL already exists
        existing_query = select(content_table.c.id).where(content_table.c.url == url)  # Correctly specify column for selection
        existing_result = conn.execute(existing_query).fetchone()
        
        if existing_result:
            if force_update:
                # Forced update: Update the existing content
                update_stmt = (
                    update(content_table).
                    where(content_table.c.url == url).
                    values(content_text=content_text, summary=summary, label=label)
                )
                conn.execute(update_stmt)
                print(f"Content updated for URL: {url}")
            else:
                print(f"No update performed. Content already exists for URL: {url}")
        else:
            # Insert new entry if not existing
            insert_stmt = insert(content_table).values(
                source=source,
                url=url,
                content_text=content_text,
                summary=summary,
                label=label
            )
            result = conn.execute(insert_stmt)
            conn.commit()
            print(f"New content added for URL: {url}")

def main(args):
    """ Main function to handle workflow. """
    if args.source == "confluence":
        content_text = fetch_confluence_content(args.url)
    elif args.source == "medium":
        content_text = fetch_medium_content(args.source, args.url)
    else:
        print("Invalid source specified.")
        return
    if not content_text:
        print("Failed to fetch content.")
        return 
    summary = generate_summary(args.source, args.label, content_text)
    store_data(args.source, args.url, content_text, summary, args.label, args.force_update)
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch and process content from URLs.')
    parser.add_argument('source', type=str, help='Source of the content (e.g., medium, confluence)')
    parser.add_argument('url', type=str, help='URL of the content')
    parser.add_argument('label', type=str, help='Label for the content')
    parser.add_argument('--force-update', action='store_true', help='Force update the content in the database')
    args = parser.parse_args()
    main(args)
# Example usage
# if __name__ == "__main__":
#     content_urls = {
#         # "github": ("https://github.com/Bhushan4829/GDP_Prediction_using_xgboost/blob/main/README.md", "Project: GDP Prediction using XGBoost"),
#         "medium": ("https://medium.com/@bhushanmahajan2929/developing-a-patient-portal-using-synthetic-data-and-microsoft-fabric-8a0151099cbd", "blog post"),
#         # "confluence": ("https://bhushan4829.atlassian.net/wiki/rest/api/content/21364737?expand=body.storage", "Scratch implementation of Decision Tree Regression")
#     }
#     username = os.getenv('CONFLUENCE_USERNAME')
#     api_token = os.getenv('CONFLUENCE_API_KEY')
#     for source, (url, label) in content_urls.items():
#         if source == "confluence":
#             # headers = credentails(username,api_token)
#             content_text = fetch_confluence_content("21364737")
#             print("Content Confluence:", content_text)
#         content_text = fetch_medium_content(source,url)
#         print("Content:", content_text)
#         if content_text: #Summary Generation Code
#             summary = generate_summary(source, label, content_text)
#             print("Summary:", summary)
#             # store_data(source, url, content_text, summary, label)


# def fetch_content(source,url, headers=None):
    # if source == "github":
    #     headers= {'Authorization':'your_github_token'}
    #     response = requests.get(url, headers=headers)
    #     print("Github Response",response)
    #     if response.status_code == 200:
    #         soup = BeautifulSoup(response.content, 'html.parser')
    #         # print("Soup",soup)
    #         return ' '.join(p.text for p in soup.find_all('p'))
    # if source == "confluence":
        
    #     token = base64.b64encode("bhushan4829: Your_confluence_key".encode()).decode()
    #     headers = {'Authorization': 'Basic' + token}
    #     response = requests.get(url, headers=headers)
    #     print("Confluence Response",response)
    #     if response.status_code == 200:
    #         soup = BeautifulSoup(response.content, 'html.parser')
    #         print("Soup",soup)   
    #         return ' '.join(p.text for p in soup.find_all('p'))
    # """General content fetch function for any URL."""
    # if source == "medium":
    #     response = requests.get(url, headers=headers)
    #     if response.status_code == 200:
    #         soup = BeautifulSoup(response.content, 'html.parser')
    #         return ' '.join(p.text for p in soup.find_all('p'))
    # return None

# Alternate implementation using Hugging Face's Inference API
# def generate_summary(source, label, text):
#     """Generate a summary using Hugging Face's Inference API."""
#     hugging_face_api_key = os.getenv('HUGGING_FACE_API_KEY')
#     client = InferenceClient(
#         provider="hf-inference",
#         api_key=hugging_face_api_key  # Replace with your actual Hugging Face API key
#     )
#     prompt = f"""Summarize the following content with an emphasis on highlighting the key skills and technologies used, their application in the project or role, and any significant outcomes or innovations that resulted from their usage:
# Source: {source} Context: {text} Topic: {label}
# Please ensure the summary is concise yet detailed, focusing on the problem statement, technical skills, technologies involved, and their impact on the project or role’s success."""
#     messages = [
#         {
#             "role": "user",
#             "content": prompt
#         }
#     ]
    
#     completion = client.chat.completions.create(
#         model="meta-llama/Llama-3.2-1B",  # Ensure this model can perform summarization
#         messages=messages,
#         max_tokens=500,  # Adjust token limit based on your needs
#     )
#     print(completion.choices[0].message)
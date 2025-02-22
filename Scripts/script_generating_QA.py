import requests
from bs4 import BeautifulSoup
from sqlalchemy import create_engine, Table, MetaData, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import insert
import base64
# Setup the database connection
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/portfolio_db"
engine = create_engine(DATABASE_URL)
metadata = MetaData()

# Bind the metadata to an engine
metadata.bind = engine

# Define or reflect your table structure
metadata.reflect(bind=engine)

# Check if 'content' table exists, if not, create it
if 'content' not in metadata.tables:
    content_table = Table('content', metadata,
                          Column('id', Integer, primary_key=True),
                          Column('source', String),
                          Column('url', String),
                          Column('content_text', Text),
                          Column('summary', Text),
                          Column('label', String))
    # Create the table in the database
    content_table.create(bind=engine)
else:
    content_table = metadata.tables['content']

# Function to fetch data
def fetch_content(source,url, headers=None):
    if source == "github":
        headers= {'Authorization':'your_github_token'}
        response = requests.get(url, headers=headers)
        print("Github Response",response)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            print("Soup",soup)
            return ' '.join(p.text for p in soup.find_all('p'))
    if source == "confluence":
        token = base64.b64encode("bhushan4829: Your_confluence_key".encode()).decode()
        headers = {'Authorization': 'Basic' + token}
        response = requests.get(url, headers=headers)
        print("Confluence Response",response)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            print("Soup",soup)   
            return ' '.join(p.text for p in soup.find_all('p'))
    """General content fetch function for any URL."""
    if source == "medium":
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            return ' '.join(p.text for p in soup.find_all('p'))
    return None

# Function to generate a summary using Hugging Face's Inference API
def generate_summary(source,label,text):
    """Generate a summary using Hugging Face's Inference API."""
    headers = {
        'Authorization': 'Bearer your_hugging_face_api_key'
    }
    prompt =f"""Summarize the following content with an emphasis on highlighting the key skills and technologies used, their application in the project or role, and any significant outcomes or innovations that resulted from their usage:
Source: {source} Context {text} Topic:{label} 
Please ensure the summary is concise yet detailed, focusing on problem statement , technical skills, technologies involved, and their impact on the project or role’s success.
"""
    data = {
        'inputs': prompt,
        'parameters': {'max_length': 150, 'min_length': 40},
        'options': {'use_cache': False}
    }
    response = requests.post(
        'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
        headers=headers,
        json=data
    )
    result = response.json()
    return result[0]['summary_text'] if response.status_code == 200 else None

# Function to store data in the database
def store_data(source, url, content_text, summary, label):
    """Insert or update content data into the database."""
    stmt = insert(content_table).values(
        source=source,
        url=url,
        content_text=content_text,
        summary=summary,
        label=label
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=['url'],
        set_={'content_text': content_text, 'summary': summary}
    )
    with engine.connect() as conn:
        conn.execute(stmt)

# Example usage
if __name__ == "__main__":
    content_urls = {
        "github": ("https://github.com/Bhushan4829/GDP_Prediction_using_xgboost/blob/main/README.md", "Project: GDP Prediction using XGBoost"),
        # "medium": ("https://medium.com/@user/article-title", "blog post"),
        "confluence": ("https://bhushan4829.atlassian.net/wiki/spaces/~712020e5e83b9c8ac5421aa151b0d912540ce7/pages/21364737/Decision+Tree+Regression+Implementation+from+Scratch+and+Comparison+with+Scikit-Learn+Model", "Scratch implementation of Decision Tree Regression")
    }

    for source, (url, label) in content_urls.items():
        content_text = fetch_content(source,url)
        if content_text:
            summary = generate_summary(source, label, content_text)
            print("Summary:", summary)
            # store_data(source, url, content_text, summary, label)

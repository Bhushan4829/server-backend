import openai
import requests
from bs4 import BeautifulSoup
import fitz  # PyMuPDF for PDF processing
from docx import Document
import json
import os
import pandas as pd
import uuid
import dotenv

dotenv.load_dotenv()
CSV_FILENAME = "projects_data.csv"

# OpenAI API Key Setup
openai.api_key = {os.getenv('OPENAI_API_KEY')}

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file and verify extraction."""
    try:
        text = ''
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        print(f"Extracted PDF Text (First 500 chars): {text[:500]}")  # Debug
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_docx(file_path):
    """Extract text from a DOCX file and verify extraction."""
    try:
        doc = Document(file_path)
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        print(f"Extracted DOCX Text (First 500 chars): {text[:500]}")  # Debug
        return text
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"

def fetch_github_readme(github_link):
    """Fetches the README.md content from GitHub repository."""
    try:
        # Convert GitHub link to raw content URL
        repo_name = github_link.split("github.com/")[-1]
        raw_url = f"https://raw.githubusercontent.com/{repo_name}/main/README.md"

        response = requests.get(raw_url)
        if response.status_code == 200:
            return response.text[:2000]  # Limit to avoid token limit
        else:
            return "Error fetching GitHub README."
    except Exception as e:
        return f"GitHub error: {str(e)}"

def fetch_and_summarize(url, context="general"):
    """Fetch text from a webpage and summarize it dynamically."""
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        text = ' '.join(p.text for p in soup.find_all('p'))

        return generate_summary(text, context)
    except Exception as e:
        return f"Error fetching URL {url}: {str(e)}"

def generate_summary(text, context="general"):
    """Generate a concise summary with a context-specific prompt."""
    prompt = f"Summarize the following text with a focus on {context}:\n\n{text}"
    
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "You are an AI assistant that summarizes documents accurately."},
                  {"role": "user", "content": prompt}],
        max_tokens=200
    )

    return response.choices[0].message.content.strip()

# def extract_technologies(text):
#     """Extract technologies into structured categories."""
#     prompt = f"""
#     Identify and classify all technologies mentioned in the following text into programming languages, frameworks, libraries, cloud services, and tools:
    
#     {text}
    
#     Respond in JSON format like this:
#     {{
#       "languages": [],
#       "frameworks": [],
#       "libraries": [],
#       "cloud_services": [],
#       "tools": []
#     }}
#     """
    
#     response = openai.chat.completions.create(
#         model="gpt-4o",
#         messages=[{"role": "system", "content": "Extract and categorize technologies accurately."},
#                   {"role": "user", "content": prompt}],
#         max_tokens=300
#     )
    
#     try:
#         return json.loads(response.choices[0].message.content)
#     except json.JSONDecodeError:
#         return {"languages": [], "frameworks": [], "libraries": [], "cloud_services": [], "tools": []}
def save_to_csv(project, csv_filename=CSV_FILENAME):
    """
    Saves or updates project data in a CSV file.
    - If the project already exists (same title), it updates the row.
    - Otherwise, it appends a new row.
    """
    if os.path.exists(csv_filename):
        df = pd.read_csv(csv_filename)
    else:
        df = pd.DataFrame(columns=["id", "title", "description", "technologies", "github_link",
                                   "medium_link", "deployment_link", "document_link", "report_link"])

    existing_index = df[df["title"] == project["title"]].index

    if existing_index.empty:
        project["id"] = str(uuid.uuid4())  # New unique ID
    else:
        project["id"] = df.loc[existing_index[0], "id"]  # Keep existing ID

    project["technologies"] = json.dumps(project["technologies"])
    project["medium_link"] = ", ".join(project["medium_links"]) if project["medium_links"] else ""

    new_data = pd.DataFrame([project])

    if existing_index.empty:
        df = pd.concat([df, new_data], ignore_index=True)
        print(f"✅ Appended new project: {project['title']}")
    else:
        df.loc[existing_index[0]] = new_data.iloc[0]  # Update
        print(f"🔄 Updated project: {project['title']}")

    df.to_csv(csv_filename, index=False)
    return project["id"]
def process_projects(projects):
    """Process a list of projects dynamically."""
    processed_projects = []

    for project in projects:
        print(f"Processing {project['title']}...")

        # Extract project report text
        if project['report_link'].endswith('.pdf'):
            report_text = extract_text_from_pdf(project['report_link'])
        elif project['report_link'].endswith('.docx'):
            report_text = extract_text_from_docx(project['report_link'])
        else:
            report_text = "Unsupported format or missing report."

        # Summarize GitHub README
        github_summary = fetch_and_summarize(project['github_link'] + '/README.md', context="project overview")
        print(f"GitHub Summary: {github_summary}")  # Debug
        # Process Medium articles
        medium_summaries = ' '.join(fetch_and_summarize(link, context="blog insights") for link in project['medium_links'])
        print(f"Medium Summaries: {medium_summaries}")  # Debug
        # Combine all text sources
        combined_text = f"{github_summary}\n{medium_summaries}\n{report_text}"

        # Generate final summary
        final_summary = generate_summary(combined_text, context="technical project insights")

        # Extract technologies
        # technologies = extract_technologies(combined_text)
        
        technologies = {
                "languages": ["Python"],
                "frameworks": ["Scikit-learn"],
                "libraries": ["XGBoost", "Pandas", "NumPy"],
                "cloud_services": ["Render"],
                "tools": ["Jupyter Notebook","VSCode","Docker"],
                "Areas": ["Machine Learning", "Data Science","Data Cleaning","Data Preprocessing","Data Visualization","Model Building","Model Deployment"]
            }
        processed_project = {
            'title': project['title'],
            'description': final_summary,
            'technologies': technologies,
            'github_link': project['github_link'],
            'medium_links': project['medium_links'],
            'deployment_link': project['deployment_link'],
            'report_link': "",
            'document_link': ""
        }


        processed_projects.append(processed_project)

    return processed_projects

# Example project data structure
projects_info = [
    {
        'title': 'GDP Prediction using XGBoost',
        'github_link': 'https://github.com/Bhushan4829/GDP_Prediction_using_xgboost',
        'medium_links': [],
        'deployment_link': 'https://gdp-prediction-app.onrender.com/',
        'report_link': 'D:/MS/project_report/GDP_Prediction_using_XgBoost.pdf'
    }
    {
        
        'title': 'MedilinkAI- An AI powered healthcare Portal',
        'github_link': 'https://github.com/Bhushan4829/GDP_Prediction_using_xgboost',
        'medium_links': [],
        'deployment_link': 'https://gdp-prediction-app.onrender.com/',
        'report_link': 'D:/MS/project_report/GDP_Prediction_using_XgBoost.pdf'
    }
]

# Processing projects
processed_projects = process_projects(projects_info)
print(json.dumps(processed_projects, indent=4))

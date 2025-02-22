import requests

def fetch_confluence_content(api_url, auth_token):
    """Fetch content from a Confluence page using API."""
    headers = {
        'Authorization': f'Bearer {auth_token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(api_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return data['results'][0]['body']['storage']['value']  # Adjust based on actual response structure
    else:
        return None

# Usage
confluence_api_url = 'https://your-confluence-site.atlassian.net/wiki/rest/api/content/123456?expand=body.storage'
confluence_auth_token = 'your_auth_token'
content = fetch_confluence_content(confluence_api_url, confluence_auth_token)
print(content)
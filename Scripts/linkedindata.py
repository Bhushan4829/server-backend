from flask import Flask, request, redirect, session
import requests
import os
import uuid
from dotenv import load_dotenv
app = Flask(__name__)
app.secret_key = os.urandom(24)

CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
REDIRECT_URI = os.getenv('LINKEDIN_REDIRECT_URI')

@app.route('/')
def home():
    return '<a href="/login">Login with LinkedIn</a>'

@app.route('/login')
def login():
    state = uuid.uuid4().hex
    session['linkedin_state'] = state
    auth_url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&state={state}&scope=r_liteprofile%20r_emailaddress"
    return redirect(auth_url)

@app.route('/linkedin_oauth')
def linkedin_oauth():
    code = request.args.get('code')
    state = request.args.get('state')

    # Validate state
    if state != session.get('linkedin_state'):
        return "State validation failed.", 401

    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    response = requests.post(token_url, data=data)
    if response.status_code != 200:
        return "Failed to retrieve access token.", response.status_code

    access_token = response.json().get('access_token')

    # Fetch profile data with specified fields
    fields = "id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline"
    profile_url = f'https://api.linkedin.com/v2/me?projection=({fields})'
    headers = {'Authorization': f'Bearer {access_token}'}
    profile_response = requests.get(profile_url, headers=headers)
    if profile_response.status_code != 200:
        return "Failed to retrieve profile data.", profile_response.status_code

    profile_data = profile_response.json()
    print("Profile Data",profile_data)
    return profile_data

if __name__ == '__main__':
    app.run(debug=True)

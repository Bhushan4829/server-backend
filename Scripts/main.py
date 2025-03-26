from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jdagent import JobAwareAgent  # make sure this file holds your class
import uvicorn

# Initialize FastAPI app
app = FastAPI()

# CORS config to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this to ["http://localhost:3000"] if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load agent (singleton)
agent = JobAwareAgent("interview_questions_cleaned.csv")

# Request model
class ChatRequest(BaseModel):
    question: str
    job_description: str = ""

# Endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not request.question.strip():
        return {"response": "Please provide a question."}
    response = agent.generate_response(user_question=request.question, jd_text=request.job_description)
    return {"response": response}
@app.get("/")
def read_root():
    return {"message": "Job-Aware API is running!"}
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Entry point
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7999, reload=True)

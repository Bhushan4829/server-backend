# Use slim Python base image
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Copy only needed files
COPY main.py jdagent.py requirements.txt interview_questions_cleaned.csv ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 7999

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7999"]

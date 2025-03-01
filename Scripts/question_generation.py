import pandas as pd

# Creating the data for CSV
categories = [
    "Technical Skills",
    "Behavioral",
    "Project Based",
    "Job Description Based Mappings",
    "Problem-Solving & Critical Thinking"
]

questions = [
    # Technical Skills with Example
    "Can you explain the difference between SQL and NoSQL databases? Provide examples.",
    "How do you optimize a SQL query for better performance? Give a real-world example.",
    "Explain the difference between ETL and ELT with an example from your work.",
    "How do you handle missing values in a dataset? Show an example.",
    "Describe a time when you optimized a slow-running dashboard/report.",
    "What are window functions in SQL, and when have you used them?",
    "Explain data normalization and how it improves database performance.",
    "Can you describe a scenario where you used data warehousing in a project?",
    "How do you ensure data quality and integrity in a business intelligence pipeline?",
    "Walk me through a Machine Learning project you built from scratch.",
    "Explain feature engineering in ML and how it impacts model performance.",
    "When would you use random forest over logistic regression?",
    "What are the key challenges in deploying machine learning models?",
    "Describe how you have used Power BI/Tableau for storytelling with data.",
    "What are the advantages of cloud computing for analytics workloads?",
    "Can you explain Kafka vs. RabbitMQ in a real-time data processing scenario?",
    "What is the most complex data transformation you have written in Python or SQL?",
    "What are common pitfalls in API-based data integration?",
    "Have you ever had to debug a data pipeline failure in production? What did you do?",
    "How would you handle a situation where a model starts drifting over time?",

    # Behavioral
    "Tell me about a time when you handled a difficult colleague or stakeholder.",
    "Give an example of a time when you had to work under tight deadlines.",
    "How do you handle constructive criticism at work?",
    "Describe a time when you made a mistake at work and how you handled it.",
    "Can you give an example of how you prioritize multiple tasks?",
    "How do you deal with unexpected changes in a project?",
    "Tell me about a time when you had to explain complex data to a non-technical audience.",
    "What would you do if you were given a project with unclear goals?",
    "Describe a time you had to influence a team decision without authority.",
    "Give an example of when you went above and beyond to deliver results.",
    "How do you handle difficult clients or business users?",
    "Have you ever worked on a project where you had to learn a new tool or technology quickly?",
    "Describe a high-pressure situation and how you managed it.",
    "What motivates you to do your best work?",
    "How do you handle work-life balance in a fast-paced job?",
    "Describe a time when you had to ask for help in a challenging situation.",
    "What is the biggest professional risk you have taken, and what did you learn from it?",
    "How do you give and receive feedback?",
    "Can you describe a situation where you had to disagree with your manager?",
    "Tell me about a time you had to handle conflict within a team.",

    # Project Based
    "Walk me through your most impactful project and your role in it.",
    "Have you ever worked on a project with incomplete or missing data? How did you handle it?",
    "Describe a time when you had to change your approach in the middle of a project.",
    "What was the most complex dataset you worked with, and how did you analyze it?",
    "Have you worked on a project where you had to integrate multiple data sources?",
    "How do you determine whether a project was successful or not?",
    "Can you describe a situation where you had to troubleshoot a failing project?",
    "What tools have you used for project tracking and documentation?",
    "Describe a project where you had to automate repetitive tasks.",
    "Have you ever worked on a real-time analytics project? If yes, explain the challenges.",
    "Tell me about a project where you optimized an existing system.",
    "What was the biggest challenge you faced when managing stakeholders in a project?",
    "Have you ever had to handle conflicting requirements from different teams?",
    "How do you approach testing and validating a data pipeline?",
    "Explain a time you had to collaborate with a cross-functional team.",
    "Have you ever worked with unstructured data? How did you analyze it?",
    "What is the most interesting insight you have uncovered in a project?",
    "How do you document your workflow for future team members?",
    "Have you worked on a cloud-based data project? What architecture did you use?",
    "What steps do you take to ensure a smooth project handoff?",

    # Job Description Based Mappings
    "How does your experience align with the core responsibilities of this role?",
    "What specific technical skills do you bring that make you the best fit?",
    "Have you worked with [insert company tech stack] before? If not, how will you learn it?",
    "What experience do you have with large-scale data pipelines, as mentioned in the JD?",
    "Can you explain a past project where you worked with similar datasets?",
    "How would you approach solving X problem listed in the JD?",
    "What experience do you have with data governance & compliance (GDPR, HIPAA, etc.)?",
    "Have you worked on customer behavior analytics before?",
    "How comfortable are you with working independently?",
    "The JD mentions collaboration with business teams. How have you done that before?",
    "How have you used visualization tools (Tableau, Power BI, Looker, etc.) effectively?",
    "What strategies do you use for troubleshooting performance issues?",
    "Can you give an example of when you had to improve a dashboard’s performance?",
    "How would you improve data-driven decision-making at our company?",
    "What do you think is the biggest challenge of this role, and how would you tackle it?",
    "Have you worked on forecasting or predictive analytics projects?",
    "How do you handle confidential or sensitive data?",
    "What KPIs or success metrics do you track in similar roles?",
    "How would you automate a repetitive manual data process?",
    "Why do you want to work for our company specifically?",

    # Problem-Solving & Critical Thinking
    "You notice a sudden drop in user engagement on a dashboard. How do you investigate?",
    "A SQL query is running too slow. What steps would you take to improve performance?",
    "A dataset has conflicting values. How do you resolve this inconsistency?",
    "You have two weeks to deliver a high-priority project. How do you plan your work?",
    "How do you handle a stakeholder who keeps changing project requirements?",
    "What do you do if a model performs well in training but poorly in production?",
    "A dashboard is not loading for executives on mobile. What do you check first?",
    "You have to quickly onboard a junior analyst. How do you guide them?",
    "How would you validate the accuracy of a dataset provided by a third party?",
    "Your team has a disagreement on the best data model to use. How do you decide?",
    "If given a new dataset, what first steps do you take to explore it?",
    "How would you detect fraud in a financial dataset?",
    "Describe a time you had to debug a data integration issue.",
    "What would you do if an important client report had incorrect data?",
    "How do you ensure your solutions are scalable?",
    "How do you prioritize tasks when everything seems urgent?",
    "What strategies do you use for continuous learning?",
    "How do you challenge assumptions in a data-driven project?",
    "What’s the most creative solution you have come up with?",
    "How would you handle an unexpected system outage?"
]

# Creating a DataFrame
df = pd.DataFrame({
    "Category": [category for category in categories for _ in range(20)],
    "Question": questions
})

# Save to CSV
csv_filename = "interview_questions.csv"
df.to_csv(csv_filename, index=False)

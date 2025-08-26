import React from 'react';
import './Experience.css';

function Experience() {
  const experiences = [
    {
      date: 'Jun 2025 - present',
      title: 'AI Intern, Right Skale, Remote',
      description: 
        '• Built a Flask-based Excel data extraction microservice with dynamic LLM prompts, cutting S3 I/O by 80% and boosting retrieval speed by 60%.\n' +
        '• Developed a Dockerized RAG pipeline (Qdrant + OpenAI embeddings + LlamaParse) deployed on AWS ECS with full unit/integration test coverage.\n' +
        '• Automated deployments with a GitHub Actions CI/CD pipeline, including tests, rollbacks, and email notifications for production reliability.',
      tags: ['Flask', 'Docker', 'AWS ECS', 'GitHub Actions', 'CI/CD', 'LLM', 'RAG', 'Qdrant', 'OpenAI', 'LlamaParse'],
    },
    {
      date: 'Dec 2024 - May 2025',
      title: 'AI Engineer Intern, Flow, Remote',
      description:
        '• Designed real-time ETL pipelines using Apache Kafka & Airflow, processing thousands of CRM records and improving analytics efficiency by 20%.\n' +
        '• Containerized and deployed scalable API microservices on AWS ECS, integrating Pinecone for semantic search and CI/CD for fast delivery.\n' +
        '• Partnered with cross-functional teams to integrate Gemini, Redis, and Prometheus for high-availability inference, logging, and monitoring.',
      tags: ['Apache Kafka', 'Airflow', 'AWS ECS', 'CI/CD', 'Pinecone', 'Gemini', 'Redis', 'Prometheus'],
    },
    {
      date: 'Aug 2024 - May 2025',
      title: 'Research Assistant, University at Buffalo, Buffalo, NY',
      description:
        '• Built a HIPAA-compliant multi-agent conversational AI (LangGraph) integrating symptom extraction, disease prediction, and RLHF-based reasoning for healthcare applications.\n' +
        '• Designed an LLM ensemble pipeline (MedAlpaca-7B, OpenAI, similarity re-ranking) to boost diagnostic accuracy with confidence scoring and adaptive follow-up.\n' +
        '• Integrated PubMed + MIMIC-IV FHIR data via Databricks and Pinecone to deliver personalized, evidence-based clinical insights with memory and CoT prompting.',
      tags: ['LangGraph', 'LLM', 'PubMed', 'MIMIC-IV', 'Databricks', 'Pinecone', 'HIPAA', 'CoT', 'RLHF'],
    },
    {
      date: 'Aug 2024 — Dec 2024',
      title: 'Graduate Teaching Assistant, University at Buffalo, Buffalo, NY',
      description:
        '• Evaluated assignments and projects for Deep Learning, providing feedback to over 50 students.\n' +
        '• Resolved 30+ student queries during office hours and Piazza, enhancing comprehension.\n' +
        '• Conducted workshop on LLMs, equipping 40+ students with practical skills for real-world applications.',
      tags: ['Teaching', 'LLMs', 'Deep Learning', 'Feedback'],
    },
    {
      date: 'Jan 2024 — Sept 2024',
      title: 'Supervised Research, University at Buffalo, Buffalo, NY',
      description:
        '• Engineered a chatbot using 4 fine-tuned LLMs, integrating ChromaDB and LangChain for memory.\n' +
        '• Deployed chatbot on Pepper robot, enabling voice and bodily responses (40+) using Google Speech API.\n' +
        '• Conducted testing for 20+ conversational scenarios to ensure robustness and evaluate responses.',
      tags: ['Chatbot', 'LLMs', 'ChromaDB', 'LangChain', 'Google Speech API'],
    },
    {
      date: 'Feb 2024 — May 2024',
      title: 'Graduate Teaching Assistant, University at Buffalo, Buffalo, NY',
      description:
        '• Mentored 6 teams for their semester-long project in Computer Vision and Image Processing.\n' +
        '• Evaluated research paper presentations.\n' +
        '• Attended lectures and conducted office hours to resolve student queries.',
      tags: ['Teaching', 'Computer Vision', 'Project Mentorship', 'Research Evaluation'],
    },
    {
      date: 'July 2021 — Sept 2021',
      title: 'Machine Learning Intern, Grroom, India',
      description:
        '• Annotated 5,000 images, improving YOLOv4 object detection accuracy for real-time applications.\n' +
        '• Refined ML workflows collaboratively with a team of 4+, boosting model performance by 20%.\n' +
        '• Delivered high-accuracy detection (98%) through iterative testing and optimization.',
      tags: ['YOLOv4', 'Image Annotation', 'ML Workflow', 'Object Detection'],
    },
  ];

  return (
    <section id="experience" className="experience-section main-section">
      <h2>Experience</h2>
      <div className="experience-list">
        {experiences.map((exp, index) => (
          <div key={index} className="experience-card">
            <p className="experience-date">{exp.date}</p>
            <h3 className="experience-title">{exp.title}</h3>
            <p className="experience-description">{exp.description}</p>
            <div className="experience-tags">
              {exp.tags.map((tag, i) => (
                <span key={i} className="experience-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Experience;

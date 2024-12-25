import React from 'react';
import './Experience.css';

function Experience() {
  const experiences = [
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

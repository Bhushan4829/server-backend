import React from 'react';
import './Education.css';

function Education() {
  const education = [
    {
      title: "Master of Science in Computer Science",
      date: "June 2025",
      institution: "University at Buffalo, The State University of New York",
      description: "Specialized in AI and Machine Learning. Collaborated with Prof. Kaiyi Ji on multimodal Vision Transformers. GPA: 3.62/4.0.",
    },
    {
      title: "Bachelor of Engineering in Electronics and Telecommunication",
      date: "May 2023",
      institution: "Ramrao Adik Institute of Technology, India",
      description: "Graduated with a CGPA of 8.79/10. Studied core engineering principles with a focus on electronics and communication.",
    },
  ];

  return (
    <section id="education" className="education-section main-section">
      <h2>Education</h2>
      <div className="education-container">
        {education.map((edu, index) => (
          <div key={index} className="education-card">
            <h3 className="education-title">{edu.title}</h3>
            <p className="education-date">{edu.date}</p>
            <p className="education-institution">{edu.institution}</p>
            <p className="education-description">{edu.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Education;

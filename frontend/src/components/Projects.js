import React from 'react';
import './Projects.css';
import project1 from '../assests/projects/project1.png';
import project2 from '../assests/projects/project2.png';
function Projects() {
  const projects = [
    {
      title: 'Novel Based Chat-bot',
      description:
        'This project presents an innovative chatbot system based on 15 different novels and chit-chat mode. The system operates through a structured backend and frontend, utilizing a Random Forest classifier and OpenAI GPT-3.5 for contextual responses. The frontend is a user-centric web application designed to enhance usability with robust error handling and visualization.',
      image: project2,
      tags: ['Python', 'Random Forest', 'Blenderbot API', 'RAG', 'GPT-3.5'],
    },
    {
      title: 'Nature Inspired Algorithms for Underwater Object Detection',
      description:
        'In my final year project, my team and I developed an efficient method for detecting objects in underwater environments. Combining pre-trained deep learning models with nature-inspired algorithms, we achieved 98.18% accuracy while reducing computational costs by over 50%. This breakthrough has significant potential in marine research, environmental monitoring, and underwater robotics.',
      image: project1,
      tags: [
        'Deep Learning',
        'VGG16',
        'PSO',
        'Snake Optimizer',
        'Marine Research',
      ],
    },
  ];

  return (
    <section id="projects" className="projects-section main-section">
      <h2>Projects</h2>
      <div className="projects-list">
        {projects.map((project, index) => (
          <div key={index} className="project-card">
            <img src={project.image} alt={project.title} className="project-image" />
            <div className="project-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-tags">
                {project.tags &&
                  project.tags.map((tag, i) => (
                    <span key={i} className="project-tag">
                      {tag}
                    </span>
                  ))}
              </div>
              {project.stars && <p>★ {project.stars}</p>}
              {project.downloads && <p>⬇ {project.downloads}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;

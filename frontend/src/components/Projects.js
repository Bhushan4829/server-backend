import React, { useState } from 'react';
import './Projects.css';
import project1 from '../assests/projects/project1.png';
import project2 from '../assests/projects/project2.png';
import project3 from '../assests/projects/project3.png';
import project6 from '../assests/projects/project6.png';
import project7 from '../assests/projects/project7.png';
function Projects() {
  // const [showMore, setShowMore] = useState(false);

  const projects = [
    {
      title: 'Linkedin Note Generator - Your AI powered sidekick for networking',
      description: 'A smart Chrome extension that makes LinkedIn networking effortless by generating personalized connection notes, InMails, and cold emails in one click. Using profile data (name, headline, experience), our React + TypeScript frontend and FastAPI backend (with Supabase and OpenAI GPT models) create tailored, professional messages that feel genuine—no more copy-paste templates. With features like a messaging dashboard, customizable templates, and resume/job description integration, it acts as your personal networking assistant, saving time while making outreach thoughtful and effective.',
      image: project6,
      tags: ['React', 'TypeScript', 'FastAPI', 'OpenAI'],
      link: 'https://github.com/Bhushan4829/linkedin-note-generator',
    },
    {
      title: 'AI powered Patient Portal',
      description: 'A full-stack health platform built with React and Flask that empowers patients with personalized insights and easy access to their medical data. The web app features a dynamic dashboard for visualizing key health metrics and an AI-powered chatbot with multi-agent architecture. One agent assists with symptom-based diagnosis using OpenAI and PubMed integration, asking follow-up questions for higher accuracy. Another agent (in progress) focuses on generating radiology reports. Patient data is managed using a graph database for contextual reasoning, with strong privacy measures like row-level security and planned federated learning to ensure compliance and data protection.',
      image: project7,
      tags: ['React', 'OpenAI', 'Multi Agent', 'Privacy'],
      link: 'https://github.com/Bhushan4829/patient_portal',
    },
    {
      title: 'Novel Based Chat-bot',
      description: 'This project presents an innovative chatbot system based on 15 different novels and chit-chat mode. The system operates through a structured backend and frontend, utilizing a Random Forest classifier and OpenAI GPT-3.5 for contextual responses. The frontend is a user-centric web application designed to enhance usability with robust error handling and visualization.',
      image: project2,
      tags: ['Python', 'Random Forest', 'RAG', 'GPT-3.5'],
      link: 'https://github.com/Bhushan4829/novel_based_chatbot',
    },
    {
      title: 'Underwater Object Detection',
      description: 'In my final year project, my team and I developed an efficient method for detecting objects in underwater environments. Combining pre-trained deep learning models with nature-inspired algorithms, we achieved 98.18% accuracy while reducing computational costs by over 50%. This breakthrough has significant potential in marine research, environmental monitoring, and underwater robotics',
      image: project1,
      tags: ['Deep Learning', 'VGG16', 'PSO', 'Snake Optimizer'],
      link: 'https://github.com/yourusername/underwater-detection',
    },
    {
      title: 'Road Extraction and Analysis',
      description: 'A satellite imagery-based system designed to detect and extract road networks for applications in urban planning, disaster response, and infrastructure monitoring. The project uses deep learning models—U-Net and a fusion of ResNet50 + VGG16—paired with advanced preprocessing (augmentation, segmentation, enhancement) and post-processing techniques like edge detection and CRFs. Trained on 12,000+ images, it achieved 94%+ accuracy. The combination of U-Net and edge refinement yielded the best results.',
      image: project3,
      tags: ['Neural Networks', 'Image Segmentation','Feature Extraction','Model Fusion'],
    },
  ];

//   const initialProjects = projects.slice(0, 2);
//   const extraProjects = projects.slice(2);

//   return (
//     <section id="projects" className="projects-section main-section">
//       <h2>Projects</h2>
//       <div className="projects-list">
//         {initialProjects.map((project, index) => (
//           <ProjectCard key={index} project={project} />
//         ))}
//       </div>

//       <button className="toggle-button" onClick={() => setShowMore(true)}>
//         Show More
//       </button>

//       {showMore && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>More Projects</h3>
//               <button className="close-modal" onClick={() => setShowMore(false)}>
//                 &times;
//               </button>
//             </div>
//             <div className="extra-projects-grid">
//             {extraProjects.map((project, index) => (
//               <ProjectCard key={index} project={project} isModal />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

// function ProjectCard({ project, isModal = false }) {
//   return (
//     <a
//       href={project.link}
//       target="_blank"
//       rel="noopener noreferrer"
//       className={isModal ? "modal-project-card" : "project-card"}
//     >
//       <img src={project.image} alt={project.title} className="project-image" />
//       <div className="project-content">
//         <h3>{project.title}</h3>
//         <p>{project.description}</p>
//         <div className="project-tags">
//           {project.tags.map((tag, i) => (
//             <span key={i} className="project-tag">{tag}</span>
//           ))}
//         </div>
//       </div>
//     </a>
//   );
// }


// export default Projects;
const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(0);

  const startIndex = currentPage * itemsPerPage;
  const currentProjects = projects.slice(startIndex, startIndex + itemsPerPage);

  const canGoBack = currentPage > 0;
  const canGoForward = startIndex + itemsPerPage < projects.length;

  return (
    <section id="projects" className="projects-section main-section">
      <h2>Projects</h2>
      <div
        className="projects-list animated-slide"
        key={currentPage} // triggers re-render and animation
      >
        {currentProjects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>

      <div className="pagination-buttons">
        <button
          className="arrow-button"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={!canGoBack}
        >
          &#8592; Previous
        </button>
        <button
          className="arrow-button"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!canGoForward}
        >
          Next &#8594;
        </button>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="project-card"
    >
      <img src={project.image} alt={project.title} className="project-image" />
      <div className="project-content">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-tags">
          {project.tags.map((tag, i) => (
            <span key={i} className="project-tag">{tag}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default Projects;
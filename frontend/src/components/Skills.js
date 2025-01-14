import React from 'react';
import './Skills.css';

function Skills() {
  const skills = [
    { name: 'Python', icon: '/assets/icons/python.png' },
    { name: 'JavaScript', icon: '/assets/icons/javascript.png' },
    { name: 'R', icon: '/assets/icons/R.png' },
    { name: 'SQL', icon: '/assets/icons/sql.png' },
    { name: 'Hadoop', icon: '/assets/icons/hadoop.png' },
    { name: 'PySpark', icon: '/assets/icons/pyspark.png' },
    { name: 'REST API', icon: '/assets/icons/rest_api.png' },
    { name: 'Flask', icon: '/assets/icons/flask.png' },
    { name: 'Django', icon: '/assets/icons/django.png' },
    { name: 'Jupyter Notebook', icon: '/assets/icons/jupyter.png' },
    { name: 'TensorFlow', icon: '/assets/icons/tensorflow.png' },
    { name: 'PyTorch', icon: '/assets/icons/pytorch.png' },
    { name: 'Visual Studio', icon: '/assets/icons/visual_studio.png' },
    { name: 'Postman', icon: '/assets/icons/postman.png' },
    { name: 'GitLab', icon: '/assets/icons/gitlab.png' },
    { name: 'OpenAI', icon: '/assets/icons/openai.png' },
    { name: 'Neo4j', icon: '/assets/icons/neo4j.png' },
    { name: 'Microsoft Azure Fabric', icon: '/assets/icons/fabric.png' },
    { name: 'Snowflake', icon: '/assets/icons/snowflake.png' },
    { name: 'PostgreSQL', icon: '/assets/icons/postgresql.png' },
    { name: 'Tableau', icon: '/assets/icons/tableau.png' },
    { name: 'GCP', icon: '/assets/icons/GCP.png' },
    { name: 'Azure', icon: '/assets/icons/azure.png' },

  ];

  return (
    <section id="skills" className="skills-section">
      <h2>Tech Stack</h2>
      <div className="skills-grid">
        {skills.map((skill, index) => (
          <div key={index} className="skill-card">
            <img src={skill.icon} alt={skill.name} className="skill-icon" />
            <p>{skill.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;

import React, { useState } from 'react';
import './Skills.css';

function Skills() {
  const [filter, setFilter] = useState('All');
  
  const skills = [
    { name: 'Python', icon: '/assets/icons/python.png', category: 'Artificial Intelligence' },
    { name: 'JavaScript', icon: '/assets/icons/javascript.png', category: 'Software' },
    { name: 'R', icon: '/assets/icons/R.png', category: 'Data Science' },
    { name: 'SQL', icon: '/assets/icons/sql.png', category: 'Database' },
    { name: 'Hadoop', icon: '/assets/icons/hadoop.png', category: 'Big Data' },
    { name: 'PySpark', icon: '/assets/icons/pyspark.png', category: 'Big Data' },
    { name: 'REST API', icon: '/assets/icons/rest_api.png', category: 'Web Development' },
    { name: 'Flask', icon: '/assets/icons/flask.png', category: 'Web Development' },
    { name: 'Django', icon: '/assets/icons/django.png', category: 'Web Development' },
    { name: 'Jupyter Notebook', icon: '/assets/icons/jupyter.png', category: 'Data Science' },
    { name: 'TensorFlow', icon: '/assets/icons/tensorflow.png', category: 'Artificial Intelligence' },
    { name: 'PyTorch', icon: '/assets/icons/pytorch.png', category: 'Artificial Intelligence' },
    { name: 'Visual Studio', icon: '/assets/icons/visual_studio.png', category: 'Software' },
    { name: 'Postman', icon: '/assets/icons/postman.png', category: 'Web Development' },
    { name: 'GitLab', icon: '/assets/icons/gitlab.png', category: 'Software' },
    { name: 'OpenAI', icon: '/assets/icons/openai.png', category: 'Artificial Intelligence' },
    { name: 'Neo4j', icon: '/assets/icons/neo4j.png', category: 'Database' },
    { name: 'Microsoft Azure Fabric', icon: '/assets/icons/fabric.png', category: 'Cloud Computing' },
    { name: 'Snowflake', icon: '/assets/icons/snowflake.png', category: 'Cloud Computing' },
    { name: 'PostgreSQL', icon: '/assets/icons/postgresql.png', category: 'Database' },
    { name: 'Tableau', icon: '/assets/icons/tableau.png', category: 'Data Visualization' },
    { name: 'GCP', icon: '/assets/icons/GCP.png', category: 'Cloud Computing' },
    { name: 'Azure', icon: '/assets/icons/azure.png', category: 'Cloud Computing' },
  ];

  const handleFilterChange = (category) => {
    setFilter(category);
  };

  const filteredSkills = skills.filter(skill => filter === 'All' || skill.category === filter);

  return (
    <section id="skills" className="skills-section">
      <h2>Tech Stack</h2>
      <div>
        <button onClick={() => handleFilterChange('All')}>All</button>
        <button onClick={() => handleFilterChange('Artificial Intelligence')}>AI</button>
        <button onClick={() => handleFilterChange('Cloud Computing')}>Cloud</button>
        <button onClick={() => handleFilterChange('Software')}>Software</button>
        <button onClick={() => handleFilterChange('Web Development')}>Web Dev</button>
        <button onClick={() => handleFilterChange('Database')}>Database</button>
        <button onClick={() => handleFilterChange('Data Science')}>Data Science</button>
      </div>
      <div className="skills-grid">
        {filteredSkills.map((skill, index) => (
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

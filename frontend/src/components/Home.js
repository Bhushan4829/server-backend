import React from 'react';
import './Home.css';
import aboutMeImage from '../assests/images/AspireProfilePhoto.jpeg';

function Home({ navigate }) {
  React.useEffect(() => {
    const updateNavBarWidth = () => {
      const navBar = document.querySelector('.navigation-bar');
      if (navBar) {
        const width = window.getComputedStyle(navBar).width;
        document.documentElement.style.setProperty('--nav-bar-width', width);
      }
    };

    updateNavBarWidth();
    window.addEventListener('resize', updateNavBarWidth);

    return () => {
      window.removeEventListener('resize', updateNavBarWidth);
    };
  }, []);

  return (
    <section id="home" className="home">
      <div className="home-container">
        {/* Left Section: About Me */}
        <div className="content">
          <h1>
            Hi, I am <span>Bhushan Mahajan</span>
          </h1>
          <p>
            I'm a passionate Machine Learning Engineer who specializes in creating scalable and high-performance applications. 
            Currently pursuing my Master's in Computer Science at the University at Buffalo, I thrive on solving challenging 
            problems and delivering impactful solutions that make a difference.
          </p>
          <p>
            I’m constantly exploring ways to leverage tools like LangChain, Docker, and Azure to bridge the gap 
            between complex technical solutions and seamless user experiences.With expertise spanning AI, 
            Data Engineering, and Cloud Technologies (Azure and AWS), I’ve worked on projects involving 
            advanced machine learning workflows, scalable data pipelines, and AI-driven solutions that 
            empower businesses to make informed decisions.
          </p>
          <p>
            🔍 I am actively seeking full-time opportunities as a Machine Learning Engineer, AI Engineer, 
            or Data Engineer, where I can apply my skills and creativity to solve real-world problems.
            Let’s connect and create something amazing together! 🚀
          </p>
          <div className="buttons">
            <button>Download CV</button>
            <button>Start Project</button>
            <button onClick={() => navigate('/dashboard')}>Track My Consistency</button>
          </div>
        </div>

        {/* Right Section: Image */}
        <div className="image">
          <img src={aboutMeImage} alt="Bhushan Mahajan" />
        </div>
      </div>
    </section>
  );
}

export default Home;

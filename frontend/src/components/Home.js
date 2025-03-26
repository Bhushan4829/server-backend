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
          <span className="hi-part">Hi, I am </span>
          <span className="name-part">Bhushan Mahajan</span>
        </h1>

          <p>
          A builder at heart who loves turning data into intelligent systems. Currently wrapping up my Master’s in Computer Science at the University at Buffalo, I specialize in crafting scalable, AI-powered solutions that bridge research and real-world impact.
          </p>
          <p>
          From designing ML workflows and deploying models with Docker & Azure, to building data pipelines that power decision-making — I’ve been deep in the code and the cloud. Tools like LangChain, AWS, and GPT models are my playground.
          </p>
          <p>
          🚀 I'm now seeking full-time roles as a Machine Learning Engineer, AI Engineer, or Data Engineer — where I can keep solving complex problems and build things that matter.

            🌟 Let's create something meaningful together.
          </p>
          <div className="buttons">
            <button onClick={() => window.open('https://drive.google.com/file/d/1sd3TM-EARBDBdJ4d39Cj0yywthMqAV0b/view?usp=sharing', '_blank')}>
              View Resume
            </button>
            <button onClick={() => navigate('/dashboard')}>Track My Consistency</button>
            <button onClick={() => navigate('/chatbot')} className="nav-button">Chatbot Assistant</button>
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

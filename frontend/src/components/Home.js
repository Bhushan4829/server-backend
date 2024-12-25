import React from 'react';
import './Home.css';
import aboutMeImage from '../assests/images/AspireProfilePhoto.jpeg';
function Home({ navigate }) {
  return (
    <section id="home" className="home">
      <div className="home-container">
        {/* Left Section: About Me */}
        <div className="content">
        <h1>Hi, I am <span>Bhushan Mahajan</span></h1>
          <p>
            A passionate software engineer specializing in building high-quality web applications
            with React and Django. I have over 2 years of experience in web development and am currently pursuing my
            interest in data science and machine learning.
          </p>
          <p>
            I enjoy solving complex problems, collaborating with teams, and delivering user-centric solutions. My
            expertise lies in leveraging modern tools and frameworks to create scalable and efficient applications.
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

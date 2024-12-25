import React from 'react';
import './AboutMe.css';
import aboutMeImage from '../assests/images/AspireProfilePhoto.jpeg';
function AboutMe() {
  return (
    <section id="about-me" className="about-me">
      <h2>About me</h2>
      <div className="about-me-content">
        <div className="about-me-text">
          <p>
            Merwan Bekkar is a passionate computer science student and full-stack web developer. I am currently studying at the National School of Computer Science (ESI ex.INI) and have more than two years of experience in web development. I enjoy working with React, Django, Python, JavaScript, HTML, and CSS to create dynamic and responsive web applications.
          </p>
          <p>
            In addition to web development, I have a strong interest in cybersecurity and am currently learning about data science and machine learning.
          </p>
        </div>
        <div className="about-me-graphic">
          {/* Add an SVG or placeholder image */}
          <img src={aboutMeImage} alt="About Me Graphic" />
        </div>
      </div>
    </section>
  );
}

export default AboutMe;

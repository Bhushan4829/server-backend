import React from 'react';
import './NavigationBar.css';

function NavigationBar() {
  return (
    <div className="navigation-bar">
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#experience">Experience</a></li>
      </ul>
    </div>
  );
}

export default NavigationBar;

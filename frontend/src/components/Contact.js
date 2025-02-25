import React from 'react';
import './Contact.css'; // Ensure this file exists or rename appropriately
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

function ConnectWithMe() {
  return (
    <section id="connect" className="connect-section">
      <h2>Connect with Me</h2>
      <div className="connect-icons">
        <a href="https://www.instagram.com/bhushan5625/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} />
        </a>
        <a href="mailto:bhushanm@buffalo.edu">
          <FontAwesomeIcon icon={faEnvelope} />
        </a>
        <a href="https://www.linkedin.com/in/bhushan2908/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedin} />
        </a>
      </div>
    </section>
  );
}

export default ConnectWithMe;

import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Education from './components/Education';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Dashboard from './components/Dashboards'; // Updated import path
import NavigationBar from './components/NavigationBar';
import ConnectWithMe from './components/Contact';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  let content;
  if (currentPath === '/dashboard') {
    content = (
      <div className="p-4">
        <button
          onClick={() => navigate('/')}
          className="home-button"
        >
          Home
        </button>
        <Dashboard />
      </div>
    );
  } else if (currentPath === '/chatbot') {
    content = (
      <div className="p-4">
        <button onClick={() => navigate('/')} className="home-button">Home</button>
        <Chatbot />
      </div>
    );
  } else {
    content = (
      <div className="main-layout">
        <NavigationBar />
        <div className="main-content">
          <Home navigate={navigate} />
          <Education />
          <Skills />
          <Projects />
          <Experience />
          <ConnectWithMe />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`font-sans text-white ${
        currentPath === '/dashboard' ? 'bg-dashboard' : 'bg-gray-900'
      }`}
    >
      <main>{content}</main>
      
      {/* Floating Chatbot Button */}
      {currentPath !== '/chatbot' && (
        <div className="floating-chatbot">
          <div className="chatbot-popover">
            Want to know more?
            <span>I’m Bhushan’s personal assistant. Let’s chat!</span>
          </div>
          <button
            onClick={() => navigate('/chatbot')}
            className="chatbot-fab"
            title="Open AI Assistant"
          >
            <span className="chatbot-icon">🤖</span>
            <span className="chatbot-pulse"></span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

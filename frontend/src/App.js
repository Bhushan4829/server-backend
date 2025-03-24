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
      <>
        <NavigationBar />
        <div className="ml-[300px]">
          <Home navigate={navigate} />
          <Education />
          <Skills />
          <Projects />
          <Experience />
          <ConnectWithMe />
        </div>
      </>
    );
  }

  return (
    <div
      className={`font-sans text-white ${
        currentPath === '/dashboard' ? 'bg-dashboard' : 'bg-gray-900'
      }`}
    >
      <main>{content}</main>
    </div>
  );
}

export default App;

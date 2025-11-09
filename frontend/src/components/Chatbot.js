import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const API_BASE_URL = (process.env.REACT_APP_CHAT_API_BASE_URL || 'http://localhost:7999').replace(/\/$/, '');
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chatgpt`;

function Chatbot() {
  const [messages, setMessages] = useState([]); // Removed initial sample messages
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [showSamples, setShowSamples] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message = input) => {
    if (message.trim() === '') return;
  
    const userMessage = { type: 'user', text: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowSamples(false);
    setIsLoading(true);
  
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: message,
          job_description: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { type: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: '⚠️ Error connecting to server.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "Is the candidate a good fit for this role?",
    "Tell me about yourself.",
    "What are your strengths and weaknesses?"
  ];

  return (
    <div className="chatbot-page main-section">
      <div className="mobile-header">
        <button className="home-btn">Home</button>
        <button className="jobdesc-btn" onClick={() => setShowJobDesc(true)}>
          Job Description
        </button>
      </div>
  
      {showJobDesc && (
        <div className="jobdesc-overlay">
          <div className="jobdesc-content">
            <h2>Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
            />
            <button className="close-btn" onClick={() => setShowJobDesc(false)}>Close</button>
          </div>
        </div>
      )}
  
      <div className="chatbot-container">
        <div className="job-description-block">
          <h2>Job Description</h2>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
          />
        </div>
  
        <div className="chat-interface-block">
          <h2>Chat Assistant</h2>
          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            
            {showSamples && messages.length === 0 && (
              <div className="sample-prompts">
                <p>Try asking:</p>
                {samplePrompts.map((prompt, index) => (
                  <div 
                    key={index} 
                    className="sample-prompt"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="chat-message bot loading">
                Thinking...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <textarea
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onFocus={() => setShowSamples(false)}
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? 'Waiting...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
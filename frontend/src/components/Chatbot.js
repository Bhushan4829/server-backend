import React, { useState } from 'react';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'user', text: 'How can I prepare for this role?' },
    { type: 'bot', text: 'Focus on React, TypeScript, and system design.' },
  ]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;

    setMessages((prev) => [...prev, { type: 'user', text: input }]);
    setInput('');

    // Simulated bot response — replace with API later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: `I got your question: "${input}"\nAnalyzing based on JD...` },
      ]);
    }, 800);
  };

  return (
    <div className="chatbot-page main-section">
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
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;

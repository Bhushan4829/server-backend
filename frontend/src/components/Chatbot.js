import React, { useState } from 'react';
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'user', text: 'How can I prepare for this role?' },
    { type: 'bot', text: 'Focus on React, TypeScript, and system design.' },
  ]);
  const [input, setInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;
  
    const userMessage = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
  
    try {
      const response = await fetch('https://job-aware-api.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          job_description: jobDescription,
        }),
      });
  
      const data = await response.json();
      const botMessage = { type: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error:', err);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: '⚠️ Error connecting to server.' },
      ]);
    }
  };
  

  return (
    <div className="chatbot-page main-section">
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
</div>

  );
}

export default Chatbot;

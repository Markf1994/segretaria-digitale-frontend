import React, { useState } from 'react';
import api from '../api/axios';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const IntegrationBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');


  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await api.post('/api/chat', {
        messages: [...messages, userMessage],
      });
      const assistant = res.data.choices[0].message as Message;
      setMessages(prev => [...prev, assistant]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'system', content: 'Error communicating with API' },
      ]);
    }
  };

  return (
    <div className="integration-box dashboard-section">
      <h2>Chat</h2>
      <div className="messages">
        {messages.map((m, idx) => (
          <div key={idx} className={m.role}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default IntegrationBox;

import React, { useState } from 'react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const IntegrationBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const apiKey = import.meta.env.VITE_OPENAI_KEY;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!apiKey) return;

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [...messages, userMessage],
        },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
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

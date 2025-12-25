import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSession();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSession = async () => {
    try {
      const response = await api.get('/chat/session');
      setSessionId(response.data.sessionId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      sender: 'user',
      text: input.trim()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/message', {
        message: input.trim(),
        sessionId: sessionId
      });

      setSessionId(response.data.sessionId);
      setMessages(response.data.messages);
    } catch (error) {
      setMessages([...messages, userMessage, {
        role: 'assistant',
        sender: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="chatbot-widget">
          <div className="chatbot-header">
            <h3>AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="close-button">
              ×
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Hi! I'm your AI interview preparation assistant. How can I help you today?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant-message">
                <div className="message-content">
                  <div className="loading"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;


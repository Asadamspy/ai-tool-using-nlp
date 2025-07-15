import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved
      ? JSON.parse(saved)
      : [{ role: 'system', content: 'You are a helpful assistant.' }];
  });
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const chatBoxRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Using fetch instead of axios for compatibility
      const res = await fetch('https://ai-tool-using-nlp.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        })
      });

      const data = await res.json();
      const reply = data.generated_text || 'No response.';
      const updatedMessages = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(updatedMessages);
      localStorage.setItem('chatHistory', JSON.stringify(updatedMessages));
    } catch (err) {
      const errorMessages = [...newMessages, { role: 'assistant', content: '❌ Error generating response.' }];
      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('chatHistory');
    setMessages([{ role: 'system', content: 'You are a helpful assistant.' }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            min-height: 100vh;
          }
          
          .chat-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          
          .chat-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.03) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .chat-inner {
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: linear-gradient(135deg, #111111 0%, #000000 100%);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6),
                        0 0 0 1px rgba(255, 215, 0, 0.1);
            overflow: hidden;
            position: relative;
          }
          
          .chat-inner::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.02) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .chat-header {
            padding: 2rem 2rem 1.5rem;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            border-bottom: 1px solid rgba(255, 215, 0, 0.1);
            position: relative;
            overflow: hidden;
          }
          
          .chat-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.05) 50%, transparent 100%);
            animation: shimmer 3s infinite;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .chat-title {
            font-size: clamp(1.75rem, 4vw, 2.5rem);
            margin: 0;
            font-weight: 700;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #FFD700 0%, #F0C814 50%, #DAA520 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center;
            position: relative;
            z-index: 1;
          }
          
          .chat-subtitle {
            text-align: center;
            color: #888;
            font-size: 0.95rem;
            margin-top: 0.5rem;
            font-weight: 400;
            position: relative;
            z-index: 1;
          }
          
          .chat-box {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            background: #000000;
            min-height: 0;
          }
          
          .chat-box::-webkit-scrollbar {
            width: 6px;
          }
          
          .chat-box::-webkit-scrollbar-track {
            background: #111111;
            border-radius: 10px;
          }
          
          .chat-box::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #333, #555);
            border-radius: 10px;
          }
          
          .chat-box::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #FFD700, #F0C814);
          }
          
          .message {
            padding: 1.25rem 1.5rem;
            border-radius: 20px;
            max-width: 85%;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 0.95rem;
            position: relative;
            backdrop-filter: blur(10px);
            animation: messageSlide 0.3s ease-out;
          }
          
          @keyframes messageSlide {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .user-message {
            background: linear-gradient(135deg, #FFD700 0%, #F0C814 100%);
            color: #000000;
            align-self: flex-end;
            margin-left: auto;
            border-bottom-right-radius: 8px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
          }
          
          .assistant-message {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: #ffffff;
            align-self: flex-start;
            border: 1px solid rgba(255, 215, 0, 0.1);
            border-bottom-left-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          }
          
          .message-label {
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .user-message .message-label {
            color: #000000;
          }
          
          .assistant-message .message-label {
            color: #FFD700;
          }
          
          .input-section {
            padding: 2rem;
            background: linear-gradient(135deg, #111111 0%, #000000 100%);
            border-top: 1px solid rgba(255, 215, 0, 0.1);
          }
          
          .input-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            align-items: flex-end;
          }
          
          .input-wrapper {
            flex: 1;
            position: relative;
          }
          
          .input-box {
            width: 100%;
            padding: 1rem 1.25rem;
            border-radius: 16px;
            font-size: 1rem;
            border: 2px solid #333;
            outline: none;
            background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%);
            color: #ffffff;
            transition: all 0.3s ease;
            font-family: inherit;
            resize: none;
            min-height: 56px;
            line-height: 1.5;
          }
          
          .input-box:focus {
            border-color: #FFD700;
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1),
                        0 8px 32px rgba(255, 215, 0, 0.1);
            background: linear-gradient(135deg, #222222 0%, #1a1a1a 100%);
          }
          
          .input-box::placeholder {
            color: #666;
          }
          
          .send-button {
            padding: 1rem 1.5rem;
            border-radius: 16px;
            background: linear-gradient(135deg, #FFD700 0%, #F0C814 100%);
            color: #000000;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            min-width: 100px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .send-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
            background: linear-gradient(135deg, #F0C814 0%, #DAA520 100%);
          }
          
          .send-button:active {
            transform: translateY(0);
          }
          
          .clear-button {
            background: linear-gradient(135deg, #333 0%, #555 100%);
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            border: 1px solid rgba(255, 215, 0, 0.2);
            color: #FFD700;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0 auto;
          }
          
          .clear-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(255, 215, 0, 0.2);
            background: linear-gradient(135deg, #444 0%, #666 100%);
          }
          
          .loading-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #FFD700;
          }
          
          .loading-dots {
            display: flex;
            gap: 0.25rem;
          }
          
          .loading-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #FFD700;
            animation: loadingBounce 1.4s infinite ease-in-out;
          }
          
          .loading-dot:nth-child(1) { animation-delay: -0.32s; }
          .loading-dot:nth-child(2) { animation-delay: -0.16s; }
          .loading-dot:nth-child(3) { animation-delay: 0s; }
          
          @keyframes loadingBounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
          
          @media (max-width: 768px) {
            .chat-container {
              padding: 0.5rem;
            }
            
            .chat-inner {
              height: 100vh;
              border-radius: 0;
              max-width: 100%;
            }
            
            .chat-header {
              padding: 1.5rem 1rem 1rem;
            }
            
            .chat-title {
              font-size: 1.75rem;
            }
            
            .chat-box {
              padding: 1rem;
              gap: 1rem;
            }
            
            .input-section {
              padding: 1rem;
            }
            
            .input-container {
              flex-direction: column;
              gap: 0.75rem;
            }
            
            .send-button {
              width: 100%;
            }
            
            .message {
              max-width: 95%;
              padding: 1rem;
            }
          }
          
          @media (max-width: 480px) {
            .chat-header {
              padding: 1rem 0.75rem 0.75rem;
            }
            
            .chat-title {
              font-size: 1.5rem;
            }
            
            .chat-box {
              padding: 0.75rem;
            }
            
            .input-section {
              padding: 0.75rem;
            }
            
            .message {
              padding: 0.875rem;
              font-size: 0.9rem;
            }
          }
          
          @media (min-width: 769px) and (max-width: 1024px) {
            .chat-inner {
              max-width: 95%;
            }
            
            .chat-header {
              padding: 1.75rem 1.5rem 1.25rem;
            }
            
            .input-container {
              gap: 1rem;
            }
          }
        `}
      </style>
      
      <div className="chat-container">
        <div className="chat-inner">
          <div className="chat-header">
            <h1 className="chat-title">AI Chat Assistant</h1>
            <p className="chat-subtitle">Your intelligent conversation partner</p>
          </div>

          <div className="chat-box" ref={chatBoxRef}>
            {messages
              .filter((msg) => msg.role !== 'system')
              .map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-label">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="message-content">
                    {msg.role === 'assistant' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: msg.content.replace(/\n/g, '<br>')
                        }}
                      />
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}
            {loading && (
              <div className="message assistant-message">
                <div className="message-label">AI Assistant</div>
                <div className="loading-indicator">
                  <span>Thinking</span>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-section">
            <div className="input-container">
              <div className="input-wrapper">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Type your message here..."
                  className="input-box"
                  rows="1"
                  style={{
                    resize: 'none',
                    overflow: 'hidden',
                    minHeight: '56px',
                    maxHeight: '120px'
                  }}
                />
              </div>
              <button 
                onClick={handleSend} 
                className="send-button"
                disabled={loading || !input.trim()}
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleClearHistory} 
                className="clear-button"
              >
                <span>🧹</span>
                Clear History
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
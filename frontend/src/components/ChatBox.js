import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ socket, room }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatAreaRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.on('message', (message) => {
      const shouldAutoScroll = isAtBottom();
      setMessages((prevMessages) => [...prevMessages, message]);
      // Use a timeout to ensure the new message has been added to the DOM
      setTimeout(() => {
        if (shouldAutoScroll) {
          scrollToBottom();
        }
      }, 0);
    });
    return () => {
      socket.off('message');
    };
  }, [socket]);

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;
    socket.emit('send_message', { message: inputMessage, room });
    setInputMessage('');
  };

  const scrollToBottom = () => {
    const chatArea = chatAreaRef.current;
    chatArea.scrollTop = chatArea.scrollHeight;
  };

  const isAtBottom = () => {
    const chatArea = chatAreaRef.current;
    const scrollTop = chatArea.scrollTop;
    const clientHeight = chatArea.clientHeight;
    const scrollHeight = chatArea.scrollHeight;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    return distanceToBottom < 20;
  };

  return (
    <div>
      <h3>Chat</h3>
      <div className="chat-area" ref={chatAreaRef}>
        {messages.map((message, index) => (
          <p key={index}>
            <strong>{message.username}: </strong>
            {message.text}
          </p>
        ))}
      </div>
      <div className="send-message-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;

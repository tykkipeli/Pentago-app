import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';
import sendArrow from '../assets/send_arrow_placeholder.png';


const ChatBox = ({ socket, room }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatVisible, setChatVisible] = useState(true);
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
    if (inputMessage.length > 200) {
      alert('Your message is too long. The maximum length is 200 characters.');
      return;
    }
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

  //TODO chatbox divider becomes unclickable when the screen is too narrow
  return (
    <div className="chat-container" style={{ width: chatVisible ? "25%" : "0%" }}>
      <div className="chat-wrapper">
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
          <img src={sendArrow} className="sendArrow" alt="sendArrow" onClick={sendMessage}/>
        </div>
      </div>
      <div
        className={`chatbox-divider ${chatVisible ? "left" : "right"}`}
        onClick={() => setChatVisible((prevChatVisible) => !prevChatVisible)}
      >
      </div>
    </div>
  );
};

export default ChatBox;

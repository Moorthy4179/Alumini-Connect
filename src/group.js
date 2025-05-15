import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './group.css';
import contactIcon from "../src/contact.jpeg";
import Navbar from './navbar'; 

const FriendsPage = () => {
  const [friends, setFriends] = useState([
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Chen' },
    { id: 3, name: 'Priya Patel' },
    { id: 4, name: 'James Wilson' },
    { id: 5, name: 'Sofia Rodriguez' },
    { id: 6, name: 'David Kim' },
    { id: 7, name: 'Emma Thompson' },
    { id: 8, name: 'Raj Sharma' },
    { id: 9, name: 'Olivia Martinez' },
    { id: 10, name: 'Alex Taylor' },
  ]);

  const [showRequests, setShowRequests] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});

  const confirmDeleteFriend = (id) => {
    setFriendToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteFriend = () => {
    if (friendToDelete) {
      setFriends(friends.filter(friend => friend.id !== friendToDelete));
      setShowDeleteConfirm(false);
      setFriendToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFriendToDelete(null);
  };

  const handleVideoCall = (friend) => {
    window.open('https://meet.google.com', '_blank', 'noopener,noreferrer');
  };

  const selectFriend = (friend) => {
    setSelectedFriend(friend);
    
    if (!messages[friend.id]) {
      setMessages(prevMessages => ({
        ...prevMessages,
        [friend.id]: []
      }));
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && selectedFriend) {
      const newMessage = {
        id: Date.now(),
        text: messageInput,
        sender: 'me',
        status: 'sent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prevMessages => ({
        ...prevMessages,
        [selectedFriend.id]: [...(prevMessages[selectedFriend.id] || []), newMessage]
      }));
      
      setMessageInput('');

      setTimeout(() => {
        setMessages(prevMessages => {
          const updatedFriendMessages = prevMessages[selectedFriend.id].map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          );
          
          return {
            ...prevMessages,
            [selectedFriend.id]: updatedFriendMessages
          };
        });
      }, 1000);

      setTimeout(() => {
        setMessages(prevMessages => {
          const updatedFriendMessages = prevMessages[selectedFriend.id].map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          );
          
          return {
            ...prevMessages,
            [selectedFriend.id]: updatedFriendMessages
          };
        });
        
        setTimeout(() => {
          const replyMessage = {
            id: Date.now(),
            text: getRandomReply(),
            sender: 'other',
            status: 'read',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prevMessages => ({
            ...prevMessages,
            [selectedFriend.id]: [...(prevMessages[selectedFriend.id] || []), replyMessage]
          }));
        }, 1000);
      }, 2000);
    }
  };

  const getRandomReply = () => {
    const replies = [
      "That's interesting!",
      "Thanks for letting me know!",
      "Cool! What else is new?",
      "I see, tell me more!",
      "That sounds great!",
      "Really? That's awesome!"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const getMessageStatus = (status) => {
    switch(status) {
      case 'sent':
        return <span className="message-status">✓</span>;
      case 'delivered':
        return <span className="message-status">✓✓</span>;
      case 'read':
        return <span className="message-status read">✓✓</span>;
      default:
        return null;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="home-container">
      <Navbar /> 

      <div className="friends-layout">
        {showDeleteConfirm && (
          <div className="delete-confirmation-overlay">
            <div className="delete-confirmation-box">
              <p>Are you sure you want to delete this friend?</p>
              <div className="confirmation-buttons">
                <button onClick={handleDeleteFriend}>Yes, Delete</button>
                <button onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        
        <div className="friends-list">
          <h3>Your Friends</h3>
          {friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info" onClick={() => selectFriend(friend)}>
                <img src={contactIcon} alt="Contact" className="contact-icon" />
                <span className="friend-name">
                  {friend.name}
                </span>
              </div>
              <div className="friend-actions">
                <button className="chat-btn" onClick={() => selectFriend(friend)}>💬</button>
                <button 
                  className="video-call-btn" 
                  onClick={() => handleVideoCall(friend)}
                >
                  🎥
                </button>
                <button className="delete-btn" onClick={() => confirmDeleteFriend(friend.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-section">
          <div className="requests-container">
            <button className="requests-btn" onClick={() => setShowRequests(!showRequests)}>
              Requests
            </button>
          </div>

          {showRequests && (
            <div className="requests-box">
              <p>No new friend requests!</p>
            </div>
          )}

          <div className="chat-box">
            <div className="chat-header">
              <img src={contactIcon} alt="Contact" className="contact-icon" />
              <span>
                {selectedFriend ? selectedFriend.name : 'Select a friend'}
              </span>
            </div>
            <div className="chat-messages">
              {selectedFriend && messages[selectedFriend.id] ? (
                messages[selectedFriend.id].map(message => (
                  <div key={message.id} className={`message-bubble ${message.sender === 'me' ? 'my-message' : 'other-message'}`}>
                    <div className="message-text">{message.text}</div>
                    <div className="message-meta">
                      {message.timestamp && <span className="message-time">{message.timestamp}</span>}
                      {message.sender === 'me' && getMessageStatus(message.status)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-chat-message">Select a friend to start chatting</p>
              )}
            </div>
            <div className="chat-input">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!selectedFriend}
              />
              <button className="send-btn" onClick={sendMessage} disabled={!selectedFriend}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
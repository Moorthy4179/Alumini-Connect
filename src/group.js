import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './group.css';
import contactIcon from "../src/contact.jpeg";
import Navbar from './navbar'; 

const FriendsPage = () => {
  const [friends, setFriends] = useState([
    { id: 1, name: '' },
    { id: 2, name: '' },
    { id: 3, name: '' },
    { id: 4, name: '' },
    { id: 5, name: '' },
    { id: 6, name: '' },
    { id: 7, name: '' },
    { id: 8, name: '' },
    { id: 9, name: '' },
    { id: 10, name: '' },
  ]);

  const [showRequests, setShowRequests] = useState(false);

  const handleDeleteFriend = (id) => {
    setFriends(friends.filter(friend => friend.id !== id));
  };

  return (
    <div className="home-container">
      <Navbar /> 

      <div className="friends-layout">
        {/* Left Side: Friends List */}
        <div className="friends-list">
          <h3>Your Friends</h3>
          {friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <img src={contactIcon} alt="Contact" className="contact-icon" />
                <input
                  type="text"
                  placeholder="Name"
                  value={friend.name}
                  onChange={(e) =>
                    setFriends(
                      friends.map((f) =>
                        f.id === friend.id ? { ...f, name: e.target.value } : f
                      )
                    )
                  }
                  className="friend-name-input"
                />
              </div>
              <div className="friend-actions">
                <button className="chat-btn">💬</button>
                <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="drive-link">📁</a>
                <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="meet-link">🎥</a>
                <button className="delete-btn" onClick={() => handleDeleteFriend(friend.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Chat and Requests */}
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
              <span>Name</span>
            </div>
            <div className="chat-messages">
              <p>Hii</p>
              <p className="align-right">Hiii</p>
              <p>How are you</p>
              <p>What are you doing</p>
              <p className="align-right">I am fine</p>
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type a message..." />
              <button className="send-btn">➤</button>
            </div>
          </div>

          <p>#Friends</p>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;

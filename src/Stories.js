import React, { useState } from 'react';
import Navbar from './navbar';
import './Stories.css';

const Stories = () => {
  const [stories, setStories] = useState([
    {
      name: "Alumni 1",
      image: "https://images.unsplash.com/photo-1573164574392-9d3d0eaf6d9e",
      text: "I am incredibly grateful to be an alumnus of this college."
    },
    {
      name: "Alumni 2",
      image: "https://images.unsplash.com/photo-1603415526960-f7e0328f6b6b",
      text: "This institution shaped my career and life."
    },
    {
      name: "Alumni 3",
      image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe",
      text: "Proud to be a part of this alumni family."
    },
    {
      name: "Alumni 4",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      text: "Some of my best memories were made here."
    },
    {
      name: "Alumni 5",
      image: "https://images.unsplash.com/photo-1507120878965-6b58b005fa5d",
      text: "Grateful for the learning and friendships."
    },
    {
      name: "Alumni 6",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
      text: "This place felt like a second home."
    },
    {
      name: "Alumni 7",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      text: "The professors here are truly inspiring."
    },
    {
      name: "Alumni 8",
      image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a0",
      text: "I gained confidence and clarity in life."
    },
    {
      name: "Alumni 9",
      image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39",
      text: "A launchpad to my dreams."
    },
    {
      name: "Alumni 10",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      text: "I’ll always cherish my days here."
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({ name: '', image: '', text: '' });

  const handlePostStory = () => {
    if (newStory.name && newStory.image && newStory.text) {
      setStories([newStory, ...stories]); // Adds to top
      setNewStory({ name: '', image: '', text: '' });
      setShowForm(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main className="stories-section">
        <div className="header-row">
          <h2>Stories</h2>
          <button className="post-btn" onClick={() => setShowForm(true)}>＋ POST YOUR STORY</button>
        </div>

        {showForm && (
          <div className="form-popup">
            <div className="form-box">
              <h3>Post Your Story</h3>
              <input
                type="text"
                placeholder="Your Name"
                value={newStory.name}
                onChange={(e) => setNewStory({ ...newStory, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newStory.image}
                onChange={(e) => setNewStory({ ...newStory, image: e.target.value })}
              />
              <textarea
                placeholder="Your Story"
                value={newStory.text}
                onChange={(e) => setNewStory({ ...newStory, text: e.target.value })}
              />
              <div className="form-actions">
                <button onClick={handlePostStory}>Submit</button>
                <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid-container">
          {stories.map((story, index) => (
            <div className="story-card" key={index}>
              <img src={story.image} alt={story.name} />
              <p className="story-text">{story.text}</p>
              <p className="alumni-name">👤 {story.name}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Stories;
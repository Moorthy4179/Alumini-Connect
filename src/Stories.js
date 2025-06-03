import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useAuth } from './AuthContext';
import './Stories.css';
const Stories = () => {
  const { user, isAuthenticated } = useAuth();
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newStory, setNewStory] = useState({ text: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, storyId: null, storyText: '' });
  const [deleting, setDeleting] = useState(null);
  useEffect(() => {
    fetchStories();
  }, []);
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost/Alumni/stories.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server response is not JSON:", text);
        throw new Error("Server returned invalid response format");
      }
      const data = await response.json();
      
      if (data.status === 'success') {
        setStories(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch stories');
      }
    } catch (error) {
      console.error("Fetch stories error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to load stories. Please try again.");
      }
      setStories([
        {
          id: 1,
          alumni_name: "Sample Alumni 1",
          alumni_photo: "https://images.unsplash.com/photo-1573164574392-9d3d0eaf6d9e",
          story_text: "I am incredibly grateful to be an alumnus of this college.",
          student_id: "STU001",
          department: "Computer Science",
          batch_year: "2020",
          formatted_date: "Sample Date"
        },
        {
          id: 2,
          alumni_name: "Sample Alumni 2", 
          alumni_photo: "https://images.unsplash.com/photo-1603415526960-f7e0328f6b6b",
          story_text: "This institution shaped my career and life.",
          student_id: "STU002", 
          department: "Engineering",
          batch_year: "2019",
          formatted_date: "Sample Date"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteStory = async (storyId) => {
    try {
      setDeleting(storyId);
      setError('');

      const response = await fetch('http://localhost/Alumni/stories.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          story_id: storyId,
          student_id: user.student_id 
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server response is not JSON:", text);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();

      if (data.status === 'success') {
        setStories(prevStories => prevStories.filter(story => story.id !== storyId));
        setSuccess('Story deleted successfully!');
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to delete story');
      }
    } catch (error) {
      console.error("Delete story error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to delete story. Please try again.");
      }
    } finally {
      setDeleting(null);
      setDeleteConfirm({ show: false, storyId: null, storyText: '' });
    }
  };

  const showDeleteConfirm = (story) => {
    setDeleteConfirm({
      show: true,
      storyId: story.id,
      storyText: story.story_text.substring(0, 100) + (story.story_text.length > 100 ? '...' : '')
    });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, storyId: null, storyText: '' });
  };

  const handlePostStory = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Please log in to post a story');
      return;
    }

    if (!newStory.text.trim()) {
      setError('Please write your thoughts before submitting');
      return;
    }

    if (newStory.text.trim().length < 10) {
      setError('Story must be at least 10 characters long');
      return;
    }

    if (newStory.text.trim().length > 1000) {
      setError('Story must be less than 1000 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const storyData = {
        student_id: user.student_id, 
        story_text: newStory.text.trim()
      };

      const response = await fetch('http://localhost/Alumni/stories.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(storyData)
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server response is not JSON:", text);
        throw new Error("Server returned invalid response format");
      }

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess('Story posted successfully!');
        setNewStory({ text: '' });
        
        // Add new story to the beginning of the list
        if (data.data) {
          setStories(prevStories => [data.data, ...prevStories]);
        }
        
        // Close form after a short delay
        setTimeout(() => {
          setShowForm(false);
          setSuccess('');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to post story');
      }
    } catch (error) {
      console.error("Post story error:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError("Unable to connect to server. Please check if the server is running.");
      } else {
        setError(error.message || "Failed to post story. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowForm = () => {
    if (!isAuthenticated) {
      alert('Please log in to post a story!');
      return;
    }
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setNewStory({ text: '' });
    setError('');
    setSuccess('');
  };

  return (
    <div>
      <Navbar />

      <main className="stories-section">
        <div className="header-row">
          <h2>Alumni Stories</h2>
          <button className="post-btn" onClick={handleShowForm}>
            ＋ POST YOUR STORY
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {deleteConfirm.show && (
          <div className="form-popup delete-popup">
            <div className="form-box delete-confirm-box">
              <h3>🗑️ Delete Story</h3>
              <p>Are you sure you want to delete this story?</p>
              <div className="story-preview">
                "{deleteConfirm.storyText}"
              </div>
              <p className="warning-text">This action cannot be undone.</p>
              
              <div className="form-actions">
                <button 
                  className="delete-confirm-btn"
                  onClick={() => handleDeleteStory(deleteConfirm.storyId)}
                  disabled={deleting === deleteConfirm.storyId}
                >
                  {deleting === deleteConfirm.storyId ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button 
                  type="button" 
                  onClick={cancelDelete} 
                  className="cancel-btn"
                  disabled={deleting === deleteConfirm.storyId}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="form-popup">
            <div className="form-box">
              <h3>Share Your Story</h3>
              {isAuthenticated && user && (
                <div className="user-info">
                  <img 
                    src={user.photo || '/api/placeholder/150/150'} 
                    alt={user.name}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/150/150';
                    }}
                  />
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-id">ID: {user.student_id}</span>
                    <span className="user-dept">{user.department} - {user.batch_year}</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <form onSubmit={handlePostStory}>
                <textarea
                  placeholder="Write your thoughts, experiences, or memories about your time at the college..."
                  value={newStory.text}
                  onChange={(e) => setNewStory({ ...newStory, text: e.target.value })}
                  rows="5"
                  maxLength="1000"
                  disabled={submitting}
                  required
                />
                <div className="char-count">
                  {newStory.text.length}/1000 characters
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={submitting || !newStory.text.trim()}
                    className={submitting ? 'submitting' : ''}
                  >
                    {submitting ? 'Posting...' : 'Submit Story'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCloseForm} 
                    className="cancel-btn"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading stories...</div>
        ) : (
          <div className="grid-container">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div className="story-card" key={story.id}>
                  {/* Delete button - only show for user's own stories */}
                  {isAuthenticated && user && user.student_id === story.student_id && (
                    <button 
                      className="delete-story-btn"
                      onClick={() => showDeleteConfirm(story)}
                      disabled={deleting === story.id}
                      title="Delete this story"
                    >
                      {deleting === story.id ? '⏳' : '🗑️'}
                    </button>
                  )}
                  
                  <img 
                    src={story.alumni_photo || '/api/placeholder/150/150'} 
                    alt={story.alumni_name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/150/150';
                    }}
                  />
                  <p className="story-text">{story.story_text}</p>
                  <div className="story-footer">
                    <p className="alumni-name">👤 {story.alumni_name}</p>
                    <p className="department">🎓 {story.department}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-stories">
                <p>No stories available yet.</p>
                {isAuthenticated && (
                  <p>Be the first to share your story!</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default Stories;
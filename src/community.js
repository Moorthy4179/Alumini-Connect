import React, { useState, useEffect, useRef } from 'react';
import Navbar from './navbar';
import { useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './community.css';

const Community = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0); 
  const chatMessagesRef = useRef(null);
  const chatIntervalRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const notificationIntervalRef = useRef(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [isCallWaiting, setIsCallWaiting] = useState(false);
  const [callTimeout, setCallTimeout] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const callCheckInterval = useRef(null);
  const API_BASE_URL = 'http://localhost/Alumni';

  // Add Font Awesome CSS dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);

    // Cleanup function to remove the link when component unmounts
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const getCurrentUserId = () => {
    return isAuthenticated && user?.id ? user.id : null;
  };
  
  const incomingCallIntervalRef = useRef(null);

const initializeVideoCall = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    localStream.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    setError('Unable to access camera/microphone');
    return null;
  }
};

const startVideoCall = async (friend) => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  try {
    const stream = await initializeVideoCall();
    if (!stream) return;

    setSelectedFriend(friend);
    setShowVideoCall(true);
    setIsCallWaiting(true);
    const formData = new FormData();
    formData.append('caller_id', currentUserId);
    formData.append('receiver_id', friend.id);
    formData.append('action', 'initiate_call');
    
    const response = await fetch(`${API_BASE_URL}/video_call.php`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      const timeout = setTimeout(() => {
        endCall();
        setError('Call not answered. Try again later.');
      }, 30000);
      setCallTimeout(timeout);
      checkCallStatus(friend.id);
    }
  } catch (error) {
    console.error('Error starting video call:', error);
    setError('Failed to start video call');
  }
};

const checkCallStatus = (friendId) => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  if (callCheckInterval.current) {
    clearInterval(callCheckInterval.current);
  }

  callCheckInterval.current = setInterval(async () => {
    try {
      const formData = new FormData();
      formData.append('caller_id', currentUserId);
      formData.append('receiver_id', friendId);
      formData.append('action', 'check_status');
      
      const response = await fetch(`${API_BASE_URL}/video_call.php`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.log('HTTP error:', response.status);
        return;
      }
      
      const responseText = await response.text();
      if (!responseText.trim()) {
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log('Parse error:', parseError);
        return;
      }
      
      if (data.status === 'accepted') {
        setIsCallWaiting(false);
        setIsCallActive(true);
        if (callTimeout) clearTimeout(callTimeout);
        clearInterval(callCheckInterval.current);
      } else if (data.status === 'rejected') {
        endCall();
        setError('Call was declined');
        clearInterval(callCheckInterval.current);
      }
    } catch (error) {
      console.log('Network error:', error.message);
    }
  }, 2000);
};

const checkIncomingCalls = async () => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return;

  try {
    const formData = new FormData();
    formData.append('user_id', currentUserId);
    formData.append('action', 'check_incoming');
    
    const response = await fetch(`${API_BASE_URL}/video_call.php`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      console.log('HTTP error:', response.status);
      return;
    }
    
    const responseText = await response.text();
    
    if (!responseText.trim()) {
      console.log('Empty response received');
      return;
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      console.log('Response text:', responseText.substring(0, 200));
      return;
    }
    
    if (data.status === 'incoming_call' && data.caller) {
      setIncomingCall(data.caller);
    }
  } catch (error) {
    console.log('Network error checking incoming calls:', error.message);
  }
};

const acceptCall = async () => {
  if (!incomingCall) return;
  
  const currentUserId = getCurrentUserId();
  try {
    const stream = await initializeVideoCall();
    if (!stream) return;

    const formData = new FormData();
    formData.append('caller_id', incomingCall.id);
    formData.append('receiver_id', currentUserId);
    formData.append('action', 'accept_call');
    
    const response = await fetch(`${API_BASE_URL}/video_call.php`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      setSelectedFriend(incomingCall);
      setIncomingCall(null);
      setShowVideoCall(true);
      setIsCallActive(true);
    }
  } catch (error) {
    console.error('Error accepting call:', error);
    setError('Failed to accept call');
  }
};

const rejectCall = async () => {
  if (!incomingCall) return;
  
  const currentUserId = getCurrentUserId();
  try {
    const formData = new FormData();
    formData.append('caller_id', incomingCall.id);
    formData.append('receiver_id', currentUserId);
    formData.append('action', 'reject_call');
    
    await fetch(`${API_BASE_URL}/video_call.php`, {
      method: 'POST',
      body: formData
    });
    
    setIncomingCall(null);
  } catch (error) {
    console.error('Error rejecting call:', error);
  }
};

const endCall = () => {
  if (localStream.current) {
    localStream.current.getTracks().forEach(track => track.stop());
    localStream.current = null;
  }
  
  if (callTimeout) {
    clearTimeout(callTimeout);
    setCallTimeout(null);
  }
  
  if (callCheckInterval.current) {
    clearInterval(callCheckInterval.current);
  }
  
  setShowVideoCall(false);
  setIsCallActive(false);
  setIsCallWaiting(false);
  setSelectedFriend(null);
};

  const renderUserAvatar = (user, size = 50) => {
    const getInitials = (name) => {
      if (!name) return '?';
      const names = name.trim().split(' ');
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };
    const getRandomColor = (name) => {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };
    const initials = getInitials(user.name);
    const backgroundColor = getRandomColor(user.name || 'User');
    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: backgroundColor,
          fontSize: `${size * 0.35}px`,
          border: '2px solid #dee2e6'
        }}
      >
        {initials}
      </div>
    );
  };

  useEffect(() => {
  let incomingCallInterval;
  
  if (isAuthenticated) {
    fetchFriendsList();
    fetchPendingRequests();
    fetchSentRequests();
    startNotificationPolling();
    checkIncomingCalls();
    incomingCallInterval = setInterval(checkIncomingCalls, 3000);
  }
  
  return () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
    }
    if (incomingCallInterval) {
      clearInterval(incomingCallInterval);
    }
  };
}, [isAuthenticated]);

  const startNotificationPolling = () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.log('No user ID found for notifications');
      return;
    }
    console.log('Starting notification polling for user:', currentUserId);
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    fetchUnreadCounts();
    notificationIntervalRef.current = setInterval(() => {
      fetchUnreadCounts();
    }, 3000);
  };

  const fetchUnreadCounts = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('user_id', currentUserId);
      console.log('Fetching unread counts for user:', currentUserId);
      const response = await fetch(`${API_BASE_URL}/get_unread_counts.php`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Unread counts response:', data);
      if (data.status === 'success') {
        const newUnreadCounts = data.unread_counts || {};
        const newTotalUnread = data.total_unread || 0;
        setUnreadCounts(newUnreadCounts);
        setTotalUnreadCount(newTotalUnread);
        console.log('Updated unread counts:', newUnreadCounts);
        console.log('Total unread:', newTotalUnread);
      } else {
        console.error('Error in unread counts response:', data.message);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const markMessagesAsRead = async (friendId) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('user_id', currentUserId);
      formData.append('friend_id', friendId);
      const response = await fetch(`${API_BASE_URL}/mark_messages_read.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUnreadCounts(prev => {
          const updated = { ...prev };
          const oldCount = updated[friendId] || 0;
          updated[friendId] = 0;
          setTotalUnreadCount(prevTotal => Math.max(0, prevTotal - oldCount));
          return updated;
        });
        console.log(`Marked messages as read for friend ${friendId}`);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (showChatModal && selectedFriend) {
      fetchChatMessages(selectedFriend.id);
      markMessagesAsRead(selectedFriend.id);
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
      chatIntervalRef.current = setInterval(() => {
        fetchChatMessages(selectedFriend.id, true);
      }, 2000);
      return () => {
        if (chatIntervalRef.current) {
          clearInterval(chatIntervalRef.current);
        }
      };
    }
  }, [showChatModal, selectedFriend]);

  useEffect(() => {
    if (chatMessages.length > lastMessageCountRef.current) {
      setTimeout(scrollToBottom, 100);
    }
    lastMessageCountRef.current = chatMessages.length;
  }, [chatMessages]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setError('');
    try {
      const deptResponse = await fetch(`${API_BASE_URL}/get_alumni.php`);
      const deptData = await deptResponse.json();
      if (deptData.status === 'success' && deptData.departments) {
        const allAlumni = [];
        for (const dept of deptData.departments) {
          const yearsResponse = await fetch(`${API_BASE_URL}/get_alumni.php?department=${encodeURIComponent(dept.department)}`);
          const yearsData = await yearsResponse.json();
          if (yearsData.status === 'success' && yearsData.years) {
            for (const yearData of yearsData.years) {
              const alumniResponse = await fetch(`${API_BASE_URL}/get_alumni.php?department=${encodeURIComponent(dept.department)}&batch_year=${yearData.batch_year}`);
              const alumniData = await alumniResponse.json();
              if (alumniData.status === 'success' && alumniData.alumni) {
                allAlumni.push(...alumniData.alumni);
              }
            }
          }
        }
        const filteredResults = allAlumni.filter(alumni => {
          const query = searchQuery.toLowerCase();
          return (
            alumni.name.toLowerCase().includes(query) ||
            alumni.email.toLowerCase().includes(query) ||
            alumni.department.toLowerCase().includes(query) ||
            alumni.student_id.toLowerCase().includes(query)
          );
        });
        const currentUserId = getCurrentUserId();
        const finalResults = filteredResults.filter(alumni => 
          parseInt(alumni.id) !== parseInt(currentUserId)
        );
        setSearchResults(finalResults);
      } else {
        setError('Failed to load alumni data');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Network error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const fetchFriendsList = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('user_id', currentUserId);
      const response = await fetch(`${API_BASE_URL}/get_friends.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setFriendsList(data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchPendingRequests = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('user_id', currentUserId);
      const response = await fetch(`${API_BASE_URL}/get_pending_requests.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const fetchSentRequests = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('user_id', currentUserId);
      const response = await fetch(`${API_BASE_URL}/get_sent_requests.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const handleSendRequest = (user) => {
    setSelectedUser(user);
    setRequestMessage(`Hi ${user.name}, I would like to connect with you!`);
    setShowRequestModal(true);
  };

  const sendFriendRequest = async () => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('sender_id', currentUserId);
      formData.append('receiver_id', selectedUser.id);
      formData.append('message', requestMessage);
      const response = await fetch(`${API_BASE_URL}/send_friend_request.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Friend request sent successfully!');
        setShowRequestModal(false);
        setRequestMessage('');
        setSelectedUser(null);
        await fetchSentRequests();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to send request');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('current_user_id', currentUserId);
      formData.append('other_user_id', request.sender_id || request.id);
      formData.append('action', 'accept');
      const response = await fetch(`${API_BASE_URL}/manage_friend_request.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Friend request accepted!');
        await Promise.all([
          fetchFriendsList(),
          fetchPendingRequests(),
          fetchSentRequests()
        ]);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Accept request error:', error);
      setError('Failed to accept request');
    }
  };

  const handleRejectRequest = async (request) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('current_user_id', currentUserId);
      formData.append('other_user_id', request.sender_id || request.id);
      formData.append('action', 'reject');
      const response = await fetch(`${API_BASE_URL}/manage_friend_request.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Friend request rejected');
        await fetchPendingRequests();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Reject request error:', error);
      setError('Failed to reject request');
    }
  };

  const openChat = (friend) => {
    setSelectedFriend(friend);
    setShowChatModal(true);
    setChatMessages([]);
    lastMessageCountRef.current = 0;
  };

  const closeChat = () => {
    setShowChatModal(false);
    setSelectedFriend(null);
    setChatMessages([]);
    setNewMessage('');
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
    }
  };

  const fetchChatMessages = async (friendId, silent = false) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('user1_id', currentUserId);
      formData.append('user2_id', friendId);
      const response = await fetch(`${API_BASE_URL}/get_messages.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        const newMessages = data.messages || [];
        setChatMessages(newMessages);
      }
    } catch (error) {
      if (!silent) {
        console.error('Error fetching messages:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;
    try {
      const formData = new FormData();
      formData.append('sender_id', currentUserId);
      formData.append('receiver_id', selectedFriend.id);
      formData.append('message', newMessage);
      const response = await fetch(`${API_BASE_URL}/send_message.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.status === 'success') {
        setNewMessage('');
        fetchChatMessages(selectedFriend.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getConnectionStatus = (userId) => {
    const userIdStr = userId.toString();
    if (friendsList.some(friend => friend.id.toString() === userIdStr)) {
      return 'friends';
    }
    if (sentRequests.some(req => req.id.toString() === userIdStr || req.receiver_id?.toString() === userIdStr)) {
      return 'sent';
    }
    if (pendingRequests.some(req => req.id.toString() === userIdStr || req.sender_id?.toString() === userIdStr)) {
      return 'pending';
    }
    return 'none';
  };

  const getFilteredFriends = () => {
    if (!friendsSearchQuery.trim()) {
      return friendsList;
    }
    const query = friendsSearchQuery.toLowerCase();
    return friendsList.filter(friend => 
      friend.name.toLowerCase().includes(query) ||
      friend.email.toLowerCase().includes(query) ||
      friend.department.toLowerCase().includes(query) ||
      friend.batch_year.toString().includes(query)
    );
  };

  const renderSearchResults = () => (
    <div className="card">
      <div className="card-header">
        <h5>Search People</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isSearching && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status"></div>
            <span className="ms-2">Searching...</span>
          </div>
        )}
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(user => {
              const status = getConnectionStatus(user.id);
              return (
                <div key={user.id} className="d-flex align-items-center justify-content-between p-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {renderUserAvatar(user, 50)}
                    </div>
                    <div>
                      <h6 className="mb-1">{user.name}</h6>
                      <small className="text-muted">{user.department} • {user.batch_year}</small>
                      <br />
                      <small className="text-muted">{user.email}</small>
                      <br />
                      <small className="text-muted">ID: {user.student_id}</small>
                    </div>
                  </div>
                  <div>
                    {status === 'friends' ? (
                      <span className="badge bg-success">Friends</span>
                    ) : status === 'sent' ? (
                      <span className="badge bg-warning">Request Sent</span>
                    ) : status === 'pending' ? (
                      <span className="badge bg-info">Pending Request</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendRequest(user)}
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : searchQuery.trim() && !isSearching ? (
            <div className="text-center py-4">
              <p className="text-muted">No alumni found matching your search</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderFriendsList = () => {
    const filteredFriends = getFilteredFriends();
    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            My Friends ({friendsList.length})
            {totalUnreadCount > 0 && (
              <span className="badge bg-danger ms-2"></span>
            )}
          </h5>
          <div style={{width: '200px'}}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search friends..."
              value={friendsSearchQuery}
              onChange={(e) => setFriendsSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body">
  {filteredFriends.length > 0 ? (
    filteredFriends.map(friend => {
      const friendUnreadCount = unreadCounts[friend.id] || 0;
      return (
        <div key={friend.id} className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className="me-3">
              {renderUserAvatar(friend, 50)}
            </div>
            <div>
              <h6 className="mb-1">
                {friend.name}
                {friendUnreadCount > 0 && (
                  <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>
                    {friendUnreadCount} new
                  </span>
                )}
              </h6>
              <small className="text-muted">{friend.department} • {friend.batch_year}</small>
              <br />
              <small className="text-muted">{friend.email}</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className={`btn ${friendUnreadCount > 0 ? 'btn-primary' : 'btn-outline-primary'} btn-sm position-relative`}
              onClick={() => openChat(friend)}
              style={friendUnreadCount > 0 ? {
                animation: 'pulse 2s infinite',
                boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
              } : {}}
            >
              <i className="fas fa-comment me-1"></i>
              Chat
              {friendUnreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{
                    fontSize: '0.65rem',
                    minWidth: '18px',
                    height: '18px',
                    zIndex: 1
                  }}
                >
                  {friendUnreadCount}
                </span>
              )}
            </button>
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => startVideoCall(friend)}
              title="Video Call"
            >
              <i className="fas fa-video me-1"></i>
              Video
            </button>
          </div>
        </div>
      );
    })
  ) : friendsSearchQuery.trim() ? (
    <div className="text-center py-4">
      <p className="text-muted">No friends found matching your search</p>
    </div>
  ) : (
    <div className="text-center py-4">
      <p className="text-muted">No friends yet. Start by searching for people!</p>
    </div>
  )}
</div>
      </div>
    );
  };

  const renderRequests = () => (
    <div className="card">
      <div className="card-header">
        <h5>Friend Requests</h5>
      </div>
      <div className="card-body">
        <h6>Received Requests ({pendingRequests.length})</h6>
        {pendingRequests.length > 0 ? (
          pendingRequests.map(request => (
            <div key={request.request_id || request.id} className="d-flex align-items-center justify-content-between p-3 border rounded mb-2">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {renderUserAvatar(request, 40)}
                </div>
                <div>
                  <h6 className="mb-1">{request.name}</h6>
                  <small className="text-muted">{request.department} • {request.batch_year}</small>
                  {request.message && (
                    <div className="mt-1">
                      <small className="text-muted">Message: "{request.message}"</small>
                    </div>
                  )}
                </div>
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleAcceptRequest(request)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRejectRequest(request)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No pending requests</p>
        )}
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="container-fluid p-0">
        <Navbar />
        <div className="container py-4">
          <div className="alert alert-warning" role="alert">
            Please log in to access the community features.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <Navbar />
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h2 className="mb-3">Alumni Community</h2>
            <p className="lead">Connect, chat, and stay in touch with fellow alumni</p>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                >
                  Friends 
                  {totalUnreadCount > 0 && (
                    <span className="badge bg-danger ms-1">{totalUnreadCount}</span>
                  )}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  Search People
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  Requests 
                  {pendingRequests.length > 0 && (
                    <span className="badge bg-danger ms-1">{pendingRequests.length}</span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        )}
        <div className="row">
          <div className="col-12">
            {activeTab === 'friends' && renderFriendsList()}
            {activeTab === 'search' && renderSearchResults()}
            {activeTab === 'requests' && renderRequests()}
          </div>
        </div>
      </div>
      {showRequestModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Friend Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowRequestModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedUser && (
                  <div className="mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {renderUserAvatar(selectedUser, 60)}
                          </div>
                          <div>
                            <h6 className="card-title mb-1">{selectedUser.name}</h6>
                            <p className="card-text mb-0">
                              <small className="text-muted">
                                {selectedUser.department} • {selectedUser.batch_year}
                              </small>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Message (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Add a personal message..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={sendFriendRequest}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showChatModal && selectedFriend && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {renderUserAvatar(selectedFriend, 40)}
                  </div>
                  <h5 className="modal-title mb-0">Chat with {selectedFriend.name}</h5>
                </div>
                <button type="button" className="btn-close" onClick={closeChat}></button>
              </div>
              <div className="modal-body">
                <div 
                  ref={chatMessagesRef}
                  className="chat-messages" 
                  style={{
                    height: '400px', 
                    overflowY: 'auto', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '0.375rem', 
                    padding: '1rem', 
                    marginBottom: '1rem'
                  }}
                >
                  {chatMessages.length > 0 ? (
                    chatMessages.map((message, index) => (
                      <div key={index} className={`mb-2 ${message.sender_id == getCurrentUserId() ? 'text-end' : 'text-start'}`}>
                        <div className={`d-inline-block p-2 rounded ${message.sender_id == getCurrentUserId() ? 'bg-primary text-white' : 'bg-light'}`} style={{maxWidth: '70%'}}>
                          {message.message}
                        </div>
                        <div className="small text-muted mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Incoming Call Modal */}
{incomingCall && (
  <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999}}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center p-4">
          <div className="mb-3">
            {renderUserAvatar(incomingCall, 80)}
          </div>
          <h5>{incomingCall.name}</h5>
          <p className="text-muted">Incoming video call...</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <button 
  className="btn btn-success btn-lg rounded-circle d-flex align-items-center justify-content-center"
  onClick={acceptCall}
  style={{width: '60px', height: '60px'}}
>
  <i className="fas fa-phone" style={{fontSize: '1.2rem'}}></i>
</button>
<button 
  className="btn btn-danger btn-lg rounded-circle d-flex align-items-center justify-content-center"
  onClick={rejectCall}
  style={{width: '60px', height: '60px'}}
>
  <i className="fas fa-phone-slash" style={{fontSize: '1.2rem'}}></i>
</button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* Video Call Modal */}
{showVideoCall && selectedFriend && (
  <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999}}>
    <div className="modal-dialog modal-fullscreen">
      <div className="modal-content bg-dark">
        <div className="modal-header border-0 bg-transparent">
          <div className="d-flex align-items-center text-white">
            {renderUserAvatar(selectedFriend, 40)}
            <div className="ms-3">
              <h5 className="mb-0">{selectedFriend.name}</h5>
              <small className="text-muted">
                {isCallWaiting ? 'Calling...' : isCallActive ? 'Connected' : 'Connecting...'}
              </small>
            </div>
          </div>
          <button type="button" className="btn-close btn-close-white" onClick={endCall}></button>
        </div>
        <div className="modal-body d-flex justify-content-center align-items-center position-relative" style={{height: 'calc(100vh - 140px)'}}>
          {isCallWaiting ? (
            <div className="text-center text-white">
              <div className="spinner-border mb-3" role="status"></div>
              <h4>Calling {selectedFriend.name}...</h4>
              <p>Waiting for response...</p>
            </div>
          ) : (
            <div className="w-100 h-100 position-relative">
              {/* Remote video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-100 h-100"
                style={{objectFit: 'cover', backgroundColor: '#000'}}
              />
              
              {/* Local video (small overlay) */}
              <div 
                className="position-absolute"
                style={{
                  top: '20px',
                  right: '20px',
                  width: '200px',
                  height: '150px',
                  border: '2px solid white',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-100 h-100"
                  style={{objectFit: 'cover'}}
                />
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer border-0 bg-transparent justify-content-center">
          <button 
            className="btn btn-danger btn-lg rounded-circle d-flex align-items-center justify-content-center"
            onClick={endCall}
            style={{width: '60px', height: '60px'}}
          >
            <i className="fas fa-phone-slash" style={{fontSize: '1.2rem'}}></i>
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
export default Community;
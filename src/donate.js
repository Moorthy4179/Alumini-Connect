import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import the real AuthContext
import Navbar from './navbar';

const DonateNow = () => {
  const { user, isAuthenticated } = useAuth(); // Use the real auth context
  const [donationRequests, setDonationRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState(''); // Track selected purpose
  const [formData, setFormData] = useState({
    purpose: '',
    amount: '',
    screenshot: null
  });
  // Add state to store submitted donation details for success modal
  const [submittedDonation, setSubmittedDonation] = useState({
    purpose: '',
    amount: ''
  });

  // API base URL - update this to match your backend
  const API_BASE_URL = 'http://localhost/Alumni';

  // Fetch donation requests from backend with CORS handling
  useEffect(() => {
    fetchDonationRequests();
  }, []);

  const fetchDonationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the donation.php endpoint like in AdminDonation component
      const response = await fetch(`${API_BASE_URL}/donation.php?action=requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setDonationRequests(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch donation requests');
      }
    } catch (error) {
      console.error('Error fetching donation requests:', error);
      setError('Unable to load donation requests. Please try again later.');
      
      // Fallback: try the original API endpoint
      try {
        const fallbackResponse = await fetch(`${API_BASE_URL}/api.php?action=requests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          if (fallbackResult.status === 'success') {
            setDonationRequests(fallbackResult.data || []);
            setError(null);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDonateClick = (purpose = '') => {
    if (donationRequests.length === 0) {
      alert('No donation requests available at the moment. Please check back later.');
      return;
    }
    
    // Pre-select the purpose if provided (from card button)
    setSelectedPurpose(purpose);
    setFormData(prev => ({ ...prev, purpose: purpose }));
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedPurpose('');
    setFormData({ purpose: '', amount: '', screenshot: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or GIF)');
        e.target.value = ''; // Clear the input
        return;
      }

      if (file.size > maxSize) {
        alert('File size should be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.purpose || !formData.amount || !formData.screenshot) {
      alert('Please fill in all fields and upload screenshot');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();
      submitData.append('action', 'donation');
      submitData.append('purpose', formData.purpose);
      submitData.append('donationAmount', formData.amount);
      submitData.append('donorName', user.name || user.username || 'Anonymous');
      submitData.append('donorEmail', user.email || '');
      submitData.append('donorPhone', user.phone || user.mobile || '');
      submitData.append('photo', formData.screenshot);

      // Try donation.php first (matching AdminDonation pattern)
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/donation.php`, {
          method: 'POST',
          body: submitData,
          mode: 'cors',
        });
      } catch (corsError) {
        // Fallback to original API endpoint
        console.log('Trying fallback API endpoint...');
        response = await fetch(`${API_BASE_URL}/api.php`, {
          method: 'POST',
          body: submitData,
          mode: 'cors',
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        // Store the submitted donation details BEFORE resetting form
        setSubmittedDonation({
          purpose: formData.purpose,
          amount: formData.amount
        });
        
        // Show custom success modal instead of basic alert
        setShowSuccessModal(true);
        handleClosePopup(); // Now it's safe to reset form data
        fetchDonationRequests(); 
      } else {
        throw new Error(result.message || 'Failed to submit donation');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      alert('Failed to submit donation. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle popup body scroll
  useEffect(() => {
    if (showPopup || showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup, showSuccessModal]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Please Login</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              You need to be logged in to make donations and help support our causes.
            </p>
            <button 
              onClick={() => window.location.href = '/login'} 
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url("https://t4.ftcdn.net/jpg/06/52/22/59/360_F_652225930_sbWHvu8GlyCrcGwTweBdEAlf8xor5VXL.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px 20px',
        color: 'white',
        position: 'relative'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5rem',
          color: 'white',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          Make a Donation
        </h2>
        
        {/* General Donate Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
        </div>
        
        {error && (
          <div style={{ 
            textAlign: 'center', 
            fontSize: '16px',
            backgroundColor: 'rgba(244, 67, 54, 0.9)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            maxWidth: '500px',
            margin: '0 auto 20px auto'
          }}>
            {error}
            <button 
              onClick={fetchDonationRequests}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: 'white',
                color: '#f44336',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        {loading && donationRequests.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            fontSize: '18px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#000',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '300px',
            margin: '0 auto'
          }}>
            Loading donation requests...
          </div>
        ) : donationRequests.length === 0 && !loading ? (
          <div style={{ 
            textAlign: 'center', 
            fontSize: '18px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#000',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            No donation requests available at the moment.
            <br />
            <button 
              onClick={fetchDonationRequests}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '25px'
          }}>
            {donationRequests.map((req) => (
              <div key={req.id} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                padding: '25px',
                width: '300px',
                borderRadius: '12px',
                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{
                  fontSize: '20px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {req.purpose}
                </h4>
                <p><strong>Amount Needed:</strong> ₹{parseFloat(req.amount || 0).toLocaleString()}</p>
                <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666', flex: 1 }}>
                  {req.description}
                </p>
                
                {/* Payment Instructions */}
                <div style={{
                  backgroundColor: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '15px',
                  border: '1px solid #2196f3'
                }}>
                  <p style={{ 
                    fontWeight: 'bold', 
                    color: '#1976d2', 
                    marginBottom: '10px',
                    fontSize: '15px'
                  }}>
                    💳 Payment Instructions:
                  </p>
                  <p style={{ color: '#333', marginBottom: '8px' }}>
                    Please transfer your donation to the account details below and upload the payment screenshot:
                  </p>
                  <div style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '13px',
                    border: '1px solid #ddd'
                  }}>
                    <p><strong>Account:</strong> {req.account_number}</p>
                    <p><strong>IFSC:</strong> {req.ifsc_code}</p>
                    <p><strong>Name:</strong> {req.account_holder_name}</p>
                    <p><strong>GPay:</strong> {req.gpay_number}</p>
                  </div>
                </div>
                
                {/* Card-specific Donate Button */}
                <button
                  onClick={() => handleDonateClick(req.purpose)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    marginTop: 'auto'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#45a049';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#4caf50';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
                  }}
                >
                  📤 Upload Payment Screenshot
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001
            }}
            onClick={() => setShowSuccessModal(false)}
          >
            <div 
              style={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                padding: '40px',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '500px',
                color: 'white',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                textAlign: 'center',
                border: '3px solid #fff',
                position: 'relative',
                animation: 'modalFadeIn 0.3s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                fontSize: '60px',
                marginBottom: '20px',
                animation: 'bounce 1s infinite'
              }}>
                🎉
              </div>
              
              <h2 style={{
                marginBottom: '20px',
                fontSize: '28px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Thank You for Your Generous Donation!
              </h2>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '25px',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                <p style={{
                  fontSize: '18px',
                  marginBottom: '10px',
                  fontWeight: '500'
                }}>
                  Dear {user.name || user.username},
                </p>
                <p style={{
                  fontSize: '16px',
                  marginBottom: '15px'
                }}>
                  Your donation of <strong>₹{submittedDonation.amount}</strong> towards <strong>{submittedDonation.purpose}</strong> has been successfully submitted!
                </p>
                <div style={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '3px solid #FFA500',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: 'none',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                  margin: '15px 0',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                  <p style={{ margin: 0 }}>
                    After verification, you will receive a 
                    <span style={{
                      color: '#FF4500',
                      textDecoration: 'underline',
                      fontWeight: 'bolder',
                      fontSize: '18px'
                    }}> DONATION CERTIFICATE </span>
                    as recognition of your contribution!
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSuccessModal(false)}
                style={{
                  padding: '15px 30px',
                  backgroundColor: '#fff',
                  color: '#4CAF50',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                OK
              </button>
              
              <style>
                {`
                  @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                  }
                  @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                  }
                  @keyframes glow {
                    from { box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4); }
                    to { box-shadow: 0 4px 25px rgba(255, 215, 0, 0.8); }
                  }
                `}
              </style>
            </div>
          </div>
        )}
        {showPopup && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
            onClick={handleClosePopup}
          >
            <div 
              style={{
                background: '#fff',
                padding: '30px',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                color: '#000',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                marginBottom: '20px',
                fontSize: '22px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#333'
              }}>
                Donation Form
              </h3>
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}></h4>
                <p><strong>Name:</strong> {user.name || user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Contact:</strong> {user.phone || user.mobile || 'Not provided'}</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Select Purpose: *
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Choose a purpose</option>
                    {donationRequests.map((req) => (
                      <option key={req.id} value={req.purpose}>
                        {req.purpose} (₹{parseFloat(req.amount || 0).toLocaleString()} needed)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Donation Amount (₹): *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    Upload Payment Screenshot: *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formData.screenshot && (
                    <p style={{
                      marginTop: '5px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      Selected: {formData.screenshot.name}
                    </p>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '15px'
                }}>
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '15px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: loading ? '#ccc' : '#4caf50',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#45a049')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#4caf50')}
                  >
                    {loading ? 'Submitting...' : 'Submit Donation'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleClosePopup}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '15px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: loading ? '#ccc' : '#f44336',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#d32f2f')}
                    onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#f44336')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DonateNow;
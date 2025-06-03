import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './admindonation.css';
const API_BASE = 'http://localhost/Alumni/donation.php';
const UPLOAD_BASE = 'http://localhost/Alumni/'; 
const AdminDonation = () => {
  const [donationRequests, setDonationRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [purposeStats, setPurposeStats] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); 
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState('');
  const [formData, setFormData] = useState({
    purpose: '', amount: '', description: '', accountNumber: '',
    ifscCode: '', accountHolderName: '', gpayNumber: ''
  });
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  const fetchData = async () => {
    try {
      const requests = await fetch(`${API_BASE}?action=requests`);
      const stats = await fetch(`${API_BASE}?action=stats`);
      const pendingRes = await fetch(`${API_BASE}?action=pending-donations`);
      const donationsEndpoint = activeTab === 'pending' ? 'pending-donations' : 'donations';
      const donationsRes = await fetch(`${API_BASE}?action=${donationsEndpoint}`);
      const [requestsData, donationsData, statsData, pendingData] = await Promise.all([
        requests.json(),
        donationsRes.json(),
        stats.json(),
        pendingRes.json()
      ]);
      if (requestsData.status === 'success') setDonationRequests(requestsData.data);
      if (pendingData.status === 'success') {
        setPendingCount(pendingData.data.length);
      }   
      if (donationsData.status === 'success') {
        const filteredDonations = activeTab === 'all' 
          ? donationsData.data.filter(donation => donation.status !== 'pending')
          : donationsData.data;
        setDonations(filteredDonations);
      }
      if (statsData.status === 'success') setPurposeStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data');
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const validateForm = () => {
    const required = ['purpose', 'amount', 'description', 'accountNumber', 'ifscCode', 'accountHolderName', 'gpayNumber'];
    return required.every(field => formData[field]?.trim());
  };
  const handleSubmit = async (e) => {
    e.preventDefault();   
    if (!validateForm()) {
      alert('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const url = `${API_BASE}?action=request`;
      const method = editMode ? 'PUT' : 'POST';
      const payload = editMode ? { ...formData, id: currentId } : formData;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();   
      if (result.status === 'success') {
        alert(result.message);
        closeForm();
        fetchData();
      } else {
        alert(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id, type = 'request') => {
    const confirmMessage = type === 'donation' 
      ? 'Are you sure you want to delete this donation?' 
      : 'Are you sure you want to delete this request?';   
    if (!window.confirm(confirmMessage)) return;   
    try {
      const response = await fetch(`${API_BASE}?action=${type}&id=${id}`, {
        method: 'DELETE'
      });   
      const result = await response.json();     
      if (result.status === 'success') {
        alert(result.message);
        fetchData();
      } else {
        alert(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error occurred');
    }
  };
  const handleDonationAction = async (donationId, action) => {
    const confirmMessage = action === 'approved' 
      ? 'Are you sure you want to approve this donation?' 
      : 'Are you sure you want to reject this donation?';   
    if (!window.confirm(confirmMessage)) return;   
    try {
      const response = await fetch(`${API_BASE}?action=donation-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: donationId, status: action })
      });     
      const result = await response.json();     
      if (result.status === 'success') {
        alert(`Donation ${action} successfully!`);
        fetchData(); 
      } else {
        alert(result.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error occurred');
    }
  };
  const handleViewReceipt = (receiptPath) => {
    if (!receiptPath) {
      alert('No receipt available');
      return;
    }
    const fullReceiptUrl = receiptPath.startsWith('http') 
      ? receiptPath 
      : `${UPLOAD_BASE}${receiptPath}`; 
    setCurrentReceipt(fullReceiptUrl);
    setShowReceipt(true);
  };
  const closeReceiptModal = () => {
    setShowReceipt(false);
    setCurrentReceipt('');
  };
  const openAddForm = () => {
    setFormData({
      purpose: '', amount: '', description: '', accountNumber: '',
      ifscCode: '', accountHolderName: '', gpayNumber: ''
    });
    setEditMode(false);
    setCurrentId(null);
    setShowForm(true);
  };
  const openEditForm = (request) => {
    setFormData({
      purpose: request.purpose || '',
      amount: request.amount || '',
      description: request.description || '',
      accountNumber: request.account_number || '',
      ifscCode: request.ifsc_code || '',
      accountHolderName: request.account_holder_name || '',
      gpayNumber: request.gpay_number || ''
    });
    setEditMode(true);
    setCurrentId(request.id);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setCurrentId(null);
    setEditMode(false);
    setFormData({
      purpose: '', amount: '', description: '', accountNumber: '',
      ifscCode: '', accountHolderName: '', gpayNumber: ''
    });
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeForm();
  };
  const handleReceiptOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeReceiptModal();
  };
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showForm) closeForm();
        if (showReceipt) closeReceiptModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showForm, showReceipt]);
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#3b82f6';
    if (percentage >= 50) return '#f59e0b';
    if (percentage >= 25) return '#8b5cf6';
    return '#ef4444';
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#f59e0b', text: 'Pending' },
      approved: { color: '#10b981', text: 'Approved' },
      rejected: { color: '#ef4444', text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };
  return (
    <>
      <AdminNavbar />
      <div className="admin-donation-container">
        <h2 className="admin-donation-title">Donation Management</h2>
        <div className="progress-stats-grid">
          {purposeStats.map((stat, idx) => (
            <div key={idx} className="progress-stat-card">
              <div className="progress-stat-title">{stat.purpose}</div>
              <div className="progress-stat-amount">₹{stat.collected.toLocaleString()}</div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${Math.min(stat.percentage, 100)}%`,
                    backgroundColor: getProgressColor(stat.percentage)
                  }}
                ></div>
              </div>
              <div className="progress-stat-percentage">
                {stat.percentage}% of ₹{stat.needed.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Donation Requests</h3>
            <button className="btn-primary" onClick={openAddForm}>Add Request</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Payment Details</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donationRequests.map(request => (
                  <tr key={request.id} className="table-row">
                    <td className="table-cell">
                      <div className="purpose-title">{request.purpose}</div>
                      <div className="purpose-description">{request.description}</div>
                    </td>
                    <td className="table-cell font-semibold">
                      ₹{parseFloat(request.amount).toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <div className="payment-details">
                        <div><strong>Account:</strong> {request.account_number}</div>
                        <div><strong>IFSC:</strong> {request.ifsc_code}</div>
                        <div><strong>Holder:</strong> {request.account_holder_name}</div>
                        <div><strong>GPay:</strong> {request.gpay_number}</div>
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => openEditForm(request)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(request.id, 'request')}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="section-card">
          <div className="section-header">
            <h3 className="section-title">Donations</h3>
            <div className="tab-buttons">
              <button 
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Donations
              </button>
              <button 
                className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-center">Receipt</th>
                  {activeTab === 'pending' && <th className="text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {donations.map(donation => (
                  <tr key={donation.id} className="table-row">
                    <td className="table-cell">
                      <div className="donor-info">
                        <div className="donor-name">{donation.donor_name}</div>
                        <div className="donor-email">{donation.donor_email}</div>
                        {donation.donor_phone && (
                          <div className="donor-phone">{donation.donor_phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell font-semibold">
                      ₹{parseFloat(donation.donation_amount).toLocaleString()}
                    </td>
                    <td className="table-cell">{donation.purpose}</td>
                    <td className="table-cell">
                      {getStatusBadge(donation.status)}
                    </td>
                    <td className="table-cell">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-center">
                      {donation.receipt_photo ? (
                        <button 
                          className="btn-view" 
                          onClick={() => handleViewReceipt(donation.receipt_photo)}
                          title="View Receipt"
                        >
                          📄 Receipt
                        </button>
                      ) : (
                        <span className="text-gray-400">No Receipt</span>
                      )}
                    </td>
                    {activeTab === 'pending' && (
                      <td className="table-cell text-center">
                        <div className="action-buttons">
                          {donation.status === 'pending' && (
                            <>
                              <button 
                                className="btn-approve" 
                                onClick={() => handleDonationAction(donation.id, 'approved')}
                                title="Approve Donation"
                              >
                                ✓ Accept
                              </button>
                              <button 
                                className="btn-reject" 
                                onClick={() => handleDonationAction(donation.id, 'rejected')}
                                title="Reject Donation"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {donations.length === 0 && (
              <div className="empty-state">
                <p>No {activeTab === 'pending' ? 'pending ' : ''}donations found.</p>
              </div>
            )}
          </div>
        </div>
        {showForm && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeForm}>×</button>
              <h3 className="modal-title">
                {editMode ? 'Edit Request' : 'Add New Request'}
              </h3>
              <div className="form-container">
                <input 
                  type="text" 
                  name="purpose" 
                  placeholder="Purpose *" 
                  value={formData.purpose} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required 
                />
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="Amount (₹) *" 
                  value={formData.amount} 
                  onChange={handleInputChange} 
                  min="1" 
                  step="1" 
                  className="form-input" 
                  required 
                />
                <textarea 
                  name="description" 
                  placeholder="Description *" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="form-textarea" 
                  required 
                />
                <input 
                  type="text" 
                  name="accountHolderName" 
                  placeholder="Account Holder Name *" 
                  value={formData.accountHolderName} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required 
                />
                <input 
                  type="text" 
                  name="accountNumber" 
                  placeholder="Account Number *" 
                  value={formData.accountNumber} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required 
                />
                <input 
                  type="text" 
                  name="ifscCode" 
                  placeholder="IFSC Code *" 
                  value={formData.ifscCode} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required 
                />
                <input 
                  type="tel" 
                  name="gpayNumber" 
                  placeholder="GPay Number *" 
                  value={formData.gpayNumber} 
                  onChange={handleInputChange} 
                  pattern="[0-9]{10}" 
                  className="form-input" 
                  required 
                />
                <div className="form-buttons">
                  <button onClick={handleSubmit} disabled={loading} className="btn-submit">
                    {loading && <div className="loading-spinner"></div>}
                    {loading ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Request' : 'Add Request')}
                  </button>
                  <button onClick={closeForm} disabled={loading} className="btn-cancel">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showReceipt && (
          <div className="modal-overlay" onClick={handleReceiptOverlayClick}>
            <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeReceiptModal}>×</button>
              <h3 className="modal-title">Payment Receipt</h3>
              <div className="receipt-container">
                <img 
                  src={currentReceipt} 
                  alt="Payment Receipt" 
                  className="receipt-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="receipt-error" style={{display: 'none'}}>
                  <p>Unable to load receipt image</p>
                  <p>Path: {currentReceipt}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default AdminDonation;
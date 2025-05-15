import React, { useState } from 'react';
import './donate.css';
import Navbar from './navbar';

const donationRequests = [
  {
    id: 1,
    purpose: "Library Renovation",
    amount: "₹25,000",
    description: "Renovation of the main college library with new seating and shelves."
  },
  {
    id: 2,
    purpose: "Scholarship Fund",
    amount: "₹50,000",
    description: "To support underprivileged students through scholarships."
  },
  {
    id: 3,
    purpose: "Sports Equipment",
    amount: "₹15,000",
    description: "Purchase of new equipment for the college sports teams."
  }
];

const DonateNow = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    donationAmount: ''
  });

  const handleDonateClick = (purpose) => {
    setSelectedPurpose(purpose);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setFormData({ name: '', department: '', year: '', donationAmount: '' });
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you ${formData.name} for donating ₹${formData.donationAmount} towards ${selectedPurpose}!`);
    handleClosePopup();
  };

  return (
    <>
      <Navbar />
      <div className="donate-now-background">
        <h2 className="donate-now-title">College Donation Requests</h2>
        <div className="donate-now-flex">
          {donationRequests.map((req) => (
            <div key={req.id} className="donate-now-card">
              <h4>{req.purpose}</h4>
              <p><strong>Amount Needed:</strong> {req.amount}</p>
              <p>{req.description}</p>
              <div className="donate-now-button-wrapper">
                <button
                  className="donate-now-button"
                  onClick={() => handleDonateClick(req.purpose)}
                >
                  Donate Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>Donate to: {selectedPurpose}</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  required
                  value={formData.year}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="donationAmount"
                  placeholder="Donation Amount (₹)"
                  required
                  value={formData.donationAmount}
                  onChange={handleInputChange}
                />
                <div className="popup-buttons">
                  <button type="submit">Submit</button>
                  <button type="button" onClick={handleClosePopup}>Cancel</button>
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

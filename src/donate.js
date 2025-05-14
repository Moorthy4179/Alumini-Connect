import React from 'react';
import { Link } from 'react-router-dom';
import './donate.css';
import Navbar from './navbar'; 

function Donate() {
  return (
    <div className="donate-wrapper">
      <Navbar />

      {/* Main Donate Content */}
      <section className="donate-page">
        <h1 className="main-heading">Support Our Alumni Community</h1>
        <p className="intro-text">Your donation helps empower future generations and strengthen our alumni network!</p>

        <div className="donate-options">
          <div className="donate-card">
            <h2>Donate Now</h2>
            <p>Contribute directly to support events, scholarships, and community development activities.</p>
          </div>

          <div className="donate-card">
            <h2>Scholarships</h2>
            <p>Help deserving students achieve their dreams by funding scholarships through your generous donations.</p>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <h3>Alumni Hint Points</h3>
            <ul>
              <li>Stay connected with the community</li>
              <li>Contribute to networking events</li>
              <li>Mentor young graduates</li>
              <li>Participate in alumni forums</li>
            </ul>
          </div>

          <div className="info-box">
            <h3>Community Guidelines</h3>
            <ul>
              <li>Respect all members equally</li>
              <li>Promote positivity and collaboration</li>
              <li>Maintain professionalism</li>
              <li>Encourage constructive discussions</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Donate;

import React from 'react';
import Navbar from './navbar';
import './community.css';

const Community = () => {
  return (
    <div className="home-container">
      <Navbar /> 

      {/* Main Content */}
      <div className="community-layout">
        {/* Guidelines Section */}
        <div className="guidelines-section">
          <h2>Community Guidelines</h2>
          <p>
            Welcome to the Alumni Community! Be respectful, stay connected, and collaborate for personal and professional growth.
            Kindly use this platform to uplift, network, and engage with your batchmates and seniors.
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-box left-search">
            <label>Alumni Name:</label>
            <input type="text" placeholder="Search by Name..." />
          </div>
          <div className="search-box center-search">
            <label>Department:</label>
            <input type="text" placeholder="Search by Department..." />
          </div>
          <div className="search-box right-search">
            <label>Year:</label>
            <input type="text" placeholder="Search by Year..." />
          </div>
          <button className="search-btn">Search</button>
        </div>

        {/* Alumni Records Table */}
        <div className="alumni-records">
          <h3>Alumni Records</h3>
          <table className="alumni-table">
            <thead>
              <tr>
                <th>Alumni's Name</th>
                <th>Department</th>
                <th>Batch</th>
                <th>Add Friends</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>Computer Science</td>
                <td>2019</td>
                <td><button className="add-friend-btn">Add Friend</button></td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>Electronics</td>
                <td>2018</td>
                <td><button className="add-friend-btn">Add Friend</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="community-footer">#AlumniCommunity</p>
      </div>
    </div>
  );
};

export default Community;

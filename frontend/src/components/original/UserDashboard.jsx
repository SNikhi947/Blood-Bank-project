import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './UserDashboard.css';

const UserDashboard = () => {
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [eligibleRequests, setEligibleRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [username, setUsername] = useState('Hero');
  const [userBloodGroup, setUserBloodGroup] = useState('??');

  const [profileData, setProfileData] = useState({
    name: '',
    blood_group: 'A+',
    phone: '',
    city: ''
  });

  const [reqData, setReqData] = useState({
    blood_group: 'A+',
    units_needed: 1,
    hospital: '',
    reason: '',
    request_type: 'Emergency'
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.sub);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/requests/eligible');
      setEligibleRequests(res.data);
      setNeedsProfile(false);

      const myReqs = await apiClient.get('/requests/me');
      setMyRequests(myReqs.data);

      const donorsRes = await apiClient.get('/donors');
      const token = localStorage.getItem('access_token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const myProfile = donorsRes.data.find(d => d.name.toLowerCase() === payload.sub.toLowerCase() || d.user_id === payload.id);
      if (myProfile) setUserBloodGroup(myProfile.blood_group);

    } catch (err) {
      if (err.response?.status === 400 && err.response.data.detail.includes("profile")) {
        setNeedsProfile(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/donors', profileData);
      alert("Profile created successfully!");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create profile.");
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/requests', reqData);
      alert("Blood request submitted!");
      setReqData({ ...reqData, hospital: '', reason: '', units_needed: 1 });
      fetchDashboardData();
      setActiveTab('myRequests');
    } catch (err) {
      alert("Failed to submit request.");
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await apiClient.put(`/requests/${id}/accept`);
      alert("Thank you for accepting this request! The hospital has been notified.");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to accept request.");
    }
  };

  if (loading) return <div className="dash-loading">Loading your dashboard...</div>;

  if (needsProfile) {
    return (
      <div className="setup-container">
        <div className="setup-card">
          <h2>Complete Your Profile</h2>
          <p>We need a few more details to match you with local emergencies.</p>
          <form onSubmit={handleProfileSubmit}>
            <input type="text" placeholder="Full Name" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
            <select value={profileData.blood_group} onChange={e => setProfileData({...profileData, blood_group: e.target.value})}>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
            <input type="tel" placeholder="Phone Number" required value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
            <input type="text" placeholder="City" required value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} />
            <button type="submit">Save Profile & Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Welcome back, {username}.</h1>
          <p>You've saved 0 lives! Your contributions are building a safer community for everyone.</p>
        </div>
        <div className="hero-badge">
          <h3>{userBloodGroup}</h3>
          <span>REGISTERED DONOR</span>
        </div>
      </div>

      <div className="dash-nav">
        <button className={activeTab === 'feed' ? 'active' : ''} onClick={() => setActiveTab('feed')}>Emergency Feed</button>
        <button className={activeTab === 'request' ? 'active' : ''} onClick={() => setActiveTab('request')}>Request Blood</button>
        <button className={activeTab === 'myRequests' ? 'active' : ''} onClick={() => setActiveTab('myRequests')}>My Requests</button>
      </div>

      <div className="dash-content">
        {activeTab === 'feed' && (
          <div className="feed-grid">
            {eligibleRequests.length === 0 ? (
              <p className="empty-state">No matching emergencies in your area right now. You are awesome!</p>
            ) : (
              eligibleRequests.map(req => (
                <div key={req.id} className="emergency-card">
                  <div className="urgent-pulse"></div>
                  <h3>Need {req.units_needed} Units of {req.blood_group}</h3>
                  <p><strong>Hospital:</strong> {req.hospital}</p>
                  <p><strong>Reason:</strong> {req.reason}</p>
                  <button onClick={() => handleAcceptRequest(req.id)} className="accept-btn">Accept & Donate</button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'request' && (
          <div className="request-form-card">
            <h2>Submit a Blood Request</h2>
            <form onSubmit={handleRequestSubmit}>
              <select value={reqData.blood_group} onChange={e => setReqData({...reqData, blood_group: e.target.value})}>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
              <input type="number" min="1" placeholder="Units Needed" required value={reqData.units_needed} onChange={e => setReqData({...reqData, units_needed: e.target.value})} />
              <input type="text" placeholder="Hospital Name" required value={reqData.hospital} onChange={e => setReqData({...reqData, hospital: e.target.value})} />
              <textarea placeholder="Reason for request (e.g., Surgery, Accident)" required value={reqData.reason} onChange={e => setReqData({...reqData, reason: e.target.value})}></textarea>
              <button type="submit">Broadcast Request</button>
            </form>
          </div>
        )}

        {activeTab === 'myRequests' && (
          <div className="feed-grid">
            {myRequests.length === 0 ? (
              <p className="empty-state">You haven't made any requests yet.</p>
            ) : (
              myRequests.map(req => (
                <div key={req.id} className="my-req-card">
                  <h4>{req.units_needed} Units of {req.blood_group}</h4>
                  <p>Status: <span className={`status-${req.status.toLowerCase()}`}>{req.status}</span></p>
                  <p>Hospital: {req.hospital}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
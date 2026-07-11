import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './UserDashboard.css';

const DropMark = ({ className = '' }) => (
  <svg className={className} width="18" height="22" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C10 0 0 12.5 0 17C0 20.87 4.03 24 9 24H11C15.97 24 20 20.87 20 17C20 12.5 10 0 10 0Z" fill="currentColor" />
  </svg>
);

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const TABS = [
  { key: 'feed', label: 'Available Requests' },
  { key: 'request', label: 'Request Blood' },
  { key: 'myRequests', label: 'My Requests' },
  { key: 'profile', label: 'Edit Profile' },
];

const UserDashboard = () => {
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [eligibleRequests, setEligibleRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [username, setUsername] = useState('Donor');
  const [userBloodGroup, setUserBloodGroup] = useState('??');
  const [isAvailable, setIsAvailable] = useState(localStorage.getItem('donor_available') !== 'false');
  const [banner, setBanner] = useState(null);

  const [profileData, setProfileData] = useState({ name: '', blood_group: 'A+', phone: '', city: '' });
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

  const showBanner = (text, type = 'success') => {
    setBanner({ text, type });
    setTimeout(() => setBanner(null), 3500);
  };

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
      const myProfile = donorsRes.data.find(
        (d) => d.name.toLowerCase() === payload.sub.toLowerCase() || d.user_id === payload.id
      );
      if (myProfile) {
        setUserBloodGroup(myProfile.blood_group);
        setProfileData({
          name: myProfile.name,
          blood_group: myProfile.blood_group,
          phone: myProfile.phone,
          city: myProfile.city,
        });
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.detail.includes('profile')) {
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
      showBanner('Profile created successfully!');
      fetchDashboardData();
    } catch (err) {
      showBanner(err.response?.data?.detail || 'Failed to create profile.', 'error');
    }
  };

  const handleRequestSubmit = async (e) => {
  e.preventDefault();

  try {

    await apiClient.post('/requests', reqData);

    showBanner('Blood request submitted!');

    setReqData({
      blood_group: 'A+',
      units_needed: 1,
      hospital: '',
      reason: '',
      request_type: 'Emergency'
    });

    fetchDashboardData();
    setActiveTab('myRequests');

  } catch (err) {

    console.error(err.response?.data);

    showBanner(
      err.response?.data?.detail || 'Failed to submit request.',
      'error'
    );

  }
};

  const handleAcceptRequest = async (id) => {
    try {
      await apiClient.put(`/requests/${id}/accept`);
      showBanner('Thanks for accepting — the hospital has been notified.');
      fetchDashboardData();
    } catch (err) {
      showBanner(err.response?.data?.detail || 'Failed to accept request.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.reload();
  };

  const getProfileCompletion = () => {
    if (needsProfile) return 40;
    let completed = 2;
    if (profileData.name) completed += 1;
    if (profileData.phone) completed += 1;
    if (profileData.city) completed += 1;
    return Math.round((completed / 5) * 100);
  };
  const completionPercent = getProfileCompletion();

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="setup-wrap">
        <div className="setup-card">
          <DropMark className="setup-drop" />
          <h2>Complete Your Profile</h2>
          <p>We need a few more details to match you with nearby requests.</p>
          <form onSubmit={handleProfileSubmit} className="setup-form">
            <div className="dash-field">
              <label>Full Name</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="dash-field">
              <label>Blood Group</label>
              <select
                value={profileData.blood_group}
                onChange={(e) => setProfileData({ ...profileData, blood_group: e.target.value })}
              >
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="dash-field">
              <label>Phone Number</label>
              <input
                type="tel"
                required
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div className="dash-field">
              <label>City</label>
              <input
                type="text"
                required
                value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
              />
            </div>
            <button type="submit" className="dash-submit">Save Profile &amp; Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredFeed = isAvailable ? eligibleRequests : [];

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <DropMark />
          <span>BloodLink</span>
        </div>
        <nav className="dash-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`dash-nav-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <div className="dash-avatar">{username.charAt(0).toUpperCase()}</div>
          <div className="dash-profile-meta">
            <span className="dash-profile-name">{username}</span>
            <span className="dash-profile-role">Registered Donor</span>
          </div>
          <button className="dash-logout" onClick={handleLogout} title="Log out">Exit</button>
        </div>
      </aside>

      <main className="dash-main">
        {banner && <div className={`dash-banner ${banner.type}`}>{banner.text}</div>}

        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <span className="dash-stat-label">My Availability</span>
            <div className="dash-availability-row">
              <span className={`dash-stat-value ${isAvailable ? 'ok' : 'off'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <label className="dash-switch">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => {
                    setIsAvailable(e.target.checked);
                    localStorage.setItem('donor_available', e.target.checked ? 'true' : 'false');
                  }}
                />
                <span className="dash-switch-track" />
              </label>
            </div>
            <span className="dash-stat-sub">{isAvailable ? 'Alerts enabled' : 'Alerts muted'}</span>
          </div>

          <div className="dash-stat-card">
            <span className="dash-stat-label">Blood Group</span>
            <span className="dash-stat-value">{userBloodGroup}</span>
            <span className="dash-stat-sub">Verified profile type</span>
          </div>

          <div className="dash-stat-card">
            <span className="dash-stat-label">Profile Completion</span>
            <span className="dash-stat-value">{completionPercent}%</span>
            <div className="dash-progress-track">
              <div className="dash-progress-fill" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </div>

        {activeTab === 'feed' && (
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3>Emergency Requests Nearby</h3>
              <p>Requests currently matching your blood type.</p>
            </div>
            <div className="dash-list">
              {!isAvailable ? (
                <div className="dash-empty">
                  <h4>Alerts muted</h4>
                  <p>Turn your availability back on above to see active requests.</p>
                </div>
              ) : filteredFeed.length === 0 ? (
                <div className="dash-empty">
                  <h4>No active requests</h4>
                  <p>All compatible requests are currently fulfilled.</p>
                </div>
              ) : (
                filteredFeed.map((req) => (
                  <div key={req.id} className="dash-request-card">
                    <div className="dash-request-top">
                      <span className="dash-badge">{req.blood_group}</span>
                      <span className="dash-units"><strong>{req.units_needed}</strong> units</span>
                    </div>
                    <p className="dash-request-line"><strong>Hospital:</strong> {req.hospital}</p>
                    <p className="dash-request-line"><strong>Reason:</strong> {req.reason}</p>
                    <button className="dash-submit" onClick={() => handleAcceptRequest(req.id)}>
                      Accept &amp; Donate
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3>Submit a Blood Request</h3>
              <p>Alerts go out instantly to matching donors nearby.</p>
            </div>
            <form onSubmit={handleRequestSubmit} className="dash-form">
              <div className="dash-field">
                <label>Blood Group</label>
                <select
                  value={reqData.blood_group}
                  onChange={(e) => setReqData({ ...reqData, blood_group: e.target.value })}
                >
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="dash-field">
                <label>Units Needed</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={reqData.units_needed}
                  onChange={(e) => setReqData({ ...reqData, units_needed: e.target.value })}
                />
              </div>
              <div className="dash-field">
                <label>Hospital Name</label>
                <input
                  type="text"
                  required
                  value={reqData.hospital}
                  onChange={(e) => setReqData({ ...reqData, hospital: e.target.value })}
                />
              </div>
              <div className="dash-field">
                <label>Reason</label>
                <textarea
                  required
                  placeholder="e.g. Surgery, accident, anemia treatment"
                  value={reqData.reason}
                  onChange={(e) => setReqData({ ...reqData, reason: e.target.value })}
                />
              </div>
              <div className="dash-field">
  <label>Request Type</label>

  <select
    value={reqData.request_type}
    onChange={(e) =>
      setReqData({
        ...reqData,
        request_type: e.target.value
      })
    }
  >

    <option value="Emergency">
      Emergency
    </option>

    <option value="Surgery">
      Surgery
    </option>

    <option value="Accident">
      Accident
    </option>

    <option value="Regular">
      Regular
    </option>

  </select>

</div>
              <button type="submit" className="dash-submit">Broadcast Request</button>
            </form>
          </div>
        )}

        {activeTab === 'myRequests' && (
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3>My Requests</h3>
              <p>Track the status of what you've submitted.</p>
            </div>
            <div className="dash-list">
              {myRequests.length === 0 ? (
                <div className="dash-empty">
                  <h4>No requests yet</h4>
                  <p>You haven't submitted any blood requests.</p>
                </div>
              ) : (
                myRequests.map((req) => (
                  <div key={req.id} className="dash-my-request-card">
                    <div className="dash-request-top">
                      <h4>{req.units_needed} units of {req.blood_group}</h4>
                      <span className={`dash-status dash-status-${req.status.toLowerCase()}`}>{req.status}</span>
                    </div>
                    <p className="dash-request-line"><strong>Hospital:</strong> {req.hospital}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="dash-panel">
            <div className="dash-panel-header">
              <h3>Edit Profile</h3>
              <p>Update your donor contact details.</p>
            </div>
            <form onSubmit={handleProfileSubmit} className="dash-form">
              <div className="dash-field">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="dash-field">
                <label>Blood Group</label>
                <select
                  value={profileData.blood_group}
                  onChange={(e) => setProfileData({ ...profileData, blood_group: e.target.value })}
                >
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="dash-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <div className="dash-field">
                <label>City</label>
                <input
                  type="text"
                  required
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                />
              </div>
              <button type="submit" className="dash-submit">Save Changes</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
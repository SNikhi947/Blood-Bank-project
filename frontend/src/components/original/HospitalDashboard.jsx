import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './HospitalDashboard.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalDashboard = () => {
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState('Hospital Command Center');
  
  const [inventory, setInventory] = useState([]);
  const [inventoryInputs, setInventoryInputs] = useState({});
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [communityRequests, setCommunityRequests] = useState([]);

  // Calculated Stats
  const [stats, setStats] = useState({ totalUnits: 0, activeRequests: 0, emergencies: 0 });

  const [profileData, setProfileData] = useState({
    hospital_name: '',
    license_number: '',
    contact_phone: '',
    city: ''
  });

  const [reqData, setReqData] = useState({
    blood_group: 'O-',
    units_needed: 1,
    hospital: '',
    reason: '',
    request_type: 'Emergency'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update stats whenever data changes
  useEffect(() => {
    const total = Object.values(inventoryInputs).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    setStats({
      totalUnits: total,
      activeRequests: requests.length,
      emergencies: communityRequests.length
    });
  }, [inventoryInputs, requests, communityRequests]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const myUsername = payload.sub;
      
      const usersRes = await apiClient.get('/users');
      const myUser = usersRes.data.find(u => u.username === myUsername);

      const hospRes = await apiClient.get('/hospitals');
      const myProfile = hospRes.data.find(h => h.user_id === myUser?.id);
      
      if (!myProfile) {
        setNeedsProfile(true);
        setLoading(false);
        return;
      }

      setNeedsProfile(false);
      setHospitalName(myProfile.hospital_name);
      setReqData(prev => ({ ...prev, hospital: myProfile.hospital_name }));

      const invRes = await apiClient.get('/hospitalinventory');
      const myInv = invRes.data.filter(i => i.hospital_id === myProfile.id);
      setInventory(myInv);

      const inputs = {};
      BLOOD_GROUPS.forEach(bg => {
        const item = myInv.find(i => i.blood_group === bg);
        inputs[bg] = item ? item.units_available : 0;
      });
      setInventoryInputs(inputs);

      const reqRes = await apiClient.get('/requests/me');
      setRequests(reqRes.data);

      const commRes = await apiClient.get('/requests/eligible');
      setCommunityRequests(commRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/hospital', profileData);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create hospital profile.");
    }
  };

  const handleInventoryUpdate = async (bg) => {
    try {
      const existing = inventory.find(i => i.blood_group === bg);
      const newValue = parseInt(inventoryInputs[bg]) || 0;

      if (existing) {
        await apiClient.put(`/hospitalinventory/${bg}`, { units_available: newValue });
      } else {
        await apiClient.post('/hospitalinventory', { blood_group: bg, units_available: newValue });
      }
      
      fetchDashboardData();
    } catch (err) {
      alert("Failed to update inventory.");
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/requests', reqData);
      setShowModal(false);
      setReqData({ ...reqData, reason: '', units_needed: 1 });
      fetchDashboardData();
    } catch (err) {
      alert("Failed to broadcast request.");
    }
  };

  const getMaxUnits = () => {
    const max = Math.max(...Object.values(inventoryInputs));
    return max > 10 ? max : 10;
  };
  
  const handleAcceptUserRequest = async (id) => {
    try {
      await apiClient.put(`/requests/${id}/accept`);
      alert("Emergency accepted! The patient has been notified.");
      fetchDashboardData(); 
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to accept request.");
    }
  };

  if (loading) return <div className="hosp-loading">Initializing Secure Network...</div>;

  if (needsProfile) {
    return (
      <div className="hosp-setup-container animate-fade-in">
        <div className="hosp-setup-card">
          <h2>Register Institution</h2>
          <p>Authorize your facility to access the regional blood network and emergency broadcasts.</p>
          <form onSubmit={handleProfileSubmit}>
            <input className="modern-input" type="text" placeholder="Hospital Name" required value={profileData.hospital_name} onChange={e => setProfileData({...profileData, hospital_name: e.target.value})} />
            <input className="modern-input" type="text" placeholder="Medical License Number" required value={profileData.license_number} onChange={e => setProfileData({...profileData, license_number: e.target.value})} />
            <input className="modern-input" type="tel" placeholder="Contact Phone" required value={profileData.contact_phone} onChange={e => setProfileData({...profileData, contact_phone: e.target.value})} />
            <input className="modern-input" type="text" placeholder="City" required value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} />
            <button className="primary-btn" type="submit">Verify & Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="hosp-dashboard">
      <div className="hosp-header animate-fade-in">
        <div className="hosp-header-title">
          <span className="hosp-icon">🏥</span>
          <h1>{hospitalName}</h1>
        </div>
        <button className="primary-btn" style={{width: 'auto', padding: '12px 24px'}} onClick={() => setShowModal(true)}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          Broadcast Emergency
        </button>
      </div>

      {/* NEW STATS ROW */}
      <div className="stats-row animate-fade-in delay-1">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-red">🩸</div>
          <div className="stat-details">
            <span className="stat-label">Total Blood Units</span>
            <span className="stat-value">{stats.totalUnits}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">📋</div>
          <div className="stat-details">
            <span className="stat-label">Active Network Requests</span>
            <span className="stat-value">{stats.activeRequests}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">🚨</div>
          <div className="stat-details">
            <span className="stat-label">Local Emergencies</span>
            <span className="stat-value">{stats.emergencies}</span>
          </div>
        </div>
      </div>

      <div className="hosp-grid-top animate-fade-in delay-2">
        <div className="hosp-card">
          <div className="card-header">
            <div className="card-header-left">
              <h3>
                <svg width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Global Inventory Analysis
              </h3>
              <p>Real-time volume tracking across all blood groups</p>
            </div>
          </div>
          <div className="chart-container">
            {BLOOD_GROUPS.map(bg => {
              const val = inventoryInputs[bg] || 0;
              const heightPct = (val / getMaxUnits()) * 100;
              return (
                <div key={bg} className="chart-bar-wrapper">
                  <div className="chart-val">{val} Units</div>
                  <div className="chart-bar">
                    <div className="chart-fill" style={{ height: `${heightPct}%` }}></div>
                  </div>
                  <div className="chart-label">{bg}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hosp-card">
          <div className="card-header">
            <div className="card-header-left">
              <h3>
                <svg width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                Inventory Manager
              </h3>
              <p>Quickly adjust available units</p>
            </div>
          </div>
          <div className="inventory-list">
            {BLOOD_GROUPS.map(bg => (
              <div key={bg} className="inventory-row">
                <div className="inv-badge">{bg}</div>
                <div className="inv-input-wrapper">
                  <input 
                    type="number" 
                    min="0"
                    value={inventoryInputs[bg] !== undefined ? inventoryInputs[bg] : ''}
                    onChange={(e) => setInventoryInputs({...inventoryInputs, [bg]: e.target.value})}
                  />
                </div>
                <button className="inv-update-btn" onClick={() => handleInventoryUpdate(bg)} title="Save Update">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hosp-card animate-fade-in delay-3" style={{marginBottom: '32px'}}>
        <div className="card-header">
          <div className="card-header-left">
            <h3>
              <svg width="22" height="22" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Hospital Request Board
            </h3>
            <p>Your outgoing requests to the central network</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Blood Type</th>
                <th>Units Requested</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="5" className="empty-table">No active outgoing requests found in the network.</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id}>
                    <td><span className="req-id">#REQ-{req.id}</span></td>
                    <td><span className="type-badge">{req.blood_group}</span></td>
                    <td><strong>{req.units_needed}</strong> <span style={{color: 'var(--text-muted)', fontSize: '13px'}}>Units</span></td>
                    <td>{req.reason}</td>
                    <td>
                      <span className={`status-badge status-${req.status.toLowerCase().replace(' ', '-')}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hosp-card emergency-board animate-fade-in delay-3">
        <div className="card-header">
          <div className="card-header-left">
            <h3>
              <span className="live-dot"></span> Active Community Emergencies
            </h3>
            <p>Local patients requesting blood types you currently have in stock.</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Patient Request ID</th>
                <th>Needed Type</th>
                <th>Units</th>
                <th>Emergency Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {communityRequests.length === 0 ? (
                <tr><td colSpan="5" className="empty-table">All clear. No matching emergencies in your area right now.</td></tr>
              ) : (
                communityRequests.map(req => (
                  <tr key={req.id}>
                    <td><span className="req-id">#EMG-{req.id}</span></td>
                    <td><span className="type-badge">{req.blood_group}</span></td>
                    <td><strong>{req.units_needed}</strong> <span style={{color: 'var(--text-muted)', fontSize: '13px'}}>Units</span></td>
                    <td>{req.reason}</td>
                    <td>
                      <button className="action-btn" onClick={() => handleAcceptUserRequest(req.id)}>
                        Fulfill Request
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              <span style={{color: 'var(--primary)', fontSize: '32px'}}>🚨</span> 
              Broadcast Emergency
            </h2>
            <form onSubmit={handleRequestSubmit}>
              <div className="form-row">
                <label>Blood Type Required</label>
                <select className="modern-input" style={{marginBottom: 0}} value={reqData.blood_group} onChange={e => setReqData({...reqData, blood_group: e.target.value})}>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Units Needed</label>
                <input className="modern-input" style={{marginBottom: 0}} type="number" min="1" required value={reqData.units_needed} onChange={e => setReqData({...reqData, units_needed: e.target.value})} />
              </div>
              <div className="form-row">
                <label>Clinical Reason</label>
                <input className="modern-input" style={{marginBottom: 0}} type="text" required placeholder="e.g., Trauma, Mass Casualty" value={reqData.reason} onChange={e => setReqData({...reqData, reason: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" style={{flex: 2, margin: 0}}>Broadcast to Network</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
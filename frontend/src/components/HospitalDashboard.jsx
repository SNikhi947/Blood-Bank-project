import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './HospitalDashboard.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SortIcon = ({ active, desc }) => (
  <span className="hosp-sort-icon">{active ? (desc ? '▼' : '▲') : ''}</span>
);

const HospitalDashboard = () => {
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState('Hospital');
  const [inventory, setInventory] = useState([]);
  const [inventoryInputs, setInventoryInputs] = useState({});
  const [requests, setRequests] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [banner, setBanner] = useState(null);

  const [outboundSearch, setOutboundSearch] = useState('');
  const [communitySearch, setCommunitySearch] = useState('');
  const [outboundSort, setOutboundSort] = useState({ field: 'id', desc: true });
  const [communitySort, setCommunitySort] = useState({ field: 'id', desc: true });

  const [profileData, setProfileData] = useState({ hospital_name: '', license_number: '', contact_phone: '', city: '' });
  const [reqData, setReqData] = useState({ blood_group: 'O-', units_needed: 1, hospital: '', reason: '' });

  useEffect(() => { fetchDashboardData(); }, []);

  const showBanner = (text, type = 'success') => {
    setBanner({ text, type });
    setTimeout(() => setBanner(null), 3500);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      const myUsername = payload.sub;

      const usersRes = await apiClient.get('/users');
      const myUser = usersRes.data.find((u) => u.username === myUsername);

      const hospRes = await apiClient.get('/hospitals');
      const myProfile = hospRes.data.find((h) => h.user_id === myUser?.id);

      if (!myProfile) {
        setNeedsProfile(true);
        setLoading(false);
        return;
      }

      setNeedsProfile(false);
      setHospitalName(myProfile.hospital_name);
      setReqData((prev) => ({ ...prev, hospital: myProfile.hospital_name }));

      const invRes = await apiClient.get('/hospitalinventory');
      const myInv = invRes.data.filter((i) => i.hospital_id === myProfile.id);
      setInventory(myInv);

      const inputs = {};
      BLOOD_GROUPS.forEach((bg) => {
        const item = myInv.find((i) => i.blood_group === bg);
        inputs[bg] = item ? item.units_available : 0;
      });
      setInventoryInputs(inputs);

      const reqRes = await apiClient.get('/requests/me');
      setRequests(reqRes.data);

      const commRes = await apiClient.get('/requests/eligible');
      setCommunityRequests(commRes.data);

      const donorsRes = await apiClient.get('/donors');
      setDonorsList(donorsRes.data);
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
      showBanner(err.response?.data?.detail || 'Failed to create hospital profile.', 'error');
    }
  };

  const handleInventoryUpdate = async (bg) => {
    try {
      const existing = inventory.find((i) => i.blood_group === bg);
      const newValue = parseInt(inventoryInputs[bg]) || 0;
      if (existing) {
        await apiClient.put(`/hospitalinventory/${bg}`, { units_available: newValue });
      } else {
        await apiClient.post('/hospitalinventory', { blood_group: bg, units_available: newValue });
      }
      showBanner(`${bg} inventory updated.`);
      fetchDashboardData();
    } catch (err) {
      showBanner('Failed to update inventory.', 'error');
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/requests', reqData);
      setShowModal(false);
      setReqData({ ...reqData, reason: '', units_needed: 1 });
      showBanner('Emergency request broadcast to network.');
      fetchDashboardData();
    } catch (err) {
      showBanner('Failed to broadcast request.', 'error');
    }
  };

  const handleAcceptUserRequest = async (id) => {
    try {
      await apiClient.put(`/requests/${id}/accept`);
      showBanner('Emergency accepted — the patient has been notified.');
      fetchDashboardData();
    } catch (err) {
      showBanner(err.response?.data?.detail || 'Failed to accept request.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.reload();
  };

  const totalUnits = Object.values(inventoryInputs).reduce((acc, v) => acc + (parseInt(v) || 0), 0);

  const sortRows = (rows, sort) => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let av = a[sort.field], bv = b[sort.field];
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sort.desc ? 1 : -1;
      if (av > bv) return sort.desc ? -1 : 1;
      return 0;
    });
    return copy;
  };

  const filteredOutbound = sortRows(
    requests.filter((r) =>
      r.id.toString().includes(outboundSearch) ||
      r.blood_group.toLowerCase().includes(outboundSearch.toLowerCase()) ||
      r.reason.toLowerCase().includes(outboundSearch.toLowerCase()) ||
      r.status.toLowerCase().includes(outboundSearch.toLowerCase())
    ),
    outboundSort
  );

  const filteredCommunity = sortRows(
    communityRequests.filter((r) =>
      r.id.toString().includes(communitySearch) ||
      r.blood_group.toLowerCase().includes(communitySearch.toLowerCase()) ||
      r.reason.toLowerCase().includes(communitySearch.toLowerCase())
    ),
    communitySort
  );

  const toggleSort = (setter, current, field) => {
    if (current.field === field) setter({ field, desc: !current.desc });
    else setter({ field, desc: false });
  };

  if (loading) {
    return (
      <div className="hosp-loading">
        <div className="hosp-spinner" />
        <p>Loading hospital console…</p>
      </div>
    );
  }

  if (needsProfile) {
    return (
      <div className="hosp-setup-wrap">
        <div className="hosp-setup-card">
          <h2>Register Your Hospital</h2>
          <p>Verify your facility to access the network and request supplies.</p>
          <form onSubmit={handleProfileSubmit} className="hosp-form">
            <div className="hosp-field">
              <label>Hospital Name</label>
              <input type="text" required value={profileData.hospital_name}
                onChange={(e) => setProfileData({ ...profileData, hospital_name: e.target.value })} />
            </div>
            <div className="hosp-field">
              <label>Medical License Number</label>
              <input type="text" required value={profileData.license_number}
                onChange={(e) => setProfileData({ ...profileData, license_number: e.target.value })} />
            </div>
            <div className="hosp-field">
              <label>Contact Phone</label>
              <input type="tel" required value={profileData.contact_phone}
                onChange={(e) => setProfileData({ ...profileData, contact_phone: e.target.value })} />
            </div>
            <div className="hosp-field">
              <label>City</label>
              <input type="text" required value={profileData.city}
                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} />
            </div>
            <button type="submit" className="hosp-submit">Register Facility</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="hosp-root">
      <header className="hosp-topbar">
        <div>
          <span className="hosp-eyebrow">HOSPITAL CONSOLE</span>
          <h1>{hospitalName}</h1>
        </div>
        <div className="hosp-topbar-actions">
          <button className="hosp-submit hosp-broadcast-btn" onClick={() => setShowModal(true)}>+ New Emergency Request</button>
          <button className="hosp-logout" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {banner && <div className={`hosp-banner ${banner.type}`}>{banner.text}</div>}

      <div className="hosp-stats-grid">
        <div className="hosp-stat-card">
          <span className="hosp-stat-label">Freezer Reserves</span>
          <span className="hosp-stat-value">{totalUnits} units</span>
        </div>
        <div className="hosp-stat-card">
          <span className="hosp-stat-label">Registered Donors</span>
          <span className="hosp-stat-value">{donorsList.length}</span>
        </div>
        <div className="hosp-stat-card">
          <span className="hosp-stat-label">Your Outbound Requests</span>
          <span className="hosp-stat-value">{requests.length}</span>
        </div>
        <div className="hosp-stat-card">
          <span className="hosp-stat-label">Regional Emergencies</span>
          <span className="hosp-stat-value">{communityRequests.length}</span>
        </div>
      </div>

      <div className="hosp-grid">
        <div className="hosp-panel">
          <div className="hosp-panel-header">
            <h3>Inventory</h3>
            <p>Current stock by blood group — edit and save.</p>
          </div>
          <div className="hosp-inventory-list">
            {BLOOD_GROUPS.map((bg) => {
              const val = parseInt(inventoryInputs[bg]) || 0;
              const pct = Math.min(100, (val / 10) * 100);
              let level = 'ok';
              if (val === 0) level = 'empty';
              else if (val < 5) level = 'low';
              return (
                <div key={bg} className="hosp-inv-row">
                  <span className="hosp-inv-badge">{bg}</span>
                  <div className="hosp-inv-bar-track">
                    <div className={`hosp-inv-bar-fill ${level}`} style={{ width: `${pct}%` }} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="hosp-inv-input"
                    value={inventoryInputs[bg] !== undefined ? inventoryInputs[bg] : ''}
                    onChange={(e) => setInventoryInputs({ ...inventoryInputs, [bg]: e.target.value })}
                  />
                  <button className="hosp-inv-save" onClick={() => handleInventoryUpdate(bg)}>Save</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hosp-panel">
          <div className="hosp-panel-header">
            <h3>Registered Donor Directory</h3>
            <p>A preview of donors on the network.</p>
          </div>
          <div className="hosp-donor-list">
            {donorsList.slice(0, 6).map((d, i) => (
              <div key={i} className="hosp-donor-item">
                <span className="hosp-donor-avatar">{d.name.charAt(0).toUpperCase()}</span>
                <div className="hosp-donor-meta">
                  <strong>{d.name}</strong>
                  <span>{d.blood_group} · {d.city}</span>
                </div>
              </div>
            ))}
            {donorsList.length === 0 && <p className="hosp-empty-text">No donors registered yet.</p>}
          </div>
        </div>
      </div>

      <div className="hosp-panel">
        <div className="hosp-panel-header hosp-panel-header-flex">
          <div>
            <h3>Outbound Requests</h3>
            <p>Requests your hospital has broadcast to the network.</p>
          </div>
          <input
            type="text"
            className="hosp-search"
            placeholder="Search outbound…"
            value={outboundSearch}
            onChange={(e) => setOutboundSearch(e.target.value)}
          />
        </div>
        <div className="hosp-table-wrap">
          <table className="hosp-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort(setOutboundSort, outboundSort, 'id')}>ID <SortIcon active={outboundSort.field === 'id'} desc={outboundSort.desc} /></th>
                <th onClick={() => toggleSort(setOutboundSort, outboundSort, 'blood_group')}>Group <SortIcon active={outboundSort.field === 'blood_group'} desc={outboundSort.desc} /></th>
                <th onClick={() => toggleSort(setOutboundSort, outboundSort, 'units_needed')}>Units <SortIcon active={outboundSort.field === 'units_needed'} desc={outboundSort.desc} /></th>
                <th onClick={() => toggleSort(setOutboundSort, outboundSort, 'reason')}>Reason <SortIcon active={outboundSort.field === 'reason'} desc={outboundSort.desc} /></th>
                <th onClick={() => toggleSort(setOutboundSort, outboundSort, 'status')}>Status <SortIcon active={outboundSort.field === 'status'} desc={outboundSort.desc} /></th>
              </tr>
            </thead>
            <tbody>
              {filteredOutbound.length === 0 ? (
                <tr><td colSpan="5" className="hosp-empty-cell">No matching outgoing requests.</td></tr>
              ) : (
                filteredOutbound.map((req) => (
                  <tr key={req.id}>
                    <td className="hosp-mono">#REQ-{req.id}</td>
                    <td><span className="hosp-type-badge">{req.blood_group}</span></td>
                    <td>{req.units_needed}</td>
                    <td>{req.reason}</td>
                    <td><span className={`hosp-status hosp-status-${req.status.toLowerCase()}`}>{req.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hosp-panel">
        <div className="hosp-panel-header hosp-panel-header-flex">
          <div>
            <h3>Active Regional Emergencies</h3>
            <p>Requests you can fulfill from your current stock.</p>
          </div>
          <input
            type="text"
            className="hosp-search"
            placeholder="Search emergencies…"
            value={communitySearch}
            onChange={(e) => setCommunitySearch(e.target.value)}
          />
        </div>
        <div className="hosp-table-wrap">
          <table className="hosp-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort(setCommunitySort, communitySort, 'id')}>ID <SortIcon active={communitySort.field === 'id'} desc={communitySort.desc} /></th>
                <th onClick={() => toggleSort(setCommunitySort, communitySort, 'blood_group')}>Group <SortIcon active={communitySort.field === 'blood_group'} desc={communitySort.desc} /></th>
                <th onClick={() => toggleSort(setCommunitySort, communitySort, 'units_needed')}>Units <SortIcon active={communitySort.field === 'units_needed'} desc={communitySort.desc} /></th>
                <th onClick={() => toggleSort(setCommunitySort, communitySort, 'reason')}>Reason <SortIcon active={communitySort.field === 'reason'} desc={communitySort.desc} /></th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommunity.length === 0 ? (
                <tr><td colSpan="5" className="hosp-empty-cell">No matching emergencies right now.</td></tr>
              ) : (
                filteredCommunity.map((req) => (
                  <tr key={req.id}>
                    <td className="hosp-mono">#EMG-{req.id}</td>
                    <td><span className="hosp-type-badge">{req.blood_group}</span></td>
                    <td>{req.units_needed}</td>
                    <td>{req.reason}</td>
                    <td><button className="hosp-fulfill-btn" onClick={() => handleAcceptUserRequest(req.id)}>Fulfill</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="hosp-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="hosp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <h2>New Emergency Request</h2>
              <button className="hosp-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleRequestSubmit} className="hosp-form">
              <div className="hosp-field">
                <label>Blood Group Required</label>
                <select value={reqData.blood_group} onChange={(e) => setReqData({ ...reqData, blood_group: e.target.value })}>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="hosp-field">
                <label>Units Needed</label>
                <input type="number" min="1" required value={reqData.units_needed}
                  onChange={(e) => setReqData({ ...reqData, units_needed: e.target.value })} />
              </div>
              <div className="hosp-field">
                <label>Reason</label>
                <input type="text" required placeholder="e.g. Trauma surgery, mass casualty" value={reqData.reason}
                  onChange={(e) => setReqData({ ...reqData, reason: e.target.value })} />
              </div>
              <div className="hosp-modal-actions">
                <button type="button" className="hosp-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="hosp-submit">Broadcast to Network</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
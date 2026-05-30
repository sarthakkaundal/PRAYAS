import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [currentView, setCurrentView] = useState('submit'); // 'submit' or 'view'
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [image, setImage] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mockAddress = `COORD: ${lat.toFixed(4)}N, ${lng.toFixed(4)}E`;
          setLocation({ lat, lng, address: mockAddress });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation({ lat: null, lng: null, address: 'LOCATION_UNAVAILABLE' });
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocation({ lat: null, lng: null, address: 'GEO_NOT_SUPPORTED' });
      setIsLoadingLocation(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('DESCRIPTION_REQUIRED');
      return;
    }
    const newReport = {
      id: Date.now(),
      location: location.address || 'UNKNOWN',
      coordinates: { lat: location.lat, lng: location.lng },
      description: description.trim(),
      severity,
      image,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
    setReports(prev => [newReport, ...prev]);
    setDescription('');
    setSeverity('Minor');
    setImage(null);
    setCurrentView('view');
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Report Management</h1>
        <p className="page-subtitle">SUBMIT AND TRACK COMMUNITY DISASTER LOGS</p>
      </div>

      <div className="header" style={{ borderTop: 'none', background: 'var(--bg-base)' }}>
        <div 
          className={`icon-card ${currentView === 'submit' ? 'active' : ''}`} 
          style={{ width: '50%', borderLeft: 'none' }}
          onClick={() => setCurrentView('submit')}
        >
          <span>WRITE_LOG</span>
        </div>
        <div 
          className={`icon-card ${currentView === 'view' ? 'active' : ''}`} 
          style={{ width: '50%' }}
          onClick={() => setCurrentView('view')}
        >
          <span>VIEW_LOGS ({reports.length})</span>
        </div>
      </div>

      {currentView === 'submit' && (
        <div className="card" style={{ borderRight: 'none', borderBottom: 'none' }}>
          <div className="card-header">
            <h2 className="card-title">NEW_ENTRY_FORM</h2>
          </div>
          
          <div className="form-group">
            <label className="form-label">Location Data</label>
            <div style={{ display: 'flex' }}>
              <input 
                type="text" 
                className="form-input" 
                readOnly 
                value={isLoadingLocation ? 'DETECTING...' : location.address} 
              />
              <button className="btn" onClick={detectLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? 'WAIT' : 'SYNC'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Log Details</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ENTER INCIDENT DETAILS..."
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Threat Level</label>
            <select
              className="form-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Minor">MINOR / CLASS-1</option>
              <option value="Moderate">MODERATE / CLASS-2</option>
              <option value="Severe">SEVERE / CLASS-3</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Visual Evidence (OPTIONAL)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-input"
            />
            {image && (
              <img src={image} alt="Preview" style={{ marginTop: '1rem', width: '100%', maxWidth: '300px', border: '1px solid var(--grid-border)' }} />
            )}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>
            SUBMIT_DATA
          </button>
        </div>
      )}

      {currentView === 'view' && (
        <div className="content-grid">
          {reports.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>NO_DATA_FOUND</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                  <h2 className="card-title" style={{ 
                    color: report.severity === 'Severe' ? 'var(--status-danger)' : 
                           report.severity === 'Moderate' ? 'var(--status-warning)' : 'var(--status-success)' 
                  }}>
                    {report.severity.toUpperCase()}
                  </h2>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {report.timestamp}
                  </span>
                </div>
                <div style={{ marginBottom: '1rem', fontFamily: 'JetBrains Mono', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  LOC: {report.location}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  {report.description}
                </div>
                {report.image && (
                  <img src={report.image} alt="Report evidence" style={{ width: '100%', border: '1px solid var(--grid-border)' }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
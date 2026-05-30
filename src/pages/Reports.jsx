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
      <div className="p-8 border-b border-grid bg-base">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Report Management</h1>
        <p className="font-mono text-sm text-secondary uppercase">SUBMIT AND TRACK COMMUNITY DISASTER LOGS</p>
      </div>

      <div className="flex w-full border-b border-grid bg-base">
        <button 
          className={`flex-1 p-4 text-center font-mono text-sm uppercase font-bold transition-snap ${currentView === 'submit' ? 'bg-volt text-inverse' : 'bg-base text-primary hover:bg-volt-dim'}`}
          onClick={() => setCurrentView('submit')}
        >
          WRITE_LOG
        </button>
        <button 
          className={`flex-1 p-4 text-center font-mono text-sm uppercase font-bold transition-snap ${currentView === 'view' ? 'bg-volt text-inverse' : 'bg-base text-primary hover:bg-volt-dim'}`}
          onClick={() => setCurrentView('view')}
        >
          VIEW_LOGS ({reports.length})
        </button>
      </div>

      {currentView === 'submit' && (
        <div className="flex flex-col bg-base mb-[1px]" style={{ borderRight: 'none', borderBottom: 'none' }}>
          <div className="flex justify-between items-center p-4 border-b border-grid bg-base">
            <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2">NEW_ENTRY_FORM</h2>
          </div>
          
          <div className="mb-6">
            <label className="block font-mono text-xs text-secondary mb-2 uppercase">Location Data</label>
            <div className="flex">
              <input 
                type="text" 
                className="flex-1 bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap" 
                readOnly 
                value={isLoadingLocation ? 'DETECTING...' : location.address} 
              />
              <button className="bg-transparent border border-l-0 border-grid px-6 py-4 text-primary font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-volt hover:text-inverse" onClick={detectLocation} disabled={isLoadingLocation}>
                {isLoadingLocation ? 'WAIT' : 'SYNC'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-mono text-xs text-secondary mb-2 uppercase">Log Details</label>
            <textarea
              className="w-full bg-base border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap min-h-[120px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ENTER INCIDENT DETAILS..."
              required
              rows={4}
            />
          </div>

          <div className="mb-6">
            <label className="block font-mono text-xs text-secondary mb-2 uppercase">Threat Level</label>
            <select
              className="w-full bg-transparent border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Minor" className="bg-base text-primary">MINOR / CLASS-1</option>
              <option value="Moderate" className="bg-base text-primary">MODERATE / CLASS-2</option>
              <option value="Severe" className="bg-base text-primary">SEVERE / CLASS-3</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block font-mono text-xs text-secondary mb-2 uppercase">Visual Evidence (OPTIONAL)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full bg-base border border-grid p-4 text-primary font-mono outline-none focus:border-volt transition-snap"
            />
            {image && (
              <img src={image} alt="Preview" style={{ marginTop: '1rem', width: '100%', maxWidth: '300px', border: '1px solid var(--grid-border)' }} />
            )}
          </div>

          <button className="inline-flex items-center justify-center px-6 py-3 font-mono uppercase font-bold cursor-pointer transition-snap bg-volt text-inverse border border-volt hover:bg-volt-dim hover:text-volt" style={{ width: '100%' }} onClick={handleSubmit}>
            SUBMIT_DATA
          </button>
        </div>
      )}

      {currentView === 'view' && (
        <div className="grid grid-cols-1 gap-[1px] bg-grid">
          {reports.length === 0 ? (
            <div className="flex flex-col bg-base mb-[1px]" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>NO_DATA_FOUND</p>
            </div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="flex flex-col bg-base mb-[1px]">
                <div className="flex justify-between items-center p-4 border-b border-grid bg-base" style={{ justifyContent: 'space-between' }}>
                  <h2 className="text-sm font-mono text-secondary uppercase flex items-center gap-2" style={{ 
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
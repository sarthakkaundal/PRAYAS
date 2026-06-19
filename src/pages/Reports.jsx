import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [reports, setReports] = useState([]);
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
          const mockAddress = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
          setLocation({ lat, lng, address: mockAddress });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation({ lat: null, lng: null, address: 'Location unavailable' });
          setIsLoadingLocation(false);
        }
      );
    } else {
      setLocation({ lat: null, lng: null, address: 'Geolocation not supported' });
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
      alert('Please provide a description of the incident.');
      return;
    }
    const newReport = {
      id: Date.now(),
      location: location.address || 'Unknown',
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
  };

  const severityConfig = {
    'Severe': { color: 'var(--status-danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
    'Moderate': { color: 'var(--status-warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Moderate' },
    'Minor': { color: 'var(--status-success)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', label: 'Minor' },
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--grid-border)',
    backgroundColor: 'var(--bg-base)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="opacity-0 animate-in">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>01</span>
          <span className="font-mono text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--text-tertiary)' }}>Field Reports</span>
        </div>

        <div className="rounded-xl p-5 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>Disaster Report Center</h1>
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Submit and monitor field incident reports</p>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-2 rounded-lg border flex flex-col items-center" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--grid-border)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{reports.length}</span>
              <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--text-secondary)' }}>Total</span>
            </div>
            <div className="px-3 py-2 rounded-lg border flex flex-col items-center" style={{ backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--status-danger)' }}>{reports.filter(r => r.severity === 'Severe').length}</span>
              <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--status-danger)' }}>Critical</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="lg:col-span-1 opacity-0 animate-in" style={{ animationDelay: '0.05s' }}>
          <div className="rounded-xl p-5 border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-volt)' }}></div>
              Submit Report
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Location</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={isLoadingLocation ? 'Detecting...' : location.address} 
                    style={{...inputStyle, flex: 1}}
                  />
                  <button 
                    onClick={detectLocation} 
                    disabled={isLoadingLocation}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--grid-border)',
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: '600',
                      cursor: isLoadingLocation ? 'wait' : 'pointer',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      opacity: isLoadingLocation ? 0.5 : 1,
                    }}
                    onMouseOver={(e) => { if (!isLoadingLocation) { e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)'; e.currentTarget.style.borderColor = 'var(--accent-volt)'; }}}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-base)'; e.currentTarget.style.borderColor = 'var(--grid-border)'; }}
                  >
                    Sync
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Incident Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the situation..."
                  required
                  style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent-volt)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-volt-dim)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--grid-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Minor">Minor — Routine</option>
                  <option value="Moderate">Moderate — Alert</option>
                  <option value="Severe">Severe — Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Visual Evidence</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{...inputStyle, padding: '8px', fontSize: '11px'}}
                />
                {image && (
                  <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--grid-border)' }}>
                    <img src={image} alt="Preview" style={{ width: '100%', objectFit: 'cover', maxHeight: '120px', display: 'block' }} />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--accent-volt)',
                  color: 'var(--text-inverse)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => { e.target.style.boxShadow = 'var(--shadow-glow-volt)'; }}
                onMouseOut={(e) => { e.target.style.boxShadow = 'none'; }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 opacity-0 animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-xl border overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', boxShadow: 'var(--shadow-card)', maxHeight: '680px' }}>
            <div className="px-5 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--grid-border)', backgroundColor: 'var(--bg-surface)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Reports</h2>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--status-success)' }}>Live Feed</span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3" style={{ backgroundColor: 'var(--bg-base)' }}>
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ opacity: 0.4 }}>
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No reports yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Submit a report to see it here</p>
                </div>
              ) : (
                reports.map(report => {
                  const sev = severityConfig[report.severity];
                  return (
                    <div
                      key={report.id}
                      className="rounded-lg p-4 border transition-all duration-200"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--grid-border)',
                        borderLeft: `3px solid ${sev.color}`,
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = sev.color + '60'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--grid-border)'; e.currentTarget.style.borderLeftColor = sev.color; }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold" style={{ backgroundColor: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: sev.color }}></span>
                            {sev.label}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{report.timestamp}</span>
                        </div>
                        <span className="font-mono text-[10px] max-w-[140px] truncate" style={{ color: 'var(--text-tertiary)' }} title={report.location}>
                          📍 {report.location}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{report.description}</p>
                      {report.image && (
                        <div className="rounded-md overflow-hidden border mt-3 max-w-xs" style={{ borderColor: 'var(--grid-border)' }}>
                          <img src={report.image} alt="Evidence" style={{ width: '100%', objectFit: 'cover', maxHeight: '160px', display: 'block' }} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
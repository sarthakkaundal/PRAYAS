import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [currentView, setCurrentView] = useState('submit'); // 'submit' or 'view'
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [image, setImage] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Get user's location on component mount
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
          
          // Try to get address from coordinates (using a mock address for demo)
          const mockAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
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
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }

    const newReport = {
      id: Date.now(),
      location: location.address || 'Location unavailable',
      coordinates: { lat: location.lat, lng: location.lng },
      description: description.trim(),
      severity,
      image,
      timestamp: new Date().toLocaleString()
    };

    setReports(prev => [newReport, ...prev]);
    
    // Reset form
    setDescription('');
    setSeverity('Minor');
    setImage(null);
    
    alert('Report submitted successfully!');
    setCurrentView('view');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Minor': return '#28a745';
      case 'Moderate': return '#fd7e14';
      case 'Severe': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '2rem 1rem'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        maxWidth: '1200px',
        margin: '0 auto 2rem auto'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: 'var(--text-primary)', 
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          Report Management System
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Submit disaster reports and view community submissions to help coordinate emergency response efforts.
        </p>
      </div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Toggle Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            style={{
              padding: '12px 24px',
              border: `2px solid ${currentView === 'submit' ? 'var(--text-accent)' : 'var(--border-color)'}`,
              backgroundColor: currentView === 'submit' ? 'var(--text-accent)' : 'var(--bg-card)',
              color: currentView === 'submit' ? 'var(--text-inverse)' : 'var(--text-primary)',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onClick={() => setCurrentView('submit')}
          >
            📝 Submit Report
          </button>
          <button
            style={{
              padding: '12px 24px',
              border: `2px solid ${currentView === 'view' ? 'var(--text-accent)' : 'var(--border-color)'}`,
              backgroundColor: currentView === 'view' ? 'var(--text-accent)' : 'var(--bg-card)',
              color: currentView === 'view' ? 'var(--text-inverse)' : 'var(--text-primary)',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onClick={() => setCurrentView('view')}
          >
            👁️ View Reports ({reports.length})
          </button>
        </div>

        {/* Submit Report Form */}
        {currentView === 'submit' && (
          <div style={{
            background: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: 'var(--shadow-card)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '1.5rem'
            }}>
              Submit a New Report
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Location */}
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)' 
                }}>
                  📍 Location:
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isLoadingLocation}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--text-accent)',
                      color: 'var(--text-inverse)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: isLoadingLocation ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      opacity: isLoadingLocation ? 0.6 : 1
                    }}
                  >
                    {isLoadingLocation ? 'Detecting...' : '🔄 Refresh'}
                  </button>
                </label>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace'
                }}>
                  {isLoadingLocation ? '🔍 Detecting location...' : `📍 ${location.address}`}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)' 
                }}>
                  📝 Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue you want to report in detail..."
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    minHeight: '120px',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--text-accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              {/* Severity */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)' 
                }}>
                  ⚠️ Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--text-accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                  <option value="Minor">🟢 Minor - Low impact issue</option>
                  <option value="Moderate">🟡 Moderate - Significant concern</option>
                  <option value="Severe">🔴 Severe - Critical emergency</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)' 
                }}>
                  📸 Upload Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                {image && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <img
                      src={image}
                      alt="Preview"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '200px',
                        borderRadius: '0.75rem',
                        border: '2px solid var(--border-color)',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  marginTop: '1rem'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                🚀 Submit Report
              </button>
            </div>
          </div>
        )}

        {/* View Reports */}
        {currentView === 'view' && (
          <div style={{ width: '100%' }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '1rem',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--text-accent)',
                color: 'var(--text-inverse)',
                textAlign: 'center'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                  📋 Submitted Reports ({reports.length})
                </h2>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                {reports.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem',
                    padding: '3rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '0.75rem'
                  }}>
                    📝 No reports submitted yet. Submit your first report to get started!
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid', 
                    gap: '1.5rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
                  }}>
                    {reports.map((report) => (
                      <div 
                        key={report.id} 
                        style={{
                          border: '2px solid var(--border-separator)',
                          borderRadius: '1rem',
                          padding: '1.5rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <span 
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '1.5rem',
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              backgroundColor: getSeverityColor(report.severity)
                            }}
                          >
                            {report.severity === 'Minor' && '🟢'} 
                            {report.severity === 'Moderate' && '🟡'} 
                            {report.severity === 'Severe' && '🔴'} 
                            {report.severity}
                          </span>
                          <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            🕒 {report.timestamp}
                          </small>
                        </div>
                        
                        <div style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                          <p style={{ marginBottom: '0.5rem' }}>
                            <strong>📍 Location:</strong> {report.location}
                          </p>
                          <p style={{ marginBottom: '0.5rem' }}>
                            <strong>📝 Description:</strong> {report.description}
                          </p>
                        </div>

                        {report.image && (
                          <div style={{ textAlign: 'center' }}>
                            <img
                              src={report.image}
                              alt="Report"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                borderRadius: '0.75rem',
                                border: '2px solid var(--border-color)',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
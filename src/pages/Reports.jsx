import React, { useState, useEffect } from 'react';
import { db, auth } from './Auth/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { logAuditAction } from '../services/telemetryService';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng, address: `${e.latlng.lat.toFixed(4)}°N, ${e.latlng.lng.toFixed(4)}°E` });
    },
  });
  return position.lat ? <Marker position={[position.lat, position.lng]} /> : null;
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Minor');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userRole, setUserRole] = useState('Citizen');
  
  const [locationMode, setLocationMode] = useState('browser'); // 'browser', 'map', 'manual'
  const [showMapModal, setShowMapModal] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists() && snapshot.data().role) {
          setUserRole(snapshot.data().role);
        }
      }
    });

    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribeReports = onSnapshot(q, (querySnapshot) => {
      const reportsArray = [];
      querySnapshot.forEach((doc) => {
        reportsArray.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsArray);
    });

    detectLocation();

    return () => {
      unsubscribeAuth();
      unsubscribeReports();
    };
  }, []);

  const detectLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng, address: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` });
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

  const handleManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng, address: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` });
    } else {
      alert("Please enter valid coordinates.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary config missing. Please set environment variables.");
      return null;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a description of the incident.');
      return;
    }
    if (!location.lat || !location.lng) {
      alert('Please provide valid location coordinates.');
      return;
    }

    setIsUploading(true);
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) {
        setIsUploading(false);
        return; // failed upload
      }
    }

    try {
      await addDoc(collection(db, "reports"), {
        location: location.address,
        latitude: location.lat,
        longitude: location.lng,
        description: description.trim(),
        severity,
        imageUrl,
        status: 'pending',
        reportedBy: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp()
      });
      
      logAuditAction(auth.currentUser?.uid, userRole, 'REPORT_SUBMITTED', { location: location.address, severity });

      setDescription('');
      setSeverity('Minor');
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error adding document: ", err);
      alert("Failed to submit report.");
    }
    setIsUploading(false);
  };

  const updateStatus = async (id, newStatus) => {
    if (userRole === 'Citizen') return;
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'responding') {
        updateData.verifiedBy = auth.currentUser?.uid || 'Unknown';
        updateData.verifiedAt = serverTimestamp();
      } else if (newStatus === 'resolved') {
        updateData.resolvedBy = auth.currentUser?.uid || 'Unknown';
        updateData.resolvedAt = serverTimestamp();
      }
      await updateDoc(doc(db, "reports", id), updateData);
      logAuditAction(auth.currentUser?.uid, userRole, 'REPORT_STATUS_CHANGED', { reportId: id, newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const severityConfig = {
    'Severe': { color: 'var(--status-danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
    'Moderate': { color: 'var(--status-warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Moderate' },
    'Minor': { color: 'var(--status-success)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', label: 'Minor' },
  };

  const statusConfig = {
    'pending': { color: '#f97316', label: 'Pending' },
    'responding': { color: '#3b82f6', label: 'Responding' },
    'resolved': { color: '#22c55e', label: 'Resolved' },
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
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full relative">
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
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Location Source</label>
                </div>
                <div className="flex gap-1 mb-2 p-1 rounded-md" style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-border)' }}>
                  <button onClick={() => setLocationMode('browser')} className="flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors" style={{ backgroundColor: locationMode === 'browser' ? 'var(--bg-surface-elevated)' : 'transparent', color: locationMode === 'browser' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Geo</button>
                  <button onClick={() => setLocationMode('map')} className="flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors" style={{ backgroundColor: locationMode === 'map' ? 'var(--bg-surface-elevated)' : 'transparent', color: locationMode === 'map' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Map</button>
                  <button onClick={() => setLocationMode('manual')} className="flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition-colors" style={{ backgroundColor: locationMode === 'manual' ? 'var(--bg-surface-elevated)' : 'transparent', color: locationMode === 'manual' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Manual</button>
                </div>

                {locationMode === 'browser' && (
                  <div className="flex gap-2">
                    <input type="text" readOnly value={isLoadingLocation ? 'Detecting...' : location.address} style={{...inputStyle, flex: 1}} />
                    <button onClick={detectLocation} disabled={isLoadingLocation} style={{...inputStyle, width: 'auto', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', cursor: isLoadingLocation ? 'wait' : 'pointer', opacity: isLoadingLocation ? 0.5 : 1 }}>Sync</button>
                  </div>
                )}

                {locationMode === 'map' && (
                  <div className="flex gap-2">
                    <input type="text" readOnly value={location.address || 'Select on map'} style={{...inputStyle, flex: 1}} />
                    <button onClick={() => setShowMapModal(true)} style={{...inputStyle, width: 'auto', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', cursor: 'pointer', backgroundColor: 'var(--bg-surface-elevated)' }}>Open Map</button>
                  </div>
                )}

                {locationMode === 'manual' && (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Lat" value={manualLat} onChange={(e) => setManualLat(e.target.value)} style={{...inputStyle, flex: 1}} />
                    <input type="text" placeholder="Lng" value={manualLng} onChange={(e) => setManualLng(e.target.value)} style={{...inputStyle, flex: 1}} />
                    <button onClick={handleManualLocation} style={{...inputStyle, width: 'auto', fontWeight: '600', textTransform: 'uppercase', fontSize: '11px', cursor: 'pointer' }}>Set</button>
                  </div>
                )}
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
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={inputStyle}>
                  <option value="Minor">Minor — Routine</option>
                  <option value="Moderate">Moderate — Alert</option>
                  <option value="Severe">Severe — Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Visual Evidence</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{...inputStyle, padding: '8px', fontSize: '11px'}} />
                {imagePreview && (
                  <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--grid-border)' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', objectFit: 'cover', maxHeight: '120px', display: 'block' }} />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isUploading}
                style={{
                  width: '100%', padding: '11px', borderRadius: 'var(--radius-md)', border: 'none',
                  backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', fontWeight: '600', fontSize: '13px',
                  cursor: isUploading ? 'wait' : 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                  opacity: isUploading ? 0.7 : 1
                }}
              >
                {isUploading ? 'Submitting...' : 'Submit Report'}
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
                </div>
              ) : (
                reports.map(report => {
                  const sev = severityConfig[report.severity] || severityConfig['Minor'];
                  const status = statusConfig[report.status] || statusConfig['pending'];
                  const dateString = report.createdAt?.toDate ? report.createdAt.toDate().toLocaleTimeString('en-US', { hour12: false }) : '';
                  return (
                    <div
                      key={report.id}
                      className="rounded-lg p-4 border transition-all duration-200"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', borderLeft: `3px solid ${sev.color}` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold" style={{ backgroundColor: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {sev.label}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{dateString}</span>
                          <span className="font-mono text-[10px]" style={{ color: status.color }}>• {status.label}</span>
                        </div>
                        <span className="font-mono text-[10px] max-w-[140px] truncate" style={{ color: 'var(--text-tertiary)' }} title={report.location}>
                          📍 {report.location}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{report.description}</p>
                      
                      {report.imageUrl && (
                        <div className="rounded-md overflow-hidden border mt-3 max-w-xs" style={{ borderColor: 'var(--grid-border)' }}>
                          <img src={report.imageUrl} alt="Evidence" style={{ width: '100%', objectFit: 'cover', maxHeight: '160px', display: 'block' }} />
                        </div>
                      )}

                      {/* Admin/Responder Controls */}
                      {(userRole === 'Responder' || userRole === 'RegionalAdmin' || userRole === 'SuperAdmin') && (
                        <div className="mt-3 flex gap-2">
                          <select 
                            value={report.status} 
                            onChange={(e) => updateStatus(report.id, e.target.value)}
                            style={{...inputStyle, padding: '4px 8px', fontSize: '11px', width: 'auto'}}
                          >
                            <option value="pending">Set Pending</option>
                            <option value="responding">Set Responding</option>
                            <option value="resolved">Set Resolved</option>
                          </select>
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

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-xl overflow-hidden flex flex-col w-full max-w-2xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--grid-border)', height: '60vh' }}>
            <div className="p-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--grid-border)' }}>
              <h3 className="text-sm font-semibold">Select Location</h3>
              <button onClick={() => setShowMapModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="flex-1">
              <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={location} setPosition={setLocation} />
              </MapContainer>
            </div>
            <div className="p-3 border-t flex justify-end" style={{ borderColor: 'var(--grid-border)' }}>
              <button 
                onClick={() => setShowMapModal(false)}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--accent-volt)', color: 'var(--text-inverse)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
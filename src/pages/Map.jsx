import React, { useState, useEffect } from "react";

const Map = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  const mapContainerStyle = {
    position: isFullscreen ? 'fixed' : 'relative',
    top: isFullscreen ? '0' : 'auto',
    left: isFullscreen ? '0' : 'auto',
    width: '100%',
    height: isFullscreen ? '100vh' : 'calc(100vh - 130px)',
    minHeight: isFullscreen ? '100vh' : '500px',
    zIndex: isFullscreen ? '9999' : 'auto',
    backgroundColor: 'var(--bg-base)',
    borderRadius: isFullscreen ? '0' : 'var(--radius-lg)',
    overflow: 'hidden',
  };

  // Windy-style floating pill button
  const FloatingButton = ({ onClick, children, title, danger }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(9, 9, 11, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: danger ? 'var(--status-danger)' : 'var(--text-primary)',
        fontSize: '11px',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = danger ? 'rgba(239,68,68,0.2)' : 'rgba(204,255,0,0.15)';
        e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.3)' : 'rgba(204,255,0,0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(9, 9, 11, 0.7)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
      }}
    >
      {children}
    </button>
  );

  return (
    <div className={isFullscreen ? "" : "p-4 md:p-6 flex flex-col gap-0 max-w-full mx-auto w-full"} style={{ height: isFullscreen ? '100vh' : 'auto' }}>

      {/* Map Container */}
      <div style={mapContainerStyle} className="border" >
        
        {/* Floating Header — Windy style (overlays map) */}
        {!isFullscreen && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div>
              <h1 style={{ fontSize: '14px', fontWeight: '700', color: '#fafafa', margin: 0, letterSpacing: '-0.01em' }}>GIS Command Center</h1>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '2px' }}>Satellite & Sensor Overlay</p>
            </div>
            <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#22c55e', opacity: 0.6, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#22c55e' }}></span>
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '600' }}>Live</span>
            </div>
          </div>
        )}

        {/* Floating Controls — Windy-style vertical toolbar on right */}
        <div style={{
          position: 'absolute',
          top: isFullscreen ? '16px' : '16px',
          right: '16px',
          zIndex: isFullscreen ? 10000 : 90,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <FloatingButton onClick={() => window.location.reload()} title="Refresh Telemetry">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync
          </FloatingButton>
          <FloatingButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              )}
            </svg>
            {isFullscreen ? 'Exit' : 'Expand'}
          </FloatingButton>
        </div>

        {/* Bottom-left status chip — Windy style */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: isFullscreen ? 10000 : 90,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(9, 9, 11, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }}></div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Telemetry Active  ·  {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>

        {/* Fullscreen ESC indicator — Zoom Earth style (fades away) */}
        {isFullscreen && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            zIndex: 10001,
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(9, 9, 11, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.05em',
            animation: 'animate-in 0.3s ease forwards',
          }}>
            Press <span style={{ color: 'var(--text-primary)', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: '4px', marginRight: '4px' }}>ESC</span> to exit
          </div>
        )}

        {/* Map iFrame */}
        <iframe
          title="Disaster Management Map"
          src={`/MAP/map61.html?maptiler=${process.env.REACT_APP_MAPTILER_API_KEY || ''}&weather=${process.env.REACT_APP_WEATHER_API_KEY || ''}&fb_key=${process.env.REACT_APP_FIREBASE_API_KEY || ''}&fb_domain=${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || ''}&fb_url=${process.env.REACT_APP_FIREBASE_DATABASE_URL || ''}&fb_project=${process.env.REACT_APP_FIREBASE_PROJECT_ID || ''}&fb_bucket=${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || ''}&fb_sender=${process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || ''}&fb_app=${process.env.REACT_APP_FIREBASE_APP_ID || ''}`}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Map;
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
    height: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
    minHeight: isFullscreen ? '100vh' : '600px',
    zIndex: isFullscreen ? '9999' : 'auto',
    backgroundColor: 'var(--bg-base)',
    borderTop: isFullscreen ? 'none' : '1px solid var(--grid-border)'
  };

  const controlsStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: '10000',
    display: 'flex',
    gap: '0'
  };

  return (
    <div style={{ width: '100%' }}>
      {!isFullscreen && (
        <div className="p-8 border-b border-grid bg-base">
          <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Topographic Data</h1>
          <p className="font-mono text-sm text-secondary uppercase">SATELLITE & SENSOR OVERLAY MATRIX</p>
        </div>
      )}

      <div style={mapContainerStyle}>
        <div style={controlsStyle}>
          <button
            onClick={toggleFullscreen}
            className="bg-transparent border border-grid px-3 py-1 text-[10px] text-primary font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-surface border-r-0"
            title={isFullscreen ? "EXIT FULLSCREEN (ESC)" : "ENTER FULLSCREEN"}
          >
            {isFullscreen ? 'SHRINK' : 'EXPAND'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-transparent border border-grid px-3 py-1 text-[10px] text-primary font-mono uppercase font-bold cursor-pointer transition-snap hover:bg-surface"
            title="REFRESH TELEMETRY"
          >
            SYNC
          </button>
        </div>

        <iframe
          title="Disaster Management Map"
          src={`/MAP/map61.html?maptiler=${process.env.REACT_APP_MAPTILER_API_KEY || ''}&weather=${process.env.REACT_APP_WEATHER_API_KEY || ''}&fb_key=${process.env.REACT_APP_FIREBASE_API_KEY || ''}&fb_domain=${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || ''}&fb_url=${process.env.REACT_APP_FIREBASE_DATABASE_URL || ''}&fb_project=${process.env.REACT_APP_FIREBASE_PROJECT_ID || ''}&fb_bucket=${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || ''}&fb_sender=${process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || ''}&fb_app=${process.env.REACT_APP_FIREBASE_APP_ID || ''}`}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
        />

        {isFullscreen && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            padding: '0.5rem 1rem',
            border: '1px solid var(--grid-border)',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.75rem',
            zIndex: '10001'
          }}>
            [ESC] TERMINATE FULLSCREEN
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
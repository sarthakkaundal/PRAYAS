// src/pages/Map.jsx
import React, { useState, useEffect } from "react";

const Map = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle ESC key to exit fullscreen
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
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: isFullscreen ? '0' : '1rem',
    overflow: 'hidden',
    boxShadow: isFullscreen ? 'none' : 'var(--shadow-card)'
  };

  const controlsStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: '10000',
    display: 'flex',
    gap: '0.5rem'
  };

  const buttonStyle = {
    padding: '0.75rem',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s ease',
    width: '40px',
    height: '40px'
  };

  return (
    <div style={{ 
      width: '100%', 
      padding: isFullscreen ? '0' : '1rem',
      background: isFullscreen ? 'transparent' : 'transparent'
    }}>
      {/* Page Header - only show when not fullscreen */}
      {!isFullscreen && (
        <div style={{
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Disaster Management Map
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem'
          }}>
            View real-time disaster information, shelters, and affected areas
          </p>
        </div>
      )}

      <div style={mapContainerStyle}>
        {/* Map Controls */}
        <div style={controlsStyle}>
          <button
            onClick={toggleFullscreen}
            style={buttonStyle}
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--bg-card)'}
          >
            {isFullscreen ? (
              // Minimize icon
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5m5.5 11.5V20M9 15H4.5M9 15l-5.5 5.5M20 9V4.5M20 9h-4.5M20 9l-5.5-5.5m5.5 11.5V20M20 15h-4.5m4.5 0l-5.5 5.5" />
              </svg>
            ) : (
              // Maximize icon
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
          
          {/* Additional control buttons can be added here */}
          <button
            onClick={() => window.location.reload()}
            style={buttonStyle}
            title="Refresh Map"
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--bg-card)'}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Map iframe */}
        <iframe
          title="Disaster Management Map"
          src={`${process.env.PUBLIC_URL}/Map/map61.html`}
          width="100%"
          height="100%"
          style={{ 
            border: 0,
            borderRadius: isFullscreen ? '0' : '1rem'
          }}
          allowFullScreen
        />

        {/* Fullscreen overlay instructions */}
        {isFullscreen && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            zIndex: '10001'
          }}>
            Press ESC or click the minimize button to exit fullscreen
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
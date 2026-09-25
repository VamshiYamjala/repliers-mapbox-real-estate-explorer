import { useState, useEffect, useRef } from 'react';

export default function VirtualTourModal({ listing, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showEmbedNotice, setShowEmbedNotice] = useState(false);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!listing) return;

    setIsLoading(true);
    setShowEmbedNotice(false);
    isLoadedRef.current = false;

    // Show fallback notice only if the iframe hasn't loaded after 8 seconds
    const timer = setTimeout(() => {
      if (!isLoadedRef.current) {
        setShowEmbedNotice(true);
      }
    }, 8000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [listing, onClose]);

  if (!listing || !listing.media3d) return null;

  const { embedUrl, directUrl, url, provider, is3D } = listing.media3d;
  const targetEmbedUrl = embedUrl || url;
  const targetDirectUrl = directUrl || url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '960px',
          height: '84vh',
          maxHeight: '740px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>{is3D ? '🕶️' : '🔮'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  3D / Virtual Tour
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3'
                }}>
                  {provider || 'Virtual Tour'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                {listing.address ? `${listing.address}, ` : ''}{listing.city || ''}
                {listing.price ? ` • $${typeof listing.price === 'number' ? listing.price.toLocaleString() : listing.price}` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a
              href={targetDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 13px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                borderRadius: '6px',
                border: '1px solid #1d4ed8',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Open in New Tab ↗
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Tour"
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Informational banner if provider blocks framing or takes long */}
        {showEmbedNotice && (
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#eff6ff',
            borderBottom: '1px solid #bfdbfe',
            fontSize: '12px',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span>
              ℹ️ If the preview is blank or shows an error, the external provider restricts in-app embedding.
            </span>
            <a
              href={targetDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1d4ed8',
                fontWeight: 600,
                textDecoration: 'underline',
                fontSize: '12px'
              }}
            >
              Open official tour page directly ↗
            </a>
          </div>
        )}

        {/* Tour Container */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#ffffff' }}>
          {/* Loading Indicator */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
              zIndex: 1,
              color: '#f8fafc',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(255,255,255,0.2)',
                borderTop: '3px solid #60a5fa',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Loading 3D / Virtual Tour...</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Connecting to {provider || 'external provider'}</div>
            </div>
          )}

          <iframe
            src={targetEmbedUrl}
            title={`3D / Virtual Tour for ${listing.address || listing.id}`}
            onLoad={() => {
              isLoadedRef.current = true;
              setIsLoading(false);
            }}
            onError={() => {
              setIsLoading(false);
              setShowEmbedNotice(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              backgroundColor: '#ffffff'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
            allowFullScreen
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span>
            Tour media is hosted externally by the listing provider. If a tour was deleted by the broker or expired, availability is governed by the source MLS.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

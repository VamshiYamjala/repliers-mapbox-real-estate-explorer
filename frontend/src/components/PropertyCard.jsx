import { useEffect, useRef } from 'react';

export default function PropertyCard({ listing, onSelect, isSelected, onOpenTour }) {
  const cardRef = useRef(null);
  const id = listing.id || listing.mlsNumber;
  const price = listing.price ?? listing.listPrice;
  const bedrooms = listing.bedrooms ?? listing.details?.numBedrooms ?? '-';
  const bathrooms = listing.bathrooms ?? listing.details?.numBathrooms ?? '-';
  const propertyType = listing.propertyType || listing.details?.propertyType || 'Residential';
  const sqft = listing.sqft || listing.details?.sqft;
  const city = listing.city || listing.address?.city || '';
  const state = listing.state || listing.address?.state || '';

  const addressStr = typeof listing.address === 'string'
    ? listing.address
    : (listing.address
      ? `${listing.address.streetNumber || ''} ${listing.address.streetName || ''} ${listing.address.streetSuffix || ''}`.trim()
      : 'Address unavailable');

  const imageUrl = listing.image
    || (listing.images && listing.images.length > 0
      ? (listing.images[0].startsWith('http') ? listing.images[0] : `https://cdn.repliers.io/${listing.images[0]}`)
      : 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60');

  // Scroll into view when selected from a map marker click
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      className="property-card"
      onClick={() => onSelect && onSelect(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: isSelected
          ? '0 0 0 2px #2563eb, 0 8px 16px rgba(37, 99, 235, 0.25)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb',
        transform: isSelected ? 'scale(1.01)' : 'none'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '160px', backgroundColor: '#f3f4f6' }}>
        <img
          src={imageUrl}
          alt={addressStr}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60';
          }}
        />
        {listing.photoCount > 0 && (
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            fontSize: '11px',
            padding: '3px 7px',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            📷 {listing.photoCount}
          </span>
        )}
        <span style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: isSelected ? '#1d4ed8' : '#2563eb',
          color: '#fff',
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '4px',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          {propertyType}
        </span>

        {/* Optional 3D / Virtual Tour Badge */}
        {listing.media3d?.url && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(30, 27, 75, 0.9)',
            backdropFilter: 'blur(3px)',
            color: '#e0e7ff',
            fontSize: '10px',
            padding: '3px 7px',
            borderRadius: '4px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {listing.media3d.is3D ? '🕶️ 3D TOUR' : '🔮 TOUR'}
          </span>
        )}
      </div>

      <div style={{ padding: '14px', backgroundColor: isSelected ? '#eff6ff' : '#ffffff' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          ${typeof price === 'number' ? price.toLocaleString() : (price || 'N/A')}
        </div>
        <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '10px' }}>
          {addressStr}{city ? `, ${city}` : ''}{state ? `, ${state}` : ''}
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '13px',
          color: '#6b7280',
          borderTop: '1px solid #f3f4f6',
          paddingTop: '8px'
        }}>
          <span>🛏️ <strong>{bedrooms}</strong> beds</span>
          <span>🛁 <strong>{bathrooms}</strong> baths</span>
          {sqft && (
            <span>📐 <strong>{sqft}</strong> sqft</span>
          )}
        </div>

        {/* Optional 3D / Virtual Tour Action Button */}
        {listing.media3d?.url && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenTour) onOpenTour(listing);
              }}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#4338ca',
                backgroundColor: '#eef2ff',
                border: '1px solid #c7d2fe',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e7ff';
                e.currentTarget.style.borderColor = '#a5b4fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#eef2ff';
                e.currentTarget.style.borderColor = '#c7d2fe';
              }}
            >
              <span>{listing.media3d.is3D ? '🕶️' : '🔮'}</span>
              <span>3D / Virtual Tour</span>
              <span style={{ fontSize: '10px', opacity: 0.75, fontWeight: 500 }}>
                ({listing.media3d.provider || 'Interactive'})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

export default function PropertyCard({ listing, onSelect, isSelected }) {
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

  // Badge colors based on property type
  const getBadgeStyle = (type) => {
    if (type?.toLowerCase().includes('lease')) {
      return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
    if (type?.toLowerCase().includes('income')) {
      return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
    }
    return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  };

  const badgeStyle = getBadgeStyle(propertyType);

  // Scroll into view when selected from a map marker click
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect && onSelect(id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isSelected
          ? '0 0 0 2px #2563eb, 0 10px 20px -3px rgba(37, 99, 235, 0.25)'
          : '0 2px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
        transform: isSelected ? 'translateY(-2px)' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0, 0, 0, 0.09)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
        }
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '170px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={addressStr}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Photo Count Pill */}
        {listing.photoCount > 0 && (
          <span style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            📷 {listing.photoCount}
          </span>
        )}

        {/* Property Type Badge */}
        <span style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: badgeStyle.bg,
          color: badgeStyle.color,
          border: `1px solid ${badgeStyle.border}`,
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {propertyType}
        </span>
      </div>

      <div style={{ padding: '14px 16px', backgroundColor: isSelected ? '#f8faff' : '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <div style={{ fontSize: '21px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            ${typeof price === 'number' ? price.toLocaleString() : (price || 'N/A')}
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
            MLS® {id}
          </span>
        </div>

        <div style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#475569',
          marginBottom: '10px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {addressStr}{city ? `, ${city}` : ''}{state ? `, ${state}` : ''}
        </div>

        <div style={{
          display: 'flex',
          gap: '14px',
          fontSize: '13px',
          color: '#64748b',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '10px',
          alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🛏️</span> <strong>{bedrooms}</strong> beds
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🛁</span> <strong>{bathrooms}</strong> baths
          </span>
          {sqft && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📐</span> <strong>{sqft}</strong> sqft
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

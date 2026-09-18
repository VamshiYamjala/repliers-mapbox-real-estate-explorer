export default function PropertyCard({ listing, onSelect, isSelected }) {
  const addressStr = listing.address
    ? `${listing.address.streetNumber || ''} ${listing.address.streetName || ''} ${listing.address.streetSuffix || ''}`.trim()
    : 'Address unavailable';

  const imageUrl = listing.images && listing.images.length > 0
    ? (listing.images[0].startsWith('http') ? listing.images[0] : `https://cdn.repliers.io/${listing.images[0]}`)
    : 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60';

  return (
    <div
      onClick={() => onSelect && onSelect(listing.mlsNumber)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: isSelected ? '0 0 0 2px #2563eb, 0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        border: '1px solid #e5e7eb'
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
          backgroundColor: '#2563eb',
          color: '#fff',
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '4px',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          {listing.details?.propertyType || 'Residential'}
        </span>
      </div>

      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          ${listing.listPrice ? listing.listPrice.toLocaleString() : 'N/A'}
        </div>
        <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '10px' }}>
          {addressStr}, {listing.address?.city || ''}, {listing.address?.state || ''}
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '13px',
          color: '#6b7280',
          borderTop: '1px solid #f3f4f6',
          paddingTop: '8px'
        }}>
          <span>🛏️ <strong>{listing.details?.numBedrooms ?? '-'}</strong> beds</span>
          <span>🛁 <strong>{listing.details?.numBathrooms ?? '-'}</strong> baths</span>
          {listing.details?.sqft && (
            <span>📐 <strong>{listing.details.sqft}</strong> sqft</span>
          )}
        </div>
      </div>
    </div>
  );
}

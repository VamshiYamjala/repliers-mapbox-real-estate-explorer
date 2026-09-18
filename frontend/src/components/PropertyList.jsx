import PropertyCard from './PropertyCard.jsx';

export default function PropertyList({ listings = [], selectedId, onSelectProperty }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: 600 }}>
          Available Properties
        </h3>
        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'}
        </span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6b7280' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏠</div>
            <p style={{ margin: 0, fontSize: '14px' }}>No properties found</p>
          </div>
        ) : (
          listings.map((listing) => (
            <PropertyCard
              key={listing.mlsNumber}
              listing={listing}
              isSelected={selectedId === listing.mlsNumber}
              onSelect={onSelectProperty}
            />
          ))
        )}
      </div>
    </div>
  );
}

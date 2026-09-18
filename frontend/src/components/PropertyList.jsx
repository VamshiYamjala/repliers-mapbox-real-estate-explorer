import { useState, useMemo } from 'react';
import PropertyCard from './PropertyCard.jsx';

export default function PropertyList({
  listings = [],
  selectedId,
  onSelectProperty,
  loading = false,
  error = null,
  onRetry,
  onResetFilters
}) {
  const [sortBy, setSortBy] = useState('default');

  // Sorted listings
  const sortedListings = useMemo(() => {
    if (!listings || listings.length === 0) return [];
    const list = [...listings];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return list;
  }, [listings, sortBy]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Header with Sort and Count */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
            Listings
          </h3>
          <span style={{
            fontSize: '12px',
            color: loading ? '#2563eb' : (error ? '#dc2626' : '#475569'),
            fontWeight: 600,
            backgroundColor: '#f1f5f9',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {loading ? 'Searching...' : (error ? 'Error' : `${listings.length} found`)}
          </span>
        </div>

        {/* Sort Controls */}
        {!loading && !error && listings.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="default">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        )}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px',
        position: 'relative'
      }}>
        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '14px'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
              Searching MLS data...
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Querying Repliers API
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            padding: '30px 20px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            borderRadius: '10px',
            border: '1px solid #fecaca',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#991b1b', fontWeight: 700 }}>
              Failed to load properties
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#b91c1c' }}>
              {error}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  padding: '7px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retry Request
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && listings.length === 0 && (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px dashed #cbd5e1',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: 700 }}>
              No properties match your filters
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', maxWidth: '280px', marginInline: 'auto' }}>
              Try broadening your price range, reducing minimum bedrooms, or resetting your filters.
            </p>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Normal List View */}
        {!loading && !error && sortedListings.length > 0 && (
          sortedListings.map((listing) => {
            const id = listing.id || listing.mlsNumber;
            return (
              <PropertyCard
                key={id}
                listing={listing}
                isSelected={selectedId === id}
                onSelect={onSelectProperty}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

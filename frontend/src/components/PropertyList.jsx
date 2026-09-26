import PropertyCard from './PropertyCard.jsx';

export default function PropertyList({
  listings = [],
  selectedId,
  onSelectProperty,
  loading = false,
  error = null,
  onRetry,
  onResetFilters,
  onOpenTour,
  hasMore = false,
  loadingMore = false,
  loadMoreError = null,
  onLoadMore,
  totalCount = 0
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#111827', fontWeight: 600 }}>
          Available Properties
        </h3>
        <span style={{
          fontSize: '12px',
          color: loading ? '#2563eb' : (error ? '#dc2626' : '#6b7280'),
          fontWeight: 600,
          backgroundColor: '#f3f4f6',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>
          {loading ? 'Fetching...' : (error ? 'Error' : `${listings.length} found`)}
        </span>
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        position: 'relative'
      }}>
        {/* State 1: Loading State */}
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
              width: '36px',
              height: '36px',
              border: '3px solid #e5e7eb',
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
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1f2937', fontWeight: 600 }}>
              Searching listings...
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Retrieving live properties from Repliers API
            </p>
          </div>
        )}

        {/* State 2: Error State */}
        {!loading && error && (
          <div style={{
            padding: '30px 20px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#991b1b', fontWeight: 600 }}>
              Failed to load properties
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#b91c1c' }}>
              {error}
            </p>
            {onRetry && (
              <button
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

        {/* State 3: Empty Results State */}
        {!loading && !error && listings.length === 0 && (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px dashed #d1d5db',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1f2937', fontWeight: 600 }}>
              No properties match your filters
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6b7280', maxWidth: '280px', marginInline: 'auto' }}>
              Try broadening your price range, reducing minimum bedrooms, or clearing active filters.
            </p>
            {onResetFilters && (
              <button
                onClick={onResetFilters}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
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

        {/* State 4: Normal Results View */}
        {!loading && !error && listings.length > 0 && (
          <>
            {listings.map((listing) => {
              const id = listing.id || listing.mlsNumber;
              return (
                <PropertyCard
                  key={id}
                  listing={listing}
                  isSelected={selectedId === id}
                  onSelect={onSelectProperty}
                  onOpenTour={onOpenTour}
                />
              );
            })}

            {/* Pagination Controls */}
            <div style={{
              padding: '16px 8px 8px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              borderTop: '1px solid #e5e7eb',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {listings.length} properties shown
                {totalCount > 0 ? ` of ${totalCount}` : ''}
              </div>

              {hasMore ? (
                <>
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    style={{
                      width: '100%',
                      maxWidth: '320px',
                      padding: '10px 20px',
                      backgroundColor: loadingMore ? '#93c5fd' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingMore) e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingMore) e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <span style={{
                          display: 'inline-block',
                          width: '14px',
                          height: '14px',
                          border: '2px solid rgba(255,255,255,0.4)',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite'
                        }} />
                        <span>Loading more properties...</span>
                      </>
                    ) : (
                      <span>More Properties</span>
                    )}
                  </button>

                  {loadMoreError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#dc2626',
                      marginTop: '4px'
                    }}>
                      <span>Unable to load more properties. Please try again.</span>
                      <button
                        type="button"
                        onClick={onLoadMore}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: 0
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontStyle: 'italic',
                  padding: '6px 14px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  No more properties available for this search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

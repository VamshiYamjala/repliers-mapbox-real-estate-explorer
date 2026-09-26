import { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView.jsx';
import PropertyList from './components/PropertyList.jsx';
import FilterBar from './components/FilterBar.jsx';
import CitySelector from './components/CitySelector.jsx';
import VirtualTourModal from './components/VirtualTourModal.jsx';

/*
// MOCK DATA — TEMPORARY (retained for rollback reference)
const mockListings = [
  {
    mlsNumber: 'MOCK-101',
    listPrice: 425000,
    details: { numBedrooms: 3, numBathrooms: 2, propertyType: 'Residential', sqft: '1850' },
    address: { streetNumber: '7913', streetName: 'Eudora', streetSuffix: 'Ln', city: 'Austin', state: 'TX', zip: '78747' },
    map: { latitude: 30.158569, longitude: -97.74043 },
    images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60'],
    photoCount: 15
  },
  {
    mlsNumber: 'MOCK-102',
    listPrice: 589000,
    details: { numBedrooms: 4, numBathrooms: 3, propertyType: 'Residential', sqft: '2400' },
    address: { streetNumber: '1204', streetName: 'South Congress', streetSuffix: 'Ave', city: 'Austin', state: 'TX', zip: '78704' },
    map: { latitude: 30.252000, longitude: -97.749000 },
    images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format&fit=crop&q=60'],
    photoCount: 24
  },
  {
    mlsNumber: 'MOCK-103',
    listPrice: 320000,
    details: { numBedrooms: 2, numBathrooms: 2, propertyType: 'Residential Lease', sqft: '1150' },
    address: { streetNumber: '450', streetName: 'Barton Springs', streetSuffix: 'Rd', city: 'Austin', state: 'TX', zip: '78704' },
    map: { latitude: 30.260000, longitude: -97.755000 },
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60'],
    photoCount: 8
  }
];
*/

// Deterministic Media-Priority Ranking:
// Priority 3: Genuine 3D walkthrough (Modsy 3D, Matterport 3D)
// Priority 2: Valid video walkthrough (YouTube)
// Priority 1: Other valid virtual tour
// Priority 0: Normal property listing without special tour/video
export function getMediaPriority(listing) {
  if (!listing || !listing.media3d) return 0;
  if (listing.media3d.is3D || listing.media3d.type === '3d-walkthrough') return 3;
  if (listing.media3d.type === 'video-tour') return 2;
  if (listing.media3d.type === 'virtual-tour') return 1;
  return 0;
}

export function sortListingsByMediaPriority(list) {
  return [...list].sort((a, b) => {
    const priorityA = getMediaPriority(a);
    const priorityB = getMediaPriority(b);
    if (priorityB !== priorityA) {
      return priorityB - priorityA; // Higher priority first
    }
    return 0;
  });
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Austin');
  const [selectedId, setSelectedId] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    propertyType: ''
  });

  const [activeTourListing, setActiveTourListing] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Fetch real listings from backend Express proxy with active filters & race condition protection
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    setSelectedId(null);
    setActiveTourListing(null);

    // Reset pagination to page 1 on city or filter change
    setPage(1);
    setHasMore(true);
    setLoadingMore(false);

    const params = new URLSearchParams();
    if (selectedCity) params.append('city', selectedCity);
    params.append('pageNum', '1');
    params.append('resultsPerPage', '20');

    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms);
    if (filters.minBathrooms) params.append('minBaths', filters.minBathrooms); // confirmed Repliers param name
    if (filters.propertyType) params.append('propertyType', filters.propertyType);

    fetch(`${API_BASE_URL}/api/listings?${params.toString()}`, {
      signal: controller.signal
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const rawListings = data.listings || [];
        setListings(sortListingsByMediaPriority(rawListings));
        setPage(data.page || 1);
        setHasMore(data.hasMore ?? (data.page < data.numPages && rawListings.length > 0));
        setTotalCount(data.totalCount != null ? data.totalCount : rawListings.length);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return; // Ignore intentional cancellation
        console.error('Failed to fetch listings:', err);
        setError(err.message || 'Unable to connect to server');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedCity, filters, retryTrigger]);

  // Load next page of properties without replacing previously loaded items
  const handleLoadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;

    setLoadingMore(true);
    setLoadMoreError(null);

    const nextPage = page + 1;
    const params = new URLSearchParams();
    if (selectedCity) params.append('city', selectedCity);
    params.append('pageNum', String(nextPage));
    params.append('resultsPerPage', '20');

    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms);
    if (filters.minBathrooms) params.append('minBaths', filters.minBathrooms);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);

    fetch(`${API_BASE_URL}/api/listings?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const incoming = data.listings || [];
        setListings((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const newItems = incoming.filter((l) => !existingIds.has(l.id));
          return sortListingsByMediaPriority([...prev, ...newItems]);
        });
        setPage(data.page || nextPage);
        setHasMore(data.hasMore ?? (data.page < data.numPages && incoming.length > 0));
        if (data.totalCount != null) setTotalCount(data.totalCount);
      })
      .catch((err) => {
        console.error('Failed to load more properties:', err);
        setLoadMoreError(err.message || 'Unable to load more properties. Please try again.');
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, [loadingMore, loading, hasMore, page, selectedCity, filters]);

  const handleRetry = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  const handleResetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      minBathrooms: '',
      propertyType: ''
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="brand-title">
            <span>🏡</span> Repliers + Mapbox Explorer
          </h1>
          <p className="brand-subtitle">
            Interactive multi-market real estate explorer powered by Repliers API & Mapbox GL JS
          </p>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          Live Sandbox MLS Data
        </div>
      </header>

      {/* Top Controls: City Selection & Filter Controls */}
      <CitySelector
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        markets={['Austin', 'Orlando', 'Tampa', 'Dallas']}
      />

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Main Content Layout: Responsive Map and Property List */}
      <main className="main-grid">
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <MapView
            listings={listings}
            selectedId={selectedId}
            onSelectListing={setSelectedId}
            selectedCity={selectedCity}
          />
        </div>

        <div>
          <PropertyList
            listings={listings}
            selectedId={selectedId}
            onSelectProperty={setSelectedId}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            onResetFilters={handleResetFilters}
            onOpenTour={setActiveTourListing}
            hasMore={hasMore}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onLoadMore={handleLoadMore}
            totalCount={totalCount}
          />
        </div>
      </main>

      {/* Optional 3D / Virtual Tour Modal */}
      {activeTourListing && (
        <VirtualTourModal
          listing={activeTourListing}
          onClose={() => setActiveTourListing(null)}
        />
      )}
    </div>
  );
}

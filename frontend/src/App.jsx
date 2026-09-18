import { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView.jsx';
import PropertyList from './components/PropertyList.jsx';
import FilterBar from './components/FilterBar.jsx';
import CitySelector from './components/CitySelector.jsx';

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

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Austin');
  const [selectedId, setSelectedId] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    propertyType: ''
  });

  // Fetch real listings from backend Express proxy with active filters
  const fetchListingsData = useCallback(() => {
    setLoading(true);
    setError(null);
    setSelectedId(null);

    const params = new URLSearchParams();
    if (selectedCity) params.append('city', selectedCity);
    params.append('resultsPerPage', '20');

    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms);
    if (filters.minBathrooms) params.append('minBaths', filters.minBathrooms); // confirmed Repliers param name
    if (filters.propertyType) params.append('propertyType', filters.propertyType);

    fetch(`http://localhost:5000/api/listings?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setListings(data.listings || []);
      })
      .catch((err) => {
        console.error('Failed to fetch listings:', err);
        setError(err.message || 'Unable to connect to server');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedCity, filters]);

  useEffect(() => {
    fetchListingsData();
  }, [fetchListingsData]);

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
          />
        </div>

        <div>
          <PropertyList
            listings={listings}
            selectedId={selectedId}
            onSelectProperty={setSelectedId}
            loading={loading}
            error={error}
            onRetry={fetchListingsData}
            onResetFilters={handleResetFilters}
          />
        </div>
      </main>
    </div>
  );
}

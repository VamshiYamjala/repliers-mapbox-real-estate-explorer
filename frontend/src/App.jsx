import { useState, useEffect } from 'react';
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

  // Fetch real listings from backend Express proxy
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:5000/api/listings?city=Austin')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setListings(data.listings || []);
      })
      .catch((err) => {
        console.error('Failed to fetch listings:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
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
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '24px 20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111827',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', color: '#1e3a8a' }}>
          Repliers + Mapbox Real Estate Explorer
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Discover properties across top US markets with interactive map exploration.
        </p>
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

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          ⚠️ Could not connect to backend server ({error}). Ensure the Express server is running on port 5000.
        </div>
      )}

      {/* Main Content Layout: Map and Property List side-by-side */}
      <main style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 1fr) 420px',
        gap: '20px',
        alignItems: 'start'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <MapView listings={listings} />
        </div>

        <div>
          <PropertyList
            listings={listings}
            selectedId={selectedId}
            onSelectProperty={setSelectedId}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}

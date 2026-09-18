import MapView from './components/MapView.jsx';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ margin: '0 0 16px 0' }}>Repliers + Mapbox Real Estate Explorer</h1>
      <MapView />
    </div>
  );
}

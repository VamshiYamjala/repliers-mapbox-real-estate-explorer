export default function CitySelector({ selectedCity, onSelectCity, markets = ['Austin', 'Orlando', 'Tampa', 'Dallas'] }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '14px'
    }}>
      <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
        Select Market:
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {markets.map((city) => {
          const isActive = selectedCity === city;
          return (
            <button
              key={city}
              onClick={() => onSelectCity && onSelectCity(city)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                border: isActive ? '1px solid #2563eb' : '1px solid #d1d5db',
                backgroundColor: isActive ? '#2563eb' : '#ffffff',
                color: isActive ? '#ffffff' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
}

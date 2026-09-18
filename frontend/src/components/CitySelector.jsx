export default function CitySelector({ selectedCity, onSelectCity }) {
  const markets = ['Austin', 'Orlando', 'Tampa', 'Dallas'];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '14px',
      flexWrap: 'wrap'
    }}>
      <label htmlFor="city-select" style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
        Select Market:
      </label>

      {/* Controlled Select Dropdown */}
      <select
        id="city-select"
        value={selectedCity}
        onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          fontSize: '14px',
          fontWeight: 600,
          backgroundColor: '#ffffff',
          color: '#1f2937',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        {markets.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* Quick Select Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {markets.map((city) => {
          const isActive = selectedCity === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => onSelectCity && onSelectCity(city)}
              style={{
                padding: '7px 14px',
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

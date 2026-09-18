export default function CitySelector({ selectedCity, onSelectCity }) {
  const markets = [
    { name: 'Austin', state: 'TX', icon: '🤠' },
    { name: 'Orlando', state: 'FL', icon: '🌴' },
    { name: 'Tampa', state: 'FL', icon: '☀️' },
    { name: 'Dallas', state: 'TX', icon: '⭐' }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '14px',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '16px' }}>📍</span>
        <label htmlFor="city-select" style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Market:
        </label>
      </div>

      {/* Segmented Market Buttons */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        backgroundColor: '#f1f5f9',
        padding: '3px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        {markets.map((m) => {
          const isActive = selectedCity === m.name;
          return (
            <button
              key={m.name}
              type="button"
              onClick={() => onSelectCity && onSelectCity(m.name)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#1e3a8a' : '#64748b',
                boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
              <span style={{ fontSize: '11px', opacity: isActive ? 0.7 : 0.5 }}>{m.state}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

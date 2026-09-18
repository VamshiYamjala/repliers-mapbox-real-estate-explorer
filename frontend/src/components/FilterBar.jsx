export default function FilterBar({ filters, onFilterChange, onReset }) {
  const handleChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const activeCount = Object.values(filters || {}).filter(Boolean).length;

  const inputStyle = {
    padding: '7px 11px',
    borderRadius: '7px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    fontWeight: 500,
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    transition: 'border-color 0.15s, box-shadow 0.15s'
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Price Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span>💲</span> Price:
        </label>
        <input
          type="number"
          placeholder="Min $"
          value={filters?.minPrice || ''}
          onChange={(e) => handleChange('minPrice', e.target.value)}
          style={{ ...inputStyle, width: '100px' }}
        />
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>–</span>
        <input
          type="number"
          placeholder="Max $"
          value={filters?.maxPrice || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          style={{ ...inputStyle, width: '100px' }}
        />
      </div>

      {/* Bedrooms Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span>🛏️</span> Beds:
        </label>
        <select
          value={filters?.minBedrooms || ''}
          onChange={(e) => handleChange('minBedrooms', e.target.value)}
          style={inputStyle}
        >
          <option value="">Any Beds</option>
          <option value="1">1+ Beds</option>
          <option value="2">2+ Beds</option>
          <option value="3">3+ Beds</option>
          <option value="4">4+ Beds</option>
        </select>
      </div>

      {/* Bathrooms Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span>🛁</span> Baths:
        </label>
        <select
          value={filters?.minBathrooms || ''}
          onChange={(e) => handleChange('minBathrooms', e.target.value)}
          style={inputStyle}
        >
          <option value="">Any Baths</option>
          <option value="1">1+ Baths</option>
          <option value="2">2+ Baths</option>
          <option value="3">3+ Baths</option>
        </select>
      </div>

      {/* Property Type Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span>🏷️</span> Type:
        </label>
        <select
          value={filters?.propertyType || ''}
          onChange={(e) => handleChange('propertyType', e.target.value)}
          style={inputStyle}
        >
          <option value="">All Property Types</option>
          <option value="Residential">Residential</option>
          <option value="Residential Lease">Residential Lease</option>
          <option value="Residential Income">Residential Income</option>
        </select>
      </div>

      {/* Right Controls: Active Pill & Reset Button */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {activeCount > 0 && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '4px 8px',
            borderRadius: '12px'
          }}>
            {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active
          </span>
        )}

        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          style={{
            padding: '7px 14px',
            backgroundColor: activeCount > 0 ? '#f1f5f9' : '#f8fafc',
            color: activeCount > 0 ? '#1e293b' : '#94a3b8',
            border: '1px solid #cbd5e1',
            borderRadius: '7px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: activeCount > 0 ? 'pointer' : 'default',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (activeCount > 0) e.target.style.backgroundColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            if (activeCount > 0) e.target.style.backgroundColor = '#f1f5f9';
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

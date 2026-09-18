export default function FilterBar({ filters, onFilterChange, onReset }) {
  const handleChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#1f2937'
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      padding: '14px 16px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Price:</label>
        <input
          type="number"
          placeholder="Min $"
          value={filters?.minPrice || ''}
          onChange={(e) => handleChange('minPrice', e.target.value)}
          style={{ ...inputStyle, width: '105px' }}
        />
        <span style={{ color: '#9ca3af' }}>-</span>
        <input
          type="number"
          placeholder="Max $"
          value={filters?.maxPrice || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          style={{ ...inputStyle, width: '105px' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Beds:</label>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Baths:</label>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Type:</label>
        <select
          value={filters?.propertyType || ''}
          onChange={(e) => handleChange('propertyType', e.target.value)}
          style={inputStyle}
        >
          <option value="">All Types</option>
          <option value="Residential">Residential</option>
          <option value="Residential Lease">Residential Lease</option>
          <option value="Residential Income">Residential Income</option>
        </select>
      </div>

      <button
        onClick={onReset}
        style={{
          padding: '8px 14px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          marginLeft: 'auto',
          transition: 'background-color 0.15s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
      >
        Reset Filters
      </button>
    </div>
  );
}

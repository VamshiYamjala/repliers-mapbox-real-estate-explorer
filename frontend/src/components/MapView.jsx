import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({ listings = [], selectedId, onSelectListing }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerMapRef = useRef(new Map());

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-97.7431, 30.2672], // Austin, TX
      zoom: 11,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    mapRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markerMapRef.current.forEach(({ marker }) => marker.remove());
    markerMapRef.current.clear();

    if (!listings || listings.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    listings.forEach((listing) => {
      if (listing.lat == null || listing.lng == null) return;
      const id = listing.id || listing.mlsNumber;

      // Note: Mapbox expects [lng, lat] order
      const lngLat = [listing.lng, listing.lat];

      const priceDisplay = typeof listing.price === 'number'
        ? `$${listing.price.toLocaleString()}`
        : (listing.price || 'N/A');

      const imageUrl = listing.image
        || (listing.images && listing.images.length > 0
          ? (listing.images[0].startsWith('http') ? listing.images[0] : `https://cdn.repliers.io/${listing.images[0]}`)
          : null);

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 220px;">
          ${imageUrl ? `<img src="${imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" alt="${listing.address || ''}" />` : ''}
          <div style="font-weight: 800; font-size: 16px; color: #1e3a8a; margin-bottom: 2px;">
            ${priceDisplay}
          </div>
          <div style="font-size: 12px; font-weight: 500; color: #334155; line-height: 1.3;">
            ${listing.address || ''}${listing.city ? `, ${listing.city}` : ''}
          </div>
          <div style="display: flex; gap: 8px; font-size: 11px; font-weight: 600; color: #64748b; margin-top: 6px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            ${listing.bedrooms ? `<span>🛏️ ${listing.bedrooms} bds</span>` : ''}
            ${listing.bathrooms ? `<span>🛁 ${listing.bathrooms} ba</span>` : ''}
            ${listing.propertyType ? `<span style="margin-left: auto; color: #2563eb;">${listing.propertyType}</span>` : ''}
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '240px' }).setHTML(popupHtml);

      const isSelected = selectedId === id;
      const marker = new mapboxgl.Marker({
        color: isSelected ? '#ef4444' : '#2563eb'
      })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      // On marker click: update single source of truth in App.jsx
      marker.getElement().addEventListener('click', () => {
        if (onSelectListing) {
          onSelectListing(id);
        }
      });

      markerMapRef.current.set(id, { marker, popup, lngLat });
      bounds.extend(lngLat);
      hasValidCoords = true;
    });

    if (hasValidCoords && !selectedId) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 800 });
    }
  }, [listings, onSelectListing]);

  // Handle flyTo and popup opening when selectedId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const item = markerMapRef.current.get(selectedId);
    if (!item) return;

    // Open the popup for the selected marker
    if (!item.popup.isOpen()) {
      item.popup.addTo(map);
    }

    // Smoothly fly to the marker location
    map.flyTo({
      center: item.lngLat,
      zoom: 15,
      speed: 1.2,
      curve: 1.42,
      essential: true
    });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '450px',
        position: 'relative'
      }}
    />
  );
}

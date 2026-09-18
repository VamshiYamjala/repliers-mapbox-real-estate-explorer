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

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    return () => {
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

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true }).setHTML(`
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="font-weight: 700; font-size: 15px; color: #111827; margin-bottom: 2px;">
            $${typeof listing.price === 'number' ? listing.price.toLocaleString() : (listing.price || 'N/A')}
          </div>
          <div style="font-size: 12px; color: #4b5563;">
            ${listing.address || ''}${listing.city ? `, ${listing.city}` : ''}
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            ${listing.bedrooms ? `${listing.bedrooms} beds • ` : ''}${listing.bathrooms ? `${listing.bathrooms} baths` : ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({
        color: selectedId === id ? '#ef4444' : '#2563eb'
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
      map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 1000 });
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

  return <div ref={containerRef} style={{ width: '100%', height: '600px', borderRadius: '10px' }} />;
}

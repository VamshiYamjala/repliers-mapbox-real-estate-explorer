import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({ listings = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-97.7431, 30.2672], // Austin, TX (primary market)
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
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!listings || listings.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    listings.forEach((listing) => {
      if (listing.lat == null || listing.lng == null) return;

      // Mapbox expects [lng, lat] — reversed from Repliers' map.latitude/map.longitude naming
      const lngLat = [listing.lng, listing.lat];

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
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

      const marker = new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend(lngLat);
      hasValidCoords = true;
    });

    // Auto-fit map bounds to encompass the listings
    if (hasValidCoords) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 1000 });
    }
  }, [listings]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px', borderRadius: '10px' }} />;
}

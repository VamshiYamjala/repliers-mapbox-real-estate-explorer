import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView() {
  const containerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-80.1918, 25.7617], // Miami as a placeholder starting point
      zoom: 10,
    });

    return () => map.remove();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />;
}

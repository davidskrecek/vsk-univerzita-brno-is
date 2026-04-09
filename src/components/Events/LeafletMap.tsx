"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

// Component to handle map centering when coordinates change
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
}

interface LeafletMapProps {
  location: string;
}

const LeafletMap = ({ location }: LeafletMapProps) => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fixLeafletIcon();
    let isMounted = true;

    const fetchCoords = async () => {
      setLoading(true);
      try {
        // Use Nominatim (OpenStreetMap) for free geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();
        
        if (isMounted && data && data.length > 0) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else if (isMounted) {
          // Fallback to Brno if not found
          setCoords([49.1951, 16.6068]);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        if (isMounted) setCoords([49.1951, 16.6068]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCoords();

    return () => {
      isMounted = false;
    };
  }, [location]);

  if (loading || !coords) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={coords} 
        zoom={15} 
        scrollWheelZoom={false}
        dragging={false} // Disable map movement
        doubleClickZoom={false} // Disable double click zoom
        touchZoom={false} // Disable touch zoom
        boxZoom={false} // Disable box zoom
        keyboard={false} // Disable keyboard interaction
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false} // This removes the contribution text
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={coords} />
        <RecenterMap position={coords} />
      </MapContainer>
      
      <style jsx global>{`
        .leaflet-container {
          background: #1a1a1a !important;
        }
        .leaflet-tile-pane {
          filter: contrast(1.1) brightness(0.8);
        }
      `}</style>
    </div>
  );
};

export default LeafletMap;

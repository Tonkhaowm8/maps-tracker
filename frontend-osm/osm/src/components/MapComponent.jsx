// src/MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';

// Default marker icon fix for React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const defaultPosition = [35.6895, 139.6917]; // Default position (Tokyo)
  const [userPosition, setUserPosition] = useState(null); // State for user location

  // Define stress zones as an array of objects with latitude, longitude, and radius
  // Waseda location 35.69755888453857, 139.72284916456653
  const stressZones = [
    { lat: 35.698112, lng: 139.722671, radius: 20 }, // Example zone in Tokyo
    { lat: 35.697512, lng: 139.722114, radius: 20 }, // Another zone (Ginza area)
    // Add more stress zones as needed
  ];

  // Get the user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]); // Set user's position
          console.log(`User's location: Latitude ${latitude}, Longitude ${longitude}`);
        },
        (error) => {
          console.error('Error fetching user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <MapContainer center={userPosition || defaultPosition} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Display user's current position */}
      {userPosition && (
        <Marker position={userPosition}>
          <Popup>
            You are here! <br />
            Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
          </Popup>
        </Marker>
      )}

      {/* Fallback marker for default position (Tokyo) */}
      {!userPosition && (
        <Marker position={defaultPosition}>
          <Popup>
            This is Tokyo! <br /> Unable to fetch your current location.
          </Popup>
        </Marker>
      )}

      {/* Render stress zones as red transparent circles */}
      {stressZones.map((zone, index) => (
        <Circle
          key={index}
          center={[zone.lat, zone.lng]}
          radius={zone.radius} // in meters
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} // Red transparent circle
        >
          <Popup>
            Stress Zone: <br />
            Latitude: {zone.lat}, Longitude: {zone.lng}
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default MapComponent;

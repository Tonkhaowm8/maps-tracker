import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'; // Import useMap from react-leaflet
import L from 'leaflet'; // Import Leaflet for map functionality
import './MapComponent.css';

// Default marker icon fix for React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const defaultPosition = [35.6895, 139.6917]; // Default position (Tokyo) if user's location is not available
  const [userPosition, setUserPosition] = useState(null); // State for storing the user's current location

  // Define an array of stress zones with latitude, longitude, and radius.
  const stressZones = [
    { lat: 35.698112, lng: 139.722671, radius: 20 },
    { lat: 35.697512, lng: 139.722114, radius: 20 },
  ];

  // Custom component to adjust map view to user's location
  const SetViewToUserPosition = ({ userPosition }) => {
    const map = useMap(); // Get access to the map instance

    // When userPosition is updated, set the map view to user's position with a specific zoom level
    useEffect(() => {
      if (userPosition) {
        map.setView(userPosition, 25); // Adjust zoom level (16 is a closer zoom level)
      }
    }, [userPosition, map]);

    return null; // This component does not render anything
  };

  // useEffect hook to get the user's current location using the browser's geolocation API.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]); // Update userPosition state
          console.log(`User's location: Latitude ${latitude}, Longitude ${longitude}`);
        },
        (error) => {
          console.error('Error fetching user location:', error); // Handle errors (e.g., permission denied)
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    // MapContainer is the main map component provided by React-Leaflet.
    // It takes a center (default or user position) and zoom level, along with style to fill the page.
    <MapContainer center={userPosition || defaultPosition} zoom={30} style={{ height: '100vh', width: '100%' }}>
      {/* TileLayer is used to load and display map tiles from OpenStreetMap. */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Component to programmatically adjust map view to user's position */}
      {userPosition && <SetViewToUserPosition userPosition={userPosition} />}

      {/* If user's location is available, place a marker at that location. */}
      {userPosition && (
        <Marker position={userPosition}>
          <Popup>
            You are here! <br />
            Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
          </Popup>
        </Marker>
      )}

      {/* If user's location is not available, fallback to a marker at the default position (Tokyo). */}
      {!userPosition && (
        <Marker position={defaultPosition}>
          <Popup>
            This is Tokyo! <br /> Unable to fetch your current location.
          </Popup>
        </Marker>
      )}

      {/* Render each stress zone as a red transparent circle on the map. */}
      {stressZones.map((zone, index) => (
        <Circle
          key={index} // Unique key for each circle
          center={[zone.lat, zone.lng]} // Set the center of the circle
          radius={zone.radius} // Set the radius of the circle (in meters)
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} // Red transparent circle styling
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

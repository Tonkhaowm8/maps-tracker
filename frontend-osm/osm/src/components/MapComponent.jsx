import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';
import googleMapArrow from './svg/googleMapArrow.svg'; // Adjust the path as necessary
import axios from 'axios';

const googleMapsArrowIcon = new L.Icon({
  iconUrl: googleMapArrow, // Use the imported image file
  iconSize: [30, 30], // Size of the icon
  iconAnchor: [21, 21], // Center the icon
  className: 'arrow-icon', // Optional: add a class name if needed for additional styling
});

// Default marker icon fix for React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const defaultPosition = [35.6895, 139.6917]; // Default position (Tokyo)
  const backendEndpoint = "https://172.31.43.34:4000"; // Backend URL (CHANGE everytime you launch backend)
  const [userPosition, setUserPosition] = useState(null); // State for storing the user's current location
  const [heading, setHeading] = useState(0); // State for storing heading (direction)
  const [backendData, setBackendData] = useState(null);

  // Define stress zones with latitude, longitude, and radius.
  const stressZones = [
    { lat: 35.703111, lng: 139.720416, radius: 20 },
    { lat: 35.702621, lng: 139.71998, radius: 20 },
  ];

  // Function to calculate bearing (direction) between two coordinates
  const calculateBearing = (startLat, startLng, endLat, endLng) => {
    const startLatRad = (startLat * Math.PI) / 180;
    const startLngRad = (startLng * Math.PI) / 180;
    const endLatRad = (endLat * Math.PI) / 180;
    const endLngRad = (endLng * Math.PI) / 180;

    const dLng = endLngRad - startLngRad;
    const y = Math.sin(dLng) * Math.cos(endLatRad);
    const x = Math.cos(startLatRad) * Math.sin(endLatRad) - Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;

    return (bearing + 360) % 360; // Ensure the result is between 0 and 360
  };

  // Custom component to adjust map view to user's location
  const SetViewToUserPosition = ({ userPosition }) => {
    const map = useMap(); // Get access to the map instance

    // When userPosition is updated, set the map view to user's position while maintaining the current zoom level
    useEffect(() => {
      if (userPosition) {
        map.setView(userPosition, map.getZoom()); // Keep the current zoom level
      }
    }, [userPosition, map]);

    return null; // This component does not render anything
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendEndpoint}/get-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add other headers if necessary (e.g., Authorization)
          }
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
  
        const result = await response.json();
        setBackendData(result); // Store the fetched data in the state
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle the error as needed
      }
    };
  
    if (backendData === null) {
      fetchData(); // Call the fetch function only if backendData is null
    }
  }, [backendData]); // Add backendData as a dependency

  // useEffect hook to get the user's location and update position and heading using `watchPosition`
  useEffect(() => {
    let previousPosition = null;

    console.log(`Backend Data: ${backendData}`);

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];

          // If there's a previous position, calculate the heading (bearing)
          if (previousPosition) {
            const [prevLat, prevLng] = previousPosition;
            const bearing = calculateBearing(prevLat, prevLng, latitude, longitude);
            setHeading(bearing); // Update heading (direction)
          }

          // Log to console and update state
          console.log(`New Position: Latitude ${latitude}, Longitude ${longitude}`);

          setUserPosition(newPosition); // Update user's position
          previousPosition = newPosition; // Store the new position as previous for the next update
        },
        (error) => {
          console.error('Error fetching user location:', error);
        },
        { 
          enableHighAccuracy: true, // Ensure you get GPS data (more accurate)
          maximumAge: 10000,        // Cache the location for 10 seconds
          timeout: 5000             // Timeout after 5 seconds if no position is found
        }
      );

      return () => navigator.geolocation.clearWatch(watchId); // Cleanup on unmount
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div>
      <MapContainer center={userPosition || defaultPosition} zoom={16} style={{ height: '100vh', width: '100%' }}> {/* Set zoom to 16 */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userPosition && <SetViewToUserPosition userPosition={userPosition} />}

        {/* Render user's position as an arrow icon */}
        {userPosition && (
          <Marker 
            position={userPosition} 
            icon={googleMapsArrowIcon} 
            rotationAngle={heading} // Use the heading to rotate the icon
            rotationOrigin="center" // Rotate around the center of the icon
          >
            <Popup>
              You are here! <br />
              Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
            </Popup>
          </Marker>
        )}

        {/* Fallback marker for default position */}
        {!userPosition && (
          <Marker position={defaultPosition}>
            <Popup>
              This is Tokyo! <br /> Unable to fetch your current location.
            </Popup>
          </Marker>
        )}

        {/* Render each stress zone as a red transparent circle */}
        {stressZones.map((zone, index) => (
          <Circle
            key={index}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
          >
            <Popup>
              Stress Zone: <br />
              Latitude: {zone.lat}, Longitude: {zone.lng}
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Display the current latitude and longitude */}
      {userPosition ? (
        <div className="location-info">
          <p>Current Latitude: {userPosition[0]}</p>
          <p>Current Longitude: {userPosition[1]}</p>
        </div>
      ) : (
        <p>Fetching your location...</p>
      )}
    </div>
  );
};

export default MapComponent;

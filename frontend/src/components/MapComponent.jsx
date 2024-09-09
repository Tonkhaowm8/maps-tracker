import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Circle, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting position: ", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirectionsResponse(response);
    } else {
      console.error('Directions request failed', response);
    }
  };

  return (
    <div className="w-screen h-screen">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || { lat: -3.745, lng: -38.523 }}
          zoom={currentPosition ? 15 : 10}
        >
          {currentPosition && (
            <Circle
              center={currentPosition}
              radius={20} // Adjust the radius for the size of the dot
              options={{
                strokeColor: '#ff0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#ff0000',
                fillOpacity: 1,
              }}
            />
          )}

          {/* Requesting directions from currentPosition to a destination */}
          {currentPosition && (
            <DirectionsService
              options={{
                destination: { lat: 35.6895, lng: 139.6917 },
                origin: {lat: 35.66082, lng: 139.79576}, // Your current position
                travelMode: 'WALKING', // Adjust to SCOOTER or similar if available
              }}
              callback={directionsCallback}
            />
          )}

          {/* Rendering the directions on the map */}
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                polylineOptions: {
                  strokeColor: '#007bff',
                  strokeWeight: 4,
                },
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
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

  // Clear directions when currentPosition updates to avoid showing old routes
  useEffect(() => {
    setDirectionsResponse(null);
    console.log(currentPosition)
    console.log("hi")
  }, [currentPosition]);
 
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
              radius={20}
              options={{
                strokeColor: '#ff0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#ff0000',
                fillOpacity: 1,
              }}
            />
          )}
          {/* Requesting directions from currentPosition to the 7-Eleven */}
          {currentPosition && (
            <DirectionsService
              options={{
                destination: { lat: 35.654732718490315, lng: 139.79708285715478 }, // 7-Eleven location
                origin: currentPosition, // Your current position
                travelMode: 'WALKING',
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

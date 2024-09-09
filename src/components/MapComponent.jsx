import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Circle } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);

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
              radius={10} // Adjust the radius for the size of the dot
              options={{
                strokeColor: '#007bff',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#007bff',
                fillOpacity: 1,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;

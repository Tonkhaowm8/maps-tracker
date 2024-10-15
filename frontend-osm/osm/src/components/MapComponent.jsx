import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';
import googleMapArrow from './svg/googleMapArrow.svg'; // Import the custom arrow icon for user position

// Create a custom icon for the user's position, resembling the Google Maps arrow
const googleMapsArrowIcon = new L.Icon({
  iconUrl: googleMapArrow,
  iconSize: [30, 30],
  iconAnchor: [21, 21],
  className: 'arrow-icon',
});

// Fix for default marker icon in React-Leaflet by deleting the default icon path getter
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapComponent = () => {
  const defaultPosition = [35.6895, 139.6917]; // Default location (Tokyo)
  const backendEndpoint = "https://cc70-122-222-0-252.ngrok-free.app"; // Backend endpoint for fetching additional data
  const [userPosition, setUserPosition] = useState(null); // Store user's current location
  const [heading, setHeading] = useState(0); // Store the heading (user's direction)
  const [backendData, setBackendData] = useState([]); // State for holding data fetched from the backend

  // Dummy stress zones (with blue color)
  const dummyStressZones = [
    { lat: 35.703765, lng: 139.719079, radius: 10 },
    { lat: 35.704419, lng: 139.719120, radius: 10 },
  ];

  // Custom component to adjust the map view based on the user's location
  const SetViewToUserPosition = ({ userPosition }) => {
    const map = useMap(); // Get access to the map instance

    // Adjust the map's view whenever the user's position is updated
    useEffect(() => {
      if (userPosition) {
        map.setView(userPosition, map.getZoom()); // Keep the current zoom level when centering the map
      }
    }, [userPosition, map]);

    return null; // This component does not render any UI elements
  };

  // Fetch data from the backend endpoint (only when backendData is null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendEndpoint}/get-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': '69420'
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json(); // Parse JSON response
        console.log("result: ", result);
        setBackendData(result); // Store the fetched data in state
      } catch (error) {
        console.error('Error fetching data:', error); // Log any errors during the fetch process
      }
    };

    // Call the fetch function if backendData hasn't been loaded yet
    if (backendData.length === 0) {
      fetchData();
    }
  }, [backendData]); // The effect runs when backendData changes

  // Use the browser's geolocation API to get the user's current location and heading
  useEffect(() => {
    let previousPosition = null; // Store the last known position for heading calculation

    console.log(`Backend Data: ${backendData}`);

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];

          // Log new position and update the user's position in state
          console.log(`New Position: Latitude ${latitude}, Longitude ${longitude}`);
          setUserPosition(newPosition); // Update user position
          previousPosition = newPosition; // Store the new position as the previous one
        },
        (error) => {
          console.error('Error fetching user location:', error); // Handle any geolocation errors
        },
        { 
          enableHighAccuracy: true, // Request high-accuracy location data
          maximumAge: 10000,        // Cache the location data for 10 seconds
          timeout: 5000             // Timeout if no location data is available after 5 seconds
        }
      );

      // Cleanup the geolocation watcher when the component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error('Geolocation is not supported by this browser.'); // Error handling for unsupported browsers
    }
  }, []); // This effect only runs once when the component is mounted

  return (
    <div>
      {/* MapContainer with default or user position */}
      <MapContainer center={userPosition || defaultPosition} zoom={16} style={{ height: '100vh', width: '100%' }}> {/* Set default zoom level */}
        {/* OpenStreetMap TileLayer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userPosition && <SetViewToUserPosition userPosition={userPosition} />} {/* Adjust view to user's location */}

        {/* Render user's position as a custom arrow icon */}
        {userPosition && (
          <Marker 
            position={userPosition} 
            icon={googleMapsArrowIcon} 
            rotationAngle={heading} // Rotate the icon based on heading
            rotationOrigin="center" // Rotate around the center of the icon
          >
            <Popup>
              You are here! <br />
              Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
            </Popup>
          </Marker>
        )}

        {/* Fallback marker for the default position if the user's location is not available */}
        {!userPosition && (
          <Marker position={defaultPosition}>
            <Popup>
              This is Tokyo! <br /> Unable to fetch your current location.
            </Popup>
          </Marker>
        )}

        {/* Render each real stress zone from backendData (in red) */}
        {backendData.map((zone, index) => (
          <Circle
            key={index}
            center={[zone.latitude, zone.longitude]} // Use latitude and longitude from backend data
            radius={10} // Define a default radius (you can adjust this as needed)
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} // Set circle styling
          >
            <Popup>
              Stress Zone: <br />
              Latitude: {zone.latitude}, Longitude: {zone.longitude}
            </Popup>
          </Circle>
        ))}

        {/* Render each dummy stress zone (in blue) */}
        {dummyStressZones.map((zone, index) => (
          <Circle
            key={index}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.3 }} // Blue for dummy zones
          >
            <Popup>
              Dummy Stress Zone <br />
              Latitude: {zone.lat}, Longitude: {zone.lng}
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Display the user's current latitude and longitude */}
      {userPosition ? (
        <div className="location-info">
          <p>Current Latitude: {userPosition[0]}</p>
          <p>Current Longitude: {userPosition[1]}</p>
        </div>
      ) : (
        <p>Fetching your location...</p> // Message displayed while the location is being fetched
      )}
    </div>
  );
};

export default MapComponent;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';
import googleMapArrow from './svg/googleMapArrow.svg'; // Import the custom arrow icon for user position
// import soundAudio from './audio/yamate-kudasai.mp3';
import soundAudio from './audio/anta-baka.mp3';
// import soundAudio from './audio/family-mart.mp3';
import { fetchLilUncomfortableData, fetchUncomfortableData, fetchExUncomfortableData } from './api';


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
  const backendEndpoint = "/api"; // Backend endpoint for fetching additional data
  const [littleUncomfortableData, setLittleUncomfortableData] = useState([]);
  const [uncomfortableData, setUncomfortableData] = useState([]);
  const [extremelyUncomfortableData, setExtremelyUncomfortableData] = useState([]);

  const [userPosition, setUserPosition] = useState(null); // Store user's current location
  const [backendData] = useState([]); // State for holding data fetched from the backend
  const [soundEnabled, setSoundEnabled] = useState(false); // Flag to check if sound can be played
  const [lastAlertedZones, setLastAlertedZones] = useState({}); // Track last alerted zones
  const [alertActive, setAlertActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Dummy stress zones (with blue color)
  const dummyStressZones = [
    { dumlat: 35.703765, dumlng: 139.719079, radius: 10 },
    { dumlat: 35.704419, dumlng: 139.719120, radius: 10 },
    { dumlat: 13.86435311161947, dumlng: 100.66858680626, radius: 10 },
    { dumlat: 35.660877, dumlng: 139.795827, radius: 10 },
    { dumlat: 35.70343974666288, dumlng: 139.71935010586505, radius: 10 },
  ];

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const littleUncomfortable = await fetchLilUncomfortableData(backendEndpoint);
      const uncomfortable = await fetchUncomfortableData(backendEndpoint);
      const extremelyUncomfortable = await fetchExUncomfortableData(backendEndpoint);
      
      setLittleUncomfortableData(littleUncomfortable);
      setUncomfortableData(uncomfortable);
      setExtremelyUncomfortableData(extremelyUncomfortable);

      
    };

    fetchData();
  }, [backendEndpoint]);

  // useEffect(() => {
  //   console.log("Little", littleUncomfortableData)
  //   console.log("Uncom", uncomfortableData)
  //   console.log("Ex", extremelyUncomfortableData)
  // })
  
  // Load alert sound
  const alertSound = new Audio(soundAudio); // Load the audio file
  alertSound.preload = 'auto'; // Preload the audio file

  const playAlertSound = async() => {
    return new Promise((resolve) => {
      if (soundEnabled && !alertActive) {
        alertSound.currentTime = 0; // Reset sound to start
        alertSound.play().then(() => {
          alertSound.onended = () => {
            setAlertActive(false); // Reset alert active state when sound ends
            resolve(); // Resolve when sound ends
          };
        }).catch((error) => {
          console.error("Audio playback failed:", error);
          resolve(); // Resolve anyway on error to avoid breaking the flow
        });
        setAlertActive(true); // Mark alert as active
      } else {
        resolve(); // If sound is disabled or alert is active, resolve immediately
      }
    });
  };
  
  // Call this function only when a user interacts with the button
  const handleUserAction = () => {
    // Toggle sound state
    setSoundEnabled(prev => {
      const newState = !prev; // Toggle the sound state
      if (newState) {
        playAlertSound(); // Play sound if enabling
      }
      return newState; // Return the new state
    });
  };

  // Custom Control for the Map
  const CustomControl = () => {
    const map = useMap();

    useEffect(() => {
      const control = L.control({ position: 'topright' });

      control.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.padding = '5px';
        div.style.cursor = 'pointer';
        div.innerHTML = soundEnabled ? '🔇 Mute' : '🔊 Unmute';
        div.onclick = handleUserAction;
        return div;
      };

      control.addTo(map);

      return () => {
        map.removeControl(control); // Clean up when component unmounts
      };
    }, [map, soundEnabled]);

    return null;
  };


  // Use the browser's geolocation API to get the user's current location and heading
  useEffect(() => {
    console.log(`Backend Data: ${backendData}`);

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];

          // Log new position and update the user's position in state
          console.log(`New Position: Latitude ${latitude}, Longitude ${longitude}`);
          setUserPosition(newPosition); // Update user position
        },
        (error) => {
          console.error('Error fetching user location:', error); // Handle any geolocation errors
        },
        { 
          enableHighAccuracy: true, // Request high-accuracy location data
          maximumAge: 10000,        // Cache the location data for 10 seconds
          timeout: 50000             // Timeout if no location data is available after 5 seconds
        }
      );
      // Cleanup the geolocation watcher when the component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error('Geolocation is not supported by this browser.'); // Error handling for unsupported browsers
    }
  }, []); // This effect only runs once when the component is mounted

  // The Haversine formula is used to calculate the shortest distance between two points on a sphere
  // Function to calculate distance between two coordinates using Haversine formula
  const getDistance = (pos1, pos2) => {
    const R = 6371e3; // Radius of the Earth in meters
    const lat1 = pos1[0] * Math.PI / 180;   //convert degrees to radians
    const lat2 = pos2[0] * Math.PI / 180;
    const deltaLat = (pos2[0] - pos1[0]) * Math.PI / 180; // Difference of lat and lon be between 2 points
    const deltaLng = (pos2[1] - pos1[1]) * Math.PI / 180;

    // Haversine formula
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // a: It computes a value based on the sine of half the latitude and longitude differences and the cosine of both latitudes.
    // c: This value represents the angular distance in radians between the two points.
    return R * c; // Distance in meters
  };

  // Custom component to adjust the map view based on the user's location
  const SetViewToUserPosition = ({ userPosition }) => {
    const map = useMap(); // Get access to the map instance

    // Adjust the map's view whenever the user's position is updated
    useEffect(() => {
      if (userPosition) {
        map.setView(userPosition, map.getZoom()); // Keep the current zoom level when centering the map
        checkProximity(userPosition); // Check proximity to stress zones
      }
    }, [userPosition, map]);

    return null; // This component does not render any UI elements
  };

  const checkProximity = async (position) => {
    const allZones = [...extremelyUncomfortableData,...uncomfortableData,...littleUncomfortableData];
    let alertText = "";
  
    for (const [index, zone] of allZones.entries()) {
      const distance = getDistance(position, [zone.dumlat || zone.latitude, zone.dumlng || zone.longitude]);
      const radius = zone.radius || 10;
      const zoneKey = `${zone.dumlat || zone.latitude}-${zone.dumlng || zone.longitude}`;
  
      if (distance <= radius) {
        const currentTime = Date.now();
  
        // Check if the sound has been played for this zone in the last 15 seconds
        if (!lastAlertedZones[zoneKey] || (currentTime - lastAlertedZones[zoneKey]) > 15000) {
          playAlertSound(); // Try playing the sound

          setAlertMessage("");

          // Set a timeout to display the alert message after a slight delay
          setTimeout(() => {
            alertText += `You are entering stress zone #${index + 1} be careful of bumpy path!\n`;
            setAlertMessage(alertText);
            console.log("New Alert:" , alertMessage)
          }, 100); // Adjust the delay if needed (100ms here)
    
          // Update the last alerted zones with the current time
          setLastAlertedZones((prev) => ({ ...prev, [zoneKey]: currentTime }));
        }
      }
    }

  };
  

  // Alert useEffect
  useEffect(() => {
    if (alertMessage) {
      alert(alertMessage); // Alert for mobile
      console.log(alertMessage); // Log for desktop
    }
  }, [alertMessage]);

  const [stressZoneVisibility, setStressZoneVisibility] = useState({
    yellow: false,
    orange: false,
    red: false,
  });

  //slider control
  const StressZoneControl = () => {
    const map = useMap();

    useEffect(() => {
        const control = L.control({ position: 'topright' });

        control.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            div.style.backgroundColor = 'white'; // Keep background color inline for now
            div.style.padding = '5px';
            div.style.cursor = 'pointer';

            // Create a container for the toggle buttons
            const container = document.createElement('div');
            container.className = 'stress-zone-container'; // Add a class for custom styling

            // Function to create toggle elements
            const createToggle = (color, label) => {
                const zoneDiv = document.createElement('div');
                zoneDiv.className = 'toggle-label';

                const labelSpan = document.createElement('span');
                labelSpan.className = `${color}-label`;
                labelSpan.textContent = label;

                const toggleInput = document.createElement('input');
                toggleInput.type = 'checkbox';
                toggleInput.checked = stressZoneVisibility[color]; // Set checked state based on the current visibility
                toggleInput.onchange = () => {
                    setStressZoneVisibility((prev) => ({ ...prev, [color]: toggleInput.checked }));
                };

                const labelContainer = document.createElement('label');
                labelContainer.className = `switch ${color}`;
                labelContainer.appendChild(toggleInput);
                labelContainer.appendChild(document.createElement('span')).className = "slider round"; // Create slider

                zoneDiv.appendChild(labelSpan);
                zoneDiv.appendChild(labelContainer);
                container.appendChild(zoneDiv);
            };

            // Create toggles for each zone
            createToggle('yellow', 'Litte Uncomfortable');
            createToggle('orange', 'Uncomfortable');
            createToggle('red', 'Very Uncomfortable');

            div.appendChild(container); // Append the rendered container to the div
            return div;
        };

        control.addTo(map);

        // Cleanup
        return () => {
            map.removeControl(control);
        };
    }, [map, stressZoneVisibility]); // Include stressZoneVisibility to update on changes

    return null;
};
  

  return (
    <div>
      {/* MapContainer with default or user position */}
      <MapContainer center={userPosition || defaultPosition} zoom={16} style={{ height: '100vh', width: '100%' }}>
        {/* OpenStreetMap TileLayer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Custom Control for Unmute/Mute */}
        <CustomControl />
        <StressZoneControl />
  
        {userPosition && <SetViewToUserPosition userPosition={userPosition} />}
  
        {userPosition && (
          <Marker 
            position={userPosition} 
            icon={googleMapsArrowIcon} 
            rotationOrigin="center"
          >
            <Popup>
              You are here! <br />
              Latitude: {userPosition[0]}, Longitude: {userPosition[1]}
            </Popup>
          </Marker>
        )}
  
        {/* Fallback marker */}
        {!userPosition && (
          <Marker position={defaultPosition}>
            <Popup>
              This is Tokyo! <br /> Unable to fetch your current location.
            </Popup>
          </Marker>
        )}
  
        {/* Render little uncomfortable zones (yellow) */}
        {stressZoneVisibility.yellow && littleUncomfortableData.map((zone, index) => (
          <Circle
            key={`little-${index}`}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radius || 10}
            pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.3 }}
          >
            <Popup>
              Little Uncomfortable Zone #{index + 1}: <br />
              Latitude: {zone.latitude}, Longitude: {zone.longitude}
            </Popup>
          </Circle>
        ))}

        {/* Render uncomfortable zones (orange) */}
        {stressZoneVisibility.orange && uncomfortableData.map((zone, index) => (
          <Circle
            key={`uncomfortable-${index}`}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radius || 10}
            pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.3 }}
          >
            <Popup>
              Uncomfortable Zone #{index + 1}: <br />
              Latitude: {zone.latitude}, Longitude: {zone.longitude}
            </Popup>
          </Circle>
        ))}

        {/* Render extremely uncomfortable zones (red) */}
        {stressZoneVisibility.red && extremelyUncomfortableData.map((zone, index) => (
          <Circle
            key={`extremely-${index}`}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radius || 10}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
          >
            <Popup>
              Extremely Uncomfortable Zone #{index + 1}: <br />
              Latitude: {zone.latitude}, Longitude: {zone.longitude}
            </Popup>
          </Circle>
        ))}
  
        {/* Render dummy stress zones */}
        {/* {dummyStressZones.map((zone, index) => (
          <Circle
            key={index}
            center={[zone.dumlat, zone.dumlng]}
            radius={zone.radius}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.3 }}
          >
            <Popup>
              Dummy Stress Zone #{index + 1}:<br />
              Latitude: {zone.dumlat}, Longitude: {zone.dumlng}
            </Popup>
          </Circle>
        ))} */}
      </MapContainer> 
    </div>
  );
  
};

export default MapComponent;
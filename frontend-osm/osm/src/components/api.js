// api.js
export const fetchBackendData = async (backendEndpoint) => {
    try {
      const payload = {
        "zVibration": { "$gt": 1.6, "$lte": 2.5 }
      };
  
      const response = await fetch(`${backendEndpoint}/getData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const result = await response.json(); // Parse JSON response
      if (Array.isArray(result)) {
        return result; // Return the fetched data if it's an array
      } else {
        console.error("Unexpected data format:", result);
        return [];
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };
  
export const fetchBackendData = async (backendEndpoint, zVibrationRange) => {
  try {
    const payload = {
      zVibration: zVibrationRange
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

    const result = await response.json();
    if (Array.isArray(result)) {
      return result;
    } else {
      console.error("Unexpected data format:", result);
      return [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

// Fetch functions for different discomfort levels
export const fetchLilUncomfortableData = (backendEndpoint) => {
  return fetchBackendData(backendEndpoint, { "$gt": 0.315, "$lte": 0.63 });
};

export const fetchUncomfortableData = (backendEndpoint) => {
  return fetchBackendData(backendEndpoint, { "$gt": 1, "$lte": 1.6 });
};

export const fetchExUncomfortableData = (backendEndpoint) => {
  return fetchBackendData(backendEndpoint, { "$gt": 2.5 });
};

const flattenData = (data) => {
  const transformed = data.payload.map(item => ({
    name: item.name,
    time: item.time,
    sessionId: data.sessionId,
    ...item.values  // Spread operator to flatten the values
  }));

  return transformed;
};

module.exports = { flattenData };

function calculateArray(data, mode) {
    if (!Array.isArray(data) || data.length === 0) {
      return "Invalid data array";
    }
  
    if (mode === "mean") {
      const sum = data.reduce((acc, value) => acc + value, 0);
      return sum / data.length;
    } else if (mode === "max") {
      return Math.max(...data);
    } else {
      return "Invalid mode. Use 'mean' or 'max'.";
    }
}

function rootMeanSquare(data) {

  // Check if data is not empty
  if (data.length === 0) return 0;

  // Step 1: Square each number and sum them up
  const sumOfSquares = data.reduce((sum, num) => sum + num ** 2, 0);

  // Step 2: Compute the mean of the squared numbers
  const meanOfSquares = sumOfSquares / data.length;

  // Step 3: Return the square root of the mean
  return Math.sqrt(meanOfSquares);
}

function normalize(value, min, max) {
  if (min === max) {
    console.error("Min and max cannot be the same value.");
    return null; // or return 0 depending on your needs
  }

  // Normalize and make the value absolute
  return Math.abs((value - min) / (max - min));
}

module.exports = { calculateArray, rootMeanSquare, normalize }
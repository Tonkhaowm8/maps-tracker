// routes/api.js
const express = require('express');
const router = express.Router();
const { store } = require('./store');
const { retrieve } = require('./retrieve');

// Define API routes
router.post('/sendData', store); // Adjust if necessary
router.post('/getData', retrieve); // Adjust if necessary

module.exports = router;
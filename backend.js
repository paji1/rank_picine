// Server setup code
const express = require('express');
const app = express();

// Endpoint for the callback URL
app.get('/callback', (req, res) => {
  const { error, error_description } = req.query;
  if (error) {
    // Handle the error here
    console.error('Authorization error:', error);
    console.error('Description:', error_description);
    res.send('Authorization error occurred. Please try again.');
  } else {
    // Authorization was successful, continue with the next steps
    const myScript = require('./script.js')
    const parse = require('./parse.js')
    res.send('Authorization successful!'); // Send a success response
  }
});

// Start the server
app.listen(3002, () => {
  console.log('Server listening on port 3000');
});
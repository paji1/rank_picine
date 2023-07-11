
const fs = require('fs');

// Read the JSON data from the file
const jsonData = fs.readFileSync('ex.json', 'utf8');
const cursusData = JSON.parse(jsonData);
console.log(cursusData.length);

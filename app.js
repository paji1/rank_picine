const express = require('express');
const session = require('express-session');
const cors = require('cors');
const routes = require('./routes'); // Import your routes module
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser'); // Import body-parser

app.use(cors());

const PORT = 80;

// Configure express session
app.use(session({
  secret: 'hello-world123',
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser.json());
app.use('/', routes); // Use the imported routes module
app.use(express.static('public'));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

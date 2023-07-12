const axios = require('axios');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 80;

const API_URL = 'https://api.intra.42.fr';
const ACCESS_TOKEN_URL = `${API_URL}/oauth/token`;
const CURSUS_USERS_URL = `${API_URL}/v2/cursus_users`;

const UID = 'u-s4t2ud-5e127fe7e4cb6429d6e17edb03ce13a5f5c22990183ff0b64925b6368928e79b';
const SECRET = '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';
const CAMPUS_ID = '16';
const CURSUS_ID = '9';
const RANGE_CREATED_AT = '2023-01-01T13:41:00.750Z,2023-07-10T13:41:00.750Z';
const PAGE_SIZE = 20;
let usersData = []; // Variable to store the fetched users data


const REDIRECT_URI = 'https://server-bjte.onrender.com/callback';

// Configure express session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://api.intra.42.fr/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: UID,
        client_secret: SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }
    });

    const accessToken = response.data.access_token;
    
    // Use the obtained access token for further API requests
    // ...
    
    res.sendFile(__dirname + '/index.html');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred during authorization.');
  }
});


async function getAccessToken() {
  try {
    const response = await axios.post(ACCESS_TOKEN_URL, null, {
      params: {
        grant_type: 'client_credentials',
        client_id: UID,
        client_secret: SECRET
      }
    });

    if (response.status === 200) {
      return response.data.access_token;
    } else {
      throw new Error('Failed to obtain access token');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
app.get('/', (req, res) => {
  res.redirect(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5e127fe7e4cb6429d6e17edb03ce13a5f5c22990183ff0b64925b6368928e79b&redirect_uri=https%3A%2F%2Fserver-bjte.onrender.com%2Fcallback&response_type=code`);
});

async function getUsers(accessToken, page = 1) {
  try {
    const response = await axios.get(CURSUS_USERS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        'filter[campus_id]': CAMPUS_ID,
        'filter[cursus_id]': CURSUS_ID,
        'range[created_at]': RANGE_CREATED_AT,  
        'sort': '-level',
        page,
        per_page: PAGE_SIZE
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function fetchAllUsers() {
  try {
    const accessToken = await getAccessToken();
    let page = 1;

    while (true) {
      const response = await getUsers(accessToken, page);
      usersData.push(...response);
      
      if (response.length < PAGE_SIZE) {
        usersData.push(...response);
        break; // Stop fetching if the response length is less than PAGE_SIZE
      }

      page++;
    }

    fs.writeFileSync('usersData.json', JSON.stringify(usersData));
    console.log('Users data fetched and stored successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

function fetchUsersInBackground() {
  fs.truncate('usersData.json', 0, function(){console.log('done')})
  usersData = [];

  fetchAllUsers().catch((error) => {
    console.error('Error in background task:', error.message);
  });
}

// Run the background task to fetch users' data initially
fetchUsersInBackground();

// Run the background task to fetch users' data periodically every 1 hour
setInterval(fetchUsersInBackground, 4 * 60 * 1000);

// Serve the users data to the client
app.get('/fetch', (req, res) => {
  try {
    console.log(usersData.length);
    res.send(usersData);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('An error occurred while fetching users data');
  }
});


app.use(express.static('public'));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

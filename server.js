const axios = require('axios');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 80;

const API_URL = 'https://api.intra.42.fr';
const ACCESS_TOKEN_URL = `${API_URL}/oauth/token`;
const CURSUS_USERS_URL = `${API_URL}/v2/cursus_users`;

const UID = 'u-s4t2ud-7125a98019064ca4d534fd584fae48ac8663a3cefbb1bbccf20165d9db545f32';
const SECRET = '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';
const CAMPUS_ID = '16';
const CURSUS_ID = '9';
const RANGE_CREATED_AT = '2023-01-01T13:41:00.750Z,2023-07-10T13:41:00.750Z';
const PAGE_SIZE = 20;
let usersData = []; // Variable to store the fetched users data

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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

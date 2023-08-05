    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');
    const express = require('express');
    const session = require('express-session');


    const cors = require('cors');

    const rangesTable = {
      
      
      // Add more ranges as needed...
    };
    
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

    let RANGE_CREATED_AT = '';
    const PAGE_SIZE = 20;
    let usersData = []; // Variable to store the fetched users data

    var done = false;

    const REDIRECT_URI = 'https://1337rank.live/callback';


    // Configure express session

    app.use(session({
      secret: 'hello-world123',
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
        const response_user = await axios.get('https://api.intra.42.fr/v2/me', {
          params: {
            access_token: `${response.data.access_token}`
          }
        });
        
        const startDate = new Date(response_user.data.created_at);
        const endDate = new Date(response_user.data.created_at);
        endDate.setDate(startDate.getDay() + 19);
        startDate.setDate(startDate.getDay());
        RANGE_CREATED_AT = startDate.toISOString() + "," + endDate.toISOString();
        console.log(RANGE_CREATED_AT);
        fs.truncate('usersData.json', 0, function(){console.log('done')})
        const accessToken = response.data.access_token;
        if (response_user.status === 200) {

          req.session.user = response_user.data;
          usersData = [];
          fetchAllUsers();
        }
        req.session.accessToken = accessToken;
        done=  false;
        // console.log(response_user.data);
        // Use the obtained access token for further API requests
        // ...
        res.redirect('/');
        
      } catch (error) {
        console.error('Error:', error.message);
        // res.status(500).send('An error occurred during authorization.');
        res.sendFile(__dirname + '/error.html');
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
      if(req.session.accessToken){
        // User is already authorized, redirect to another route or send response
        res.sendFile(__dirname + '/index.html');
      } else {
        // User is not authorized, initiate the OAuth2 flow
        res.redirect(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5e127fe7e4cb6429d6e17edb03ce13a5f5c22990183ff0b64925b6368928e79b&redirect_uri=https%3A%2F%2F1337rank.live%2Fcallback&response_type=code`);
        
      }
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
        if (RANGE_CREATED_AT.length == 0)
        {
          return ;
        }
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
        done = true;
        rangesTable[RANGE_CREATED_AT + ".json"] = RANGE_CREATED_AT.split(',');
        console.log(rangesTable);
        fs.writeFileSync(`${RANGE_CREATED_AT}.json`, JSON.stringify(usersData));
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
    app.get('/profile', (req, res) => {
      try {
        if (req.session.user) {
          const { login, image } = req.session.user;
          const profileLink = `https://profile.intra.42.fr/users/${login}`;
          
          // Create an object with the required data
          const userData = {
            username: login,
            profileLink: profileLink,
            profileImage: image ? image.versions.small : "./img/default.avif"
          };
    
          // Send the data as JSON response
          res.json(userData);
        } else {
          res.status(404).json({ error: "User data not found" });
        }
      } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: "An error occurred while fetching user data" });
      }
    });

    // Run the background task to fetch users' data initially
    fetchUsersInBackground()
    // Run the background task to fetch users' data periodically every 1 hour
    
    // Serve the users data to the client
    app.get('/fetch', (req, res) => {
      try {
        console.log(usersData.length);
        for (const rangeName in rangesTable) {
          if (rangesTable.hasOwnProperty(rangeName)) {
            const rangeStart = new Date(rangesTable[rangeName][0]);
            const rangeEnd = new Date(rangesTable[rangeName][1]);
        
            const currentDate = new Date(req.session.user.created_at);
        
            if (currentDate >= rangeStart && currentDate <= rangeEnd) {
              if (done == true)
              {
                console.log(rangeName);
                const filePath = path.join(__dirname, rangeName);
                res.sendFile(filePath, (err) => {
                  if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).send('Internal Server Error');
                  }
                });
                return; 
              }
            } else {
              console.log(`The current date is not in ${rangeName}.`);
            }
          }
        }
        
        if (done == true)
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
    
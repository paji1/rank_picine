const axios = require('axios');
const fs = require('fs');
const path = require('path');
// const { fetchAllUsers } = require('./helpers');
require('dotenv').config();
let { done } = require('./helpers');




const ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_URL;
const CURSUS_USERS_URL = process.env.CURSUS_USERS_URL;
const UID = process.env.UID;
const SECRET = process.env.SECRET;
const CAMPUS_ID = process.env.CAMPUS_ID;
const CURSUS_ID = process.env.CURSUS_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REDIRECT_URL = process.env.REDIRECT_URL;
const API_URL= process.env.API_URL;

async function callback(req, res) {
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
	  
	  
	//   fs.truncate('usersData.json', 0, function(){console.log('done')})
	  const accessToken = response.data.access_token;
	  if (response_user.status === 200) {
  
		req.session.user = response_user.data;
		usersData = [];
		// fetchAllUsers();
	  }
	  req.session.accessToken = accessToken;
	  done=  false;
	  // console.log(response_user.data);
	  // Use the obtained access token for further API requests
	  // ...
	  res.redirect('/');
	  
	} catch (error) {
	  console.error('callback Error:', error.message);
	  // res.status(500).send('An error occurred during authorization.');
	  res.sendFile(__dirname + '/error.html');
	}
}

function home(req, res) {
	if(req.session.accessToken){
		// User is already authorized, redirect to another route or send response
		res.sendFile(__dirname + '/index.html');
	  } else {
		// User is not authorized, initiate the OAuth2 flow
		if (done == true)
			res.redirect(REDIRECT_URL);
	  }
}

async function profile(req, res) {
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
		console.error('profile Error:', error.message);
		res.status(500).json({ error: "An error occurred while fetching user data" });
	  }
}

function fetch(req, res) {
	try {
		
		// if (done == true)
		// {
			if(req.session.accessToken){
				// User is already authorized, redirect to another route or send response
				const filePath = path.join(__dirname, "usersData.json");
				res.sendFile(filePath, (err) => {
				  if (err) {
					console.error('Error sending file:', err);
					res.status(500).send('Internal Server Error');
				  }	
				});
			  } else {
				// User is not authorized, initiate the OAuth2 flow
				res.redirect(REDIRECT_URL);
				
			  }
		// }
		
		
	  } catch (error) {
		console.error('fetch Error:', error.message);
		res.status(500).send('An error occurred while fetching users data');
	  }
}

module.exports = {
  callback,
  home,
  profile,
  fetch
};

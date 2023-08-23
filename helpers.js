// @ts-nocheck
const axios = require('axios');
const { time } = require('console');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_URL;
const CURSUS_USERS_URL = process.env.CURSUS_USERS_URL;
const UID = process.env.UID;
const SECRET = process.env.SECRET;
const CAMPUS_ID = process.env.CAMPUS_ID;
const CURSUS_ID = process.env.CURSUS_ID;
const RANGE_CREATED_AT = process.env.RANGE_CREATED_AT;
const PAGE_SIZE = process.env.PAGE_SIZE;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REDIRECT_URL = process.env.REDIRECT_URL;
const API_URL = process.env.API_URL;

global.usersData = [];
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
		console.error('getAccessToken Error:', error.message);
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
		console.error('get_user Error:', error.message);
		throw error;
	}
}
function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}
async function fetchAllUsers() {
	try {

		const accessToken = await getAccessToken();
		let page = 1;

		while (true) {
			const response = await getUsers(accessToken, page);
			usersData.push(...response);
			console.log("working");
			console.log(usersData.length);
			await delay(500);
			if (response.length == 0) {
				usersData.push(...response);
				if (usersData.length > 300) {
					break; // Stop fetching if the response length is less than PAGE_SIZE
				}
			}

			page++;
		}
		done = true;
		fs.writeFileSync(`usersData.json`, '');
		fs.writeFileSync(`usersData.json`, JSON.stringify(usersData));

		console.log('Users data fetched and stored successfully!');
	} catch (error) {
		console.error('fetchAllUsers Error:', error.message);
		throw error;
	}
}
async function fetchUsersInBackground() {
	usersData = [];

	await fetchAllUsers().catch((error) => {
		console.error('Error in background task:', error.message);
	});
}

fetchUsersInBackground();

// Run the background task to fetch users' data periodically every 1 hour
setInterval(fetchUsersInBackground, 4 * 60 * 1000);
module.exports = {
	getAccessToken,
	getUsers,
	fetchAllUsers,
	fetchUsersInBackground
};

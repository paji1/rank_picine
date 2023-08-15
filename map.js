const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { fetchAllUsers } = require('./helpers');
require('dotenv').config();

const ACCESS_TOKEN_URL = process.env.ACCESS_TOKEN_URL;
const CURSUS_USERS_URL = process.env.CURSUS_USERS_URL;
const UID = process.env.UID;
const SECRET = process.env.SECRET;
const CAMPUS_ID = process.env.CAMPUS_ID;
const CURSUS_ID = process.env.CURSUS_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const API_URL = process.env.API_URL;



function saveGridMapsToFile() {
    const data = JSON.stringify(gridMaps, null, 4); // The second argument for formatting (indentation)
    fs.writeFileSync('gridMaps.json', data);
    console.log('Grid maps saved to gridMaps.json');
}

function loadGridMapsFromFile() {
    try {
        const data = fs.readFileSync('gridMaps.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading grid maps from file:', error.message);
        return null;
    }
}

let gridMaps = loadGridMapsFromFile() || {
	map1: createGridMap(),
	map2: createGridMap(),
	map3: createGridMap(),
};

function createGridMap() {
	const map = [];
	for (let i = 0; i < 10; i++) {
		const row = [];
		for (let j = 0; j <5; j++) {
			row.push([null, null]); // Initialize each cell with two slots
		}
		map.push(row);
	}
	return map;
}

async function add(req, res) {
	try {
		console.log("here");
		const { user } = req.body; // Assuming the username is sent in the request body
		console.log(user);
		console.log(`Received request to add user: ${user}`);
		
		// Find an available slot in one of the maps
		let added = false;
		// ...
		for (let mapName in gridMaps) {
			console.log(mapName);
			let map = gridMaps[mapName];
			for (let i = 0; i < 5; i++) {
				console.log("here2");
				for (let j = 0; j < 10; j++) {
					if (!map[j][i][0]) {
						map[j][i][0] = user;
						added = true;
						saveGridMapsToFile();

						console.log(`Added ${user} to ${mapName} at position [${i}][${j}] slot 0`);
						break;
					} else if (!map[j][i][1]) {
						map[j][i][1] = user;
						added = true;
						saveGridMapsToFile();
						console.log(`Added ${user} to ${mapName} at position [${i}][${j}] slot 1`);
						break;
					}
				}
				if (added) {
					break;
				}
			}
			if (added) {
				break;
			}
			console.log(map);
		}
		// console.log(gridMaps.map1);
		// ...

		console.log('---------------------------------');
		// console.log(gridMaps[0][0]);

		if (added) {
			res.status(200).json({ message: `User ${user} added to the grid` });
		} else {
			res.status(400).json({ message: 'No available slots in the grid' });
		}
	} catch (error) {
		console.error('add Error:', error.message);
		res.status(500).json({ error: 'An error occurred while processing the request' });
	}
}


async function clear(req, res) {
	try {
		fs.truncate('gridMaps.json', 0, function() {
			console.log('done');
		  });
		gridMaps = {
			map1: createGridMap(),
			map2: createGridMap(),
			map3: createGridMap(),
		};
		
	} catch (error) {
		console.error('search Error:', error.message);
		res.status(500).json({ error: 'An error occurred while fetching grid map data' });
	}

}
async function search(req, res) {
	try {
		const gridMap = gridMaps // Fetch the grid map data
		res.json(gridMap); // Send the grid map data as a JSON response
	} catch (error) {
		console.error('search Error:', error.message);
		res.status(500).json({ error: 'An error occurred while fetching grid map data' });
	}

}
async function grid(req, res) {
	if (req.session.accessToken) {
		// User is already authorized, redirect to another route or send response
		res.sendFile(__dirname + '/grid.html');
	} else {
		// User is not authorized, initiate the OAuth2 flow
		res.redirect(`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-5e127fe7e4cb6429d6e17edb03ce13a5f5c22990183ff0b64925b6368928e79b&redirect_uri=http%3A%2F%2Flocalhost%2Fcallback&response_type=code`);

	}
}
module.exports = {
	add,
	search,
	grid,
	clear,
	// ... (other exports)
};

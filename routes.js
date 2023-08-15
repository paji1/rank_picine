const express = require('express');
const router = express.Router();
const { callback, home, profile, fetch } = require('./controllers'); // Import controller functions

router.get('/callback', callback);
router.get('/', home);
router.get('/profile', profile);
router.get('/fetch', fetch);


module.exports = router;

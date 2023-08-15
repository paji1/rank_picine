const express = require('express');
const router = express.Router();
const { callback, home, profile, fetch } = require('./controllers'); // Import controller functions
const { add , search, grid , clear} = require('./map'); // Import controller functions

router.get('/callback', callback);
router.get('/', home);
router.get('/profile', profile);
router.get('/fetch', fetch);
router.post('/add', add);
router.get('/search', search);
router.get('/grid', grid);
router.get('/clear', clear);


module.exports = router;

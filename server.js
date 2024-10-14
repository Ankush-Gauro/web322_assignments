// Ankush Gauro - 108593237
const express = require('express');
const path = require('path');
const contentService = require('./content-service'); // Import the content-service module

const app = express();
const HTTP_PORT = 8080;

app.use(express.static('public'));

// Route handlers
app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/home', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});




const express = require('express'); // "require" the Express module

const path = require('path'); // path
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port

//Get route for index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
  });

//Get route for about
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname,'/views/about.html'));
  });


// start the server on the port and output a confirmation to the console
app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));


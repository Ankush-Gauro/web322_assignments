

const express = require('express'); // "require" the Express module

const path = require('path'); // path
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port
app.use(express.static('public'));


//Get route for index

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/home', (req, res) => {
  res.redirect('/about');
});


//Get route for about
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname,'/views/about.html'));
  });


// start the server on the port and output a confirmation to the console
app.listen(HTTP_PORT, () => console.log(`Express http server listening on port ${HTTP_PORT}`));


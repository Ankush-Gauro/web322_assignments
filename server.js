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

// Route for getting articles
app.get('/articles', (req, res) => {
  contentService.getAllArticles()
      .then((data) => {
          res.json(data); // Send the articles data
      })
      .catch((err) => {
          res.json({ message: err }); // Send error message 
      });
});

// Route for getting categories
app.get('/categories', (req, res) => {
  contentService.getCategories()
      .then((data) => {
          res.json(data); // Send the categories data 
      })
      .catch((err) => {
          res.json({ message: err }); // Send error message 
      });
});

// Initialize the content service and start the server
contentService.initialize()
  .then(() => {
      app.listen(HTTP_PORT, () => {
          console.log(`Express http server listening on port ${HTTP_PORT}`);
      });
  })
  .catch((err) => {
      console.log(`Failed to initialize content service: ${err}`);
  });

module.exports = app;

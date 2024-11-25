// Ankush Gauro - 108593237
const express = require('express');
const path = require('path');
const contentService = require('./content-service'); // Import the content-service module


const multer = require("multer");

const cloudinary = require("cloudinary").v2;

const streamifier = require("streamifier");

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

cloudinary.config({
    cloud_name: "dwnronnaa",
    api_key: "861817752397373",
    api_secret: "S3cV-3ukGg_gGthRAUdkZADMK7w",
    secure: true,
  });

const upload = multer();


const HTTP_PORT = process.env.PORT || 3838;


app.use(express.static('public'));

// Route handlers
app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.render('about', {
        pageTitle: 'About Ankush Articles',
        name: 'Ankush Gauro',
        studentId: '108593237',
        className: 'WEB322-ZCC',
        email: 'agauro@myseneca.ca'
    });
});







// Route for getting categories
app.get("/categories", (req, res) => {
  contentService.getCategories().then((data) => {
    res.json(data); // Respond with categories as JSON
  });
});

app.get('/articles/add', (req, res) => {
    res.render('addArticle', {
        pageTitle: 'Add New Article',
        categories: ['News', 'Data Science', 'Technology', 'Artificial Intelligence'],
        footerText: 'Ankush Gauro, 108593237',
        email: 'agauro@myseneca.ca'
    });
});



app.get('/articles', (req, res, next) => {
  if (req.query.category) {
      // Handle filtering by category
      contentService.getArticlesByCategory(req.query.category)
          .then((articles) => {
              res.json(articles);
          })
          .catch((err) => {
              res.status(404).json({ message: err });
          });
  } else if (req.query.minDate) {
      // Handle filtering by minDate
      contentService.getArticlesByMinDate(req.query.minDate)
          .then((articles) => {
              res.json(articles);
          })
          .catch((err) => {
              res.status(404).json({ message: err });
          });
  } else {
      // If no query parameters, fetch all articles
      contentService.getAllArticles()
          .then((articles) => {
              res.json(articles);
          })
          .catch((err) => {
              res.status(404).json({ message: err });
          });
  }
});

app.post('/articles/add', upload.single("featureImage"), (req, res) => {
  if (req.file) {
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  { folder: 'articles' }, // Optional: Store in a specific folder
                  (error, result) => {
                      if (result) resolve(result);
                      else reject(error);
                  }
              );
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };

      async function uploadToCloudinary(req) {
          let result = await streamUpload(req);
          return result.url; // Return the uploaded image URL
      }

      uploadToCloudinary(req)
          .then((imageUrl) => {
              processArticle(imageUrl);
          })
          .catch((err) => {
              res.status(500).json({ message: 'Image upload failed', error: err });
          });
  } else {
      processArticle(""); // If no image uploaded, pass an empty string
  }

  function processArticle(imageUrl) {
      // Build the article object
      const articleData = {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          published: req.body.published === 'on', // Checkbox value
          featureImage: imageUrl || "", // Use the uploaded image URL or empty string
          postDate: new Date().toISOString() // Current timestamp
      };

      // Call content-service to add the article
      contentService.addArticle(articleData)
          .then(() => res.redirect('/articles')) // Redirect to articles page on success
          .catch((err) => res.status(500).json({ message: 'Failed to add article', error: err }));
  }
});

 

 app.get("/article/:Id", (req, res) => {
  contentService
    .getArticleById(req.params.Id)
    .then((article) => {
      res.json(article);
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

 

// Initialize the content service and start the server
contentService.initialize().then(() => {
  app.listen(HTTP_PORT); // Start server and listen on specified port
  console.log("server listening @ http://localhost:" + HTTP_PORT);
});

// Export the Express app instance (useful for testing or external usage)
module.exports = app;

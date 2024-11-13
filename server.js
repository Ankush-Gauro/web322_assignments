// Ankush Gauro - 108593237
const express = require('express');
const path = require('path');
const contentService = require('./content-service'); // Import the content-service module
const multer = require("multer");
const cloudinary = require("cloudinary");
const streamifier = require("streamifier");

const app = express();

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

app.get('/home', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});


// Route for getting categories
app.get("/categories", (req, res) => {
  storeData.getCategories().then((data) => {
    res.json(data); // Respond with categories as JSON
  });
});

app.get('/articles/add', (req, res) => { 

  res.sendFile(path.join(__dirname, 'views', 'addArticle.html')); 

}); 

app.get("/articles", async (req, res) => {
    try {
      // Parse the query string to extract the category parameter
      const category = req.query.category;
      const minDate = req.query.minDate;
  
      if (category) {
        let postsCategory = await blogsService.getPostsByCategory(category);
        res.json(postsCategory);
      }
  
      // Extract the minDate parameter from the query string
      else if (minDate) {
        // Retrieve posts from the database and filter based on the minDate parameter
        const post = await blogsService.getPostsByMinDate(minDate);
        res.json(post);
      } else {
        let result = await blogsService.getAllPosts();
        res.json(result);
      }
    } catch (error) {
      res.json({ message: error });
    }
  });

  app.post('/articles/add', upload.single("featureImage"), (req, res) => { 

    if (req.file) { 
 
        let streamUpload = (req) => { 
 
            return new Promise((resolve, reject) => { 
 
                let stream = cloudinary.uploader.upload_stream( 
 
                    (error, result) => { 
 
                        if (result) resolve(result); 
                        else reject(error); 
 
                    } 
 
                ); 
 
                streamifier.createReadStream(req.file.buffer).pipe(stream); 
 
            }); 
 
        }; 
 
        async function upload(req) { 
            let result = await streamUpload(req); 
            return result; 
        } 
 
        upload(req).then((uploaded) => { 
            processArticle(uploaded.url); 
        }).catch(err => res.status(500).json({ message: "Image upload failed", error: err })); 
 
    } else { 
        processArticle(""); 
    } 
 
    function processArticle(imageUrl) { 
        req.body.featureImage = imageUrl; 
 
        // Add article to content-service 
        contentService.addArticle(req.body)
            .then(() => res.redirect('/articles'))
            .catch(err => res.status(500).json({ message: "Article creation failed", error: err })); 
    } 
 
 }); 

 

  app.get("/articles/:id", async (req, res) => {
    try {
      // Extract the minDate parameter from the query string
      const value = parseInt(req.params.value);
      // Retrieve posts from the database and filter based on the value parameter
      const resultStrId = await blogsService.getArticleById(value);
      res.json(resultStrId);
    } catch (err) {
      reject(err);
    }
  });
 

// Initialize the content service and start the server
storeData.initialize().then(() => {
  app.listen(HTTP_PORT); // Start server and listen on specified port
  console.log("server listening @ http://localhost:" + HTTP_PORT);
});

module.exports = app;

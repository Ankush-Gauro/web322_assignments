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
app.get('/categories', (req, res) => {
  contentService.getCategories()
    .then((categories) => {
      res.render('categories', {
        pageTitle: 'Categories',
        categories: categories,
        errorMessage: null,
      });
    })
    .catch(() => {
      res.render('categories', {
        pageTitle: 'Categories',
        categories: [],
        errorMessage: 'No categories found or an error occurred.',
      });
    });
});

  

  app.get('/articles/add', (req, res) => {
    contentService.getCategories()
      .then((categories) => {
        res.render('addArticle', {
          pageTitle: 'Add New Article',
          categories: categories, // Categories are passed here
          errorMessage: null, // No error, so errorMessage is null
          footerText: 'Ankush Gauro, 108593237',
          email: 'agauro@myseneca.ca'
        });
      })
      .catch((err) => {
        res.render('addArticle', {
          pageTitle: 'Add New Article',
          categories: [], // Pass an empty array if categories fetch fails
          errorMessage: 'Failed to load categories. Please try again later.', // Error message passed
          footerText: 'Ankush Gauro, 108593237',
          email: 'agauro@myseneca.ca'
        });
      });
  });
  
  



  app.get('/articles', (req, res) => {
    let articlesPromise;
  
    if (req.query.category) {
      // Fetch articles by category
      articlesPromise = contentService.getArticlesByCategory(req.query.category);
    } else if (req.query.minDate) {
      // Fetch articles by minimum date
      articlesPromise = contentService.getArticlesByMinDate(req.query.minDate);
    } else {
      // Fetch all articles
      articlesPromise = contentService.getAllArticles();
    }
  
    articlesPromise
      .then((articles) => {
        res.render('articles', {
          pageTitle: 'Articles',
          articles: articles,
          errorMessage: articles.length === 0 ? 'No articles found.' : null, // Display a message if no articles are found
        });
      })
      .catch((err) => {
        res.render('articles', {
          pageTitle: 'Articles',
          articles: [],
          errorMessage: 'Unable to fetch articles. Please try again later.', // Display a generic error message if something goes wrong
        });
      });
  });
  
  

  app.post('/articles/add', upload.single("featureImage"), (req, res) => {
    let processImage = Promise.resolve(""); // Default to no image URL
  
    if (req.file) {
      const streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            { folder: 'articles' },
            (error, result) => {
              if (result) resolve(result.url);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
  
      processImage = streamUpload(req);
    }
  
    processImage
      .then((imageUrl) => {
        const articleData = {
          title: req.body.title,
          content: req.body.content,
          category: parseInt(req.body.category),
          published: req.body.published === 'on',
          featureImage: imageUrl,
          postDate: new Date().toISOString(),
        };
  
        return contentService.addArticle(articleData);
      })
      .then(() => res.redirect('/articles'))
      .catch(() => res.status(500).send('Failed to add article'));
  });
  

 

app.get('/article/:id', (req, res) => {
  const articleId = req.params.id;

  contentService.getArticleById(articleId)
    .then((article) => {
      if (!article) {
        return res.status(404).render('404', { message: 'Article not found.' });
      }
      contentService.getCategoryNameById(article.category)
        .then((categoryName) => {
          article.categoryName = categoryName;
          res.render('article', {
            pageTitle: article.title,
            article: article,
          });
        });
    })
    .catch(() => res.status(404).render('404', { message: 'Article not found.' }));
});

  
app.put('/articles/:id', (req, res) => {
  const articleId = req.params.id;
  const articleData = {
    title: req.body.title,
    content: req.body.content,
    category: parseInt(req.body.category),
    published: req.body.published === 'on',
    featureImage: req.body.featureImage,
    postDate: req.body.postDate,
  };

  contentService.updateArticle(articleId, articleData)
    .then(() => res.redirect(`/article/${articleId}`))
    .catch(() => res.status(500).send('Failed to update article'));
});


app.delete('/articles/:id', (req, res) => {
  const articleId = req.params.id;

  contentService.deleteArticle(articleId)
    .then(() => res.redirect('/articles'))
    .catch(() => res.status(500).send('Failed to delete article'));
});

 

// Initialize the content service and start the server
contentService.initialize().then(() => {
  app.listen(HTTP_PORT); // Start server and listen on specified port
  console.log("server listening @ http://localhost:" + HTTP_PORT);
});

// Export the Express app instance (useful for testing or external usage)
module.exports = app;
// Import the 'fs' module for interacting with the file system
const fs = require("fs");
const { parse } = require("path");

const { Pool } = require('pg');

const pool = new Pool({
  user: 'SenecaDB_owner',
  host: 'ep-broad-sky-a58uyw44.us-east-2.aws.neon.tech',
  database: 'blog_database',
  password: 'uXqzYt3igEy8',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});



// Arrays to store categories and articles data loaded from JSON files
let categories = [];
let articles = [];

// Function to initialize data by loading categories and articles from JSON files
function initialize() {
  return new Promise((resolve, reject) => {
    // Read the categories data from categories.json file
    fs.readFile("./data/categories.json", "utf8", (err, cat) => {
      if (err) return reject(err); // Reject the promise if an error occurs during file read
      categories = JSON.parse(cat); // Parse and store categories data

      // Nested readFile for articles.json
      // We nest the second file read inside the first because we want to ensure that categories.json
      // is successfully read and parsed before moving on to articles.json.
      // This way, we load both files sequentially and can handle any errors independently.
      fs.readFile("./data/articles.json", "utf8", (err, art) => {
        if (err) return reject(err); // Reject the promise if an error occurs during file read
        articles = JSON.parse(art); // Parse and store articles data

        // We call resolve() only once, after both files have been successfully read and parsed.
        // Calling resolve() here signifies that initialization is complete and both categories
        // and articles data are ready for use. If we called resolve() earlier, it would
        // prematurely indicate that initialization was complete before loading both files.
        resolve();
      });
    });
  });
}

function addArticle(articleData) {
  const { title, content, category, published, featureImage, postDate } = articleData;
  const query = `
    INSERT INTO articles (title, content, category, published, featureImage, postDate)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [title, content, category, published, featureImage, postDate];
  return pool.query(query, values);
}



function getArticlesByCategory (categoryId){
  return pool
    .query('SELECT * FROM articles WHERE category_id = $1', [categoryId])
    .then(res => res.rows)
    .catch(err => Promise.reject('No results returned'));
};



function getAllArticles(){
  return pool.query('SELECT * FROM articles')
  .then(res => res.rows)
  .catch(err => Promise.reject('No results returned'));
  };


  function getArticlesByMinDate(minDateStr) {
    return pool
      .query(
        `
        SELECT articles.*, categories.name AS categoryName
        FROM articles
        LEFT JOIN categories ON articles.category = categories.id
        WHERE articles.articleDate >= $1`,
        [minDateStr]
      )
      .then(res => (res.rows.length ? res.rows : Promise.reject("No results returned")))
      .catch(err => Promise.reject("No results returned"));
  }

function getArticleById (articleId) {
  return pool
    .query('SELECT * FROM articles WHERE id = $1', [articleId])
    .then(res => (res.rows.length > 0 ? res.rows[0] : Promise.reject('No article found')))
    .catch(err => Promise.reject('No results returned'));
};


// Function to get only published articles by filtering the articles array
function getPublishedArticles() {
  return pool
    .query(
      `
      SELECT articles.*, categories.name AS categoryName
      FROM articles
      LEFT JOIN categories ON articles.category = categories.id
      WHERE articles.published = true`
    )
    .then(res => res.rows)
    .catch(err => Promise.reject("No results returned"));
}

// Function to get all categories
function getCategories () {
  return pool.query('SELECT * FROM categories')
  .then(res => res.rows)
  .catch(err => Promise.reject('No results returned'));
  };


// Function to get all articles
function getArticles() {
  return pool
    .query('SELECT * FROM articles')
    .then(res => res.rows) // Return the rows from the query result
    .catch(err => Promise.reject("No results returned")); // Handle errors
}

function getCategoryNameById(categoryId) {
  return pool
    .query('SELECT name FROM categories WHERE id = $1', [categoryId])
    .then(res => (res.rows.length ? res.rows[0].name : null))
    .catch(err => Promise.reject("Category not found"));
}

function addCategoryNameToArticles(articles) {
  return Promise.all(
    articles.map(article =>
      getCategoryNameById(article.category).then(categoryName => ({
        ...article,
        categoryName: categoryName || "Unknown",
      }))
    )
  );
}

function updateArticle(articleId, articleData) {
  const { title, content, category, published, featureImage, postDate } = articleData;
  const query = `
    UPDATE articles
    SET title = $1, content = $2, category = $3, published = $4, featureImage = $5, postDate = $6
    WHERE id = $7
  `;
  const values = [title, content, category, published, featureImage, postDate, articleId];
  return pool.query(query, values);
}



function deleteArticle(articleId) {
  return pool.query('DELETE FROM articles WHERE id = $1', [articleId]);
}




// Export the functions as an object to make them available to other files
module.exports = {
  addCategoryNameToArticles,
  getCategoryNameById,
  initialize,
  getAllArticles,
  getCategories,
  getArticles,
  addArticle,
  getArticlesByCategory,
  getArticlesByMinDate,
  getArticleById,
  updateArticle,
  deleteArticle,
  pool
};

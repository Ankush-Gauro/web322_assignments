
// Ankush Gauro : 108593237 
const fs = require('fs');
const path = require('path');

let articles = [];
let categories = [];

// This function will read the contents of the "./data/articles.json" file.
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
// This function will provide the full array of "articles" object whose published property is ‘true’, using the resolve method of the returned promise.
const getPublishedArticles = () => {
    return new Promise((resolve, reject) => {
        const publishedArticles = articles.filter(article => article.published === true);
        if (publishedArticles.length > 0) {
            resolve(publishedArticles);
        } else {
            reject('no results returned');
        }
    });
};

// This function will provide an array of all “articles" objects
const getAllArticles = () => {
    return new Promise((resolve, reject) => {
        if (articles.length > 0) {
            resolve(articles);
        } else {
            reject('no results returned');
        }
    });
};

// This function will provide the full array of "category" objects 
const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject('no results returned');
        }
    });
};

const addArticle = (articleData) => {
  return new Promise((resolve, reject) => {
    articleData.published = articleData.published ? true : false;
    articleData.id = articles.length + 1; // Set ID to the current length + 1
    articles.push(articleData);
    resolve(articleData);
    });
  };

const getArticlesByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const filteredArticles= articles.filter(article=> article.category ==
    category);
    if (filteredArticles.length > 0) resolve(filteredArticles);
    else reject("no results returned");
    });
  };

const getArticlesByMinDate = (minDate) => {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);
    const filteredArticles = articles.filter(article => new
    Date(article.articleate) >= minDate);
    if (filteredArticles.length > 0) resolve(filteredArticles);
    else reject("no results returned");
    });
  };

const getArticleById = (id) => {
  return new Promise((resolve, reject) => {
    const foundArticle = articles.find(article => article.id == id);
    if (foundArticle) {
        resolve(foundArticle);
    } else {
        reject("no result returned");
    }
});
};


module.exports = {
    getArticleById,
    getArticlesByMinDate,
    getArticlesByCategory,
    addArticle,
    initialize,
    getPublishedArticles,
    getAllArticles,
    getCategories
};
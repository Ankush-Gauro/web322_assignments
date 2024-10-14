
// Ankush Gauro : 108593237 
const fs = require('fs');
const path = require('path');

let articles = [];
let categories = [];

// This function will read the contents of the "./data/articles.json" file.
const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'articles.json'), 'utf8', (err, data) => {
            if (err) {
                reject('unable to read articles file');
                return;
            }

            try {
                articles = JSON.parse(data);
            } catch (parseErr) {
                reject('unable to parse articles JSON');
                return;
            }
        });

            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    reject('unable to read categories file');
                    return;
                }

                try {
                    categories = JSON.parse(data);
                    resolve();
                } catch (parseErr) {
                    reject('unable to parse categories JSON');
                }
            });
    });
};

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

module.exports = {
    initialize,
    getPublishedArticles,
    getAllArticles,
    getCategories
};
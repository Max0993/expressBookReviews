const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont requis." });
    }
  
    if (isValid(username)) {
      return res.status(409).json({ message: "Le nom d'utilisateur existe déjà." });
    }
  
    users.push({ username, password });
    return res.status(201).json({ message: "Utilisateur enregistré avec succès !" });
  });
  


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    res.status(200).json(Object.keys(books));
  });
  
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const searchTerm = req.params.author.toLowerCase();
    const results = Object.entries(books)
        .reduce((acc, [id, book]) => {
            if (book.author.toLowerCase().includes(searchTerm)) {
                acc.push({ id, ...book });
            }
            return acc;
        }, []);
    
    results.length 
        ? res.json({ count: results.length, books: results })
        : res.status(404).json({ message: `Auteur "${req.params.author}" non trouvé` });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const searchTerm = req.params.title.toLowerCase();
    const results = Object.entries(books)
        .reduce((acc, [id, book]) => {
            if (book.title.toLowerCase().includes(searchTerm)) {
                acc.push({ id, ...book });
            }
            return acc;
        }, []);
    
    results.length 
        ? res.json({ count: results.length, books: results })
        : res.status(404).json({ message: `Title "${req.params.title}" non trouvé` });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      if (Object.keys(book.reviews).length > 0) {
        res.status(200).json(book.reviews);
      } else {
        res.status(404).json({ message: "No reviews found for ISBN " + isbn });
      }
    } else {
      res.status(404).json({ message: "Book not found with ISBN " + isbn });
    }
});

module.exports.general = public_users;

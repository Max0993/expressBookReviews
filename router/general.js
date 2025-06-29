const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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
  



public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));

});


public_users.get('/books/data', (req, res) => {
  res.status(200).json(books);
});


public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('https://maximemarcel-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/data');
    res.status(200).json({
      success: true,
      message: "Liste des livres récupérée avec Axios",
      books: response.data
    });
  } catch (error) {
    console.error("Erreur lors de la récupération avec Axios:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


  public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    const book = books[isbn];
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: "Livre non trouvé" });
    }
});
  



public_users.get('/axios/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;

  try {
    const response = await axios.get(`https://maximemarcel-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`);

    res.status(200).json({
      success: true,
      message: `Détails du livre pour ISBN ${isbn} récupérés avec Axios`,
      book: response.data
    });
  } catch (error) {
    console.error("Erreur Axios ISBN:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur ou livre introuvable" 
    });
  }
});

    
  

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


public_users.get('/axios/author/:author', async (req, res) => {
    const searchTerm = req.params.author.toLowerCase();
    try {
        const response = await axios.get('https://maximemarcel-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai//books/data'); // ✅ utilisez le port local ici
        const books = response.data;
        const results = Object.entries(books).reduce((acc, [id, book]) => {
            if (book.author.toLowerCase().includes(searchTerm)) {
                acc.push({ id, ...book });
            }
            return acc;
        }, []);
        if (results.length > 0) {
            res.status(200).json({ count: results.length, books: results });
        } else {
            res.status(404).json({ message: `Aucun livre trouvé pour l’auteur "${req.params.author}"` });
        }
    } catch (error) {
        console.error("Erreur Axios:", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});
  


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


public_users.get('/axios/title/:title', async (req, res) => {
    const searchTerm = req.params.title.toLowerCase();

    try {
        const response = await axios.get('https://maximemarcel-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/data');
        const books = response.data;

        const results = Object.entries(books)
            .reduce((acc, [id, book]) => {
                if (book.title.toLowerCase().includes(searchTerm)) {
                    acc.push({ id, ...book });
                }
                return acc;
            }, []);

        if (results.length > 0) {
            res.status(200).json({ count: results.length, books: results });
        } else {
            res.status(404).json({ message: `Aucun livre trouvé avec le titre "${req.params.title}"` });
        }
    } catch (error) {
        console.error("Erreur Axios:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});




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

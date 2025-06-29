// expressBookReviews/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [];


const createSampleUser = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);
  users.push({
    username: "maxime",
    password: hashedPassword
  });
};
createSampleUser();


const isValid = (username) => users.some(user => user.username === username);


const authenticatedUser = async (username, password) => {
  const user = users.find(u => u.username === username);
  if (!user) return false;
  return await bcrypt.compare(password, user.password);
};


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: "MISSING_TOKEN",
      message: "Authorization token required" 
    });
  }

  jwt.verify(token, "fallback_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: "INVALID_TOKEN",
        message: "Invalid or expired token" 
      });
    }
    req.user = user;
    next();
  });
};


regd_users.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: "MISSING_CREDENTIALS",
        message: "Username and password are required" 
      });
    }

    const isAuthenticated = await authenticatedUser(username, password);
    if (!isAuthenticated) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { username },
      "fallback_secret_key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      username
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
});


regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  try {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username;

    if (!review) {
      return res.status(400).json({
        success: false,
        error: "MISSING_REVIEW",
        message: "Review content is required"
      });
    }

    if (!books[isbn]) {
      return res.status(404).json({
        success: false,
        error: "BOOK_NOT_FOUND",
        message: "Book not found"
      });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
      success: true,
      message: "Review added/updated successfully",
      data: { isbn, username, review }
    });
  } catch (error) {
    console.error("Review error:", error);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
});


regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
    try {
      const { isbn } = req.params;
      const username = req.user.username;
  
      if (!books[isbn]) {
        return res.status(404).json({
          success: false,
          error: "BOOK_NOT_FOUND",
          message: "Livre non trouvé"
        });
      }
  
      if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({
          success: false,
          error: "REVIEW_NOT_FOUND",
          message: "Critique de cet utilisateur non trouvée"
        });
      }
  
      
      delete books[isbn].reviews[username];
  
      return res.status(200).json({
        success: true,
        message: "Critique supprimée avec succès",
        data: {
          isbn,
          username
        }
      });
    } catch (error) {
      console.error("Delete review error:", error);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Erreur serveur interne"
      });
    }
  });
  

module.exports = {
  authenticated: regd_users,
  isValid,
  users,
  authenticatedUser
};


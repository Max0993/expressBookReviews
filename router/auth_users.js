const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Enhanced user storage with password hashing
let users = [];

// Add sample user with hashed password
const createSampleUser = async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);
  users.push({
    username: "maxime",
    password: hashedPassword
  });
};
createSampleUser();

// Utility functions
const isValid = (username) => users.some(user => user.username === username);

const authenticatedUser = async (username, password) => {
  const user = users.find(u => u.username === username);
  if (!user) return false;
  return await bcrypt.compare(password, user.password);
};

// JWT Authentication Middleware
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

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key", (err, user) => {
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

// Login endpoint
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
      process.env.JWT_SECRET || "fallback_secret_key", 
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

// Review endpoint
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  try {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username; // From verified token

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

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
      success: true,
      message: "Review added/updated successfully",
      data: {
        isbn,
        username,
        review
      }
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

module.exports = {
  authenticated: regd_users,
  isValid,
  users,
  authenticatedUser
};

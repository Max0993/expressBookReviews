const express = require('express');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Middleware d'authentification JWT pour toutes les routes commençant par /customer/auth/*
app.use("/customer/auth/*", (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }
    req.user = user;
    next();
  });
});

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

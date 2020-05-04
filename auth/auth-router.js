const router = require('express').Router();
const db = require("../database/dbConfig");
const status = require("http-status-codes");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

router.post('/register', checkAuthBody, (req, res) => {
  db("users")
    .insert(req.credentials)
    .then(([ind]) => {
      res.status(status.CREATED).json({
        message: "logged in!",
        index: ind,
        token: jwt.sign(req.credentials.password, process.env.SECRET),
      });
    })
});

router.post('/login', checkAuthBody, (req, res) => {
  // implement login
});

function checkAuthBody(req, res, next) {
  if (typeof req.body === "object") {
    if (typeof req.body.username === "string"
      && typeof req.body.password === "string") {
        req.credentials = {
          username: req.body.username,
          password: bcrypt.hashSync(req.body.password, 12),
        };
        next()
    } else {
      res.status(status.BAD_REQUEST).json({error: "Request body missing username or password strings"})
    }
  } else {
    res.status(status.BAD_REQUEST).json({error: "Request missing body"})
  }
}

module.exports = router;

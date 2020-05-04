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
        message: "Registered!",
        index: ind,
        token: sign(req.credentials),
      });
    })
    .catch(() => { res.status(status.INTERNAL_SERVER_ERROR).json({error: "Error registering user"}) })
});

router.post('/login', checkAuthBody, (req, res) => {
  db("users")
    .where({username: req.body.username})
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        res.status(status.OK).json({
          message: "Logged in!",
          user: {
            id: user.id,
            username: user.username,
          },
          token: sign(req.credentials),
        });
      } else {
        res.status(status.UNAUTHORIZED).json({error: "Username or Password is incorrect"})
      }
    })
    .catch(() => { res.status(status.UNAUTHORIZED).json({error: "Username or Password is incorrect"}) })
});

function checkAuthBody(req, res, next) {
  if (typeof req.body === "object") {
    if (typeof req.body.username === "string"
      && typeof req.body.password === "string") {
        req.credentials = {
          username: req.body.username,
          password: hash(req.body.password),
        };
        next()
    } else {
      res.status(status.BAD_REQUEST).json({error: "Request body missing username or password strings"})
    }
  } else {
    res.status(status.BAD_REQUEST).json({error: "Request missing body"})
  }
}

function hash(password) {
  return bcrypt.hashSync(password, 12);
}

function sign(creds) {
  return jwt.sign(creds, process.env.JWT_SECRET, {expiresIn: "1d"})
}

module.exports = router;

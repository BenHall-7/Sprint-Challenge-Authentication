const db = require("../database/dbConfig");
const status = require("http-status-codes");

module.exports = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.headers.authorization, process.env.SECRET);
      db("users")
        .where({username: decoded.username, password: decoded.password})
        .then(([user]) => {
          req.user = user;
          next()
        })
        .catch(() => { res.status(status.UNAUTHORIZED).json({ you: 'shall not pass!' }); })
  } catch {
    res.status(status.UNAUTHORIZED).json({ you: 'shall not pass!' });
  }
};

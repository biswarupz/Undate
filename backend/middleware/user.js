const jwt = require("jsonwebtoken");
const JWT_KEY = require("../config");

function userAuthMiddleware(req, res, next) {
  const token = req.headers.authorization;
  const word = token.split(" ");
  const jwtToken = word[1];
  try {
    const decodeValue = jwt.verify(jwtToken, JWT_KEY);
    if (decodeValue.email) {
      req.email = decodeValue.email;
      next();
    } else {
      res.status(403).json({ message: "User not authenticated" });
    }
  } catch (error) {
    res.json({ message: "Invalid user input" });
  }
}

module.exports = userAuthMiddleware;

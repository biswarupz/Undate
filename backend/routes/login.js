const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../db/db");
const { JWT_KEY } = require("../config");
const router = express.Router();

// LOGIN ROUTE
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const alreadyUser = await User.findOne({ email: email });

  if (!alreadyUser) {
    return res.send({ error: "User doesn't exists!!" });
  }

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      const token = jwt.sign({ email }, JWT_KEY);
      return res.send({ status: "ok", data: token });
    } else {
      return res.send({ error: "Wrong password" });
    }
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;

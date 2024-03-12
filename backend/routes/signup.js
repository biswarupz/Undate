const express = require("express");
const zod = require("zod");
const { User } = require("../db/db");
const router = express.Router();

const usernameSchema = zod.string();
const emailSchema = zod.string().email();
const genderSchema = zod.string();
const passwordSchema = zod.string().min(6);
const date = new Date();

router.post("/", async (req, res) => {
  const { username, email, gender, password } = req.body;
  console.log(username);
  const usernameRes = usernameSchema.safeParse(username);
  const emailRes = emailSchema.safeParse(email);
  const genderRes = genderSchema.safeParse(gender);
  const passwordRes = passwordSchema.safeParse(password);
  if (
    !usernameRes.success ||
    !emailRes.success ||
    !passwordRes.success ||
    !genderRes.success
  ) {
    console.log("invalid user details");
    res.send({ status: 403, data: "invalid input" });
  } else {
    try {
      const email_exists = await User.findOne({ email });
      const username_exists = await User.findOne({ username });

      if (email_exists) {
        console.log("email existed");
        return res.send({ status: 409, data: "email already used" });
      } else if (username_exists) {
        return res.send({ status: 408, data: "username already taken" });
      } else {
        const newUser = await User.create({
          username,
          email,
          gender,
          password,
          account_create_time: date,
        });
        console.log(newUser);
        return res.send({ status: 200, data: "signup successful" });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

module.exports = router;

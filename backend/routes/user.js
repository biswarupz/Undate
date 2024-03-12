const express = require("express");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const { User, Post } = require("../db/db");
const { JWT_KEY } = require("../config");
const router = express.Router();
// MIDDLEEARE
const userAuthMiddleware = require("../middleware/user");

// USER DATA ROUTE // PROFILE PAGE
router.post("/userdata", async (req, res) => {
  const { token } = req.body;

  try {
    const user = jwt.verify(token, JWT_KEY);
    const userEmail = user.email;

    User.findOne({ email: userEmail }).then((data) => {
      return res.send({ status: "ok", data: data });
    });
  } catch (error) {
    return res.send({ error: error });
  }
});
// BIO UPDATE // PROFILE PAGE
router.post("/bioupdate", async (req, res) => {
  const username = req.query.username;
  const { bio } = req.body;

  try {
    const updatestaus = await User.updateOne(
      { username: username },
      { $set: { biography: bio } }
    );
    if (updatestaus) {
      return res.send({ status: "ok" });
    } else {
      return res.send({ status: 404 });
    }
  } catch (e) {
    console.log(e);
  }
});
router.post("/updateimage", async (req, res) => {
  const { username, image } = req.body;

  try {
    const success = await User.updateOne(
      { username: username },
      { $set: { picture: image } }
    );
    if (!success) {
      return res.send({ status: 403, data: "server error" });
    }
    return res.send({ status: 200, data: "image uploaded" });
  } catch (e) {
    console.log(e);
    return res.send({ status: 409, data: e });
  }
});

// ALL POSTS // HOME PAGE
router.get("/home", async (req, res) => {
  try {
    const posts = await Post.find({});
    if (posts) {
      return res.send({ status: "ok", data: posts });
    } else {
      return res.send({ status: "err" });
    }
  } catch (e) {
    console.log(e);
  }
});
// USER ACCOUNTS FROM HOME PAGE // HOME PAGE
router.post("/user", async (req, res) => {
  const username = req.query.username;
  try {
    const data = await User.findOne({ username });
    if (data) {
      return res.send({ status: "ok", data: data });
    } else {
      return res.send({ status: 404 });
    }
  } catch (error) {
    console.log(error);
  }
});

// FOLLOW FOLLOWING LOGIC // USER
router.post("/follow", async (req, res) => {
  const { otherUser, mainUser } = req.body;

  try {
    const user = await User.findOne({ username: mainUser });
    const other_user = await User.findOne({ username: otherUser });

    if (!user) {
      return res.status({ error: "user not found " });
    }
    const followIndex = user.followings.indexOf(otherUser);

    if (followIndex === -1) {
      user.followings.push(otherUser);
      other_user.followers.push(mainUser);
    } else {
      user.followings.splice(followIndex, 1);
      other_user.followers.splice(followIndex, 1);
    }
    await user.save();
    await other_user.save();
    return res.send({ status: "ok" });
  } catch (error) {
    console.log(error);
  }
});
//USER SEARCH
router.post("/search", async (req, res) => {
  const { username } = req.body;
  let users = [];

  try {
    const matchingUsers = await User.find({
      username: { $regex: new RegExp(username, "i") },
    });

    if (matchingUsers.length === 0) {
      return res.send({ status: 403, message: "No matching users found" });
    }

    matchingUsers.forEach((user) => {
      const name = user.username;
      const picture = user.picture;
      const data = { name, picture };
      users.push(data);
    });

    return res.send({ status: "ok", data: users });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: 500, message: "Internal Server Error" });
  }
});
// SENDS PROFILE PICTURE OF A USER
router.post("/profilepic", async (req, res) => {
  const { username } = req.body;

  const data = await User.findOne({ username: username });
  if (!data) {
    return res.send({ status: 404, data: "not found" });
  }
  const picture = data?.picture;
  return res.send({ status: 200, data: picture });
});
// DELETE ACCOUNT
router.post("/deleteaccount", async (req, res) => {
  const { username } = req.body;

  await User.deleteOne({ username: username });
  const postDeletion = await Post.deleteMany({ username: username });
  if (!postDeletion) {
    return res.send({ status: 404, data: "user not found" });
  }
  return res.send({ status: 200, data: "user account deleted successfuly" });
});
// DELETE BYTE POST
router.post("/deletepost", async (req, res) => {
  const { id } = req.body;
  const deletion = await Post.deleteOne({ _id: id });
  if (!deletion) {
    return res.send({ status: 404, data: "post not found" });
  }
  return res.send({ status: 200, data: "post deleted successfuly" });
});

module.exports = router;

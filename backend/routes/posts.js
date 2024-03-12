const express = require("express");
const { User, Post } = require("../db/db");
const router = express.Router();
const date = new Date();
router.post("/create", async (req, res) => {
  const username = req.query.username;
  const { byte } = req.body;
  try {
    const post = await Post.create({
      username: username,
      post: byte,
      post_create_time: date,
    });
    if (post) {
      const success = await User.updateOne(
        {
          username: username,
        },
        {
          $push: {
            posts: post._id,
          },
        }
      );
      if (success) {
        return res.send({ status: "ok" });
      } else {
        throw new Error("Failed to update user document");
      }
    } else {
      throw new Error("Failed to create post");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error" });
  }
});

// SENDING POSTED BYTES // PROFILE PAGE
router.post("/posts", async (req, res) => {
  try {
    const { posts } = req.body;

    const postData = await Post.find({ _id: { $in: posts } });
    if (postData.length) {
      res.send({ data: postData });
    } else {
      res.send({ data: [], message: "No posts found with given IDs" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// POST LIKED BY USERS // GENERAL
router.post("/like", async (req, res) => {
  const { postId, username } = req.body;

  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.send({ status: "error" });
    }
    const likedIndex = post.liked_by.indexOf(username);

    if (likedIndex === -1) {
      post.liked_by.push(username);
    } else {
      post.liked_by.splice(likedIndex, 1);
    }
    const updatedPost = await post.save();

    return res.send({ status: "ok", data: updatedPost });
  } catch (e) {
    console.log(e);
    return res.send({ status: "error" });
  }
});

module.exports = router;

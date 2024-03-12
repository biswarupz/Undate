const mongoose = require("mongoose");
const { string } = require("zod");
mongoose.connect(
  "mongodb+srv://admin:Sayu1fyqWVxa8iMz@test-cluster-1.qiqhvln.mongodb.net/undate_db"
);
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  gender: String,
  password: String,
  picture: String,
  biography: String,
  account_create_time: Date,
  followers: Array,
  followings: Array,
  posts: [{}],
});
const PostSchema = new mongoose.Schema({
  username: String,
  post: String,
  post_create_time: Date,
  liked_by: Array,
});
const User = mongoose.model("User", UserSchema);
const Post = mongoose.model("Post", PostSchema);
module.exports = {
  User,
  Post,
};

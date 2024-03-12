const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./routes/user");
const signUpRouter = require("./routes/signup");
const loginRouter = require("./routes/login");
const postRouter = require("./routes/posts");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json({ limit: "20mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true,
    parameterLimit: 20000,
  })
);
app.use(bodyParser.text({ limit: "20mb" }));
app.use(express.json());
const port = 3000;
app.get("/", (req, res) => {
  res.json({ message: "serverApi is live" });
});
app.use("/api/signup", signUpRouter);
app.use("/api/login", loginRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

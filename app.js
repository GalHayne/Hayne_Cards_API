require("dotenv/config");
const config = require("config");
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const cardsRouter = require("./routes/cards");
require("winston-mongodb");
const chalk = require("chalk");
const cors = require("cors");

mongoose
  .connect(config.get("mongoDB.MONGO_URL"))
  .then(() => console.log(chalk.magenta("connected to db successfully")))
  .catch((err) => console.log(chalk.red("could not connect to db", err)));

const app = express();
app.use(
  morgan(
    chalk.cyanBright(`Request Data => DATE: :date[web] => METHOD: :method => URL: :url => STATUS: :status => RESPONSE TIME: :response-time ms`)
  )
);
app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/cards", cardsRouter);
app.use(express.static("public"));

app.all("*", (req, res) => {
  res.status(404).send("404 Page not found");
});


app.listen(config.get("server.PORT"), () =>
  console.log(chalk.yellow(`Listening on port ${config.get("server.PORT")}`))
);

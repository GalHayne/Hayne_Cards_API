const router = require("express").Router();
const { User, validateUsers, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { Card } = require("../models/card");
const {
  checkIsAdmin,
  currentUser,
  onlyCurrUser,
} = require("../middleware/permissions");
const { checkIfUserBlock } = require("../blockUserUtil/checkIfUserBlock");
const { diff_hours } = require("../blockUserUtil/diff_hours");
const { unBlockTheuser } = require("../blockUserUtil/unBlockTheUser");
const { incWrongAttempts } = require("../blockUserUtil/incWrongAttempts");
const { logToFile } = require("../logFileUtil/logToFile");

const BLOCK_TIME = 24;

router.get("/", auth, checkIsAdmin, async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

router.post("/", async (req, res) => {
  try {
    const { error } = validateUsers(req.body);
    if (error) {
      logToFile("ERROR", `Method: ${req.method} URL: ${req.originalUrl}, Description:${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }
    
    if (req?.body?.bizNumber) {
      let user = await User.findOne({ bizNumber: req?.body?.bizNumber });
      if (user) {
        logToFile("ERROR", `Method: ${req.method}, URL: ${req.originalUrl}, Description: The biz number is exist please try another number`);
        return res
        .status(500)
        .json({ error: "The biz number is exist please try another number" });
      }
    }
    
    const newUser = new User(req.body);
    newUser.password = await bcrypt.hash(newUser.password, 12);
    const result = await newUser.save();
    res.status(201).json(result);
  } catch (error) {
    logToFile("ERROR", `Method: ${req.method} URL: ${req.originalUrl}, Description: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    logToFile("ERROR", `Method: ${req.method}, URL: ${req.originalUrl}, Description: ${error.details[0].message}`);
    res.status(400).json(error.details[0].message);
    return;
  }
  const user = await User.findOne({ email: req.body.email });
  if (checkIfUserBlock(user)) {
    diff_hours(new Date(),user?.wrongAttempts[user?.wrongAttempts.length - 1]) > BLOCK_TIME
    ? 
    unBlockTheuser(user)
    :
    logToFile("ERROR", `Method: ${req.method}, URL: ${req.originalUrl}, Description: The user is block to 24 please try log in later`);
    return res.status(400).send("The user is block to 24 please try log in later");
      
  }
  if (!user) {
    logToFile("ERROR", `Method: ${req.method}, URL: ${req.originalUrl}, Description: Invalid email or password`);
    res.status(400).send("Invalid email or password");
    return;
  }

  const isPasswordValid = await bcrypt.compare(req.body.password,user.password);
  if (!isPasswordValid) {
    logToFile("ERROR", `Method: ${req.method}, URL: ${req.originalUrl}, Description: Invalid email or password`);
    if (incWrongAttempts(user)) {
      return res.status(400).send("The user is block to 24 please try log in later");
    } else {
      return res.status(400).send("Invalid email or password");
    }
  }
  user.wrongAttempts = [];
  user.save();
  const token = user.generateAuthToken();
  res.send({ token });
});

const getCards = async (cardsArray) => {
  const cards = await Card.find({ bizNumber: { $in: cardsArray } });
  return cards;
};

router.get("/cards", auth, async (req, res) => {
  if (!req.query.numbers) res.status(400).send("Missing numbers data");

  let data = {};
  data.cards = req.query.numbers.split(",");

  const cards = await getCards(data.cards);
  res.send(cards);
});

router.patch("/cards", auth, async (req, res) => {
  const { error } = validateCards(req.body);
  if (error) res.status(400).send(error.details[0].message);

  const cards = await getCards(req.body.cards);
  if (cards.length != req.body.cards.length)
    return res.status(400).send("Card numbers don't match");

  let user = await User.findById(req.user._id);
  user.cards = req.body.cards;
  user = await user.save();
  res.send(user);
});

router.get("/:id", auth, currentUser, async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    if (user) {
      res.status(201).json(user);
    } else {
      res.status(404).send("No such user exists in the system");
    }
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
});

router.put("/:id", auth, onlyCurrUser, async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user && user?.id !== req?.params?.id) {
    return res
      .status(500)
      .json({ error: "The email is exist please try another email" });
  }
  const { error } = validateUsers(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  if (req?.body?.bizNumber) {
    if (!req?.user?.isAdmin) {
      return res
        .status(500)
        .json({ error: "Only admin can change biz number" });
    }

    let user = await User.findOne({ bizNumber: req.body.bizNumber });
    if (user && user?.id !== req?.params?.id) {
      return res
        .status(500)
        .json({ error: "The biz number is exist please try another number" });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updatedUser) {
    return res.status(404).json({ error: "User not found" });
  }
  updatedUser.password = await bcrypt.hash(updatedUser.password, 12);
  const result = await updatedUser.save();
  return res.status(201).json(result);
});

router.patch("/:id", auth, onlyCurrUser, async (req, res) => {
  let user = await User.findOne({ _id: req.params.id });

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  user.biz = !user.biz;

  user.save();

  res.send(user);
});

router.delete("/:id", auth, currentUser, async (req, res) => {
  const user = await User.findOneAndRemove({ _id: req.params.id });

  if (!user) return res.status(404).send("No such user exists in the system");
  res.status(201).send("The User deleted successfully");
});

module.exports = router;

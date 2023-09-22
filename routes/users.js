const router = require("express").Router();
const { User, validateUsers, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
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

router.post("/", async (req, res) => {
  try {
    const { error } = validateUsers(req.body);
    if (error) {
      logToFile("ERROR", req.method, req.originalUrl, error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req?.body?.bizNumber) {
      let user = await User.findOne({ bizNumber: req?.body?.bizNumber });
      const errMsg = "The biz number is exist please try another number";
      if (user) {
        logToFile("ERROR", req.method, req.originalUrl, errMsg);
        return res.status(500).json({ error: errMsg });
      }
    }

    const newUser = new User(req.body);
    newUser.password = await bcrypt.hash(newUser.password, 12);
    const result = await newUser.save();
    return res.status(201).json(result);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, error.message);
    return res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    logToFile("ERROR", req.method, req.originalUrl, error.details[0].message);
    res.status(400).json(error.details[0].message);
    return;
  }
  const user = await User.findOne({ email: req.body.email });
  const blockMsg = "The user is block to 24 please try log in later";
  const invalidUserMsg = "Invalid email or password";
  if (checkIfUserBlock(user)) {
    diff_hours(
      new Date(),
      user?.wrongAttempts[user?.wrongAttempts.length - 1]
    ) > BLOCK_TIME
      ? unBlockTheuser(user)
      : logToFile("ERROR", req.method, req.originalUrl, blockMsg);
    return res.status(400).send(blockMsg);
  }
  if (!user) {
    logToFile("ERROR", req.method, req.originalUrl, invalidUserMsg);
    return res.status(400).send(invalidUserMsg);
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordValid) {
    if (incWrongAttempts(user)) {
      logToFile("ERROR", req.method, req.originalUrl, blockMsg);
      return res.status(400).send(blockMsg);
    } else {
      logToFile("ERROR", req.method, req.originalUrl, invalidUserMsg);
      return res.status(400).send(invalidUserMsg);
    }
  }
  user.wrongAttempts = [];
  user.save();
  const token = user.generateAuthToken();
  res.send({ token });
});

router.get("/", auth, checkIsAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, error);
    res.status(401).send(error);
  }
});

router.get("/:id", auth, currentUser, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    return res.status(201).json(user);
  } catch (error) {
    const userErrorMsg = "No such user exists in the system";
    logToFile("ERROR", req.method, req.originalUrl, userErrorMsg);
    return res.status(404).send(userErrorMsg);
  }
});

router.put("/:id", auth, onlyCurrUser, async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user && user?.id !== req?.params?.id) {
      const dupMailMsg = "The email is exist please try another email";
      logToFile("ERROR", req.method, req.originalUrl, dupMailMsg);
      return res.status(500).json({ error: dupMailMsg });
    }
    const { error } = validateUsers(req.body);
    if (error) {
      logToFile("ERROR", req.method, req.originalUrl, error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req?.body?.bizNumber) {
      if (!req?.user?.isAdmin) {
        const changeBizMsg = "Only admin can change biz number";
        logToFile("ERROR", req.method, req.originalUrl, changeBizMsg);
        return res.status(500).json({ error: changeBizMsg });
      }

      let user = await User.findOne({ bizNumber: req.body.bizNumber });
      if (user && user?.id !== req?.params?.id) {
        const bizExistMsg = "The biz number is exist please try another number";
        logToFile("ERROR", req.method, req.originalUrl, bizExistMsg);
        return res.status(500).json({ error: bizExistMsg });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      const noUserMsg = "User not found";
      logToFile("ERROR", req.method, req.originalUrl, noUserMsg);
      return res.status(404).json({ error: noUserMsg });
    }
    updatedUser.password = await bcrypt.hash(updatedUser.password, 12);
    const result = await updatedUser.save();
    return res.status(201).json(result);
  } catch (err) {
    const ErrorMSg = "Update user request fail";
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
  }
});

router.patch("/:id", auth, onlyCurrUser, async (req, res) => {
  const ErrorMSg = "Toogle biz this user request fail";
  const foundUserMsg = "No such user exists in the system";
  try {
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logToFile("ERROR", req.method, req.originalUrl, foundUserMsg);
      return res.status(404).send(foundUserMsg);
    }
    user.biz = !user.biz;
    user.save();
    return res.status(201).send(user);
  } catch (err) {
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    return res.status(404).send(ErrorMSg);
  }
});

router.delete("/:id", auth, currentUser, async (req, res) => {
  const ErrorMSg = "Delete this user request fail";
  const foundUserMsg = "No such user exists in the system";
  try {
    const user = await User.findOneAndRemove({ _id: req.params.id });
    if (!user) {
      logToFile("ERROR", req.method, req.originalUrl, foundUserMsg);
      return res.status(404).send(foundUserMsg);
    }
    return res.status(201).send("The User deleted successfully");
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    return res.status(404).send(ErrorMSg);
  }
});

module.exports = router;

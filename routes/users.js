const router = require("express").Router();
const { User, validateUsers, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const auth = require("../middleware/auth");
const {logToFile} = require("../utility/logFiles/logToFile")

const { checkIsAdmin,currentUser,onlyCurrUser} = require("../middleware/permissions");
const { checkIfUserBlock } = require("../utility/blockUser/checkIfUserBlock")
const { diff_hours } = require("../utility/blockUser/diff_hours");
const { unBlockTheuser } = require("../utility/blockUser/unBlockTheUser");
const { incWrongAttempts } = require("../utility/blockUser/incWrongAttempts");
const { getRequestFailed } = require("../utility/failedMsg/requestFailed");
const {getNotFoundMsg} = require("../utility/failedMsg/foundObjectFailed");
const {duplicateKeyMsg} = require("../utility/failedMsg/duplicateKey");
const {getPermissionsMsg} = require("../utility/failedMsg/permissionsMsg");

const notFoundUser = getNotFoundMsg("user");
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
      if (user) {
        logToFile("ERROR", req.method, req.originalUrl, duplicateKeyMsg("biz number"));
        return res.status(500).json({ error: duplicateKeyMsg("biz number") });
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
    if (!user){
      logToFile("ERROR", req.method, req.originalUrl, notFoundUser);
      return res.status(404).send(notFoundUser);
    }
    return res.status(201).json(user);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("update","user"));
    return res.status(404).send( getRequestFailed("update","user"));
  }
});

router.put("/:id", auth, onlyCurrUser, async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user && user?.id !== req?.params?.id) {
      logToFile("ERROR", req.method, req.originalUrl, duplicateKeyMsg("email"));
      return res.status(500).json({ error: duplicateKeyMsg("email") });
    }
    const { error } = validateUsers(req.body);
    if (error) {
      logToFile("ERROR", req.method, req.originalUrl, error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req?.body?.bizNumber) {
      if (!req?.user?.isAdmin) {
        logToFile("ERROR", req.method, req.originalUrl, getPermissionsMsg("change biz number"));
        return res.status(500).json({ error: changeBizMsg });
      }

      let user = await User.findOne({ bizNumber: req.body.bizNumber });
      if (user && user?.id !== req?.params?.id) {
        logToFile("ERROR", req.method, req.originalUrl, duplicateKeyMsg("biz number"));
        return res.status(500).json({ error: duplicateKeyMsg("biz number") });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      logToFile("ERROR", req.method, req.originalUrl, notFoundUser);
      return res.status(404).json({ error: notFoundUser });
    }
    updatedUser.password = await bcrypt.hash(updatedUser.password, 12);
    const result = await updatedUser.save();
    return res.status(201).json(result);
  } catch (err) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("update","user"));
  }
});

router.patch("/:id", auth, onlyCurrUser, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.params.id });
    if (!user) {
      logToFile("ERROR", req.method, req.originalUrl, notFoundUser);
      return res.status(404).send(notFoundUser);
    }
    user.biz = !user.biz;
    user.save();
    return res.status(201).send(user);
  } catch (err) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("toggle biz","user"));
    return res.status(404).send(getRequestFailed("toggle biz","user"));
  }
});

router.delete("/:id", auth, currentUser, async (req, res) => {
  try {
    const user = await User.findOneAndRemove({ _id: req.params.id });
    if (!user) {
      logToFile("ERROR", req.method, req.originalUrl, notFoundUser);
      return res.status(404).send(notFoundUser);
    }
    return res.status(201).send("The User deleted successfully");
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("delete","user"));
    return res.status(404).send(getRequestFailed("delete","user"));
  }
});

module.exports = router;

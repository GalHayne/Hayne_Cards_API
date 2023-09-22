const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { checkIfUserBlock } = require("../utility/blockUser/checkIfUserBlock");
const { diff_hours } = require("../utility/blockUser/diff_hours");
const { unBlockTheuser } = require("../utility/blockUser/unBlockTheUser");
const { incWrongAttempts } = require("../utility/blockUser/incWrongAttempts");

const BLOCK_TIME = 24;

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).json(error.details[0].message);
    return;
  }
  const user = await User.findOne({ email: req.body.email });
  if (checkIfUserBlock(user)) {
      diff_hours(new Date(),user?.wrongAttempts[user?.wrongAttempts.length - 1]) > BLOCK_TIME ? unBlockTheuser(user) : res.status(400).send("The user is block to 24 please try log in later");
  }
  if (!user) {
    res.status(400).send("Invalid email or password");
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordValid) {
    if (incWrongAttempts(user)){
      res.status(400).send("The user is block to 24 please try log in later");
    }else{
      res.status(400).send("Invalid email or password");
    }
    return;
  }
  user.wrongAttempts = [];
  user.save();
  const token = user.generateAuthToken();
  res.send({ token });
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });
  return schema.validate(user);
}

module.exports = router;

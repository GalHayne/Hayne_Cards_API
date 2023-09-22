const config = require("config");
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },
    middle: {
      type: String,
      minlength: 0,
      maxlength: 255,
      default: "",
    },
    last: {
      type: String,
      minlength: 2,
      maxlength: 255,
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  phone: {
    type: String,
    minlength: 9,
    maxlength: 10,
  },
  email: {
    type: String,
    minlength: 6,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 1024,
  },
  image: {
    url: {
      type: String,
      minlength: 0,
      maxlength: 1024,
      default: "",
    },
    alt: {
      type: String,
      minlength: 0,
      maxlength: 1024,
      default: "",
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  address: {
    state: {
      type: String,
      minlength: 0,
      maxlength: 400,
      default: "",
    },
    country: {
      type: String,
      minlength: 2,
      maxlength: 400,
    },
    city: {
      type: String,
      minlength: 2,
      maxlength: 400,
    },
    street: {
      type: String,
      minlength: 0,
      maxlength: 400,
      default: "",
    },
    houseNumber: {
      type: String,
      minlength: 0,
      maxlength: 8,
      default: "",
    },
    zip: {
      type: String,
      minlength: 0,
      maxlength: 14,
      default: "",
    },
    _id: {
      type: mongoose.Types.ObjectId,
      default: new mongoose.mongo.ObjectId(),
    },
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  biz: {
    type: Boolean,
    default: false,
  },
  bizNumber: {
    type: String, // Change the data type to String
  },
  createdAt: { type: Date, default: Date.now },
  blockedUser: {
    type: Boolean,
    default: false,
  },
  wrongAttempts: { type: Array, default: null },
  cards: Array,
});
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, biz: this.biz, isAdmin: this.isAdmin, email: this.email },
    "MYSECRET" || error("JWT_SECRET environment variable is empty")
  );
  return token;
};

const User = mongoose.model("User", userSchema, "users");

function validateUsers(user) {
  const schema = Joi.object({
    name: Joi.object({
      first: Joi.string().min(2).max(255),
      middle: Joi.string().min(2).max(255),
      last: Joi.string().min(2).max(255),
    }),
    phone: Joi.string()
      .min(9)
      .max(12)
      .required()
      .regex(/^0[2-9]\d{7,8}$/),
    email: Joi.string().min(6).max(255).email().required(),
    password: Joi.string().min(6).max(1024).required(),
    address: Joi.object({
      state: Joi.string().allow(""),
      country: Joi.string().min(2).max(400),
      city: Joi.string().min(2).max(400),
      street: Joi.string().min(2).max(400),
      houseNumber: Joi.string().min(1).max(8),
      zip: Joi.string().min(1).max(14),
    }),
    isAdmin: Joi.boolean(),
    biz: Joi.boolean(),
    bizNumber: Joi.string().min(0).max(10000),
  });
  return schema.validate(user);
}
function validateCards() {
  const schema = Joi.object({
    cards: Joi.array().min(1).required(),
  });
  return schema.validate(cards);
}

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });
  return schema.validate(user);
}

module.exports = { User, validateUsers, validateCards, validate };

const Joi = require("joi");
const mongoose = require("mongoose");
const _ = require("lodash");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  subtitle: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1024,
  },
  phone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 10,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    unique: false,
  },
  web: {
    type: String,
    minlength: 0,
    maxlength: 255,
    default: "",
  },
  image: {
    url: {
      type: String,
      minlength: 11,
      maxlength: 1024,
    },
    alt: {
      type: String,
      minlength: 2,
      maxlength: 1024,
    },
  },
  address: {
    state: {
      type: String,
      minlength: 0,
      maxlength: 255,
      default: "",
    },
    country: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    street: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    houseNumber: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 8,
    },
    zip: {
      type: String,
      minlength: 1,
      maxlength: 14,
    },
  },
  bizNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 999_999_999,
    unique: true,
  },
  likes: {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  createdAt: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Card = mongoose.model("Card", cardSchema, "cards");

function validateCard(card) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    subtitle: Joi.string().min(2).max(255).required(),
    description: Joi.string().min(2).max(1024).required(),
    phone: Joi.string()
      .min(9)
      .max(10)
      .required()
      .regex(/^0[2-9]\d{7,8}$/),
    email: Joi.string().min(11).max(1024).required().email({ tlds: false }),
    web: Joi.string().min(11).max(1024),
    image: Joi.object({
      url: Joi.string().min(11).max(1024).required(),
      alt: Joi.string().min(2).max(1024).required(),
    }),
    address: Joi.object({
      state: Joi.string().allow(""),
      country: Joi.string().min(2).max(255).required(),
      city: Joi.string().min(2).max(255).required(),
      street: Joi.string().min(2).max(255).required(),
      houseNumber: Joi.string().min(1).max(8).required(),
      zip: Joi.string().min(1).max(14).empty(""),
    }),
  });

  return schema.validate(card);
}

async function generateBizNumber() {
  while (true) {
    let randomNumber = _.random(1000, 999_999_999);
    let card = await Card.findOne({ bizNumber: randomNumber });
    if (!card) return String(randomNumber);
  }
}

module.exports = {
  Card,
  validateCard,
  generateBizNumber,
};

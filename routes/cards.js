const router = require("express").Router();
const auth = require("../middleware/auth");
const { validateCard, Card, generateBizNumber } = require("../models/card");
const { isBiz } = require("../middleware/permissions");
const {logToFile} = require("../utility/logFiles/logToFile")
const { getRequestFailed } = require("../utility/failedMsg/requestFailed");
const {getNotFoundMsg} = require("../utility/failedMsg/foundObjectFailed");
const {getPermissionsMsg} = require("../utility/failedMsg/permissionsMsg");

const foundCardError = getNotFoundMsg("cards");

router.get("/", async (req, res) => {
  try{
    const cards = await Card.find({});
    return res.send(cards);
  }catch(error){

    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("get","cards"));
    res.status(400).send(getRequestFailed("get","cards"));
  }
});

router.get("/my-cards", auth, async (req, res) => {
  try {
    const cards = await Card.find({ user_id: req.user._id });
    return res.json(cards);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("get","my cards"));
    res.status(400).send(getRequestFailed("get","my cards"));
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      logToFile("ERROR", req.method, req.originalUrl, foundCardError);
      return res.status(401).send(foundCardError);
    }
    if (JSON.stringify(req?.user?._id) !== JSON.stringify(card?.user_id)) {
      if (!req?.user?.isAdmin) {
        logToFile("ERROR", req.method, req.originalUrl, getPermissionsMsg("delete card"));
        return res.status(401).send(getPermissionsMsg("delete card"));
      }
    }
    card = await Card.findOneAndRemove({ _id: req.params.id });
    if (card) {
      return res.status(201).send("The card has been successfully deleted");
    } else {
      logToFile("ERROR", req.method, req.originalUrl, foundCardError);
      return res.status(401).send(foundCardError);
    }
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("delete","card"));
    return res.status(401).send(getRequestFailed("delete","card"));
  }
});

router.get("/:id", async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req?.params?.id });
    if (!card){
      logToFile("ERROR", req.method, req.originalUrl, foundCardError);
      return res.status(404).send(foundCardError);
    }
    res.status(201).send(card);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("get this", "card"));
    return res.status(401).send(getRequestFailed("get this", "card"));
  }
});

router.post("/", auth, isBiz, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    logToFile("ERROR", req.method, req.originalUrl, error.details[0].message);
    res.status(400).json(error.details[0].message);
    return;
  }
  try {
    const card = new Card({
      ...req.body,
      bizNumber: await generateBizNumber(),
      user_id: req.user._id,
    });
    await card.save();
    res.json(card);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, error?.message);
    return res.status(400).send(error?.message);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const duplicateLike = "You already liked this card";
  try {
    const foundCard = await Card.findOne({
      _id: req.params.id,
      "likes.user_id": req.user._id,
    });
    if (foundCard) {
      logToFile("ERROR", req.method, req.originalUrl, duplicateLike);
      return res.status(401).send(duplicateLike);
    }
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { likes: { user_id: req.user._id } } },
      { new: true }
    );
    if (!card) {
      logToFile("ERROR", req.method, req.originalUrl, foundCardError);
      return res.status(401).send(foundCardError);
    }
    res.json(card);
  } catch (err) {
    logToFile("ERROR", req.method, req.originalUrl, getRequestFailed("like this","card"));
    res.status(400).send( getRequestFailed("like this","card"));
    return;
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(201).send(foundCardError);
    }
    if (JSON.stringify(req?.user?._id) !== JSON.stringify(card?.user_id)) {
      logToFile("ERROR", req.method, req.originalUrl, getPermissionsMsg("edit this card"));
      return res.status(401).send(getPermissionsMsg("edit this card"));
    }
    const { error } = validateCard(req.body);
    if (error) {
      logToFile("ERROR", req.method, req.originalUrl, error);
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCard) {
      logToFile("ERROR", req.method, req.originalUrl, );
      return res.status(404).json({ error: foundCardError });
    }
    const result = await updatedCard.save();
    return res.status(201).json(result);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, foundCardError);
    return res.status(400).json({ error: foundCardError });
  }
});

module.exports = router;

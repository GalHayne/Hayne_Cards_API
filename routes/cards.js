const router = require("express").Router();
const auth = require("../middleware/auth");
const { validateCard, Card, generateBizNumber } = require("../models/card");
const { isBiz } = require("../middleware/permissions");
const {logToFile} = require("../utility/logFiles/logToFile")

router.get("/", async (req, res) => {
  const ErrorMSg = "get cards request fail";
  try{
    const cards = await Card.find({});
    return res.send(cards);
  }catch(error){

    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    res.status(400).send(ErrorMSg);
  }
});

router.get("/my-cards", auth, async (req, res) => {
  const ErrorMSg = "get cards request fail";
  try {
    const cards = await Card.find({ user_id: req.user._id });
    return res.json(cards);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    res.status(400).send(ErrorMSg);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const cardIDErrorMsg = "The ID of this card not exist";
  const permissionDeleteMsg = "You dont have permissions";
  const ErrorMSg = "Delete this card request fail";
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      logToFile("ERROR", req.method, req.originalUrl, cardIDErrorMsg);
      return res.status(401).send(cardIDErrorMsg);
    }
    if (JSON.stringify(req?.user?._id) !== JSON.stringify(card?.user_id)) {
      if (!req?.user?.isAdmin) {
        logToFile("ERROR", req.method, req.originalUrl, permissionDeleteMsg);
        return res.status(401).send(permissionDeleteMsg);
      }
    }
    card = await Card.findOneAndRemove({ _id: req.params.id });
    if (card) {
      return res.status(201).send("The card has been successfully deleted");
    } else {
      logToFile("ERROR", req.method, req.originalUrl, cardIDErrorMsg);
      return res.status(401).send(cardIDErrorMsg);
    }
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    return res.status(401).send(ErrorMSg);
  }
});

router.get("/:id", async (req, res) => {
  const foundCardError = "The card with the given ID was not found";
  const ErrorMSg = "Get this card request fail";
  try {
    const card = await Card.findOne({ _id: req?.params?.id });
    if (!card){
      logToFile("ERROR", req.method, req.originalUrl, foundCardError);
      return res.status(404).send(foundCardError);
    }
    res.status(201).send(card);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    return res.status(401).send(ErrorMSg);
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
  const ErrorMSg = "Like this card request fail";
  const foundCardError = "The card with the given ID was not found";
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
    logToFile("ERROR", req.method, req.originalUrl, ErrorMSg);
    res.status(400).send(ErrorMSg);
    return;
  }
});

router.put("/:id", auth, async (req, res) => {
  const cardNotFoundMsg = "The ID of this card not exist";
  const permissionDeleteMsg = "You dont have permissions to edit this card";
  try {
    const card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(201).send(cardNotFoundMsg);
    }
    if (JSON.stringify(req?.user?._id) !== JSON.stringify(card?.user_id)) {
      logToFile("ERROR", req.method, req.originalUrl, permissionDeleteMsg);
      return res.status(401).send(permissionDeleteMsg);
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
      logToFile("ERROR", req.method, req.originalUrl, cardNotFoundMsg);
      return res.status(404).json({ error: cardNotFoundMsg });
    }
    const result = await updatedCard.save();
    return res.status(201).json(result);
  } catch (error) {
    logToFile("ERROR", req.method, req.originalUrl, cardNotFoundMsg);
    return res.status(400).json({ error: cardNotFoundMsg });
  }
});

module.exports = router;

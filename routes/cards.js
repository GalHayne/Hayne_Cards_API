const router = require("express").Router();
const auth = require("../middleware/auth");
const { validateCard, Card, generateBizNumber } = require("../models/card");
const { isBiz } = require("../middleware/permissions");

router.get("/", async (req, res) => {
  const cards = await Card.find({});
  return res.send(cards);
});

router.get("/my-cards", auth, async (req, res) => {
  try {
    const cards = await Card.find({ user_id: req.user._id });
    return res.json(cards);
  } catch (error) {
    res.status(400).send("You can't get cards");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(201).send("The ID of this card not exist");
    }
    if (JSON.stringify(req?.user?._id) !== JSON.stringify(card?.user_id)) {
      if (!req?.user?.isAdmin) {
        return res
          .status(401)
          .send("You dont have permissions to delete this card");
      }
    }
    card = await Card.findOneAndRemove({ _id: req.params.id });
    if (card) {
      return res.status(201).send("The card has been successfully deleted");
    } else {
      return res.status(201).send("The ID of this card not exist");
    }
  } catch (error) {
    return res.status(401).send("You can't delete this card!!");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req?.params?.id });
    if (!card)
      return res.status(404).send("The card with the given ID was not found.");
    res.send(card);
  } catch (error) {
    return res.status(401).send("You can get this card");
  }
});

router.post("/", auth, isBiz, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
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
    return res.status(400).send(error?.message);
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const foundCard = await Card.findOne({
      _id: req.params.id,
      "likes.user_id": req.user._id,
    });
    if (foundCard) {
      return res.status(400).send("You already liked this card.");
    }
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { likes: { user_id: req.user._id } } },
      { new: true }
    );
    res.json(card);
  } catch (err) {
    res.statusMessage = "The Card Likes where not updated.";
    res.status(400).send("The Card Likes where not updated.");
    return;
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id });
    if (!card) {
      return res.status(201).send("The ID of this card not exist");
    }
    if (JSON.stringify(req?.user?._id) !== JSON.stringify(card?.user_id)) {
      if (!req?.user?.isAdmin) {
        return res
          .status(401)
          .send("You dont have permissions to delete this card");
      }
    }
    const { error } = validateCard(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedCard) {
      return res.status(404).json({ error: "Card not found" });
    }
    const result = await updatedCard.save();
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
});

module.exports = router;

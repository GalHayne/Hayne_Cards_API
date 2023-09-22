const { User } = require("../models/user");

const checkIsAdmin = async (req, res, next) => {
  if (!req?.user?.isAdmin)
    return res.status(401).send({ msg: "You dont have permissions!!!" });
  next();
};
const currentUser = async (req, res, next) => {
  if (JSON.stringify(req.user._id) !== JSON.stringify(req.params.id)) {
    if (!req.user.isAdmin) {
      return res.status(401).send({ msg: "You dont have permissions!!!" });
    }
  }
  next();
};
const onlyCurrUser = async (req, res, next) => {
  if (JSON.stringify(req.user._id) !== JSON.stringify(req.params.id)) {
    return res.status(401).send({ msg: "You dont have permissions!!!" });
  }
  next();
};


const isBiz = async (req, res, next) => {
  if (!req.user.biz)
    return res
      .status(401)
      .send({ msg: "You dont have access to create a card!!!" });
  next();
};

module.exports = { checkIsAdmin, currentUser, onlyCurrUser , isBiz };

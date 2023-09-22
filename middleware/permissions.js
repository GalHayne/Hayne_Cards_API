const {logToFile} = require("../utility/logFiles/logToFile")

const permissionsMsgError = "You dont have permissions";
const createCardMsgError = "You dont have access to create a card";

const checkIsAdmin = async (req, res, next) => {
  if (!req?.user?.isAdmin) {
    logToFile("ERROR", req.method, req.originalUrl, permissionsMsgError);
    return res.status(401).send({ msg: permissionsMsgError });
  }
  next();
};
const currentUser = async (req, res, next) => {
  if (JSON.stringify(req.user._id) !== JSON.stringify(req.params.id)) {
    if (!req.user.isAdmin) {
      logToFile("ERROR", req.method, req.originalUrl, permissionsMsgError);
      return res.status(401).send({ msg: permissionsMsgError });
    }
  }
  next();
};
const onlyCurrUser = async (req, res, next) => {
  if (JSON.stringify(req.user._id) !== JSON.stringify(req.params.id)) {
    logToFile("ERROR", req.method, req.originalUrl, permissionsMsgError);
    return res.status(401).send({ msg: permissionsMsgError });
  }
  next();
};

const isBiz = async (req, res, next) => {
  if (!req.user.biz) {
    logToFile("ERROR", req.method, req.originalUrl, createCardMsgError);
    return res.status(401).send({ msg: createCardMsgError });
  }
  next();
};

module.exports = { checkIsAdmin, currentUser, onlyCurrUser, isBiz };

const { models } = require("../models");

exports.messagesGET = async (req, res) => {
  const messages = await models.Message.find({
    order: [["createdAt", "DESC"]],
  }).populate("user");
  res.json(messages);
};

exports.messagesFindOneGET = async (req, res) => {
  const message = await models.Message.findOne({
    where: { id: req.params.id },
  }).populate("user");
  res.json(message);
};

exports.summaryGET = async (req, res) => {
  const messages = await models.Message.find({
    order: [["createdAt", "DESC"]],
  }).populate("user");
  const summary = messages.reduce((acc, curr) => {
    if (!acc[curr.user.id]) {
      acc[curr.user.id] = {
        user: curr.user._id,
        name: curr.user.firstName + " " + curr.user.lastName,
        messages: messages.map((message) => {
          return {
            id: message.id,
            text: message.message,
            createdAt: message.createdAt,
          };
        }),
      };
    }
    return acc;
  }, {});
  res.json(summary);
};

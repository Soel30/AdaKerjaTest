const { webhookGET, webhookPOST } = require("../Controller/WebHookController");
const {
  messagesFindOneGET,
  messagesGET,
  summaryGET,
} = require("../Controller/MessageController");
module.exports = (app) => {
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/webhook", webhookPOST);
  app.get("/webhook", webhookGET);

  app.get("/messages", messagesGET);
  app.get("/messages/:id", messagesFindOneGET);
  app.get("/summary", summaryGET);
};

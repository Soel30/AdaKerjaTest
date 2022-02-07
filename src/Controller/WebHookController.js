const { models } = require("../models");
require("dotenv").config();
const request = require("request");
const moment = require("moment");
const mongoose = require("mongoose");
// Variables
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ABOGOBOGA";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "";
let askName = false;
let askBirthday = false;
let nextBirthday = false;
let birthday = "";

function handleMessage(sender_psid, received_message) {
  let response;
  if (received_message.text) {
    models.User.findOne({ psid: sender_psid }, (err, user) => {
      models.Message.create({
        user: user._id,
        message: received_message.text,
      });
    });

    if (received_message.text.toLowerCase() === "hi") {
      askName = true;
      response = {
        text: "Hi, What's your name?",
      };
    } else if (askName == true && received_message.text) {
      response = {
        text: `Hi ${received_message.text}, What your birthday? (YYYY-MM-DD, e.g. 1990-01-01)`,
      };
      askBirthday = true;
      askName = false;
    } else if (askBirthday) {
      birthday = received_message.text;
      const valid = moment(birthday, "YYYY-MM-DD", true).isValid();
      if (valid) {
        nextBirthday = true;
        response = {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: `Your birthday is ${received_message.text}, Want to know your next birthday?`,
              buttons: [
                {
                  type: "postback",
                  title: "Yes",
                  payload: "birthday_yes",
                },
                {
                  type: "postback",
                  title: "No",
                  payload: "birthday_no",
                },
              ],
            },
          },
        };
        askBirthday = false;
      } else {
        response = {
          text: "Please enter a valid date (YYYY-MM-DD, e.g. 1990-01-01)",
        };
      }
    }
  }

  callSendApi(sender_psid, response);
}

function handlePostBack(sender_psid, received_postback) {
  let response;
  let payload = received_postback.payload;

  switch (payload) {
    case "birthday_yes":
      response = {
        text: calculateDays(birthday),
      };
      break;
    case "birthday_no":
      response = {
        text: "Goodbye 👋",
      };
    default:
      break;
  }

  callSendApi(sender_psid, response);
}

function callSendApi(sender_psid, response) {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.log("Unabled to send Message: " + err);
      }
    }
  );
}

function calculateDays(birth) {
  let today = new Date();
  let bday = new Date(birth);
  let age = today.getFullYear() - bday.getFullYear();

  let upcomingBday = new Date(
    today.getFullYear(),
    bday.getMonth(),
    bday.getDate()
  );

  if (today > upcomingBday) {
    upcomingBday.setFullYear(today.getFullYear() + 1);
  }

  var one_day = 24 * 60 * 60 * 1000;

  let daysLeft = Math.ceil(
    (upcomingBday.getTime() - today.getTime()) / one_day
  );

  // No need to calculate people older than 199 yo. :)
  if (daysLeft && age < 200) {
    return `There are  ${daysLeft} days left until your next birthday`;
  }
}

function setUserDetails(psid) {
  request(
    {
      uri: `https://graph.facebook.com/${psid}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${PAGE_ACCESS_TOKEN}`,
      method: "GET",
    },
    (err, res, body) => {
      if (!err) {
        const user = JSON.parse(body);
        let userid = user["id"];
        let first_name = user["first_name"];
        let last_name = user["last_name"];
        let profile_pic = user["profile_pic"];
        let locale = user["locale"];
        let timezone = user["timezone"];

        models.User.findOne({ fbId: userid }, (err, user) => {
          if (!user) {
            const newUser = new models.User({
              fbId: userid,
              firstName: first_name,
              lastName: last_name,
              profilePic: profile_pic,
              locale: locale,
              timezone: timezone,
              psid: psid,
            });
            newUser.save();
          }
        });
      } else {
        console.log("Unabled to send Message: " + err);
      }
    }
  );
}

function getUserDetail(psid) {
  models.User.findOne({ psid: psid }, (err, user) => {
    if (user) {
      return user;
    }
  });
}

exports.webhookPOST = (req, res) => {
  let body = req.body;
  if (body.object === "page") {
    body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      setUserDetails(sender_psid);
      // console.log(sender_psid);
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostBack(sender_psid, webhook_event.postback);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
};

exports.webhookGET = (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

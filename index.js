const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());

const { connectDb, models } = require("./src/models");
const Route = require("./src/Routes/index");

require("dotenv").config();

Route(app);

connectDb().then(async () => {
  console.log("Connected to MongoDB");
  app.listen(process.env.PORT || 8080, () => console.log("Server running..."));
});

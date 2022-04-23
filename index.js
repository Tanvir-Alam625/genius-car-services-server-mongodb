const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
// data  get
app.get("/", (req, res) => {
  res.send("genius car server is running");
});
// port listening
app.listen(port, () => {
  console.log("This port is running", port);
});

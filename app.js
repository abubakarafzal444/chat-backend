require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const productsRoutes = require("./routes/products");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
    "Authorization"
  );
  next();
});

app.use(productsRoutes);

mongoose
  .connect(process.env.DB_CONNECTION_URL)
  .then((result) => {
    app.listen(8080);
    console.log("connected to database");
  })
  .catch((e) => console.log("database conection failed", e));

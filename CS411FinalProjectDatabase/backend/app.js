var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql2");
var path = require("path");
var app = express();
app.use(cors());

var useLocalDB = process.env.DB_CONNECTION == "local";
var connection = require("./connection");

//for every route defined in routes we need to create a router
var apiRouter = require("./routes/api");

// set up ejs view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//any time you add a new resource you need to tell the app to use it if the resource is in a diff folder
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api", apiRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});

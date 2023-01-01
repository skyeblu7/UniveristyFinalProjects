var express = require("express");
var router = express.Router();
var cardsRouter = require("./cards");
var queriesRouter = require("./queries");

/* GET users listing. */
router.get("/", function (req, res) {
  res.send("Im at API !!!!");
});

router.use("/cards", cardsRouter);
router.use("/queries", queriesRouter);

module.exports = router;

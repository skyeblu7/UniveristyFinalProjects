var express = require("express");
var url = require("url");
var router = express.Router();
var connection = require("../../../connection");
var app = require("../../../app");
const { changeUser } = require("../../../connection");

/* Add click log */
router.get("/clickDetected", function (req, res) {
  let card_id = url.parse(req.url, true).query.card_id;
  let ip_addr = req.socket.remoteAddress.split(/[:]/)[3];
  let date_time = new Date()
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");

  console.log(ip_addr)
  console.log(card_id)

  var query = `
  INSERT INTO click_logs (
    card_id,
    date_time,
    ip_addr
)
VALUES
    (
        ${card_id},
        '${date_time}',
        "${ip_addr}"
    );`;

  connection.query(query, function (err, result) {
    if (err) {
      // console.log(err.sqlMessage)
      res.send(err);
      return;
    } else {
      res.send("Update successful.");
    }
  });
});

/* Get Trending Cards */
router.get("/trend", function (req, res) {
  var query = `
    SELECT card_name, total_requests FROM (
      SELECT cc.*, COUNT(cl.card_id) AS total_requests
      FROM credit_cards cc NATURAL JOIN click_logs cl
      WHERE TIMESTAMPDIFF(DAY, CURRENT_TIMESTAMP(), cl.date_time) < 7
      GROUP BY cc.card_id
      ORDER BY total_requests DESC, cc.card_name
    ) a
    LIMIT 10`;

  connection.query(query, function (err, result) {
    console.log("/api/cards/trend request returns: " + result);
    if (err) {
      res.send(err);
      return;
    }

    var new_result = [];

    for (val in result) {
      new_result.push({card_name: result[val]["card_name"], views: result[val]["total_requests"]});
    }

    if (result.length) {
      res.json(new_result);
    } else {
      res.status(404);
    }
  });
});

/* Get recommended cards */
router.get("/recommend", function (req, res) {
  let params = url.parse(req.url, true).query;

  let vend_name_filter = params.vend_name;
  let vend_type_filter = params.vend_type;
  let credit_score_min_filter = params.credit_score;
  let credit_limit_min_filter = params.credit_limit_min;
  let annual_fee_max_filter = params.max_annual_fee;
  let payment_processor_filter = params.payment_processor_filter;

  if (typeof vend_name_filter === "undefined") {
    vend_name_filter = "NULL";
  } else {
    vend_name_filter = `"${vend_name_filter}"`;
  }
  if (typeof vend_type_filter === "undefined") {
    vend_type_filter = "NULL";
  } else {
    vend_type_filter = `"${vend_type_filter}"`;
  }
  if (typeof credit_score_min_filter === "undefined") {
    credit_score_min_filter = "NULL";
  } else {
    credit_score_min_filter = `${credit_score_min_filter}`;
  }
  if (typeof credit_limit_min_filter === "undefined") {
    credit_limit_min_filter = "NULL";
  } else {
    credit_limit_min_filter = `${credit_limit_min_filter}`;
  }
  if (typeof annual_fee_max_filter === "undefined") {
    annual_fee_max_filter = "NULL";
  } else {
    annual_fee_max_filter = `${annual_fee_max_filter}`;
  }
  if (typeof payment_processor_filter === "undefined") {
    payment_processor_filter = "NULL";
  } else {
    payment_processor_filter = `"${payment_processor_filter}"`;
  }

  /*console.log("vend_name_filter = " + vend_name_filter)
  console.log("vend_type_filter = " + vend_type_filter)
  console.log("credit_score_min_filter = " + credit_score_min_filter)
  console.log("credit_limit_min_filter = " + credit_limit_min_filter)
  console.log("annual_fee_max_filter = " + annual_fee_max_filter)
  console.log("payment_processor_filter = " + payment_processor_filter)*/

  var query = `
    CALL GetCardRecommendation(
      ${vend_name_filter}, 
      ${vend_type_filter}, 
      ${credit_score_min_filter}, 
      ${credit_limit_min_filter},
      ${annual_fee_max_filter},
      ${payment_processor_filter}
      );`
  console.log(query);

  connection.query(query, function (err, result) {
    if (err) {
      res.send(err);
      return;
    }

    var new_result = [];

    for (val in result[2]) {
      new_result.push(result[2][val]["card_name"]);
    }

    if (result.length) {
      res.json(new_result);
    } else {
      res.status(404);
      res.send("No recommended cards found");
    }
  });
});

module.exports = router;

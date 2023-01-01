var express = require("express");
var router = express.Router();
var connection = require("../../../connection");
var app = require("../../../app");

var current_max_id = 0;

payment_proc_map = {10000000: 'Visa', 10000001: 'American Express', 10000002: 'Mastercard', 10000003: 'Discover'}

connection.query(
  "SELECT MAX(card_id) FROM credit_cards",
  function (err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      current_max_id = result[0]["MAX(card_id)"] + 1;
    }
  }
);

// ###################################################################

function convert_rewards(convert) {
  if (convert.length === 1) {
    if (convert === "c") {
      return "Cashback";
    } else {
      return "Points";
    }
  } else {
    if (convert === "Cashback") {
      return "c";
    } else {
      return "p";
    }
  }
}

function cc_search(
  card_id,
  card_name,
  bank,
  annual_fee,
  credit_limit,
  signup_bonus,
  APR_min,
  APR_max,
  min_rec_credit,
  foreign_trans_fee,
  reward_type,
  num_cards=100,
) {
  /*
  Generates the string for the SQL server query.
  Format:
  If a parameter is empty, it will not be added in the WHERE clause
  If a parameter has a string value, it will added to the WHERE clause
  -> For Integers and Real numbers, include the conditional as well as the value
  Example: To filter a param less than or equal to to, send in "<= 2"
  -> For Varchar and Char, just provide the string and the comparison will be done
  with a LIKE.
  Example: To Look for card_name abc, send in "abc", to look for cards that
    start with abc, send in "abc%"
  */

  if (
    card_id == `` &&
    card_name == "" &&
    bank == "" &&
    annual_fee == "" &&
    credit_limit == "" &&
    signup_bonus == "" &&
    APR_min == "" &&
    APR_max == "" &&
    min_rec_credit == "" &&
    foreign_trans_fee == "" &&
    reward_type == ""
  ) {
    return `SELECT * FROM credit_cards ORDER BY card_name LIMIT ${num_cards}`;
  }

  if (card_id != ``) {
    card_id = ` card_id ${card_id} AND`;
  }

  if (card_name != ``) {
    card_name = ` card_name LIKE "%${card_name}%" AND`;
  }

  if (bank != ``) {
    bank = ` bank LIKE "${bank}" AND`;
  }

  if (annual_fee != ``) {
    // format for INT/REAL: pass in conditional and value. ie: '< 3'
    annual_fee = ` annual_fee ${annual_fee} AND`;
  }

  if (credit_limit != ``) {
    credit_limit = ` credit_limit ${credit_limit} AND`;
  }

  if (signup_bonus != ``) {
    signup_bonus = ` signup_bonus ${signup_bonus} AND`;
  }

  if (APR_min != ``) {
    APR_min = ` APR_min ${APR_min} AND`;
  }

  if (APR_max != ``) {
    APR_max = ` APR_max ${APR_max} AND`;
  }

  if (min_rec_credit != ``) {
    min_rec_credit = ` min_rec_credit ${min_rec_credit} AND`;
  }

  if (foreign_trans_fee != ``) {
    foreign_trans_fee = ` foreign_trans_fee ${foreign_trans_fee} AND`;
  }

  if (reward_type != ``) {
    reward_type = ` reward_type LIKE ${reward_type} AND`;
  }

  var query = `SELECT * FROM credit_cards WHERE ${card_id}${card_name}${bank}${annual_fee}`;
  query += `${credit_limit}${signup_bonus}${APR_min}${APR_max}${min_rec_credit}`;
  query += `${foreign_trans_fee}${reward_type}`;
  query = query.slice(0, -3) + ` ORDER BY card_name LIMIT 15`;

  return query;
}

function cc_delete(card_id) {
  if (card_id == "") return "";
  return "DELETE FROM credit_cards WHERE card_id = " + card_id;
}

// WORKS
function cc_update(card_id, changes) {
  if (changes.length == 0) return "";

  var sql = "UPDATE credit_cards SET ";
  for (var key in changes) {
    if (key === "reward_type") {
      changes[key] = convert_rewards(changes[key]);
    }
    if (
      ["card_name", "bank", "image_url", "signup_link", "reward_type"].includes(
        key
      )
    ) {
      sql = sql + key + '="' + changes[key] + '" ,';
    } else {
      sql = sql + key + "=" + changes[key] + " ,";
    }
  }
  sql = sql.slice(0, -1);
  sql = sql + `WHERE card_id = ${card_id}`; // ; SELECT card_id FROM credit_cards WHERE card_id = ${card_id}`

  return sql;
}

// ###################################################################

// WORKS DONT TOUCH
/* GETS ALL CARDS (LIMIT 15) WITH BLANK PARAMS
   DOES A CUSTOM QUERY BASED ON PARAMS         */
// Ex: /api/cards/?card_id==10078307&card_name=opcqyl
router.get("/", function (req, res) {
  let card_id = req.query.card_id;
  let card_name = req.query.card_name;
  let bank = req.query.bank;
  let annual_fee = req.query.annual_fee;
  let credit_limit = req.query.credit_limit;
  let signup_bonus = req.query.signup_bonus;
  let APR_min = req.query.APR_min;
  let APR_max = req.query.APR_max;
  let min_rec_credit = req.query.min_rec_credit;
  let foreign_trans_fee = req.query.foreign_trans_fee;
  let reward_type = req.query.reward_type;

  if (typeof card_id === "undefined") card_id = "";
  if (typeof card_name === "undefined") card_name = "";
  if (typeof bank === "undefined") bank = "";
  if (typeof annual_fee === "undefined") annual_fee = "";
  if (typeof credit_limit === "undefined") credit_limit = "";
  if (typeof signup_bonus === "undefined") signup_bonus = "";
  if (typeof APR_min === "undefined") APR_min = "";
  if (typeof APR_max === "undefined") APR_max = "";
  if (typeof min_rec_credit === "undefined") min_rec_credit = "";
  if (typeof foreign_trans_fee === "undefined") foreign_trans_fee = "";
  if (typeof reward_type === "undefined") reward_type = "";

  sql = cc_search(
    card_id,
    card_name,
    bank,
    annual_fee,
    credit_limit,
    signup_bonus,
    APR_min,
    APR_max,
    min_rec_credit,
    foreign_trans_fee,
    reward_type
  );
  connection.query(sql, function (err, result) {
    console.log("/api/cards custom query returned: " + result);
    console.log(sql);
    if (err) {
      res.send(err);
      return;
    }
    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        result[i]["reward_type"] = convert_rewards(result[i]["reward_type"]);
        result[i]['processor_id'] = payment_proc_map[result[i]['processor_id']];
      }
      res.json(result);
      // res.send("Update successful.");
    } else {
      res.status(404);
      res.send("No cards found with the current query parameters...");
    }
  });
});

/* DELETES ALL CARDS BASED ON A card_id */ // WORKS DONT TOUCH
router.delete("/:id", function (req, res) {
  card_id = parseInt(req.params.id);

  if (typeof card_id === "undefined") card_id = "";

  sql = cc_delete(card_id);

  if (sql != "") {
    connection.query(sql, function (err, result) {
      console.log("sql query: ", sql);
      console.log(JSON.stringify(result));
      if (err) {
        res.send(err);
        return;
      } else {
        res.send(`Delete request to card_id = ${card_id} sent.`);
      }
    });
  } else {
    res.status(204);
    res.send(`DELETE FAILED: card id = ${card_id} not found`);
  }
});

/*
// GETS CARD BY ID   ( WORKS )
router.get("/:id", function (req, res) {
  req_id = parseInt(req.params.id);

  connection.query(
    `DELETE FROM credit_cards WHERE card_id = ${req_id}`,
    function (err, result) {
      console.log("DELETE /api/cards/:id deletes card: " + req_id);
      if (err) {
        res.send(err);
        return;
      }

      if (result.length > 0) {
        res.json(result);
      } else {
        res.status(404);
        res.send("Card id " + req_id + " not found");
      }
    }
  );
});
*/

/* CREATE NEW CREDIT CARD */
router.post("/", function (req, res) {
  let newData = req.body;

  console.log("CREATE NEW CARD = " + newData[0] + " " + newData[1]);



  var processor_id = Math.floor(Math.random() * (10000003 - 10000000 + 1) + 10000000)


  // unique card_id from current_max_id var
  var card_id = current_max_id;
  current_max_id += 1;

  var map = {
    card_id: card_id,
    processor_id: processor_id,
    card_name: "placeholder",
    bank: "placeholder",
    annual_fee: "00.00",
    credit_limit: "00.00",
    signup_bonus: "00.00",
    APR_min: "00.00",
    APR_max: "00.00",
    min_rec_credit: "000",
    foreign_trans_fee: "00.00",
    reward_type: "p",
  };

  for (var key in newData) {
    map[key] = newData[key];
  }

  if (map["reward_type"] == "Points") map["reward_type"] = "p";
  else if (map["reward_type"] == "Cashback") map["reward_type"] = "c";

  var sql = "INSERT INTO credit_cards (";
  for (var key in map) {
    sql = sql + `${key}, `;
  }
  sql = sql.slice(0, -2);

  sql = sql + ") VALUES (";
  for (var key in map) {
    if (["card_name", "bank", "image_url", "signup_link"].includes(key)) {
      sql = sql + `"${map[key]}", `;
    } else if (key == "reward_type") {
      sql = sql + `'${map[key]}', `;
    } else {
      sql = sql + `${map[key]}, `;
    }
  }
  sql = sql.slice(0, -2);
  sql = sql + ")";

  console.log(sql);

  connection.query(sql, function (err, result) {
    console.log(
      `POST INSERT with data ${JSON.stringify(newData)} to card_id ${card_id}`
    );
    if (err) {
      res.send(err);
      return;
    }
    res.send("Update successful.");
  });
});

/* UPDATES CARD WITH NEW INFO BY ID  ( WORKS )*/
router.put("/:id", function (req, res) {
  id = parseInt(req.params.id);
  // new data
  let newData = req.body;
  let sql = cc_update(id, newData);

  console.log(sql);

  if (sql.length === 0) {
    res.status(404);
    res.send("Card id " + req_id + " not found");
  }

  connection.query(sql, function (err, result) {
    console.log("PUT /api/cards/:id request returns: " + result);
    if (err) {
      res.send(err);
      return;
    }
  });

  res.send("Update successful.");
});

module.exports = router;

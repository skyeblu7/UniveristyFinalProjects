var mysql = require("mysql2");

var useLocalDB = process.env.DB_CONNECTION === "local";
var connection = mysql.createConnection({
  host: useLocalDB ? process.env.DEV_DB_HOST : process.env.CLOUD_DB_HOST,
  user: useLocalDB ? process.env.DEV_DB_USER : process.env.CLOUD_DB_USER,
  password: useLocalDB
    ? process.env.DEV_DB_PASSWORD
    : process.env.CLOUD_DB_PASSWORD,
  database: useLocalDB ? process.env.DEV_DB_NAME : process.env.CLOUD_DB_NAME,
});
connection.connect;

module.exports = connection;

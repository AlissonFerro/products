const config = require('./config/config');
const mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  user: config.development.username,
  password: config.development.password,
  database: config.development.database,
  host: config.development.host
})
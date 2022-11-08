const config = require('./config/config');
const mysql = require('mysql2/promise');

async function connect(){
  const connection = await mysql.createConnection({
    user: config.development.username,
    password: config.development.password,
    database: config.development.database,
    host: config.development.host
  })
  
  return connection;
}

module.exports = connect;
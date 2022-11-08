const bodyParser = require('body-parser');
const client = require('./client');

module.exports = function(app){
  app.use(
    bodyParser.json(),
    client
  );
}
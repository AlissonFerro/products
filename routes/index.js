const bodyParser = require('body-parser');
const client = require('./client');
const product = require('./product');
const itemRequest = require('./itemRequest');

module.exports = function(app){
  app.use(
    bodyParser.json(),
    client,
    product,
    itemRequest
  );
}
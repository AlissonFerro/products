const bodyParser = require('body-parser');
const client = require('./client');
const product = require('./product');

module.exports = function(app){
  app.use(
    bodyParser.json(),
    client,
    product
  );
}
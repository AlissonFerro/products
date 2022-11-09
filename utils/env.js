const env = require('../env');

function getTableName(table){
  if(env == 'TEST')
    table += '_test';

  return table;
}

module.exports = getTableName;
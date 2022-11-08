const env = require('../env');

function getTableName(){
  let table = 'client';
  if(env == 'TEST')
    table += '_test';

  return table;
}

module.exports = getTableName;
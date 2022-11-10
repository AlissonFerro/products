const connection = require('../db');
const getTableName = require('../utils/env');

class ItemRequestController {
  static async getAllItems(req, res){
    const table = getTableName('request_item');
    const [requestItems] = await connection.query(
      `SELECT \`idRequestItem\`, \`idRequest\`, \`idProduct\`, \`amount\` FROM ${table} WHERE removedAt IS NULL;`
    );

    return res.status(200).send(requestItems);
  }

  static async getItemById(req, res){
    return 0;
  }

  static async createItem(req, res){
    return 0;
  }

  static async alterItem(req, res){
    return 0;
  }

  static async removeItem(req, res){
    return 0;
  }
}

module.exports = ItemRequestController;
const connection = require('../db');
const getTableName = require('../utils/env');

class ItemRequestController {
  static async getAllItems(req, res){
    const table = getTableName('request_item');
    const [requestItems] = await connection.query(
      `SELECT \`idRequestItem\`, \`idRequest\`, \`idProduct\`, \`amount\` 
      FROM ${table} WHERE removedAt IS NULL;`
    );

    return res.status(200).send(requestItems);
  }

  static async getItemById(req, res){
    const table = getTableName('request_item');
    const { id } = req.params;

    try {
      const [product] = await connection.query(
        `SELECT \`idRequestItem\`, \`idRequest\`, \`idProduct\`, \`amount\`
        FROM ${table} WHERE \`idRequestItem\` = ${id} AND \`removedAt\` IS NULL `
      )
      if(product.length < 1){
        return res.status(404).send();
      }
      return res.status(200).send(product);

    } catch (error) {
      return res.status(400).send(error);
    }

  }

  static async createItem(req, res){
    const {idRequest, idProduct, amount} = req.body;
    const table = getTableName('request_item');

    // const now = new Date();
    // const [itemsRequest] = await connection.query(
    //   `SELECT`
    // ) 

    // try {
    //   await connection.execute(
    //     `INSERT INTO \`${table} (\`idRequestItem\`, \`idProduct\`, \`idRequest\`, \`createdAt\`)`
    //   )
    // } catch (error) {
    // }
    return res.status(400).send(error);
  }

  static async alterItem(req, res){
    return 0;
  }

  static async removeItem(req, res){
    return 0;
  }
}

module.exports = ItemRequestController;
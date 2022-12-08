const connection = require('../db');
const getTableName = require('../utils/env');

class ProductController{
  static async getAllProducts(req, res){
    const table = getTableName('product');
    const [rows] = await connection.query(
      `SELECT \`idProduct\`, \`description\` FROM ${table} 
      WHERE \`removedAt\` IS NULL;`
      );
    return res.send(rows);
  }

  static async getProductById(req, res){
    const table = getTableName('product');
    const { id } = req.params;
    
    try {
      const [product] = await connection.query(
        `SELECT \`idProduct\`, \`description\` FROM ${table} 
        WHERE idProduct = ${id} AND \`removedAt\` IS NULL;`
      );
      
      if(product.length < 1){
        return res.status(404).send(product);
      }

      return res.status(200).send(product);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async createProdut(req, res){
    const { description } = req.body;

    if(!description || description.length < 3) 
      return res.status(400).send();

    const table = getTableName('product');
    const now = new Date();
    const [products] = await connection.query(
      `SELECT COUNT(idProduct) as countProducts FROM ${table};`
    );
    let count = products[0].countProducts;
    await connection.execute(
      `INSERT INTO \`${table}\` (\`idProduct\`, \`description\`, \`createdAt\`) ` +
      `VALUES (${count}, '${description}',` + 
      `"${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}" );`
    );
    
    const [product] = await connection.query(
      `SELECT \`idProduct\`, \`description\` FROM ${table} WHERE idProduct=${count};`
    )
    return res.status(200).send(product);
  }

  static async alterProductById(req, res){
    const { id } = req.params;
    const { description } = req.body;

    if(!description || description.length < 3)
      return res.status(400).send();

    const table = getTableName('product');
    const [product] = await connection.query(
      `SELECT * FROM ${table} WHERE idProduct=${id};`
    )
    if(product.length < 1)
      return res.status(404).send();
    
    const now = new Date();

    await connection.execute(
      `UPDATE ${table} SET description='${description}', ` + 
      `modifiedAt='${now.getFullYear()}-${now.getMonth()+1}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}' WHERE idProduct=${id};`
    );

    const [alterProduct] = await connection.query(
      `SELECT \`idProduct\`, \`description\` FROM ${table} WHERE idProduct=${id};`
    )
    
    return res.status(200).send(alterProduct);
  }

  static async removeProduct(req, res){
    const { id } = req.params;
    const table = getTableName('product');
    try {
      const [product] = await connection.query(
        `SELECT * FROM ${table} WHERE idProduct=${id}`
      );
      if(product.length < 1)
        return res.status(404).send();
      const now = new Date();
      await connection.execute(
        `UPDATE ${table} SET ` +
        `removedAt='${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}' WHERE idProduct=${id};`
      );
      const [deletedProduct] = await connection.query(
        `SELECT * FROM ${table} WHERE idProduct=${id};`
      )
      return res.status(200).send(deletedProduct);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

module.exports = ProductController;
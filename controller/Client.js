const connect = require('../db');
const getTableName = require('../utils/env');

class ClientController {
  static async getAllClients(req, res){    
    const table = getTableName('client'); 
    const connection = await connect();
    const [rows] = await connection.query(`SELECT \`idClient\`, \`name\`, \`lastName\` FROM ${table} WHERE \`removedAt\` IS NULL;`);
    return res.send(rows);
  };
    
  static async getClientById(req, res){
    const table = getTableName('client');
    const { id } = req.params;

    try {
      const connection = await connect();
      const [rows] = await connection.query(`SELECT \`idClient\`, \`name\`, \`lastName\` FROM ${table} where idClient=${id} AND \`removedAt\` IS NULL;`);

      if(rows.length <1){
        return res.status(404).send(rows);
      }

      return res.status(200).send(rows);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  static async createClient(req, res){
    const { name, lastName } = req.body;

    if(!name || !lastName ||
      name.length < 3 || lastName.length < 3
      )
      return res.status(400).send();
    
    const connection = await connect();    
    const table = getTableName('client');

    const [rows] = await connection.query(`SELECT * FROM ${table};`);

    const now = new Date();    

    await connection.execute(
      `INSERT INTO \`${table}\`(\`idClient\`, \`name\`, \`lastName\`, \`createdAt\`)` +
      `VALUES (${rows.length}, '${name}', '${lastName}',` + 
      `"${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}" );`
    )
    
    const [client] = await connection.query(`SELECT \`idClient\`, \`name\`, \`lastName\` FROM ${table} WHERE idClient=${rows.length} AND removedAt IS NULL`);

    return res.status(200).send(client);
  }

  static async alterClientById(req, res){
    const { id } = req.params;
    const { name, lastName } = req.body;
    if(!name || !lastName || name.length < 3 || lastName.length < 3)
      return res.status(400).send();

    const table = getTableName('client'); 
    const connection = await connect();  

    try {
      const [client] = await connection.query(`SELECT * FROM ${table} WHERE idClient=${id};`);
      if(client.length < 1){
        return res.status(404).send();
      }
      const now = new Date();

      await connection.execute(
        `UPDATE ${table} SET name='${name}', lastName='${lastName}',` + 
        `modifiedAt='${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}' WHERE idClient=${id};`
      );

      const [newInfos] = await connection.query(`SELECT \`idClient\`, \`name\`, \`lastName\` FROM ${table} WHERE idClient=${id} AND removedAt IS NULL;`);

      return res.status(200).send(newInfos);
    } catch (error) {
      return res.status(400).send(error);      
    }
  }

  static async removeClient(req, res){
    const table = getTableName('client');
    const { id } = req.params;

    try {
      const connection = await connect();
      const [client] = await connection.query(`SELECT * FROM ${table} where idClient=${id};`);

      if(client.length < 1){
        return res.status(404).send(client);
      }
      const now = new Date();

      await connection.execute(
        `UPDATE ${table} SET ` + 
        `removedAt='${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}' WHERE idClient=${id};`
      );
      const [removedClient] = await connection.query(`SELECT * FROM ${table} WHERE idClient=${id} AND removedAt IS NOT NULL`); 
      return res.status(200).send(removedClient);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  
}

module.exports = ClientController;
const connect = require('../db');
const getTableName = require('../utils/env');

class ClientController {
  static async getAllClients(req, res){    
    const table = getTableName(); 
    const connection = await connect();
    const [rows] = await connection.query(`SELECT * FROM ${table};`);
    return res.send(rows);
  };
    
  static async getClientById(req, res){
    const table = getTableName();
    const { id } = req.params;

    try {

      const connection = await connect();
      const [rows] = await connection.query(`SELECT * FROM ${table} where idClient=${id};`);

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
    const table = getTableName();

    const [rows] = await connection.query(`SELECT * FROM ${table};`);

    await connection.execute(
      `INSERT INTO \`${table}\`(idClient, name, lastName) VALUES (${rows.length}, '${name}', '${lastName}');`
    )
    
    const [client] = await connection.query(`SELECT * FROM ${table} where idClient=${rows.length}`);

    return res.status(200).send(client);
  }
}

module.exports = ClientController;
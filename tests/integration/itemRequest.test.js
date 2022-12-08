const request = require('supertest');
const connection = require('../../db');
let server;

async function clearDB(){
  await connection.execute('DELETE FROM `request_item_test` WHERE idRequestItem = 0;');
  await connection.execute('DELETE FROM `request_item_test` WHERE idRequestItem = 1;');
  await connection.execute('DELETE FROM `request_item_test` WHERE idRequestItem = 2;');
  await connection.execute('DELETE FROM `request_item_test` WHERE idRequestItem = 3;');
  await connection.execute('DELETE FROM `request_item_test` WHERE idRequestItem = 4;');

  await connection.execute('DELETE FROM `request_test` WHERE idRequest = 10;');
  await connection.execute('DELETE FROM `request_test` WHERE idRequest = 11;');
  await connection.execute('DELETE FROM `request_test` WHERE idRequest = 12;');

  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 10;');
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 11;');
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 12;');

  await connection.execute('DELETE FROM `client_test` WHERE idClient = 10;');
  await connection.execute('DELETE FROM `client_test` WHERE idClient = 11;');
  await connection.execute('DELETE FROM `client_test` WHERE idClient = 12;');
};

async function insertFKInDB(){
  await connection.execute(
    "INSERT INTO `client_test` (idClient, name, lastName, createdAt) VALUES " + 
    "(10, 'name 10', 'last name 10', '2022-11-09 00:00:00')," +
    "(11, 'name 11', 'last name 11', '2022-11-09 00:00:00')," +
    "(12, 'name 12', 'last name 12', '2022-11-09 00:00:00');" 
  );
  await connection.execute(
    "INSERT INTO `product_test` (idProduct, description, createdAt) VALUES " + 
    "(10, 'description 10', '2022-11-09 00:00:00')," +
    "(11, 'description 11', '2022-11-09 00:00:00')," +
    "(12, 'description 12', '2022-11-09 00:00:00');" 
  );
  await connection.execute(
    "INSERT INTO `request_test` (idRequest, date, idClient, createdAt) VALUES " + 
    "(10, '2022-11-10', 10, '2022-11-09 00:00:00')," +
    "(11, '2022-11-10', 11, '2022-11-09 00:00:00')," +
    "(12, '2022-11-10', 12, '2022-11-09 00:00:00');" 
  );
}

describe('/api/itensPedidos', async () => {
  beforeEach(async () => {
    server = require('../../index');
  });

  afterEach(async () => {
    server.close();
  });

  describe('GET /', async () => {
    beforeEach(async () => insertFKInDB());
    afterEach(async () => clearDB());
    
    it('should return all items saved', async () => {
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt) VALUES " + 
        "(0, 10, 10, 10, '2022-11-09 00:00:00')," +
        "(1, 11, 11, 20, '2022-11-09 00:00:00')," +
        "(2, 12, 12, 30, '2022-11-09 00:00:00');"
      );

      const res = await request(server).get('/api/itensPedidos');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).not.toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });

    it('should return all items if more 1 was deleted', async () => {
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt) VALUES " + 
        "(0, 10, 10, 10, '2022-11-09 00:00:00')," +
        "(2, 12, 12, 30, '2022-11-09 00:00:00');"
      );
      
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt, removedAt) VALUES " + 
        "(1, 11, 11, 20, '2022-11-09 00:00:00','2022-11-10 00:00:00');"
      );

      const res = await request(server).get('/api/itensPedidos');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2)
    })
  });

  describe('GET /:id',async () => {
    beforeEach(async() => await insertFKInDB());
    afterEach(async() => await clearDB());

    it('should return a item if valid id was passed', async () => {
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt) VALUES " + 
        "(1, 11, 11, 20, '2022-11-09 00:00:00');"
      );

      const res = await request(server).get('/api/itensPedidos/1');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).not.toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });

    it('should return 400 if id was not valid', async () => {
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt) VALUES " + 
        "(1, 11, 11, 20, '2022-11-09 00:00:00');"
      );
      
      const invalidsId = ['a', '!', '1a', '-'];

      invalidsId.map( async (invalidId) => {
        const res = await(request(server).get(`/api/itensPedidos/${invalidId}`));
        expect(res.status).toBe(400)
      })
    });

    it('should return 404 if id was not found', async () => {
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt) VALUES " + 
        "(1, 11, 11, 20, '2022-11-09 00:00:00');"
      );

      const res = await request(server).get('/api/itensPedidos/0');
      expect(res.status).toBe(404);
    })

    it('should return 404 if id was deleted', async () => {
      await connection.execute(
        "INSERT INTO \`request_item_test\` (idRequestItem, idRequest, idProduct, amount, createdAt, removedAt) VALUES " + 
        "(1, 11, 11, 20, '2022-11-09 00:00:00','2022-11-10 00:00:00');"
      );

      const res = await(request(server).get('/api/itensPedidos/1'));
      expect(res.status).toBe(404);
    })
  });

  describe('POST /', async () => {
    let amount;
    let idRequest;
    let idProduct;
    beforeEach(async () => {
      await insertFKInDB()
      amount = 1;
      idRequest = 11;
      idProduct = 11;
    })
    afterEach(async() => await clearDB());

    it('should return 400 if amount is not a number', async () => {
      amount = 'a';
      const res = await request(server).post('/api/itensPedidos')
        .send({ idRequest, idProduct, amount });
      expect(res.status).toBe(400);
    });

    it('sould save the product if it is valid', async() => {
      const res = await request(server).post('/api/itensPedidos')
        .send({ idRequest, idProduct, amount });
      
      expect(res.status).toBe(200)
    })
  })
});
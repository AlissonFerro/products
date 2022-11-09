const request = require('supertest');
const connection = require('../../db');
let server;

async function clearDB(){
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 0;');
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 1;');
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 2;');
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 3;');
  await connection.execute('DELETE FROM `product_test` WHERE idProduct = 4;');
}

describe('/api/produtos', async () => {
  beforeEach(async () => {
    server = require('../../index');
  });

  afterEach(async () => {
    server.close();
  });

  describe('GET /', async () => {
    afterEach(async () => { await clearDB(); });

    it('should return all products', async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(1, 'description product 1', '2022-11-09 00:00:00'), " + 
        "(2, 'description product 2', '2022-11-09 00:00:00'), " + 
        "(3, 'description product 3', '2022-11-09 00:00:00');"
      );
      const res = await request(server).get("/api/produtos");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).not.toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });

    it('should return all products if was more 1 deleted', async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(1, 'description product 1', '2022-11-09 00:00:00'), " + 
        "(3, 'description product 3', '2022-11-09 00:00:00');" 
      );
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt, removedAt) VALUES " +
        "(2, 'description product 2', '2022-11-09 00:00:00', '2022-11-09 00:00:00'); "
      );
      const res = await request(server).get("/api/produtos");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).not.toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });
  });

  describe('GET /:id', async () => {
    afterEach(async () => { await clearDB() });

    it('should return a product if valid id was passed', async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(1, 'description product 1', '2022-11-09 00:00:00'), " + 
        "(2, 'description product 2', '2022-11-09 00:00:00'), " + 
        "(3, 'description product 3', '2022-11-09 00:00:00');"
      );
      const res = await request(server).get('/api/produtos/2');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).not.toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });

    it('should return 400 if id was not valid', async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(1, 'description product 1', '2022-11-09 00:00:00');"
      );

      const invalidsId = ['a', '!', '1a', '-'];

      invalidsId.map( async (invalidId) => {
        const res = await request(server).get(`/api/produtos/${invalidId}`);
        expect(res.status).toBe(400);
      });
    });

    it('should return 404 if id was not found', async () => {
      const res = await request(server).get(`/api/produtos/1`);
      expect(res.status).toBe(404);
    });

    it('should return 404 if is was deleted', async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt, removedAt) VALUES " +
        "(1, 'description product 1', '2022-11-09 00:00:00', '2022-11-09 00:00:00'); "
      );
      const res = await request(server).get('/api/produtos/1');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', async() => {
    let description;
    beforeEach(() => {
      description = 'description produt'
    });

    afterEach(async () => { await clearDB() });

    it('should return 400 if product description is less than 3 caracters', async () => {
      description = 'a';
      const res = await request(server).post('/api/produtos').send({ description });
      expect(res.status).toBe(400);
    })

    it('should return 400 if product has no description', async () => {
      description = undefined;
      const res = await request(server).post('/api/produtos').send({ description });
      expect(res.status).toBe(400);
    })

    it('should save the product if it is valid', async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(0, 'description product 0', '2022-11-09 00:00:00');"
      );
      const res = await request(server).post('/api/produtos').send({ description })

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('description');
      expect(res.body[0]).not.toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });
  });

  describe('PUT /:id', async () =>{
    let description;
    beforeEach(async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(0, 'description product 0', '2022-11-09 00:00:00');"
      );
      description = 'alter product description';
    });
    afterEach(async () => { await clearDB(); });

    it('should return 400 if id is not valid', async () => {
      const invalidsId = ['a', '!', '-', '1a'];
      invalidsId.map(async (invalidId) => {
        const res = await request(server).put(`/api/produtos/${invalidId}`).send();
        expect(res.status).toBe(400);
      });
    });

    it('should return 400 if description was not passed', async () => {
      description = undefined;
      const res = await request(server).put('/api/produtos/0').send({ description });
      expect(res.status).toBe(400);
    });

    it('should return 404 if id was not found', async () => {
      const res = await request(server).put('/api/produtos/1').send({ description });
      expect(res.status).toBe(404);
    });

    it('should return 400 if description less than 3 caracters', async () => {
      description = 'a'
      const res = await request(server).put('/api/produtos/0').send({ description });
      expect(res.status).toBe(400);
    });

    it('should retur 200 if description and id is valid', async () => {
      const res = await request(server).put('/api/produtos/0').send({ description });
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].description).toContain('alter');
      expect(res.body[0]).not.toHaveProperty('removedAt');
      expect(res.body[0]).not.toHaveProperty('modifiedAt');
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });
  });

  describe('DELETE /:id', async () => {
    beforeEach(async () => {
      await connection.execute(
        "INSERT INTO `product_test`(idProduct, description, createdAt) VALUES " +
        "(0, 'description product 0', '2022-11-09 00:00:00');"
      );
    });
    afterEach( async () => await clearDB());

    it('should return 400 if id is not valid', async () => {
      const invalidsId = ['a', '!', '1a', NaN]
      invalidsId.map( async (invalidId) => {
        const res = await request(server).delete(`/api/produtos/${invalidId}`).send();
        expect(res.status).toBe(400);
      });
    });

    it('should return 404 if id was not found', async () => {
      const res = await request(server).delete('/api/produtos/2').send();
      expect(res.status).toBe(404);
    });

    it('should delete item if id is valid', async () => {
      const res = await request(server).delete('/api/produtos/0').send();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].removedAt).not.toBeNull();
    });
  });
})
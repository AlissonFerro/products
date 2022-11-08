const request = require('supertest');
const connect = require('../../db');
let server;
let connection;

describe('/api/clientes', async () => {
  beforeEach(async () => { 
    server = require('../../index');
    connection = await connect();
  });
  
  afterEach(async() => {   
    await connection.execute('delete from `client_test` where idClient = 1;');
    await connection.execute('delete from `client_test` where idClient = 2;');
    await connection.execute('delete from `client_test` where idClient = 3;');
    await connection.execute('delete from `client_test` where idClient = 4;');

    connection.end();
    server.close();
  });

  describe('GET /', () => {
    it('should return all clients', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName) VALUES (1, 'name1', 'lastName1'), (2, 'name2', 'lastName2'), (3, 'name3', 'lastName3');"
      );
      const res = await request(server).get("/api/clientes");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);    
    }); 
  });

  describe('GET /:id', () => {
    afterEach(async () => {
      await connection.execute('delete from `client_test` where idClient = 1;');
      await connection.execute('delete from `client_test` where idClient = 2;');
      await connection.execute('delete from `client_test` where idClient = 3;');
      await connection.execute('delete from `client_test` where idClient = 4;');
    });

    it('should return a client if valid id was passed', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName) VALUES (1, 'name1', 'lastName1'), (2, 'name2', 'lastName2'), (3, 'name3', 'lastName3');"
      );
      
      const res = await request(server).get("/api/clientes/2");   
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'name2');
      expect(res.body[0]).toHaveProperty('lastName', 'lastName2');
    });
      
    it('should return 404 if id was not valid', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName) VALUES (1, 'name1', 'lastName1'), (2, 'name2', 'lastName2'), (3, 'name3', 'lastName3');"
      );
      const invalidsId = ['a', '!'];
      invalidsId.map( async (invalidId) => {
        const res = await request(server).get(`/api/clientes/${invalidId}`);
        expect(res.status).toBe(400);
      })
    });
    
    it('should return 404 if id not found', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName) VALUES (1, 'name1', 'lastName1'), (2, 'name2', 'lastName2'), (3, 'name3', 'lastName3');"
      );
      const res = await request(server).get("/api/clientes/4");
      expect(res.status).toBe(404);      
    });
  });

  describe('POST /', () => {
    let name;
    let lastName;
    beforeEach(() => {
      name = 'name';
      lastName = 'lastName'
    });
    afterEach(async () => {
      await connection.execute('delete from `client_test` where idClient = 0;');
    })

    it('should return 400 if client name is less than 3 caracters', async () => {
      name = 'a';
      const res = await request(server).post('/api/clientes').send({ name, lastName });
      expect(res.status).toBe(400);
    });


    it('should return 400 if client lastname is less than 3 caracters', async () => {
      lastName = 'a';
      const res = await request(server).post('/api/clientes').send({ name, lastName });
      expect(res.status).toBe(400);
    });

    it('should save the client if it is valid', async () => {
      const res = await request(server).post('/api/clientes').send({ name, lastName });
      
      expect(res.status).toBe(200);
      expect([res.body].length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'name');
      expect(res.body[0]).toHaveProperty('lastName', 'lastName');
    });

  });
})
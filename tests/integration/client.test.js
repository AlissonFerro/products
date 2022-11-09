const request = require('supertest');
const connect = require('../../db');
let server;
let connection;

async function clearDB(){
  await connection.execute('delete from `client_test` where idClient = 0;');
  await connection.execute('delete from `client_test` where idClient = 1;');
  await connection.execute('delete from `client_test` where idClient = 2;');
  await connection.execute('delete from `client_test` where idClient = 3;');
  await connection.execute('delete from `client_test` where idClient = 4;');
}

describe('/api/clientes', async() => {
  beforeEach(async () => { 
    server = require('../../index');
    connection = await connect();
  });
  
  afterEach(async() => { 
    connection.end();
    server.close();
  });

  describe('GET /', () => {
    afterEach(async () => clearDB() );

    it('should return all clients if was not removed', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00')," + 
        "(2, 'name2', 'lastName2', '2022-11-09 00:00:00')," + 
        "(3, 'name3', 'lastName3', '2022-11-09 00:00:00');"
      );
      const res = await request(server).get("/api/clientes");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('lastName');
      expect(res.body[0]).not.toHaveProperty('createdAt');    
      expect(res.body[0]).not.toHaveProperty('modifiedAt');    
      expect(res.body[0]).not.toHaveProperty('removedAt');    
    });

    it('should return all clients if was more 1 removed', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00')," + 
        "(3, 'name3', 'lastName3', '2022-11-09 00:00:00');"
      );
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt, removedAt)" +
        "VALUES (2, 'name2', 'lastName2', '2022-11-09 00:00:00', '2022-11-09 00:00:00');"
      );
      const res = await request(server).get("/api/clientes");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('lastName');
      expect(res.body[0]).not.toHaveProperty('createdAt');    
      expect(res.body[0]).not.toHaveProperty('modifiedAt');    
      expect(res.body[0]).not.toHaveProperty('removedAt');
    })
  });

  describe('GET /:id', () => {
    afterEach(async () => clearDB() );

    it('should return a client if valid id was passed', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00')," + 
        "(2, 'name2', 'lastName2', '2022-11-09 00:00:00')," + 
        "(3, 'name3', 'lastName3', '2022-11-09 00:00:00');"
      );
      
      const res = await request(server).get("/api/clientes/2");   
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'name2');
      expect(res.body[0]).toHaveProperty('lastName', 'lastName2');
      expect(res.body[0]).not.toHaveProperty('createdAt');    
      expect(res.body[0]).not.toHaveProperty('modifiedAt');    
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });
      
    it('should return 400 if id was not valid', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00')," + 
        "(2, 'name2', 'lastName2', '2022-11-09 00:00:00')," + 
        "(3, 'name3', 'lastName3', '2022-11-09 00:00:00');"
      );
      const invalidsId = ['a', '!'];
      invalidsId.map( async (invalidId) => {
        const res = await request(server).get(`/api/clientes/${invalidId}`);
        expect(res.status).toBe(400);
      })
    });
    
    it('should return 404 if id not found', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00')," + 
        "(2, 'name2', 'lastName2', '2022-11-09 00:00:00')," + 
        "(3, 'name3', 'lastName3', '2022-11-09 00:00:00');"
      );
      const res = await request(server).get("/api/clientes/4");
      expect(res.status).toBe(404);      
    });

    it('should return not found item if client was deleted', async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt, removedAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00', '2022-11-09 00:00:00');"
      );
      const res = await request(server).get("/api/clientes/1");
      expect(res.status).toBe(404);
    })
  });

  describe('POST /', () => {
    let name;
    let lastName;
    beforeEach(() => {
      name = 'name';
      lastName = 'lastName'
    });
    afterEach(async () => clearDB() )

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
      expect(res.body[0]).not.toHaveProperty('createdAt');    
      expect(res.body[0]).not.toHaveProperty('modifiedAt');    
      expect(res.body[0]).not.toHaveProperty('removedAt');
    });

  });

  describe('PUT /:id', () => {  
    beforeEach(async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName, createdAt)" +
        "VALUES (1, 'name1', 'lastName1', '2022-11-09 00:00:00');"
      );
    });
    
    afterEach(async () => clearDB());

    it('should return 400 if id is not valid', async () => {
      const invalidsId = ['a', '!'];
      invalidsId.map( async (invalidId) => {
        const res = await request(server)
          .put(`/api/clientes/${invalidId}`)
          .send({ name: 'alterName', lastName: 'Alter Last Name'});
        expect(res.status).toBe(400);
      });
    });

    it('should return 400 if name or lastName was not passed', async () => {
      const res = await request(server)
        .put(`/api/clientes/1`)
        .send({name: '', lastName: ''})
      expect(res.status).toBe(400);
    });

    it('should return 404 if id was not found', async () => {   
      const res = await request(server)
        .put(`/api/clientes/5`)
        .send({ name: 'alterName', lastName: 'Alter Last Name'});      
      expect(res.status).toBe(404);
    });

    it('should return 400 if name less than 3 caracters', async () => {
      const res = await request(server)
        .put('/api/clientes/1')
        .send({ name: 'a', lastName: 'last Name'});

      expect(res.status).toBe(400)
    });

    it('should return 400 if lastName less than 3 caracters', async () => {
      const res = await request(server)
        .put('/api/clientes/1')
        .send({ name: 'name', lastName: 'a'});
      
      expect(res.status).toBe(400);
    })
      
    it('should save new infos if name, lastName and id is valid', async () => {
      const res = await request(server)
        .put(`/api/clientes/1`)
        .send({ name: 'alterName', lastName: 'Alter Last Name'});     
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', 'alterName');
      expect(res.body[0]).toHaveProperty('lastName', 'Alter Last Name'); 
      expect(res.body[0]).not.toHaveProperty('createdAt');    
      expect(res.body[0]).not.toHaveProperty('modifiedAt');    
      expect(res.body[0]).not.toHaveProperty('removedAt');  
    });
  });

  describe('DELETE /:id', () => {
    beforeEach(async () => {
      await connection.execute(
        "INSERT INTO `client_test`(idClient, name, lastName) VALUES (1, 'name1', 'lastName1');"
      );
    });
    
    afterEach(async () => clearDB() );
    
    it('should return 400 if id is not valid', async () => {
      const invalidsId = ['a', '!', '1a', NaN];
      invalidsId.map(async (invalidId) => {
        const res = await request(server).delete(`/api/clientes/${invalidId}`).send();
        expect(res.status).toBe(400);
      })
    });

    it('should return 404 if id was not found', async () => {
      const res = await request(server).delete('/api/clientes/3').send();
      expect(res.status).toBe(404);
    });

    it('should delete item if id is valid', async () => {
      const res = await request(server).delete('/api/clientes/1').send();
      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0].removedAt).not.toBeNull();
    });
  });
  
})
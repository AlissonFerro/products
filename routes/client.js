const express = require('express');
const Client = require('../controller/Client');
const router = express.Router();

router
  .get("/api/clientes", Client.getAllClients)
  .get("/api/clientes/:id", Client.getClientById)
  .post("/api/clientes", Client.createClient)
  .put("/api/clientes/:id", Client.alterClientById)
  .delete('/api/clientes/:id', Client.removeClient)

module.exports = router;
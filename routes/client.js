const express = require('express');
const ClientController = require('../controller/Client');
const router = express.Router();

router
  .get("/api/clientes", ClientController.getAllClients)
  .get("/api/clientes/:id", ClientController.getClientById)
  .post("/api/clientes", ClientController.createClient)
  .put("/api/clientes/:id", ClientController.alterClientById)
  .delete('/api/clientes/:id', ClientController.removeClient)

module.exports = router;
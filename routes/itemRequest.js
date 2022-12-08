const express = require('express');
const router = express.Router();
const ItemRequest = require('../controller/ItemRequest');

router
  .get('/api/itensPedidos', ItemRequest.getAllItems)
  .get('/api/itensPedidos/:id', ItemRequest.getItemById)
  .post('/api/itensPedidos', ItemRequest.createItem)

module.exports = router;
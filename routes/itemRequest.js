const express = require('express');
const router = express.Router();
const ItemRequest = require('../controller/ItemRequest');

router
  .get('/api/itensPedidos', ItemRequest.getAllItems)

module.exports = router;
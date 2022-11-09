const express = require('express');
const router = express.Router();
const Product = require('../controller/Product');

router
  .get("/api/produtos", Product.getAllProducts)
  .get("/api/produtos/:id", Product.getProductById)
  .post('/api/produtos', Product.createProdut)
  .put('/api/produtos/:id', Product.alterProductById)
  .delete('/api/produtos/:id', Product.removeProduct)

module.exports = router;
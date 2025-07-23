const express = require('express');
const aicontoller = require('../controllers/aicontoller.js')

const router = express.Router();

// Example route

router.get('/aigetResult',aicontoller.getResult )

module.exports = router;
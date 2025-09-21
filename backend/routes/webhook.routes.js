const router = require('express').Router();
const { webhookHandler } = require('../controllers/webhook.controller');

// public endpoint - payment gateway will call this
router.post('/webhook', webhookHandler);

module.exports = router;

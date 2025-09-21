// const router = require('express').Router();
// const auth = require('../middlewares/auth.middleware');
// const { createPayment } = require('../controllers/payment.controller');

// router.post('/create-payment', auth, createPayment);

// module.exports = router;

const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const { createPayment, checkStatus } = require('../controllers/payment.controller');

router.post('/create-payment', auth, createPayment);
router.get('/status/:collect_request_id', auth, checkStatus); // optional: check gateway status

module.exports = router;

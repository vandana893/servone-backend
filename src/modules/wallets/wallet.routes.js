const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { rechargeSchema, paySchema } = require('./wallet.validation');

router.use(auth);

router.get('/me/balance', walletController.getMyBalance);
router.post('/recharge', validate({ body: rechargeSchema }), walletController.recharge);
router.post('/pay', validate({ body: paySchema }), walletController.pay);

module.exports = router;

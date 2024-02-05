const { convert } = require('../controllers/convert.controller');

const router = require('express').Router();

router.post('/convert',convert)

module.exports = router;

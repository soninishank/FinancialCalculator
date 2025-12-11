const express = require('express');
const router = express.Router();
const ipoController = require('../controllers/ipoController');

router.get('/', ipoController.getAllIpos);
router.post('/refresh', ipoController.refreshIpoData);
router.get('/:symbol', ipoController.getIpoDetails);

module.exports = router;

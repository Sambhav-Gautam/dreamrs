const express = require('express');
const router = express.Router();
const openingController = require('../controllers/openingController');

router.get('/', openingController.getOpenings);
router.post('/', openingController.updateOpenings);
router.post('/:category', openingController.addOpening);
router.delete('/:category/:index', openingController.deleteOpening);

module.exports = router;

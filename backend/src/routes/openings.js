const express = require('express');
const router = express.Router();
const openingController = require('../controllers/openingController');

// Get all openings (all 4 types)
router.get('/', openingController.getOpenings);

// Update a specific opening type (phd, mtech, btech, analyst)
router.put('/:category', openingController.updateOpeningType);

// Clear/reset a specific opening type
router.delete('/:category', openingController.deleteOpeningType);

module.exports = router;

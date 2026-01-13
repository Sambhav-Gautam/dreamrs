const express = require('express');
const router = express.Router();
const openingController = require('../controllers/openingController');

// Get all openings (all 4 categories with their arrays of items)
router.get('/', openingController.getOpenings);

// Add a new item to a category
router.post('/:category', openingController.addItem);

// Update an item in a category
router.put('/:category/:index', openingController.updateItem);

// Delete an item from a category
router.delete('/:category/:index', openingController.deleteItem);

module.exports = router;

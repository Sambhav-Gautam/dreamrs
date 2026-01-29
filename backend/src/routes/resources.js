const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// Get all resources
router.get('/', resourceController.getResources);

// Add a new resource
router.post('/', resourceController.addResource);

// Update a resource
router.put('/:id', resourceController.updateResource);

// Delete a resource
router.delete('/:id', resourceController.deleteResource);

module.exports = router;

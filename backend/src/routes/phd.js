const express = require('express');
const router = express.Router();
const phdController = require('../controllers/phdController');

// GET /api/data/phd - Get all PhD scholars
router.get('/', phdController.getPhd);

// POST /api/data/phd - Update all PhD data
router.post('/', phdController.updatePhd);

// POST /api/data/phd/scholar - Add a single scholar
router.post('/scholar', phdController.addScholar);

// PUT /api/data/phd/scholar/:index - Update a scholar by index
router.put('/scholar/:index', phdController.updateScholar);

// DELETE /api/data/phd/scholar/:index - Delete a scholar by index
router.delete('/scholar/:index', phdController.deleteScholar);

module.exports = router;

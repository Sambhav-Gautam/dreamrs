const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');

// Research data routes
router.get('/', researchController.getResearch);
router.post('/', researchController.updateResearch);

// Publication routes
router.post('/publications', researchController.addPublication);
router.put('/publications/:index', researchController.updatePublication);
router.delete('/publications/:index', researchController.deletePublication);

// Collaboration routes
router.post('/collaborations', researchController.addCollaboration);
router.delete('/collaborations/:index', researchController.deleteCollaboration);

module.exports = router;

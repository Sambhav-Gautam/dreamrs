const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Team data routes
router.get('/', teamController.getTeam);
router.post('/', teamController.updateTeam);

// Member routes
router.post('/members/:category', teamController.addMember);
router.put('/members/:category/:index', teamController.updateMember);
router.delete('/members/:category/:index', teamController.deleteMember);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');

// Configure multer for memory storage (files go to GridFS, not disk)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// File upload
router.post('/upload', upload.single('file'), fileController.uploadFile);

// List files
router.get('/list', fileController.listFiles);

// Get file by filename
router.get('/download/:filename', fileController.getFile);

// Get file by ID
router.get('/id/:id', fileController.getFileById);

// Delete file by filename
router.post('/delete', fileController.deleteFile);

// Delete file by ID
router.delete('/id/:id', fileController.deleteFileById);

module.exports = router;

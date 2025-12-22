const { getGridFSBucket } = require('../config/database');
const mongoose = require('mongoose');
const { Readable } = require('stream');

// Upload a file
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const bucket = getGridFSBucket();
        const { originalname, mimetype, buffer } = req.file;

        // Sanitize filename
        const safeName = originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${Date.now()}-${safeName}`;

        // Determine file type folder (for metadata)
        let folder = 'pdfs';
        if (mimetype.startsWith('image/')) {
            folder = req.query.folder === 'team' ? 'images/team' : 'images/publications';
        }

        // Create readable stream from buffer
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);

        // Upload to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                originalName: originalname,
                contentType: mimetype,
                folder: folder,
                uploadDate: new Date()
            }
        });

        readableStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
            res.json({
                success: true,
                filename: filename,
                fileId: uploadStream.id.toString(),
                originalName: originalname,
                contentType: mimetype
            });
        });

        uploadStream.on('error', (error) => {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

// Get/Download a file by filename
exports.getFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const bucket = getGridFSBucket();

        // Find the file
        const files = await bucket.find({ filename }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Set content type header
        if (file.metadata && file.metadata.contentType) {
            res.set('Content-Type', file.metadata.contentType);
        }

        // Set content disposition for download
        res.set('Content-Disposition', `inline; filename="${file.metadata?.originalName || filename}"`);

        // Stream the file
        const downloadStream = bucket.openDownloadStreamByName(filename);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Failed to download file' });
        });

    } catch (error) {
        console.error('Error getting file:', error);
        res.status(500).json({ error: 'Failed to get file' });
    }
};

// Get file by ID
exports.getFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const bucket = getGridFSBucket();

        const objectId = new mongoose.Types.ObjectId(id);
        const files = await bucket.find({ _id: objectId }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = files[0];

        // Set content type header
        if (file.metadata && file.metadata.contentType) {
            res.set('Content-Type', file.metadata.contentType);
        }

        res.set('Content-Disposition', `inline; filename="${file.metadata?.originalName || file.filename}"`);

        // Stream the file
        const downloadStream = bucket.openDownloadStream(objectId);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Failed to download file' });
        });

    } catch (error) {
        console.error('Error getting file:', error);
        res.status(500).json({ error: 'Failed to get file' });
    }
};

// List files
exports.listFiles = async (req, res) => {
    try {
        const { dir } = req.query;
        const bucket = getGridFSBucket();

        let query = {};
        if (dir) {
            let folder = 'pdfs';
            if (dir === 'publications') folder = 'images/publications';
            if (dir === 'team') folder = 'images/team';

            query = { 'metadata.folder': folder };
        }

        const files = await bucket.find(query).toArray();

        const fileList = files.map(file => ({
            filename: file.filename,
            fileId: file._id.toString(),
            originalName: file.metadata?.originalName,
            contentType: file.metadata?.contentType,
            uploadDate: file.uploadDate,
            length: file.length
        }));

        res.json(fileList);
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
};

// Delete a file
exports.deleteFile = async (req, res) => {
    try {
        const { filename } = req.body;
        const bucket = getGridFSBucket();

        // Find the file first
        const files = await bucket.find({ filename }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete the file
        await bucket.delete(files[0]._id);

        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};

// Delete file by ID
exports.deleteFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const bucket = getGridFSBucket();

        await bucket.delete(new mongoose.Types.ObjectId(id));

        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from root
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Explicitly serve uploads

// Storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/pdfs'; // default for PDFs

        if (file.mimetype.startsWith('image/')) {
            // Check query param for specific folder
            if (req.query.folder === 'team') {
                dir = 'uploads/images/team';
            } else {
                dir = 'uploads/images/publications';
            }
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        cb(null, Date.now() + '-' + safeName);
    }
});
const upload = multer({ storage: storage });

// Helper to read data
const readData = (file) => {
    const dataPath = path.join(__dirname, 'data', `${file}.json`);
    if (!fs.existsSync(dataPath)) return null;
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
};

// Helper to write data
const writeData = (file, data) => {
    const dataPath = path.join(__dirname, 'data', `${file}.json`);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// --- AUTHENTICATION ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        res.json({ success: true, token: 'admin-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// --- DATA ENDPOINTS ---

// Get all data for a section
app.get('/api/data/:section', (req, res) => {
    const data = readData(req.params.section);
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Section not found' });
    }
});

// Update data for a section (Protected)
app.post('/api/data/:section', (req, res) => {
    // In a real app, verify token here
    const section = req.params.section;
    const newData = req.body;
    writeData(section, newData);
    res.json({ success: true });
});

// --- FILE UPLOADS ---

// Upload File (PDF or Image)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return filename. Frontend will construct path based on context.
    // Or we could return the relative path.
    // Let's return just filename as stored in the specific dir.

    res.json({ filename: req.file.filename });
});

// List Files in Directory
app.get('/api/files/list', (req, res) => {
    const { dir } = req.query;
    let targetDir = 'uploads/pdfs';

    if (dir === 'publications') targetDir = 'uploads/images/publications';
    if (dir === 'team') targetDir = 'uploads/images/team';
    // Add other allowed dirs if needed

    const fullPath = path.join(__dirname, targetDir);

    if (!fs.existsSync(fullPath)) {
        return res.json([]);
    }

    fs.readdir(fullPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        res.json(files);
    });
});

// Delete File (PDF or Image)
app.post('/api/delete-file', (req, res) => {
    const { filename, type } = req.body;
    let dir = 'uploads/pdfs';

    if (type === 'image') {
        // "image" is ambiguous in new structure, usually means research/pub image
        dir = 'uploads/images/publications';
    } else if (type === 'team_image') {
        dir = 'uploads/images/team';
    }

    const filePath = path.join(__dirname, dir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

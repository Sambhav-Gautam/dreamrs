/**
 * Migration Script - Import existing JSON data and files into MongoDB
 * 
 * This script will:
 * 1. Read existing JSON files from the data/ directory
 * 2. Import PDFs and images from uploads/ into GridFS
 * 3. Create MongoDB documents with references to the GridFS files
 * 
 * Usage: node src/utils/migrate.js --data-path /path/to/dreamrs
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const { connectDB, getGridFSBucket } = require('../config/database');
const Research = require('../models/Research');
const Team = require('../models/Team');
const Course = require('../models/Course');
const Opening = require('../models/Opening');

// Parse command line arguments
const args = process.argv.slice(2);
let dataPath = '../..'; // Default: parent of backend folder

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-path' && args[i + 1]) {
        dataPath = args[i + 1];
        i++;
    }
}

// Helper function to read JSON file
const readJsonFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn(`Warning: Could not read ${filePath}:`, error.message);
    }
    return null;
};

// Helper function to upload file to GridFS
const uploadFileToGridFS = async (filePath, folder) => {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(filePath)) {
                return resolve(null);
            }

            const bucket = getGridFSBucket();
            const filename = path.basename(filePath);
            const buffer = fs.readFileSync(filePath);

            // Detect content type
            const ext = path.extname(filename).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.pdf') contentType = 'application/pdf';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';

            const readableStream = new Readable();
            readableStream.push(buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(filename, {
                metadata: {
                    originalName: filename,
                    contentType: contentType,
                    folder: folder,
                    uploadDate: new Date(),
                    migratedFrom: 'filesystem'
                }
            });

            readableStream.pipe(uploadStream);

            uploadStream.on('finish', () => {
                console.log(`  ✓ Uploaded: ${filename}`);
                resolve({
                    fileId: uploadStream.id,
                    filename: filename
                });
            });

            uploadStream.on('error', (error) => {
                console.error(`  ✗ Failed to upload ${filename}:`, error.message);
                reject(error);
            });
        } catch (error) {
            console.error(`  ✗ Error processing ${filePath}:`, error.message);
            reject(error);
        }
    });
};

// Migrate research data
const migrateResearch = async (dataDir) => {
    console.log('\n📚 Migrating research data...');

    const researchFile = path.join(dataDir, 'data', 'research.json');
    const data = readJsonFile(researchFile);

    if (!data) {
        console.log('  No research data found.');
        return;
    }

    // Delete existing research data
    await Research.deleteMany({});

    const research = new Research({
        publications: data.publications || [],
        collaborations: data.collaborations || []
    });

    await research.save();
    console.log(`  ✓ Migrated ${research.publications.length} publications`);
    console.log(`  ✓ Migrated ${research.collaborations.length} collaborations`);
};

// Migrate team data
const migrateTeam = async (dataDir) => {
    console.log('\n👥 Migrating team data...');

    const teamFile = path.join(dataDir, 'data', 'team.json');
    const data = readJsonFile(teamFile);

    if (!data) {
        console.log('  No team data found.');
        return;
    }

    // Delete existing team data
    await Team.deleteMany({});

    // Upload team images and update references
    const uploadDir = path.join(dataDir, 'uploads', 'images', 'team');

    const processMembers = async (members) => {
        const processed = [];
        for (const member of members) {
            if (member.imageFilename || member.image) {
                const imageName = member.imageFilename || member.image;
                const imagePath = path.join(uploadDir, imageName);

                if (fs.existsSync(imagePath)) {
                    const result = await uploadFileToGridFS(imagePath, 'images/team');
                    if (result) {
                        member.image = result.fileId;
                        member.imageFilename = result.filename;
                    }
                }
            }
            processed.push(member);
        }
        return processed;
    };

    const teamData = {
        phd_scholars: await processMembers(data.phd_scholars || []),
        masters_students: await processMembers(data.masters_students || []),
        btech_students: await processMembers(data.btech_students || []),
        alumni: await processMembers(data.alumni || [])
    };

    const team = new Team(teamData);
    await team.save();

    const totalMembers = Object.values(teamData).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`  ✓ Migrated ${totalMembers} team members`);
};

// Migrate courses data
const migrateCourses = async (dataDir) => {
    console.log('\n📖 Migrating courses data...');

    const coursesFile = path.join(dataDir, 'data', 'courses.json');
    const data = readJsonFile(coursesFile);

    if (!data || !Array.isArray(data)) {
        console.log('  No courses data found.');
        return;
    }

    // Delete existing courses
    await Course.deleteMany({});

    if (data.length > 0) {
        await Course.insertMany(data);
    }

    console.log(`  ✓ Migrated ${data.length} courses`);
};

// Migrate openings data
const migrateOpenings = async (dataDir) => {
    console.log('\n📋 Migrating openings data...');

    const openingsFile = path.join(dataDir, 'data', 'openings.json');
    const data = readJsonFile(openingsFile);

    if (!data) {
        console.log('  No openings data found.');
        return;
    }

    // Delete existing openings
    await Opening.deleteMany({});

    const pdfDir = path.join(dataDir, 'uploads', 'pdfs');
    const categories = ['PhD Positions', 'Research Assistant', 'B.Tech Projects'];

    for (const category of categories) {
        const items = data[category] || [];
        const processedItems = [];

        for (const item of items) {
            const pdfPath = path.join(pdfDir, item.file);

            if (fs.existsSync(pdfPath)) {
                const result = await uploadFileToGridFS(pdfPath, 'pdfs');
                if (result) {
                    processedItems.push({
                        name: item.name,
                        fileId: result.fileId,
                        filename: result.filename,
                        originalFilename: item.file
                    });
                }
            } else {
                processedItems.push({
                    name: item.name,
                    filename: item.file
                });
            }
        }

        if (processedItems.length > 0) {
            const opening = new Opening({
                category,
                items: processedItems
            });
            await opening.save();
            console.log(`  ✓ Migrated ${processedItems.length} items in "${category}"`);
        }
    }
};

// Upload remaining files
const migrateRemainingFiles = async (dataDir) => {
    console.log('\n📁 Migrating remaining files...');

    const dirs = [
        { path: path.join(dataDir, 'uploads', 'pdfs'), folder: 'pdfs' },
        { path: path.join(dataDir, 'uploads', 'images', 'publications'), folder: 'images/publications' },
        { path: path.join(dataDir, 'uploads', 'images', 'team'), folder: 'images/team' }
    ];

    const bucket = getGridFSBucket();

    for (const dir of dirs) {
        if (!fs.existsSync(dir.path)) continue;

        const files = fs.readdirSync(dir.path);
        let uploaded = 0;

        for (const file of files) {
            // Check if file already exists in GridFS
            const existing = await bucket.find({ filename: file }).toArray();
            if (existing.length > 0) continue;

            const filePath = path.join(dir.path, file);
            const stat = fs.statSync(filePath);

            if (stat.isFile()) {
                try {
                    await uploadFileToGridFS(filePath, dir.folder);
                    uploaded++;
                } catch (err) {
                    console.warn(`  ⚠ Skipped ${file}: ${err.message}`);
                }
            }
        }

        if (uploaded > 0) {
            console.log(`  ✓ Uploaded ${uploaded} files from ${dir.folder}`);
        }
    }
};

// Main migration function
const migrate = async () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('       DREAMRS Data Migration to MongoDB');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\nData source: ${path.resolve(dataPath)}`);

    try {
        await connectDB();
        console.log('\n✓ Connected to MongoDB');

        const resolvedPath = path.resolve(dataPath);

        await migrateResearch(resolvedPath);
        await migrateTeam(resolvedPath);
        await migrateCourses(resolvedPath);
        await migrateOpenings(resolvedPath);
        await migrateRemainingFiles(resolvedPath);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('       Migration completed successfully! 🎉');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n✗ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

migrate();

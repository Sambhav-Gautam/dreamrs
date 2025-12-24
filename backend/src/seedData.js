/**
 * Enhanced Seed Script - Uploads all data AND images to MongoDB
 * Run with: node src/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Import models
const Team = require('./models/Team');
const ResearchData = require('./models/Research');
const CoursesData = require('./models/Course');
const OpeningsData = require('./models/Opening');
const Settings = require('./models/Settings');
const PhdData = require('./models/Phd');

// Paths
const DATA_DIR = path.join(__dirname, '../../data');
const IMAGES_DIR = path.join(__dirname, '../../images');

let gridFSBucket;

// Initialize GridFS bucket
function initGridFS(db) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'uploads'
    });
    console.log('✅ GridFS bucket initialized');
}

// Upload a file to GridFS and return the filename
async function uploadFileToGridFS(filePath, folder = 'images') {
    return new Promise((resolve, reject) => {
        const filename = path.basename(filePath);
        const safeName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const gridFSFilename = `${Date.now()}-${safeName}`;

        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.mp4': 'video/mp4'
        };

        const ext = path.extname(filename).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        const readStream = fs.createReadStream(filePath);
        const uploadStream = gridFSBucket.openUploadStream(gridFSFilename, {
            metadata: {
                originalName: filename,
                contentType: contentType,
                folder: folder,
                uploadDate: new Date()
            }
        });

        readStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
            resolve({
                originalName: filename,
                gridFSFilename: gridFSFilename,
                fileId: uploadStream.id.toString()
            });
        });

        uploadStream.on('error', (error) => {
            reject(error);
        });
    });
}

// Upload all images from a directory
async function uploadAllImages(directory, folder) {
    const uploadedFiles = {};

    if (!fs.existsSync(directory)) {
        console.log(`  Directory ${directory} does not exist, skipping...`);
        return uploadedFiles;
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && !file.startsWith('.')) {
            try {
                const result = await uploadFileToGridFS(filePath, folder);
                uploadedFiles[file] = result.gridFSFilename;
                console.log(`    ✅ Uploaded: ${file} -> ${result.gridFSFilename}`);
            } catch (err) {
                console.log(`    ❌ Failed to upload ${file}: ${err.message}`);
            }
        }
    }

    return uploadedFiles;
}

// Update team data with new image filenames
function updateTeamImages(teamData, imageMap) {
    const updated = {};

    for (const category in teamData) {
        updated[category] = teamData[category].map(member => {
            if (member.image && imageMap[member.image]) {
                return { ...member, image: imageMap[member.image] };
            }
            return member;
        });
    }

    return updated;
}

async function seedDatabase() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Initialize GridFS
        initGridFS(conn.connection.db);

        // Clear existing files in GridFS
        console.log('\nClearing existing GridFS files...');
        const existingFiles = await gridFSBucket.find({}).toArray();
        for (const file of existingFiles) {
            await gridFSBucket.delete(file._id);
        }
        console.log(`✅ Cleared ${existingFiles.length} existing files`);

        // Upload all images
        console.log('\n========================================');
        console.log('📁 UPLOADING IMAGES TO GRIDFS');
        console.log('========================================');

        console.log('\n📷 Uploading main images...');
        const mainImages = await uploadAllImages(IMAGES_DIR, 'images');

        console.log('\n📷 Uploading publication images...');
        const publicationImages = await uploadAllImages(
            path.join(IMAGES_DIR, 'publications'),
            'images/publications'
        );

        // Combine all image mappings
        const allImageMappings = { ...mainImages, ...publicationImages };
        console.log(`\n✅ Total images uploaded: ${Object.keys(allImageMappings).length}`);

        // Load JSON data files
        console.log('\n========================================');
        console.log('📊 SEEDING DATA COLLECTIONS');
        console.log('========================================');

        console.log('\nLoading data files...');
        const teamData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'team.json'), 'utf8'));
        const researchData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'research.json'), 'utf8'));
        const coursesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'courses.json'), 'utf8'));
        const openingsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'openings.json'), 'utf8'));
        const phdData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'phd.json'), 'utf8'));
        console.log('✅ Loaded all data files');

        // Update team data with new image references
        console.log('\nUpdating team image references...');
        const updatedTeamData = updateTeamImages(teamData, allImageMappings);

        // Update PhD data with new image references
        console.log('\nUpdating PhD image references...');
        const updatedPhdScholars = phdData.scholars.map(scholar => {
            if (scholar.image && allImageMappings[scholar.image]) {
                return { ...scholar, image: allImageMappings[scholar.image] };
            }
            return scholar;
        });

        // Clear existing data
        console.log('\nClearing existing collections...');
        await Team.deleteMany({});
        await ResearchData.deleteMany({});
        await CoursesData.deleteMany({});
        await OpeningsData.deleteMany({});
        await PhdData.deleteMany({});
        await Settings.deleteMany({});
        console.log('✅ Cleared existing collections');

        // Seed Team data
        console.log('\nSeeding Team data...');
        await Team.create({ data: updatedTeamData });
        console.log('✅ Team data seeded');

        // Seed Research data
        console.log('\nSeeding Research data...');
        await ResearchData.create({ data: researchData });
        console.log('✅ Research data seeded');

        // Seed Courses data
        console.log('\nSeeding Courses data...');
        await CoursesData.create({ courses: coursesData });
        console.log('✅ Courses data seeded');

        // Seed Openings data
        console.log('\nSeeding Openings data...');
        await OpeningsData.create({ data: openingsData });
        console.log('✅ Openings data seeded');

        // Seed PhD data
        console.log('\nSeeding PhD data...');
        await PhdData.create({ scholars: updatedPhdScholars });
        console.log('✅ PhD data seeded');

        // Seed Settings
        console.log('\n========================================');
        console.log('⚙️  SEEDING SETTINGS');
        console.log('========================================');

        // Site Logo
        const logoFilename = allImageMappings['logo.png'] || 'logo.png';
        await Settings.findOneAndUpdate(
            { key: 'siteLogo' },
            { key: 'siteLogo', value: logoFilename },
            { upsert: true, new: true }
        );
        console.log(`✅ siteLogo: ${logoFilename}`);

        // Theme Color
        await Settings.findOneAndUpdate(
            { key: 'themeColor' },
            { key: 'themeColor', value: '#16a34a' },
            { upsert: true, new: true }
        );
        console.log('✅ themeColor: #16a34a');

        // PI Bio
        const defaultPIBio = `
            <p><span class="text-leaf font-bold">Dr. Sonal Keshwani</span> is the Founder and Principal
                Investigator of the Design Research and Human Factors Lab (<span
                    class="text-leaf font-semibold">DREAMRS</span> Lab), Department of Human-Centered
                Design, IIIT-Delhi. She holds a Ph.D. and an MSc in Design from <a
                    href="https://dm.iisc.ac.in/cpdm/ideaslab/" class="text-leaf hover:underline">IDeaS
                    Lab</a>, <a href="https://dm.iisc.ac.in/dm/"
                    class="text-leaf hover:underline">Department of Design and Manufacturing</a>, <a
                    href="https://iisc.ac.in/" class="text-leaf hover:underline">Indian Institute of
                    Science (IISc), Bangalore</a> (2018), and a B.Tech in Production Engineering from
                G.B. Pant University, Pantnagar (2008). Dr. Keshwani serves on the review boards of
                several leading publications, including the Journal of Engineering Design (Taylor and
                Francis), Research in Engineering Design (Springer), and the ASME IDETC conference. Her
                research has been published in five international peer-reviewed SCI journals. She was
                also a guest researcher at the Japan Advanced Institute of Science and Technology, where
                she received the prestigious JASSO scholarship.</p>
            <p class="mt-4">In addition to her research, Dr. Keshwani has fostered international
                collaborations with institutions such as the Technical University of Denmark,
                Politecnico di Milano, and Ariel University. She was a founding member of the School of
                Design and Digital Transmedia at Dayananda Sagar University (DSU), Bangalore, where she
                served from 2021 to 2023. Before transitioning to academia, Dr. Keshwani gained industry
                experience working with Tata Motors Ltd. from 2008 to 2011.</p>
        `;
        await Settings.findOneAndUpdate(
            { key: 'piContent' },
            { key: 'piContent', value: defaultPIBio },
            { upsert: true, new: true }
        );
        console.log('✅ piContent: Default PI biography');

        // PI Education
        const piEducation = [
            {
                degree: 'Doctor of Philosophy (Ph.D.) in Design',
                institution: 'Indian Institute of Science (IISc), Bangalore',
                year: '2011–2018',
                thesis: 'Design approaches for bioinspired design'
            },
            {
                degree: 'Master of Science (M.Sc.) in Design',
                institution: 'Indian Institute of Science (IISc), Bangalore',
                year: '2011–2013'
            },
            {
                degree: 'Bachelor of Technology (B.Tech) in Production Engineering',
                institution: 'G.B. Pant University of Agriculture and Technology, Pantnagar',
                year: '2004–2008'
            }
        ];
        await Settings.findOneAndUpdate(
            { key: 'piEducation' },
            { key: 'piEducation', value: piEducation },
            { upsert: true, new: true }
        );
        console.log('✅ piEducation: 3 entries');

        // PI Experience
        const piExperience = [
            {
                role: 'Assistant Professor',
                institution: 'IIIT Delhi, Department of Human-Centered Design',
                period: 'July 2023 – Present'
            },
            {
                role: 'Assistant Professor',
                institution: 'Dayananda Sagar University, School of Design',
                period: '2021 – 2023'
            },
            {
                role: 'Graduate Engineer Trainee / Engineer',
                institution: 'Tata Motors Ltd.',
                period: '2008 – 2011'
            }
        ];
        await Settings.findOneAndUpdate(
            { key: 'piExperience' },
            { key: 'piExperience', value: piExperience },
            { upsert: true, new: true }
        );
        console.log('✅ piExperience: 3 entries');

        // PI Awards
        const piAwards = [
            {
                title: 'GATE All India Rank 33',
                description: '2008, Production and Industrial Engineering'
            },
            {
                title: 'JASSO Scholarship',
                description: 'Received the prestigious JASSO scholarship at Japan Advanced Institute of Science and Technology (JAIST)'
            },
            {
                title: 'International Journal Publications',
                description: 'Research published in five international peer-reviewed SCI journals'
            }
        ];
        await Settings.findOneAndUpdate(
            { key: 'piAwards' },
            { key: 'piAwards', value: piAwards },
            { upsert: true, new: true }
        );
        console.log('✅ piAwards: 2 entries');

        console.log('\n========================================');
        console.log('🎉 ALL DATA SEEDED SUCCESSFULLY!');
        console.log('========================================');

        // Verify the data
        console.log('\nVerifying seeded data:');
        const teamCount = await Team.countDocuments();
        const researchCount = await ResearchData.countDocuments();
        const coursesCount = await CoursesData.countDocuments();
        const openingsCount = await OpeningsData.countDocuments();
        const settingsCount = await Settings.countDocuments();
        const filesCount = (await gridFSBucket.find({}).toArray()).length;

        console.log(`  📊 Team documents: ${teamCount}`);
        console.log(`  📊 Research documents: ${researchCount}`);
        console.log(`  📊 Courses documents: ${coursesCount}`);
        console.log(`  📊 Openings documents: ${openingsCount}`);
        console.log(`  ⚙️  Settings documents: ${settingsCount}`);
        console.log(`  📁 Files in GridFS: ${filesCount}`);

        console.log('\n💡 Image Mapping Reference:');
        console.log('   (Original -> GridFS Filename)');
        Object.entries(allImageMappings).slice(0, 5).forEach(([orig, gridfs]) => {
            console.log(`   ${orig} -> ${gridfs}`);
        });
        if (Object.keys(allImageMappings).length > 5) {
            console.log(`   ... and ${Object.keys(allImageMappings).length - 5} more`);
        }

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    }
}

// Run the seed function
seedDatabase();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load Models
const Course = require('./models/Course');
const Opening = require('./models/Opening');
const ResearchData = require('./models/Research');
const Team = require('./models/Team');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

// Read JSON files
const dataDir = path.join(__dirname, '../../data');

const getJsonData = (filename) => {
    try {
        const filePath = path.join(dataDir, filename);
        if (fs.existsSync(filePath)) {
            const json = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(json);
        } else {
            console.warn(`Warning: ${filename} not found.`);
            return null;
        }
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return null;
    }
};

const importData = async () => {
    try {
        // Clear existing data
        await Course.deleteMany();
        await Opening.deleteMany();
        await ResearchData.deleteMany();
        await Team.deleteMany();

        console.log('Data Cleared...');

        // 1. Courses
        const courses = getJsonData('courses.json');
        if (courses) {
            // Course model expects { courses: [...] }
            await Course.create({ courses: courses });
            console.log('Courses Imported...');
        }

        // 2. Openings
        const openings = getJsonData('openings.json');
        if (openings) {
            // Opening model expects { data: ... }
            await Opening.create({ data: openings });
            console.log('Openings Imported...');
        }

        // 3. Research
        const research = getJsonData('research.json');
        if (research) {
            // Inject projects if missing
            if (!research.projects) {
                console.log('Injecting empty projects structure...');
                research.projects = { funded: [], other: [] };
            } else {
                console.log(`Found ${research.projects.funded?.length || 0} funded and ${research.projects.other?.length || 0} other projects from JSON...`);
            }
            // ResearchData model expects { data: ... }
            await ResearchData.create({ data: research });
            console.log('Research Data Imported...');
        }

        // 4. Team
        const team = getJsonData('team.json');
        if (team) {
            // Team model expects { data: ... }
            await Team.create({ data: team });
            console.log('Team Data Imported...');
        }

        console.log('All Data Imported Successfully!');
        process.exit();

    } catch (err) {
        console.error('Error with data import:', err);
        process.exit(1);
    }
};

importData();

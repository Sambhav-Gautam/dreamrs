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

        // 5. Settings (PI Content)
        const Settings = require('./models/Settings');
        await Settings.deleteMany();

        const piContent = `<p class="mb-4"><span class="text-leaf">Dr. Sonal Keshwani</span> is the Founder and Principal Investigator of the Design Research and Human Factors Lab (<span class="text-leaf">DREAMRS</span> Lab), Department of Human-Centered Design, IIIT-Delhi. She holds a Ph.D. and an MSc in Design from <a href="https://dm.iisc.ac.in/cpdm/ideaslab/" class="text-leaf hover:underline" target="_blank">IDeaS Lab</a>, <a href="https://dm.iisc.ac.in/dm/" class="text-leaf hover:underline" target="_blank">Department of Design and Manufacturing</a>, <a href="https://iisc.ac.in/" class="text-leaf hover:underline" target="_blank">Indian Institute of Science (IISc), Bangalore</a> (2018), and a B.Tech in Production Engineering from G.B. Pant University, Pantnagar (2008). Dr. Keshwani serves on the review boards of several leading publications, including the Journal of Engineering Design (Taylor and Francis), Research in Engineering Design (Springer), and the ASME IDETC conference. Her research has been published in five international peer-reviewed SCI journals. She was also a guest researcher at the Japan Advanced Institute of Science and Technology, where she received the prestigious JASSO scholarship.</p><p>In addition to her research, Dr. Keshwani has fostered international collaborations with institutions such as the Technical University of Denmark, Politecnico di Milano, and Ariel University. She was a founding member of the School of Design and Digital Transmedia at Dayananda Sagar University (DSU), Bangalore, where she served from 2021 to 2023. Before transitioning to academia, Dr. Keshwani gained industry experience working with Tata Motors Ltd. from 2008 to 2011.</p>`;

        await Settings.create({ key: 'piContent', value: piContent });
        console.log('Settings (PI Content) Imported...');

        // 6. Settings (PI Sections)
        const piEducation = [
            {
                degree: "Doctor of Philosophy (Ph.D.)",
                institution: "Department of Design and Manufacturing, Indian Institute of Science, Bangalore",
                year: "2011–2018",
                details: "Thesis: <em>Supporting Designers in Generating Novel Ideas at the Conceptual Stage using Analogies from the Biological Domain</em>"
            },
            {
                degree: "Master of Science (M.Sc.)",
                institution: "Centre for Product Design and Manufacturing, Indian Institute of Science, Bangalore",
                year: "",
                details: ""
            },
            {
                degree: "Bachelor of Technology (B.Tech.)",
                institution: "Production Engineering, G.B. Pant University of Agriculture and Technology, Pantnagar",
                year: "",
                details: ""
            }
        ];

        const piExperience = [
            {
                role: "Full-Time Visiting Faculty",
                institution: "Department of Human-Centered Design, IIIT Delhi",
                period: "July 2023 – Present"
            },
            {
                role: "Founding Member and Assistant Professor",
                institution: "School of Design and Digital Transmedia, Dayananda Sagar University, Bengaluru",
                period: "Sep 2021 – July 2023"
            },
            {
                role: "Guest Researcher",
                institution: "Japan Advanced Institute of Science and Technology, Japan",
                period: "May 2018 – July 2018"
            }
        ];

        const piAwards = [
            {
                title: "Recipient of JASSO Scholarship (2018)",
                description: ""
            },
            {
                title: "Certificate of Merit for the following papers:",
                description: `<ul class="list-disc list-inside pl-6 mt-2 space-y-3">
                    <li>
                        <strong>Keshwani S, and Chakrabarti A (2017)</strong>:
                        Towards automatic classification of description of analogies into SAPPhIRE constructs.
                        In: <em>Proceedings of 6th International Conference on Research in Design</em>, Guwahati, India, 9-11 January.
                    </li>
                    <li>
                        <strong>Keshwani S, Lenau TA, Ahmed-Kristensen S, Chakrabarti A (2013)</strong>:
                        Comparing novelty of designs from biological-inspiration with those from brainstorming.
                        In: <em>Journal of Engineering Design</em>, 24(10), 723-753.
                    </li>
                </ul>`
            }
        ];

        await Settings.create({ key: 'piEducation', value: piEducation });
        await Settings.create({ key: 'piExperience', value: piExperience });
        await Settings.create({ key: 'piAwards', value: piAwards });
        console.log('Settings (PI Sections) Imported...');

        console.log('All Data Imported Successfully!');
        process.exit();

    } catch (err) {
        console.error('Error with data import:', err);
        process.exit(1);
    }
};

importData();

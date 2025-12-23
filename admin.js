// --- API CONFIGURATION ---
// Uses window.ENV from env.js
const API_BASE_URL = window.ENV?.API_BASE_URL || window.API_CONFIG?.API_BASE_URL || '';

// Helper function for API calls
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    return fetch(url, { ...options, headers });
}

// Helper to get file URL
function getFileUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}/api/files/download/${encodeURIComponent(path)}`;
}

// --- GLOBAL STATE ---
let researchData = { publications: [], collaborations: [], projects: { funded: [], other: [] } };
let teamData = {};
let coursesData = [];
let openingsData = {};

// --- TABS & MODALS LOGIC ---
function openTab(tabName) {
    const tabs = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.add('hidden');
    }
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    const buttons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('text-leaf', 'border-leaf');
        buttons[i].classList.add('text-gray-500', 'border-transparent');
    }
    event.currentTarget.classList.remove('text-gray-500', 'border-transparent');
    event.currentTarget.classList.add('text-leaf', 'border-leaf');

    // Refresh specific data if needed
    if (tabName === 'openings') fetchOpenings();
}

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// --- AUTH LOGIC ---
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        loadAllData();
        // Also load and apply theme settings
        fetchThemeSettings();
    } else {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await apiFetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            checkAuth();
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        alert('Login failed');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    checkAuth();
});

// --- DATA LOADING ---

async function loadAllData() {
    await Promise.all([
        fetchResearch(),
        fetchTeam(),
        fetchCourses(),
        fetchOpenings()
    ]);
}

async function fetchResearch() {
    const res = await apiFetch('/api/data/research');
    researchData = await res.json();
    renderResearchList();
    renderResearchList();
    renderCollabList();
    renderProjectsList();
}

async function fetchTeam() {
    const res = await apiFetch('/api/data/team');
    teamData = await res.json();
    renderTeamList();
}

async function fetchCourses() {
    const res = await apiFetch('/api/data/courses');
    coursesData = await res.json();
    renderCoursesList();
}

// --- RESEARCH MANAGEMENT ---

function renderResearchList() {
    const container = document.getElementById('publications-list');
    container.innerHTML = '';

    researchData.publications.forEach((pub, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800 dark:text-white">${pub.Title}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">${pub.Author} | ${pub.Year}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editPublication(${index})" class="text-blue-500 hover:text-blue-700">Edit</button>
                <button onclick="deletePublication(${index})" class="text-red-500 hover:text-red-700">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openPublicationModal() {
    document.getElementById('pub-form').reset();
    document.getElementById('pub-index').value = -1;
    document.getElementById('pub-modal-title').textContent = 'Add Publication';
    document.getElementById('pub-current-images').innerHTML = '';
    openModal('publication-modal');
}

function editPublication(index) {
    const pub = researchData.publications[index];
    document.getElementById('pub-index').value = index;
    document.getElementById('pub-title').value = pub.Title;
    document.getElementById('pub-author').value = pub.Author;
    document.getElementById('pub-journal').value = pub.Journal;
    document.getElementById('pub-year').value = pub.Year;
    document.getElementById('pub-cited').value = pub.Cited_by || '';
    document.getElementById('pub-link').value = pub.Link;
    document.getElementById('pub-modal-title').textContent = 'Edit Publication';

    const imgContainer = document.getElementById('pub-current-images');
    imgContainer.innerHTML = '';

    if (pub.images && pub.images.length > 0) {
        pub.images.forEach((img, i) => {
            const div = document.createElement('div');
            div.className = "relative group inline-block m-2";
            div.innerHTML = `
                <img src="${getFileUrl(img)}" class="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm" alt="Publication Image" onerror="this.style.display='none'">
                <button type="button" onclick="removePubImage(${index}, ${i})" title="Remove Image" class="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg shadow-md transition-transform hover:scale-110 z-10">×</button>
            `;
            imgContainer.appendChild(div);
        });
    } else {
        imgContainer.innerHTML = '<p class="text-sm text-gray-500 italic p-2">No images uploaded yet.</p>';
    }

    openModal('publication-modal');
}

async function removePubImage(pubIndex, imgIndex) {
    if (!confirm('Remove this image?')) return;
    const pub = researchData.publications[pubIndex];
    const filename = pub.images[imgIndex];

    // Remove from array or mark for removal? 
    // Ideally we remove immediately and save to keep UI simple
    pub.images.splice(imgIndex, 1);

    // Delete file from server
    try {
        await apiFetch('/api/delete-file', {
            method: 'POST',
            body: JSON.stringify({ filename, type: 'image' })
        });
    } catch (e) {
        console.error("Failed to delete file", e);
    }

    await saveResearch();
    // Re-render modal content
    editPublication(pubIndex);
}

document.getElementById('pub-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('pub-index').value);
    const fileInput = document.getElementById('pub-images');

    // Upload New Images First
    let newImages = [];
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        // Upload loop
        for (let i = 0; i < fileInput.files.length; i++) {
            const singleFormData = new FormData();
            singleFormData.append('file', fileInput.files[i]);

            try {
                const res = await fetch(`${API_BASE_URL} /api/upload`, {
                    method: 'POST',
                    body: singleFormData
                });
                const data = await res.json();
                if (data.filename) newImages.push(data.filename);
            } catch (err) {
                console.error("Upload error", err);
            }
        }
    }

    // Logic: If new images uploaded, DELETE OLD ones and REPLACE.
    // If no new images, keep existing.

    let finalImages = [];
    if (index >= 0) {
        // Existing publication
        const oldImages = researchData.publications[index].images || [];

        if (newImages.length > 0) {
            // Case 1: Replacement
            // Delete old files from server
            for (const oldImg of oldImages) {
                try {
                    await apiFetch('/api/delete-file', {
                        method: 'POST',
                        body: JSON.stringify({ filename: oldImg, type: 'image' })
                    });
                } catch (e) {
                    console.error("Error deleting old image:", e);
                }
            }
            finalImages = newImages; // Use new set
        } else {
            // Case 2: No new upload, keep old
            finalImages = oldImages;
        }
    } else {
        // New publication
        finalImages = newImages;
    }

    const newPub = {
        Title: document.getElementById('pub-title').value,
        Author: document.getElementById('pub-author').value,
        Journal: document.getElementById('pub-journal').value,
        Year: parseInt(document.getElementById('pub-year').value),
        Cited_by: document.getElementById('pub-cited').value,
        Link: document.getElementById('pub-link').value,
        images: finalImages
    };

    // Update Array
    if (index === -1) {
        researchData.publications.unshift(newPub);
    } else {
        researchData.publications[index] = newPub;
    }

    await saveResearch();
    renderResearchList();
    closeModal('publication-modal');
});

async function deletePublication(index) {
    if (!confirm('Delete this publication?')) return;
    researchData.publications.splice(index, 1);
    await saveResearch();
    renderResearchList();
}

async function saveResearch() {
    await apiFetch('/api/data/research', {
        method: 'POST',
        body: JSON.stringify(researchData)
    });
}

// --- COLLABORATION MANAGEMENT ---
function renderCollabList() {
    const container = document.getElementById('collaborations-list');
    if (!container) return;
    container.innerHTML = '';

    if (!researchData.collaborations) return;

    researchData.collaborations.forEach((collab, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800 dark:text-white">${collab.name || ''}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">${collab.position || ''} at ${collab.department || ''}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editCollab(${index})" class="text-blue-500 hover:text-blue-700">Edit</button>
                <button onclick="deleteCollab(${index})" class="text-red-500 hover:text-red-700">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openCollabModal() {
    document.getElementById('collab-form').reset();
    document.getElementById('collab-index').value = -1;
    document.getElementById('collab-modal-title').textContent = 'Add Collaboration';
    openModal('collab-modal');
}

function editCollab(index) {
    const data = researchData.collaborations[index];
    document.getElementById('collab-index').value = index;
    document.getElementById('collab-name').value = data.name;
    document.getElementById('collab-link').value = data.link;
    document.getElementById('collab-position').value = data.position;
    document.getElementById('collab-dept').value = data.department;
    document.getElementById('collab-dept-link').value = data.departmentLink;
    document.getElementById('collab-modal-title').textContent = 'Edit Collaboration';
    openModal('collab-modal');
}

document.getElementById('collab-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('collab-index').value);

    const newCollab = {
        name: document.getElementById('collab-name').value,
        link: document.getElementById('collab-link').value,
        position: document.getElementById('collab-position').value,
        department: document.getElementById('collab-dept').value,
        departmentLink: document.getElementById('collab-dept-link').value
    };

    if (index === -1) {
        researchData.collaborations.push(newCollab);
    } else {
        researchData.collaborations[index] = newCollab;
    }

    await saveResearch();
    renderCollabList();
    closeModal('collab-modal');
});



async function deleteCollab(index) {
    if (!confirm('Delete this collaboration?')) return;
    researchData.collaborations.splice(index, 1);
    await saveResearch();
    renderCollabList();
}


// --- PROJECTS MANAGEMENT ---

function renderProjectsList() {
    renderProjectCategory('funded');
    renderProjectCategory('other');
}

function renderProjectCategory(type) {
    const listId = type === 'funded' ? 'funded-projects-list' : 'other-projects-list';
    const sectionId = type === 'funded' ? 'admin-funded-section' : 'admin-other-section';

    const container = document.getElementById(listId);
    const section = document.getElementById(sectionId);

    if (!container || !section) return;
    container.innerHTML = '';

    const list = researchData.projects && researchData.projects[type] ? researchData.projects[type] : [];

    if (list.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');

    list.forEach((project, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-start';
        div.innerHTML = `
            <div class="flex-1">
                <p class="font-semibold text-gray-800 dark:text-white">${project.title || 'Untitled'}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${project.description || ''}</p>
                ${project.agency ? `<p class="text-xs text-leaf mt-1">Agency: ${project.agency}</p>` : ''}
            </div>
            <div class="flex gap-2 ml-4">
                <button onclick="editProject('${type}', ${index})" class="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                <button onclick="deleteProject('${type}', ${index})" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openProjectModal(type) {
    const form = document.getElementById('project-form');
    form.reset();
    document.getElementById('project-index').value = -1;
    document.getElementById('project-type').value = type;
    document.getElementById('project-modal-title').textContent = type === 'funded' ? 'Add Funded Project' : 'Add Other Project';

    // Toggle fields based on type
    const agencyField = document.getElementById('project-agency-field');
    const amountField = document.getElementById('project-amount-field');

    if (type === 'funded') {
        agencyField.style.display = 'block';
        amountField.style.display = 'grid';
    } else {
        agencyField.style.display = 'none';
        amountField.style.display = 'none';
    }

    document.getElementById('project-current-image').innerHTML = '';
    openModal('project-modal');
}

function editProject(type, index) {
    openProjectModal(type); // Reset and set type

    const project = researchData.projects[type][index];
    document.getElementById('project-index').value = index;
    document.getElementById('project-modal-title').textContent = type === 'funded' ? 'Edit Funded Project' : 'Edit Other Project';

    document.getElementById('project-title').value = project.title || '';
    document.getElementById('project-agency').value = project.agency || '';
    document.getElementById('project-amount').value = project.amount || '';
    document.getElementById('project-duration').value = project.duration || '';
    document.getElementById('project-desc').value = project.description || '';
    document.getElementById('project-link').value = project.link || '';

    // Show image if exists
    const imgContainer = document.getElementById('project-current-image');
    if (project.image) {
        imgContainer.innerHTML = `
            <div class="relative inline-block group">
                <img src="${getFileUrl(project.image)}" class="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm">
                <button type="button" onclick="removeProjectImage('${type}', ${index})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">×</button>
            </div>
        `;
    }
}

async function removeProjectImage(type, index) {
    if (!confirm('Remove this image?')) return;
    const project = researchData.projects[type][index];

    try {
        await apiFetch('/api/delete-file', {
            method: 'POST',
            body: JSON.stringify({ filename: project.image, type: 'image' })
        });
        delete project.image;
        await saveResearch();
        editProject(type, index);
    } catch (e) {
        console.error("Failed to delete file", e);
    }
}

document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('project-index').value);
    const type = document.getElementById('project-type').value;
    const fileInput = document.getElementById('project-image');

    let imageName = null;

    // Handle Image Upload
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            // Delete old image if editing
            if (index !== -1) {
                const oldProject = researchData.projects[type][index];
                if (oldProject && oldProject.image) {
                    await apiFetch('/api/delete-file', {
                        method: 'POST',
                        body: JSON.stringify({ filename: oldProject.image, type: 'image' })
                    });
                }
            }

            const res = await fetch(`${API_BASE_URL}/api/upload?folder=research`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.filename) imageName = data.filename;
        } catch (err) {
            console.error("Project image upload failed", err);
        }
    } else if (index !== -1) {
        // Keep existing image
        const oldProject = researchData.projects[type][index];
        if (oldProject) imageName = oldProject.image;
    }

    const newProject = {
        title: document.getElementById('project-title').value,
        agency: document.getElementById('project-agency').value,
        amount: document.getElementById('project-amount').value,
        duration: document.getElementById('project-duration').value,
        description: document.getElementById('project-desc').value,
        link: document.getElementById('project-link').value,
    };
    if (imageName) newProject.image = imageName;

    // Initialize logic if undefined
    if (!researchData.projects) researchData.projects = { funded: [], other: [] };
    if (!researchData.projects[type]) researchData.projects[type] = [];

    if (index === -1) {
        researchData.projects[type].push(newProject);
    } else {
        researchData.projects[type][index] = newProject;
    }

    await saveResearch();
    renderProjectsList();
    closeModal('project-modal');
});

async function deleteProject(type, index) {
    if (!confirm('Delete this project?')) return;

    // Delete image if exists
    const project = researchData.projects[type][index];
    if (project.image) {
        try {
            await apiFetch('/api/delete-file', {
                method: 'POST',
                body: JSON.stringify({ filename: project.image, type: 'image' })
            });
        } catch (e) {
            console.error("Image delete failed during project deletion", e);
        }
    }

    researchData.projects[type].splice(index, 1);
    await saveResearch();
    renderProjectsList();
}


// --- TEAM MANAGEMENT ---

function renderTeamList() {
    const container = document.getElementById('team-list');
    container.innerHTML = '';

    Object.keys(teamData).forEach(category => {
        const catDiv = document.createElement('div');
        catDiv.className = 'mb-4';
        catDiv.innerHTML = `<h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">${category}</h4>`;

        teamData[category].forEach((member, index) => {
            const div = document.createElement('div');
            div.className = 'ml-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-center mb-2';
            div.innerHTML = `
                <div>
                    <span class="font-medium text-gray-800 dark:text-white">${member.name}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400"> - ${member.workDescription || ''}</span>
                </div>
                <div class="flex gap-2 text-sm">
                    <button onclick="editTeam('${category}', ${index})" class="text-blue-500 hover:text-blue-700">Edit</button>
                    <button onclick="deleteTeam('${category}', ${index})" class="text-red-500 hover:text-red-700">Delete</button>
                </div>
            `;
            catDiv.appendChild(div);
        });
        container.appendChild(catDiv);
    });
}

function openTeamModal() {
    document.getElementById('team-form').reset();
    document.getElementById('team-index').value = -1;
    document.getElementById('team-old-category').value = '';
    document.getElementById('team-modal-title').textContent = 'Add Team Member';
    document.getElementById('team-current-image').innerHTML = ''; // Clear Previous Image
    openModal('team-modal');
}


function editTeam(category, index) {
    const member = teamData[category][index];
    document.getElementById('team-index').value = index;
    document.getElementById('team-old-category').value = category;
    document.getElementById('team-category').value = category;
    document.getElementById('team-name').value = member.name;
    document.getElementById('team-linkedin').value = member.linkedin || '';
    document.getElementById('team-github').value = member.github || '';
    document.getElementById('team-work').value = member.workDescription || '';
    document.getElementById('team-modal-title').textContent = 'Edit Team Member';

    // Show current image
    const imgContainer = document.getElementById('team-current-image');
    imgContainer.innerHTML = '';
    if (member.image) {
        imgContainer.innerHTML = `
            <div class="relative inline-block group">
                <img src="${getFileUrl(member.image)}" class="w-16 h-16 rounded object-cover border">
                <button type="button" onclick="removeTeamImage('${category}', ${index})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
            </div>
            <p class="text-xs text-gray-400 mt-1">${member.image}</p>
        `;
    }

    openModal('team-modal');
}

async function removeTeamImage(category, index) {
    if (!confirm('Remove this image?')) return;
    const member = teamData[category][index];

    try {
        await apiFetch('/api/delete-file', {
            method: 'POST',
            body: JSON.stringify({ filename: member.image, type: 'team_image' })
        });
        delete member.image; // Remove property
        await saveTeam();
        editTeam(category, index); // Refresh
    } catch (e) {
        console.error("Delete failed", e);
    }
}

document.getElementById('team-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('team-index').value);
    const oldCategory = document.getElementById('team-old-category').value;
    const newCategory = document.getElementById('team-category').value;
    const fileInput = document.getElementById('team-image');

    let imageName = null;

    // 1. Handle File Upload
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            // Check if editing and has old image -> delete it
            if (index !== -1 && oldCategory) {
                const oldMember = teamData[oldCategory][index];
                if (oldMember && oldMember.image) {
                    await apiFetch('/api/delete-file', {
                        method: 'POST',
                        body: JSON.stringify({ filename: oldMember.image, type: 'team_image' })
                    });
                }
            }

            const res = await fetch(`${API_BASE_URL}/api/upload?folder=team`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.filename) imageName = data.filename;

        } catch (err) {
            console.error("Team image upload failed", err);
        }
    } else if (index !== -1) {
        // Keep existing image if no new file
        // Logic fix: index is valid, so we are editing. 
        // We get image from old category (if present) OR from the current member being edited (which is safer)
        if (oldCategory && teamData[oldCategory] && teamData[oldCategory][index]) {
            const oldMember = teamData[oldCategory][index];
            if (oldMember) imageName = oldMember.image;
        }
    }

    const member = {
        name: document.getElementById('team-name').value,
        linkedin: document.getElementById('team-linkedin').value,
        github: document.getElementById('team-github').value,
        workDescription: document.getElementById('team-work').value
    };

    if (imageName) member.image = imageName;

    // Logic for updating list
    if (index !== -1 && oldCategory) {
        // Remove from old
        teamData[oldCategory].splice(index, 1);
    }

    if (!teamData[newCategory]) teamData[newCategory] = [];
    teamData[newCategory].push(member);

    await saveTeam();
    renderTeamList();
    closeModal('team-modal');
});

async function deleteTeam(category, index) {
    if (!confirm('Delete this team member?')) return;
    teamData[category].splice(index, 1);
    await saveTeam();
    renderTeamList();
}

async function saveTeam() {
    await apiFetch('/api/data/team', {
        method: 'POST',
        body: JSON.stringify(teamData)
    });
}

// --- COURSES MANAGEMENT ---

function renderCoursesList() {
    const container = document.getElementById('courses-list');
    if (!container) return;
    container.innerHTML = '';

    if (!coursesData || !Array.isArray(coursesData)) return;

    coursesData.forEach((course, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <span class="inline-block px-2 py-1 bg-leaf/10 text-leaf text-xs rounded mb-1">${course.code || ''}</span>
                <p class="font-semibold text-gray-800 dark:text-white">${course.title || ''}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editCourse(${index})" class="text-blue-500 hover:text-blue-700">Edit</button>
                <button onclick="deleteCourse(${index})" class="text-red-500 hover:text-red-700">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openCourseModal() {
    document.getElementById('course-form').reset();
    document.getElementById('course-index').value = -1;
    document.getElementById('course-modal-title').textContent = 'Add Course';
    openModal('course-modal');
}

function editCourse(index) {
    const course = coursesData[index];
    document.getElementById('course-index').value = index;
    document.getElementById('course-code').value = course.code;
    document.getElementById('course-title').value = course.title;
    document.getElementById('course-desc').value = course.description;
    document.getElementById('course-link').value = course.link;
    document.getElementById('course-modal-title').textContent = 'Edit Course';
    openModal('course-modal');
}

document.getElementById('course-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const index = parseInt(document.getElementById('course-index').value);

    const newCourse = {
        code: document.getElementById('course-code').value,
        title: document.getElementById('course-title').value,
        description: document.getElementById('course-desc').value,
        link: document.getElementById('course-link').value
    };

    if (index === -1) {
        coursesData.push(newCourse);
    } else {
        coursesData[index] = newCourse;
    }

    await saveCourses();
    renderCoursesList();
    closeModal('course-modal');
});

async function deleteCourse(index) {
    if (!confirm('Delete this course?')) return;
    coursesData.splice(index, 1);
    await saveCourses();
    renderCoursesList();
}

async function saveCourses() {
    await apiFetch('/api/data/courses', {
        method: 'POST',
        body: JSON.stringify(coursesData)
    });
}

// --- OPENINGS LOGIC (Reused/Adapted) ---

async function fetchOpenings() {
    const res = await apiFetch('/api/data/openings');
    openingsData = await res.json();
    renderOpeningsList('PhD Positions', 'phd-list');
    renderOpeningsList('Research Assistant', 'ra-list');
    renderOpeningsList('B.Tech Projects', 'btp-list');
}

function renderOpeningsList(category, elementId) {
    const list = openingsData[category] || [];
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic text-sm">No active openings.</p>';
        return;
    }

    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600';
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                <a href="${getFileUrl(item.file)}" target="_blank" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">${item.name}</a>
                <span class="text-xs text-gray-400">(${item.file})</span>
            </div>
            <button onclick="deleteOpening('${category}', ${index})" class="text-red-500 hover:text-red-700 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        `;
        container.appendChild(div);
    });
}

async function uploadOpeningPDF(category, fileInputId, nameInputId) {
    const fileInput = document.getElementById(fileInputId);
    const nameInput = document.getElementById(nameInputId);

    if (!fileInput.files[0] || !nameInput.value) {
        return alert('Please select a file and enter a name.');
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]); // changed from 'pdf' to 'file' to match generic endpoint

    try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.filename) {
            if (!openingsData[category]) openingsData[category] = [];
            openingsData[category].push({
                name: nameInput.value,
                file: data.filename
            });

            await apiFetch('/api/data/openings', {
                method: 'POST',
                body: JSON.stringify(openingsData)
            });

            fileInput.value = '';
            nameInput.value = '';
            fetchOpenings();
            alert('Opening added successfully!');
        }
    } catch (e) {
        console.error(e);
        alert('Upload failed.');
    }
}

async function deleteOpening(category, index) {
    if (!confirm('Are you sure you want to delete this opening?')) return;

    const item = openingsData[category][index];

    try {
        await apiFetch('/api/delete-file', {
            method: 'POST',
            body: JSON.stringify({ filename: item.file })
        });

        openingsData[category].splice(index, 1);
        await apiFetch('/api/data/openings', {
            method: 'POST',
            body: JSON.stringify(openingsData)
        });

        fetchOpenings();
    } catch (e) {
        console.error(e);
        alert('Delete failed.');
    }
}

// --- THEME SETTINGS MANAGEMENT ---

let currentThemeColor = '#16a34a';

// Apply cached theme immediately to prevent flash of green
const cachedTheme = localStorage.getItem('themeColor');
if (cachedTheme) {
    currentThemeColor = cachedTheme;
    applyThemeColor(cachedTheme);
}

async function fetchThemeSettings() {
    try {
        const res = await apiFetch('/api/settings');
        const settings = await res.json();
        if (settings.themeColor) {
            currentThemeColor = settings.themeColor;
            localStorage.setItem('themeColor', settings.themeColor);
            updateThemeUI(currentThemeColor);
            applyThemeColor(currentThemeColor);
        }
    } catch (e) {
        console.error('Error fetching theme settings:', e);
    }
}

function updateThemeUI(color) {
    const picker = document.getElementById('theme-color-picker');
    const hex = document.getElementById('theme-color-hex');
    const preview = document.getElementById('theme-color-preview');

    if (picker) picker.value = color;
    if (hex) hex.value = color.toUpperCase();
    if (preview) preview.style.backgroundColor = color;
}

function setThemeColor(color) {
    currentThemeColor = color;
    updateThemeUI(color);
    applyThemeColor(color);
}

function applyThemeColor(color) {
    document.documentElement.style.setProperty('--leaf-color', color);
    // Generate lighter/darker variants
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Set RGB components for rgba() usage in CSS
    document.documentElement.style.setProperty('--leaf-r', r);
    document.documentElement.style.setProperty('--leaf-g', g);
    document.documentElement.style.setProperty('--leaf-b', b);

    const lighter = `rgba(${r}, ${g}, ${b}, 0.15)`;
    const darker = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;

    document.documentElement.style.setProperty('--leaf-color-light', color);
    document.documentElement.style.setProperty('--leaf-color-dark', darker);
    document.documentElement.style.setProperty('--leaf-bg-light', lighter);
}

async function saveThemeSettings() {
    try {
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key: 'themeColor', value: currentThemeColor })
        });

        // Also save to localStorage for instant loading on next visit
        localStorage.setItem('themeColor', currentThemeColor);

        const status = document.getElementById('theme-save-status');
        if (status) {
            status.classList.remove('hidden');
            setTimeout(() => status.classList.add('hidden'), 2000);
        }
    } catch (e) {
        console.error('Error saving theme settings:', e);
        alert('Failed to save theme settings');
    }
}

// Theme color picker event listeners
document.addEventListener('DOMContentLoaded', () => {
    const picker = document.getElementById('theme-color-picker');
    const hex = document.getElementById('theme-color-hex');

    if (picker) {
        picker.addEventListener('input', (e) => {
            setThemeColor(e.target.value);
        });
    }

    if (hex) {
        hex.addEventListener('change', (e) => {
            const value = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                setThemeColor(value);
            }
        });
    }

    // Logo file input preview
    const logoInput = document.getElementById('logo-file-input');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewContainer = document.getElementById('logo-preview-container');
                    const previewImg = document.getElementById('new-logo-preview');
                    if (previewImg && previewContainer) {
                        previewImg.src = e.target.result;
                        previewContainer.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Fetch theme settings on page load
    fetchThemeSettings();
    fetchLogoSettings();
});

// --- LOGO MANAGEMENT ---

let currentLogoFilename = 'images/logo.png';

// Apply cached logo immediately
const cachedLogo = localStorage.getItem('siteLogo');
if (cachedLogo) {
    currentLogoFilename = cachedLogo;
    updateLogoUI(cachedLogo);
}

async function fetchLogoSettings() {
    try {
        const res = await apiFetch('/api/settings');
        const settings = await res.json();
        if (settings.siteLogo) {
            currentLogoFilename = settings.siteLogo;
            localStorage.setItem('siteLogo', settings.siteLogo);
            updateLogoUI(settings.siteLogo);
        }
    } catch (e) {
        console.error('Error fetching logo settings:', e);
    }
}

function updateLogoUI(logoPath) {
    const logoUrl = getFileUrl(logoPath) || logoPath;

    // Update Settings tab preview
    const currentLogoPreview = document.getElementById('current-logo-preview');
    if (currentLogoPreview) {
        currentLogoPreview.src = logoUrl;
    }

    // Update navbar logo
    const navbarLogo = document.querySelector('.admin-logo-img');
    if (navbarLogo) {
        navbarLogo.src = logoUrl;
    }

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        favicon.href = logoUrl;
    }
}

async function saveLogo() {
    const fileInput = document.getElementById('logo-file-input');
    const file = fileInput?.files[0];

    if (!file) {
        alert('Please select a logo file to upload');
        return;
    }

    try {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'logos');

        const uploadRes = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            body: formData
        });

        if (!uploadRes.ok) {
            throw new Error('Failed to upload logo');
        }

        const uploadData = await uploadRes.json();
        const logoFilename = uploadData.filename;

        // Save logo filename to settings
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key: 'siteLogo', value: logoFilename })
        });

        // Update localStorage and UI
        localStorage.setItem('siteLogo', logoFilename);
        currentLogoFilename = logoFilename;
        updateLogoUI(logoFilename);

        // Clear file input and hide preview
        fileInput.value = '';
        document.getElementById('logo-preview-container')?.classList.add('hidden');

        // Show success message
        const status = document.getElementById('logo-save-status');
        if (status) {
            status.classList.remove('hidden');
            setTimeout(() => status.classList.add('hidden'), 2000);
        }
    } catch (e) {
        console.error('Error saving logo:', e);
        alert('Failed to save logo');
    }
}

// --- PI PROFILE EDITOR ---

// Store the current selection for formatting
let savedSelection = null;

// Save the current selection (called on mousedown of buttons)
function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedSelection = sel.getRangeAt(0).cloneRange();
    }
}

// Restore the saved selection
function restoreSelection() {
    if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
    }
}

// Active editor ID (defaults to main PI editor)
window.activeEditorId = 'pi-content-editor';

function setActiveEditor(id) {
    window.activeEditorId = id;
}

// Format text in contenteditable editor
function formatText(command) {
    const editor = document.getElementById(window.activeEditorId);
    if (editor) {
        // We assume focus is preserved via event.preventDefault() on buttons
        // So we just execute the command on the current selection
        document.execCommand(command, false, null);
        editor.focus(); // Ensure focus stays
    }
}

// Toggle link - insert or remove
function toggleLink() {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        alert('Please select some text first');
        return;
    }

    // Check if selection is inside a link
    let node = selection.anchorNode;
    while (node && node.nodeName !== 'A') {
        node = node.parentNode;
    }

    if (node && node.nodeName === 'A') {
        // Remove link - unwrap the anchor
        document.execCommand('unlink', false, null);
    } else {
        // Insert link
        const url = prompt('Enter URL:', 'https://');
        if (url) {
            document.execCommand('createLink', false, url);
            // Add theme color class to new links
            const editor = document.getElementById('pi-content-editor');
            if (editor) {
                const links = editor.querySelectorAll('a:not(.text-leaf)');
                links.forEach(link => {
                    link.classList.add('text-leaf', 'hover:underline');
                    link.setAttribute('target', '_blank');
                });
            }
        }
    }
    document.getElementById('pi-content-editor')?.focus();
}

// Change font size
function changeFontSize(size) {
    if (size) {
        document.execCommand('fontSize', false, size);
        document.getElementById(window.activeEditorId)?.focus();
    }
}

// Apply color from color picker
function applySelectedColor() {
    restoreSelection();
    const colorPicker = document.getElementById('font-color-picker');
    const color = colorPicker?.value;
    const selection = window.getSelection();

    if (!selection.rangeCount || selection.isCollapsed) {
        alert('Please select some text first');
        return;
    }

    if (color) {
        document.execCommand('foreColor', false, color);
        document.getElementById(window.activeEditorId)?.focus();
    }
}

// Toggle theme color on selected text
function toggleThemeColor() {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        alert('Please select some text first');
        return;
    }

    // Check if selection has text-leaf class
    let node = selection.anchorNode;
    while (node && node.nodeType !== 1) {
        node = node.parentNode;
    }

    // Check if already has theme color class
    if (node && (node.classList?.contains('text-leaf') || node.closest?.('.text-leaf'))) {
        // Remove theme color - reset to default
        document.execCommand('removeFormat', false, null);
    } else {
        // Apply theme color using span
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'text-leaf font-semibold';
        try {
            range.surroundContents(span);
        } catch (e) {
            // If selection spans multiple elements, use execCommand with current theme color
            document.execCommand('foreColor', false, currentThemeColor);
        }
    }
    document.getElementById('pi-content-editor')?.focus();
}

// Fetch PI content from settings
async function fetchPIContent() {
    try {
        const res = await apiFetch('/api/settings');
        const settings = await res.json();
        const editor = document.getElementById('pi-content-editor');
        if (settings.piContent && editor) {
            editor.innerHTML = settings.piContent;
        }
    } catch (e) {
        console.error('Error fetching PI content:', e);
    }
}

// Save PI content to settings
async function savePIContent() {
    const editor = document.getElementById('pi-content-editor');
    if (!editor) return;

    const content = editor.innerHTML;

    try {
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key: 'piContent', value: content })
        });

        const status = document.getElementById('pi-save-status');
        if (status) {
            status.classList.remove('hidden');
            setTimeout(() => status.classList.add('hidden'), 2000);
        }
    } catch (e) {
        console.error('Error saving PI content:', e);
        alert('Failed to save PI content');
    }
}

// Load PI content on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pi-content-editor')) {
        fetchPIContent();
        loadPISections();
    }
});

// --- PI SECTION HELPERS ---
async function savePISetting(key, value) {
    try {
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key, value })
        });
    } catch (e) {
        console.error('Error saving ' + key, e);
        alert('Failed to save changes');
    }
}

// --- PI SECTIONS STATE ---
let piEducation = [];
let piExperience = [];
let piAwards = [];

// Load all PI sections
async function loadPISections() {
    try {
        const res = await apiFetch('/api/settings');
        const settings = await res.json();

        piEducation = settings.piEducation || [];
        piExperience = settings.piExperience || [];
        piAwards = settings.piAwards || [];

        renderEducationList();
        renderExperienceList();
        renderAwardsList();
    } catch (e) {
        console.error('Error loading PI sections:', e);
    }
}

// --- EDUCATION LOGIC ---
function renderEducationList() {
    const list = document.getElementById('education-list');
    if (!list) return;

    list.innerHTML = piEducation.map((item, index) => `
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600 flex justify-between items-start">
            <div class="flex-1">
                <div class="font-bold text-gray-800 dark:text-white">${item.degree || 'No Degree'}</div>
                <div class="text-sm text-gray-600 dark:text-gray-300 font-semibold">${item.institution || ''}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 italic">${item.year || ''}</div>
                ${item.details ? `<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">${item.details}</div>` : ''}
            </div>
            <div class="flex gap-2 ml-4">
                <button onclick="openEducationModal(${index})" class="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                    Edit
                </button>
                <button onclick="deleteEducation(${index})" class="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function openEducationModal(index = null) {
    const modal = document.getElementById('education-modal');
    modal.classList.remove('hidden');
    document.getElementById('edu-index').value = index !== null ? index : '';
    document.getElementById('edu-modal-title').innerText = index !== null ? 'Edit Education' : 'Add Education';

    if (index !== null) {
        const item = piEducation[index];
        document.getElementById('edu-degree').value = item.degree || '';
        document.getElementById('edu-institution').value = item.institution || '';
        document.getElementById('edu-year').value = item.year || '';
        document.getElementById('edu-details-editor').innerHTML = item.details || '';
    } else {
        document.getElementById('edu-degree').value = '';
        document.getElementById('edu-institution').value = '';
        document.getElementById('edu-year').value = '';
        document.getElementById('edu-details-editor').innerHTML = '';
    }
    setActiveEditor('edu-details-editor');
}

function closeEducationModal() {
    document.getElementById('education-modal').classList.add('hidden');
    setActiveEditor('pi-content-editor');
}

async function saveEducationItem() {
    const index = document.getElementById('edu-index').value;
    const item = {
        degree: document.getElementById('edu-degree').value,
        institution: document.getElementById('edu-institution').value,
        year: document.getElementById('edu-year').value,
        details: document.getElementById('edu-details-editor').innerHTML
    };

    if (index !== '') {
        piEducation[parseInt(index)] = item;
    } else {
        piEducation.push(item);
    }

    await savePISetting('piEducation', piEducation);
    renderEducationList();
    closeEducationModal();
}

async function deleteEducation(index) {
    if (!confirm('Delete this education entry?')) return;
    piEducation.splice(index, 1);
    await savePISetting('piEducation', piEducation);
    renderEducationList();
}


// --- EXPERIENCE LOGIC ---
function renderExperienceList() {
    const list = document.getElementById('experience-list');
    if (!list) return;

    list.innerHTML = piExperience.map((item, index) => `
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600 flex justify-between items-start">
            <div class="flex-1">
                <div class="font-bold text-gray-800 dark:text-white">${item.role || 'No Role'}</div>
                <div class="text-sm text-gray-600 dark:text-gray-300 font-semibold">${item.institution || ''}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 italic">${item.period || ''}</div>
            </div>
            <div class="flex gap-2 ml-4">
                <button onclick="openExperienceModal(${index})" class="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">Edit</button>
                <button onclick="deleteExperience(${index})" class="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">Delete</button>
            </div>
        </div>
    `).join('');
}

function openExperienceModal(index = null) {
    const modal = document.getElementById('experience-modal');
    modal.classList.remove('hidden');
    document.getElementById('exp-index').value = index !== null ? index : '';
    document.getElementById('exp-modal-title').innerText = index !== null ? 'Edit Experience' : 'Add Experience';

    if (index !== null) {
        const item = piExperience[index];
        document.getElementById('exp-role').value = item.role || '';
        document.getElementById('exp-institution').value = item.institution || '';
        document.getElementById('exp-period').value = item.period || '';
    } else {
        document.getElementById('exp-role').value = '';
        document.getElementById('exp-institution').value = '';
        document.getElementById('exp-period').value = '';
    }
}

function closeExperienceModal() {
    document.getElementById('experience-modal').classList.add('hidden');
}

async function saveExperienceItem() {
    const index = document.getElementById('exp-index').value;
    const item = {
        role: document.getElementById('exp-role').value,
        institution: document.getElementById('exp-institution').value,
        period: document.getElementById('exp-period').value
    };

    if (index !== '') {
        piExperience[parseInt(index)] = item;
    } else {
        piExperience.push(item);
    }

    await savePISetting('piExperience', piExperience);
    renderExperienceList();
    closeExperienceModal();
}

async function deleteExperience(index) {
    if (!confirm('Delete this experience entry?')) return;
    piExperience.splice(index, 1);
    await savePISetting('piExperience', piExperience);
    renderExperienceList();
}

// --- AWARDS LOGIC ---
function renderAwardsList() {
    const list = document.getElementById('awards-list');
    if (!list) return;

    list.innerHTML = piAwards.map((item, index) => `
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600 flex justify-between items-start">
            <div class="flex-1">
                <div class="font-bold text-gray-800 dark:text-white">${item.title || 'Award Title'}</div>
                ${item.description ? `<div class="text-sm text-gray-600 dark:text-gray-400 mt-1 pl-6">${item.description}</div>` : ''}
            </div>
            <div class="flex gap-2 ml-4">
                <button onclick="openAwardsModal(${index})" class="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">Edit</button>
                <button onclick="deleteAward(${index})" class="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">Delete</button>
            </div>
        </div>
    `).join('');
}

function openAwardsModal(index = null) {
    const modal = document.getElementById('awards-modal');
    modal.classList.remove('hidden');
    document.getElementById('award-index').value = index !== null ? index : '';
    document.getElementById('award-modal-title').innerText = index !== null ? 'Edit Award' : 'Add Award';

    if (index !== null) {
        const item = piAwards[index];
        document.getElementById('award-title').value = item.title || '';
        document.getElementById('award-details-editor').innerHTML = item.description || '';
    } else {
        document.getElementById('award-title').value = '';
        document.getElementById('award-details-editor').innerHTML = '';
    }
    setActiveEditor('award-details-editor');
}

function closeAwardsModal() {
    document.getElementById('awards-modal').classList.add('hidden');
    setActiveEditor('pi-content-editor');
}

async function saveAwardItem() {
    const index = document.getElementById('award-index').value;
    const item = {
        title: document.getElementById('award-title').value,
        description: document.getElementById('award-details-editor').innerHTML
    };

    if (index !== '') {
        piAwards[parseInt(index)] = item;
    } else {
        piAwards.push(item);
    }

    await savePISetting('piAwards', piAwards);
    renderAwardsList();
    closeAwardsModal();
}

async function deleteAward(index) {
    if (!confirm('Delete this award?')) return;
    piAwards.splice(index, 1);
    await savePISetting('piAwards', piAwards);
    renderAwardsList();
}

// Initialize
checkAuth();

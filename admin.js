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
// Removed old openingsData array

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
    if (tabName === 'openings') loadOpeningsAdmin();
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
        loadOpeningsAdmin(),
        fetchPISettings()
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
    try {
        const res = await apiFetch('/api/data/courses');
        const data = await res.json();
        // Ensure coursesData is always an array
        coursesData = Array.isArray(data) ? data : [];
        console.log('Courses loaded:', coursesData.length);
        renderCoursesList();
    } catch (e) {
        console.error('Failed to fetch courses:', e);
        coursesData = [];
        renderCoursesList();
    }
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
                const res = await fetch(`${API_BASE_URL}/api/upload`, {
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

    // Get description and auto-generate collaborator link if provided
    let description = document.getElementById('project-desc').value;
    const collabName = document.getElementById('project-collab-name')?.value?.trim() || '';
    const collabUrl = document.getElementById('project-collab-url')?.value?.trim() || '';

    // If collaborator info is provided, append the link HTML
    if (collabName && collabUrl) {
        const linkHtml = `<a href="${collabUrl}" target="_blank" class="text-leaf hover:underline">${collabName}</a>`;
        description = description ? `${description}\n${linkHtml}` : linkHtml;
    }

    const newProject = {
        title: document.getElementById('project-title').value,
        agency: document.getElementById('project-agency').value,
        amount: document.getElementById('project-amount').value,
        duration: document.getElementById('project-duration').value,
        description: description,
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
    const form = document.getElementById('course-form');
    const modal = document.getElementById('course-modal');
    if (!form || !modal) {
        console.error('Course modal or form not found');
        return;
    }
    form.reset();
    document.getElementById('course-index').value = -1;
    document.getElementById('course-modal-title').textContent = 'Add Course';
    openModal('course-modal');
}

function editCourse(index) {
    const course = coursesData[index];
    if (!course) {
        console.error('Course not found at index', index);
        return;
    }
    document.getElementById('course-index').value = index;
    document.getElementById('course-code').value = course.code || '';
    document.getElementById('course-title').value = course.title || '';
    document.getElementById('course-desc').value = course.description || '';
    document.getElementById('course-link').value = course.link || '';
    document.getElementById('course-modal-title').textContent = 'Edit Course';
    openModal('course-modal');
}

// Course form submit handler - wrapped in null check
const courseForm = document.getElementById('course-form');
if (courseForm) {
    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const index = parseInt(document.getElementById('course-index').value);

            const newCourse = {
                code: document.getElementById('course-code').value,
                title: document.getElementById('course-title').value,
                description: document.getElementById('course-desc').value,
                link: document.getElementById('course-link').value
            };

            // Ensure coursesData is an array
            if (!Array.isArray(coursesData)) {
                coursesData = [];
            }

            if (index === -1) {
                coursesData.push(newCourse);
            } else {
                coursesData[index] = newCourse;
            }

            await saveCourses();
            renderCoursesList();
            closeModal('course-modal');
        } catch (err) {
            console.error('Error saving course:', err);
            alert('Failed to save course. Check console for details.');
        }
    });
} else {
    console.warn('Course form not found - course editing will not work');
}

async function deleteCourse(index) {
    if (!confirm('Delete this course?')) return;
    coursesData.splice(index, 1);
    await saveCourses();
    renderCoursesList();
}

async function saveCourses() {
    try {
        const res = await apiFetch('/api/data/courses', {
            method: 'POST',
            body: JSON.stringify(coursesData)
        });
        const result = await res.json();
        if (!res.ok) {
            throw new Error(result.error || 'Failed to save courses');
        }
        console.log('Courses saved successfully');
    } catch (e) {
        console.error('Failed to save courses:', e);
        alert('Failed to save courses: ' + e.message);
    }
}


// --- OPENINGS (4-Type System: phd, mtech, btech, analyst) ---

let openingsData = {};

async function loadOpeningsAdmin() {
    try {
        const res = await apiFetch('/api/data/openings');
        const data = await res.json();
        openingsData = data;

        // Populate each opening type
        ['phd', 'mtech', 'btech', 'analyst'].forEach(type => {
            const opening = data[type] || {};

            const linkInput = document.getElementById(`opening-${type}-link`);
            const fileDisplay = document.getElementById(`opening-${type}-current-file`);

            if (linkInput) linkInput.value = opening.link || '';
            if (fileDisplay) {
                if (opening.file) {
                    fileDisplay.innerHTML = `<span class="text-leaf">📄 ${opening.file}</span>`;
                } else {
                    fileDisplay.innerHTML = '<span class="italic text-gray-400">No PDF uploaded</span>';
                }
            }
        });

    } catch (e) {
        console.error('Error loading openings:', e);
    }
}

async function saveOpening(category) {
    const fileInput = document.getElementById(`opening-${category}-file`);
    const linkInput = document.getElementById(`opening-${category}-link`);
    const linkValue = linkInput ? linkInput.value.trim() : '';

    // Start with existing data for this category
    let newData = { ...(openingsData[category] || {}) };

    try {
        // 1. Handle File Upload if present
        if (fileInput && fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('folder', 'pdfs');

            const uploadRes = await fetch(`${API_BASE_URL}/api/files/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('File upload failed');

            const uploadData = await uploadRes.json();
            newData.file = uploadData.filename;
        }

        // 2. Update Link
        newData.link = linkValue;

        // 3. Save to backend via PUT /:category
        await apiFetch(`/api/data/openings/${category}`, {
            method: 'PUT',
            body: JSON.stringify(newData)
        });

        // 4. Update local state
        openingsData[category] = newData;

        alert(`${category.toUpperCase()} opening saved successfully!`);

        // Refresh UI
        loadOpeningsAdmin();

        // Clear file input
        if (fileInput) fileInput.value = '';

    } catch (e) {
        console.error(`Error saving ${category} opening:`, e);
        alert(`Failed to save ${category} opening: ` + e.message);
    }
}

async function clearOpening(category) {
    if (!confirm(`Are you sure you want to clear the ${category.toUpperCase()} opening?`)) return;

    try {
        // Delete via backend
        await apiFetch(`/api/data/openings/${category}`, {
            method: 'DELETE'
        });

        // Update local state
        openingsData[category] = { file: '', link: '', description: '' };

        alert(`${category.toUpperCase()} opening cleared!`);
        loadOpeningsAdmin();

    } catch (e) {
        console.error(`Error clearing ${category} opening:`, e);
        alert(`Failed to clear ${category} opening: ` + e.message);
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
    document.documentElement.style.setProperty('--leaf-bg-light', lighter);

    // Update charts if they exist (dashboard?)
}

function saveThemeColor() {
    const picker = document.getElementById('theme-color-picker');
    const color = picker ? picker.value : currentThemeColor;

    apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ key: 'themeColor', value: color })
    }).then(() => {
        alert('Theme color saved!');
    }).catch(e => {
        console.error('Save failed', e);
        alert('Failed to save theme');
    });
}

// Save Theme Settings (called from admin.html Settings tab)
async function saveThemeSettings() {
    const picker = document.getElementById('theme-color-picker');
    const color = picker ? picker.value : currentThemeColor;

    try {
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key: 'themeColor', value: color })
        });

        // Update local storage for immediate effect
        localStorage.setItem('themeColor', color);

        // Show success message
        const status = document.getElementById('theme-save-status');
        if (status) {
            status.classList.remove('hidden');
            setTimeout(() => status.classList.add('hidden'), 3000);
        }
    } catch (e) {
        console.error('Save failed', e);
        alert('Failed to save theme settings');
    }
}

// Color Picker Listeners
const colorPicker = document.getElementById('theme-color-picker');
const colorHex = document.getElementById('theme-color-hex');

if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
        setThemeColor(e.target.value);
    });
}

if (colorHex) {
    colorHex.addEventListener('change', (e) => {
        let val = e.target.value;
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            setThemeColor(val);
        }
    });
}

// --- LOGO SETTINGS ---
async function uploadLogo(type = 'nav') {
    // type: 'nav' or 'footer'
    const inputId = type === 'nav' ? 'logo-nav-file' : 'logo-footer-file';
    const input = document.getElementById(inputId);

    if (input.files.length === 0) return alert('Select a file first');

    const formData = new FormData();
    formData.append('file', input.files[0]);
    formData.append('folder', 'images/logo');

    try {
        const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.filename) {
            // Save to settings
            const key = type === 'nav' ? 'siteLogo' : 'siteFooterLogo';
            await apiFetch('/api/settings', {
                method: 'PUT',
                body: JSON.stringify({ key, value: data.filename })
            });

            // Update Preview
            const previewId = type === 'nav' ? 'logo-nav-preview' : 'logo-footer-preview';
            const preview = document.getElementById(previewId);
            if (preview) preview.src = getFileUrl(data.filename);

            alert('Logo updated!');
        }
    } catch (e) {
        console.error(e);
        alert('Upload failed');
    }
}

// Save Logo (called from Settings tab)
async function saveLogo() {
    const fileInput = document.getElementById('logo-file-input');
    const statusEl = document.getElementById('logo-save-status');

    if (!fileInput || fileInput.files.length === 0) {
        alert('Please select a logo file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        // Upload the file
        const uploadRes = await fetch(`${API_BASE_URL}/api/files/upload?folder=images`, {
            method: 'POST',
            body: formData
        });

        if (!uploadRes.ok) throw new Error('File upload failed');

        const uploadData = await uploadRes.json();
        const filename = uploadData.filename;

        // Save to settings
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key: 'siteLogo', value: filename })
        });

        // Update preview
        const preview = document.getElementById('current-logo-preview');
        if (preview) {
            preview.src = getFileUrl(filename);
        }

        // Show success status
        if (statusEl) {
            statusEl.classList.remove('hidden');
            setTimeout(() => statusEl.classList.add('hidden'), 3000);
        }

        // Clear file input
        fileInput.value = '';
        document.getElementById('logo-preview-container')?.classList.add('hidden');

        alert('Logo saved successfully!');

    } catch (e) {
        console.error('Logo save failed:', e);
        alert('Failed to save logo: ' + e.message);
    }
}

// Logo preview on file select
const logoFileInput = document.getElementById('logo-file-input');
if (logoFileInput) {
    logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('new-logo-preview');
                const container = document.getElementById('logo-preview-container');
                if (preview) preview.src = event.target.result;
                if (container) container.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Expose saveLogo to global window
window.saveLogo = saveLogo;

// --- MARKDOWN / TEXT EDITOR LOGIC (For PI Modal) ---

let piEducation = [];
let piExperience = [];
let piAwards = [];

// Text Formatting Functions (called from admin.html)
function formatText(command) {
    const activeEditor = document.getElementById(window.activeEditorId || 'pi-content-editor');
    if (activeEditor) activeEditor.focus();
    document.execCommand(command, false, null);
    if (activeEditor) activeEditor.focus();
}

function changeFontSize(size) {
    if (!size) return;
    const activeEditor = document.getElementById(window.activeEditorId || 'pi-content-editor');
    if (activeEditor) activeEditor.focus();
    document.execCommand('fontSize', false, size);
    if (activeEditor) activeEditor.focus();
}

function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

function applyThemeColorToText() {
    const color = currentThemeColor || '#16a34a';
    document.execCommand('foreColor', false, color);
}

async function savePIContent() {
    const content = document.getElementById('pi-content-editor').innerHTML;
    try {
        await apiFetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'piContent', value: content })
        });
        const status = document.getElementById('pi-save-status');
        if (status) {
            status.classList.remove('hidden');
            setTimeout(() => status.classList.add('hidden'), 2000);
        }
    } catch (err) {
        console.error('Failed to save PI content:', err);
        alert('Failed to save PI content');
    }
}

// Expose functions to global window for onclick handlers
window.formatText = formatText;
window.changeFontSize = changeFontSize;
window.insertLink = insertLink;
window.applyThemeColorToText = applyThemeColorToText;
window.savePIContent = savePIContent;

// Selection management for rich text editor
let savedSelection = null;

function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedSelection = sel.getRangeAt(0).cloneRange();
    }
}

function restoreSelection() {
    if (savedSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection);
    }
}

function toggleLink() {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const parentLink = sel.anchorNode?.parentElement?.closest('a');
    if (parentLink) {
        // Remove link
        document.execCommand('unlink', false, null);
    } else {
        // Add link
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }
}

function toggleThemeColor() {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const parentSpan = sel.anchorNode?.parentElement;
    const currentColor = parentSpan?.style?.color;
    const themeColor = currentThemeColor || '#16a34a';

    if (currentColor && (currentColor === themeColor || currentColor === 'rgb(22, 163, 74)')) {
        // Remove color - set to inherit
        document.execCommand('removeFormat', false, null);
    } else {
        // Apply theme color
        document.execCommand('foreColor', false, themeColor);
    }
}

// Export selection and toggle functions
window.saveSelection = saveSelection;
window.restoreSelection = restoreSelection;
window.toggleLink = toggleLink;
window.toggleThemeColor = toggleThemeColor;

// PI Profile Editor Logic
function setActiveEditor(id) {
    window.activeEditorId = id;

    // Highlight active editor visually
    document.querySelectorAll('[contenteditable]').forEach(el => {
        el.classList.remove('ring-2', 'ring-leaf', 'bg-white');
        el.classList.add('bg-gray-50');
    });

    const activeEl = document.getElementById(id);
    if (activeEl) {
        activeEl.classList.add('ring-2', 'ring-leaf', 'bg-white');
        activeEl.classList.remove('bg-gray-50');
    }
}

function execCmd(command, value = null) {
    if (!window.activeEditorId) {
        // Default to main bio if none selected
        setActiveEditor('pi-content-editor');
    }

    document.getElementById(window.activeEditorId).focus();
    document.execCommand(command, false, value);

    // Re-focus to keep selection active
    document.getElementById(window.activeEditorId).focus();
}

// PI Settings Modal with Tabs
function openPIModal() {
    loadPISettings();
    openModal('pi-modal');
    setActiveEditor('pi-content-editor');
}

async function loadPISettings() {
    try {
        const res = await apiFetch('/api/settings');
        const settings = await res.json();

        // Load Bio
        const editor = document.getElementById('pi-content-editor');
        if (editor) editor.innerHTML = settings.piBio || '<p>Enter PI Biography here...</p>';

        // Load Education
        piEducation = settings.piEducation || [];
        renderEducationList();

        // Load Experience
        piExperience = settings.piExperience || [];
        renderExperienceList();

        // Load Awards
        piAwards = settings.piAwards || [];
        renderAwardsList();

    } catch (e) {
        console.error('Error loading PI settings:', e);
    }
}

async function fetchPISettings() {
    // Load PI settings on page startup so arrays are populated before any edits
    try {
        const res = await apiFetch('/api/settings');
        const settings = await res.json();

        // Populate global arrays with existing data
        piEducation = settings.piEducation || [];
        piExperience = settings.piExperience || [];
        piAwards = settings.piAwards || [];

        console.log('PI data loaded:', {
            education: piEducation.length,
            experience: piExperience.length,
            awards: piAwards.length
        });
    } catch (e) {
        console.error('Error loading PI settings on startup:', e);
    }
}

async function savePISettingsContent() {
    const content = document.getElementById('pi-content-editor').innerHTML;
    try {
        await apiFetch('/api/settings', {
            method: 'PUT',
            body: JSON.stringify({ key: 'piBio', value: content })
        });
        alert('PI Biography Saved!');
    } catch (e) {
        console.error(e);
        alert('Failed to save bio');
    }
}

async function savePISetting(key, value) {
    await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ key, value })
    });
}

// --- EDUCATION LOGIC ---
function renderEducationList() {
    const list = document.getElementById('education-list');
    if (!list) return;

    list.innerHTML = piEducation.map((item, index) => `
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600 flex justify-between items-start">
            <div class="flex-1">
                <div class="font-bold text-gray-800 dark:text-white">${item.degree || 'Degree'}</div>
                <div class="text-sm text-gray-600 dark:text-gray-300 font-semibold">${item.institution || ''}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 italic">${item.year || ''}</div>
                ${item.details || item.thesis ? `<div class="text-sm text-gray-500 dark:text-gray-400 mt-1">${item.details || item.thesis}</div>` : ''}
            </div>
            <div class="flex gap-2 ml-4">
                <button onclick="openEducationModal(${index})" class="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">Edit</button>
                <button onclick="deleteEducation(${index})" class="text-red-600 hover:text-red-800 flex items-center gap-1 font-medium">Delete</button>
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
        const detailsEditor = document.getElementById('edu-details-editor');
        if (detailsEditor) detailsEditor.innerHTML = item.details || item.thesis || '';
    } else {
        document.getElementById('edu-degree').value = '';
        document.getElementById('edu-institution').value = '';
        document.getElementById('edu-year').value = '';
        const detailsEditor = document.getElementById('edu-details-editor');
        if (detailsEditor) detailsEditor.innerHTML = '';
    }
}

function closeEducationModal() {
    document.getElementById('education-modal').classList.add('hidden');
}

async function saveEducationItem() {
    const index = document.getElementById('edu-index').value;
    const item = {
        degree: document.getElementById('edu-degree').value,
        institution: document.getElementById('edu-institution').value,
        year: document.getElementById('edu-year').value,
        details: document.getElementById('edu-details-editor')?.innerHTML || ''
    };

    if (index !== '' && index !== null) {
        piEducation[parseInt(index)] = item;
    } else {
        piEducation.push(item);
    }

    try {
        await savePISetting('piEducation', piEducation);
        renderEducationList();
        closeEducationModal();
    } catch (e) {
        console.error('Failed to save education:', e);
        alert('Failed to save education item');
    }
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

    if (index !== '' && index !== null) {
        piExperience[parseInt(index)] = item;
    } else {
        piExperience.push(item);
    }

    try {
        await savePISetting('piExperience', piExperience);
        renderExperienceList();
        closeExperienceModal();
    } catch (e) {
        console.error('Failed to save experience:', e);
        alert('Failed to save experience item');
    }
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
        description: document.getElementById('award-details-editor')?.innerHTML || ''
    };

    if (index !== '' && index !== null) {
        piAwards[parseInt(index)] = item;
    } else {
        piAwards.push(item);
    }

    try {
        await savePISetting('piAwards', piAwards);
        renderAwardsList();
        closeAwardsModal();
    } catch (e) {
        console.error('Failed to save award:', e);
        alert('Failed to save award item');
    }
}

async function deleteAward(index) {
    if (!confirm('Delete this award?')) return;
    piAwards.splice(index, 1);
    await savePISetting('piAwards', piAwards);
    renderAwardsList();
}

// --- GLOBAL WINDOW EXPORTS FOR onclick HANDLERS ---
// PI Profile Functions
window.openPIModal = openPIModal;
window.loadPISettings = loadPISettings;
window.savePISettingsContent = savePISettingsContent;
window.setActiveEditor = setActiveEditor;
window.execCmd = execCmd;

// Education Functions
window.openEducationModal = openEducationModal;
window.closeEducationModal = closeEducationModal;
window.saveEducationItem = saveEducationItem;
window.deleteEducation = deleteEducation;

// Experience Functions
window.openExperienceModal = openExperienceModal;
window.closeExperienceModal = closeExperienceModal;
window.saveExperienceItem = saveExperienceItem;
window.deleteExperience = deleteExperience;

// Awards Functions
window.openAwardsModal = openAwardsModal;
window.closeAwardsModal = closeAwardsModal;
window.saveAwardItem = saveAwardItem;
window.deleteAward = deleteAward;

// Research Functions
window.openPublicationModal = openPublicationModal;
window.editPublication = editPublication;
window.deletePublication = deletePublication;
window.removePubImage = removePubImage;
window.renderResearchList = renderResearchList;
window.saveResearch = saveResearch;

// Collaboration Functions
window.openCollabModal = openCollabModal;
window.editCollab = editCollab;
window.deleteCollab = deleteCollab;
window.renderCollabList = renderCollabList;

// Project Functions
window.openProjectModal = openProjectModal;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.removeProjectImage = removeProjectImage;
window.renderProjectsList = renderProjectsList;

// Team Functions
window.openTeamModal = openTeamModal;
window.editTeam = editTeam;
window.deleteTeam = deleteTeam;
window.removeTeamImage = removeTeamImage;
window.renderTeamList = renderTeamList;
window.saveTeam = saveTeam;

// Course Functions
window.openCourseModal = openCourseModal;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse;
window.renderCoursesList = renderCoursesList;
window.saveCourses = saveCourses;

// Openings Functions
window.loadOpeningsAdmin = loadOpeningsAdmin;
window.saveOpening = saveOpening;
window.clearOpening = clearOpening;

// Theme Functions
window.setThemeColor = setThemeColor;
window.saveThemeColor = saveThemeColor;
window.saveThemeSettings = saveThemeSettings;
window.applyThemeColor = applyThemeColor;
window.fetchThemeSettings = fetchThemeSettings;

// Logo Functions
window.uploadLogo = uploadLogo;

// Tab/Modal Functions
window.openTab = openTab;
window.openModal = openModal;
window.closeModal = closeModal;

// Initialize
checkAuth();

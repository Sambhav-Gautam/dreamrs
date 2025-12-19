// --- GLOBAL STATE ---
let researchData = { publications: [], collaborations: [] };
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
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/data/research');
    researchData = await res.json();
    renderResearchList();
    renderCollabList();
}

async function fetchTeam() {
    const res = await fetch('/api/data/team');
    teamData = await res.json();
    renderTeamList();
}

async function fetchCourses() {
    const res = await fetch('/api/data/courses');
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
                <img src="uploads/images/publications/${img}" class="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm" alt="Publication Image" onerror="this.style.display='none'">
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
        await fetch('/api/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                const res = await fetch('/api/upload', {
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
                    await fetch('/api/delete-file', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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
    await fetch('/api/data/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(researchData)
    });
}

// --- COLLABORATION MANAGEMENT ---
function renderCollabList() {
    constcontainer = document.getElementById('collaborations-list');
    const container = document.getElementById('collaborations-list');
    container.innerHTML = '';

    researchData.collaborations.forEach((collab, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800 dark:text-white">${collab.name}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">${collab.position} at ${collab.department}</p>
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


// --- TEAM MANAGEMENT ---

function renderTeamList() {
    const container = document.getElementById('team-list');
    container.innerHTML = '';

    Object.keys(teamData).forEach(category => {
        const catDiv = document.createElement('div');
        catDiv.innerHTML = `<h4 class="font-bold text-gray-700 dark:text-gray-300 mb-2">${category}</h4>`;

        teamData[category].forEach((member, index) => {
            const div = document.createElement('div');
            div.className = 'ml-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-center mb-2';
            div.innerHTML = `
                <div>
                    <span class="font-medium text-gray-800 dark:text-white">${member.name}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400"> - ${member.title}</span>
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
    openModal('team-modal');
}


function editTeam(category, index) {
    const member = teamData[category][index];
    document.getElementById('team-index').value = index;
    document.getElementById('team-old-category').value = category;
    document.getElementById('team-category').value = category;
    document.getElementById('team-name').value = member.name;
    document.getElementById('team-title').value = member.title;
    document.getElementById('team-subtitle').value = member.subtitle || '';
    document.getElementById('team-linkedin').value = member.linkedin || '';
    document.getElementById('team-github').value = member.github || '';
    document.getElementById('team-modal-title').textContent = 'Edit Team Member';

    // Show current image
    const imgContainer = document.getElementById('team-current-image');
    imgContainer.innerHTML = '';
    if (member.image) {
        imgContainer.innerHTML = `
            <div class="relative inline-block group">
                 <img src="uploads/images/team/${member.image}" class="w-16 h-16 rounded object-cover border">
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
        await fetch('/api/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                    await fetch('/api/delete-file', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: oldMember.image, type: 'team_image' })
                    });
                }
            }

            const res = await fetch('/api/upload?folder=team', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.filename) imageName = data.filename;

        } catch (err) {
            console.error("Team image upload failed", err);
        }
    } else if (index !== -1 && oldCategory) {
        // Keep existing image if no new file
        const oldMember = teamData[oldCategory][index];
        if (oldMember) imageName = oldMember.image;
    }

    const member = {
        name: document.getElementById('team-name').value,
        title: document.getElementById('team-title').value,
        subtitle: document.getElementById('team-subtitle').value,
        linkedin: document.getElementById('team-linkedin').value,
        github: document.getElementById('team-github').value
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
    await fetch('/api/data/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
    });
}

// --- COURSES MANAGEMENT ---

function renderCoursesList() {
    const container = document.getElementById('courses-list');
    container.innerHTML = '';

    coursesData.forEach((course, index) => {
        const div = document.createElement('div');
        div.className = 'p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-start';
        div.innerHTML = `
            <div>
                <span class="inline-block px-2 py-1 bg-leaf/10 text-leaf text-xs rounded mb-1">${course.code}</span>
                <p class="font-semibold text-gray-800 dark:text-white">${course.title}</p>
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
    await fetch('/api/data/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coursesData)
    });
}

// --- OPENINGS LOGIC (Reused/Adapted) ---

async function fetchOpenings() {
    const res = await fetch('/api/data/openings');
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
                <a href="uploads/pdfs/${item.file}" target="_blank" class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">${item.name}</a>
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
        const res = await fetch('/api/upload', {
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

            await fetch('/api/data/openings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        await fetch('/api/delete-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: item.file })
        });

        openingsData[category].splice(index, 1);
        await fetch('/api/data/openings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(openingsData)
        });

        fetchOpenings();
    } catch (e) {
        console.error(e);
        alert('Delete failed.');
    }
}

// Initialize
checkAuth();

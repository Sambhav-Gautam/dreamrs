document.addEventListener('DOMContentLoaded', function () {
    // --- API CONFIGURATION ---
    const API_BASE_URL = window.ENV?.API_BASE_URL || window.API_CONFIG?.API_BASE_URL || '';

    // Helper to get file URL from backend
    function getFileUrl(filename) {
        if (!filename) return '';
        if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
        return `${API_BASE_URL}/api/files/download/${encodeURIComponent(filename)}`;
    }

    async function loadPhDScholars() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/data/phd`);
            const data = await response.json();
            console.log('PhD data loaded:', data);
            renderPhDScholars(data.scholars || []);
        } catch (error) {
            console.error('Error loading PhD data:', error);
        }
    }

    function renderPhDScholars(scholars) {
        const container = document.getElementById("phd-container");
        if (!container) return;

        if (!scholars || scholars.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No PhD Scholars found.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'flex flex-col gap-6 max-w-4xl mx-auto';

        scholars.forEach((scholar, index) => {
            const initials = scholar.name ? scholar.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';
            const cardId = `phd-${index}`;

            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300';

            // Image Source Logic
            let imageSrc = scholar.image ? getFileUrl(scholar.image) : null;

            let imageHTML = '';
            if (imageSrc) {
                imageHTML = `<img src="${imageSrc}" alt="${scholar.name}" class="w-20 h-20 rounded-full object-cover border-2 border-leaf/20">`;
            } else {
                imageHTML = `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-2xl border-2 border-leaf/20">${initials}</div>`;
            }

            // Research areas preview (first 2)
            const researchPreview = (scholar.researchAreas && scholar.researchAreas.length > 0)
                ? scholar.researchAreas.slice(0, 2).map(a => `<span class="px-2 py-0.5 bg-leaf/10 text-leaf text-xs rounded-full">${a}</span>`).join('')
                : '';

            // Build full education list
            const educationHTML = (scholar.education && scholar.education.length > 0)
                ? `<div class="mb-6">
                    <h5 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Education</h5>
                    <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        ${scholar.education.map(edu => `<li class="flex items-start gap-2"><span class="text-leaf">•</span>${edu}</li>`).join('')}
                    </ul>
                </div>`
                : '';

            // All research areas
            const researchHTML = (scholar.researchAreas && scholar.researchAreas.length > 0)
                ? `<div class="mb-6">
                    <h5 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Research Areas</h5>
                    <div class="flex flex-wrap gap-2">
                        ${scholar.researchAreas.map(area => `<span class="px-3 py-1 bg-leaf/10 text-leaf text-xs rounded-full font-medium">${area}</span>`).join('')}
                    </div>
                </div>`
                : '';

            // Interests
            const interestsHTML = (scholar.interests && scholar.interests.length > 0)
                ? `<div class="mb-6">
                    <h5 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Interests</h5>
                    <div class="flex flex-wrap gap-2">
                        ${scholar.interests.map(int => `<span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">${int}</span>`).join('')}
                    </div>
                </div>`
                : '';

            // Publications with abstracts (like research section)
            const publicationsHTML = (scholar.publications && scholar.publications.length > 0)
                ? `<div class="mb-6">
                    <h5 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Publications</h5>
                    <div class="space-y-4">
                        ${scholar.publications.map((pub, pubIdx) => {
                    const pubId = `${cardId}-pub-${pubIdx}`;
                    return `
                            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div class="flex flex-wrap items-center gap-2 mb-2">
                                    ${pub.year ? `<span class="px-2.5 py-1 bg-leaf text-white text-xs rounded-full font-bold">${pub.year}</span>` : ''}
                                    ${pub.doi ? `<span class="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded font-mono">DOI: ${pub.doi}</span>` : ''}
                                    ${pub.note ? `<span class="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded font-medium">${pub.note}</span>` : ''}
                                </div>
                                <h6 class="font-semibold text-gray-800 dark:text-white mb-2">${pub.title}</h6>
                                ${pub.abstract ? `
                                <button onclick="togglePubAbstract('${pubId}')" class="text-xs text-leaf hover:underline flex items-center gap-1 mb-2">
                                    <span id="${pubId}-btn">Show Abstract</span>
                                    <svg id="${pubId}-chevron" class="w-3 h-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                <div id="${pubId}-abstract" class="hidden mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-l-2 border-leaf">
                                    <p class="text-sm text-gray-600 dark:text-gray-300">${pub.abstract}</p>
                                </div>
                                ` : ''}
                                <p class="text-xs text-gray-500 dark:text-gray-400 italic">${pub.apa || ''}</p>
                                ${pub.link ? `<a href="${pub.link}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-leaf hover:bg-green-600 text-white text-xs rounded-lg font-medium transition-colors"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>View Paper</a>` : ''}
                            </div>
                            `;
                }).join('')}
                    </div>
                </div>`
                : '';

            // Social links
            const socialHTML = `
                <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    ${scholar.email ? `<a href="mailto:${scholar.email}" class="flex items-center gap-2 text-gray-500 hover:text-leaf transition-colors text-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>${scholar.email}</a>` : ''}
                    ${scholar.googleScholar ? `<a href="${scholar.googleScholar}" target="_blank" rel="noopener" class="flex items-center gap-2 text-gray-500 hover:text-leaf transition-colors text-sm"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM2.18 6.31A10.68 10.68 0 0 0 1.51 9H7l5-8-9.82 5.31z"/></svg>Google Scholar</a>` : ''}
                    ${scholar.linkedin ? `<a href="${scholar.linkedin}" target="_blank" rel="noopener" class="flex items-center gap-2 text-gray-500 hover:text-leaf transition-colors text-sm"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>LinkedIn</a>` : ''}
                    ${scholar.github ? `<a href="${scholar.github}" target="_blank" rel="noopener" class="flex items-center gap-2 text-gray-500 hover:text-leaf transition-colors text-sm"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>GitHub</a>` : ''}
                </div>
            `;

            card.innerHTML = `
                <!-- Collapsed Header (Always Visible) -->
                <div class="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors" onclick="togglePhDCard('${cardId}')">
                    <div class="flex items-center gap-4">
                        ${imageHTML}
                        <div class="flex-1">
                            <h4 class="text-xl font-bold text-gray-800 dark:text-white">${scholar.name}</h4>
                            <p class="text-leaf font-medium text-sm">PhD Scholar</p>
                            <div class="flex flex-wrap gap-2 mt-2">
                                ${researchPreview}
                            </div>
                        </div>
                        <div class="flex-shrink-0">
                            <svg id="${cardId}-chevron" class="w-6 h-6 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <!-- Expandable Details (Hidden by Default) -->
                <div id="${cardId}-details" class="hidden border-t border-gray-200 dark:border-gray-700">
                    <div class="p-6">
                        ${educationHTML}
                        ${researchHTML}
                        ${interestsHTML}
                        ${publicationsHTML}
                        ${socialHTML}
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    // Toggle PhD card expansion
    window.togglePhDCard = function (cardId) {
        const details = document.getElementById(`${cardId}-details`);
        const chevron = document.getElementById(`${cardId}-chevron`);

        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            chevron.classList.add('rotate-180');
        } else {
            details.classList.add('hidden');
            chevron.classList.remove('rotate-180');
        }
    };

    // Toggle publication abstract
    window.togglePubAbstract = function (pubId) {
        const abstract = document.getElementById(`${pubId}-abstract`);
        const btn = document.getElementById(`${pubId}-btn`);
        const chevron = document.getElementById(`${pubId}-chevron`);

        if (abstract.classList.contains('hidden')) {
            abstract.classList.remove('hidden');
            btn.textContent = 'Hide Abstract';
            chevron.classList.add('rotate-180');
        } else {
            abstract.classList.add('hidden');
            btn.textContent = 'Show Abstract';
            chevron.classList.remove('rotate-180');
        }
    };

    loadPhDScholars();
});

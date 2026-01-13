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

            // Router Logic
            const urlParams = new URLSearchParams(window.location.search);
            const scholarSlug = urlParams.get('scholar');

            if (scholarSlug) {
                renderScholarProfile(data.scholars || [], scholarSlug);
            } else {
                renderPhDList(data.scholars || []);
            }
        } catch (error) {
            console.error('Error loading PhD data:', error);
            document.getElementById('phd-container').innerHTML = '<p class="text-center text-red-500">Failed to load data.</p>';
        }
    }

    // --- LIST VIEW ---
    function renderPhDList(scholars) {
        const container = document.getElementById("phd-container");
        if (!container) return;

        // Change Header for List View
        const headerTitle = document.querySelector('h3');
        if (headerTitle) headerTitle.innerHTML = `PhD <span class="text-leaf">Scholars</span>`;

        if (!scholars || scholars.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No PhD Scholars found.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto';

        scholars.forEach(scholar => {
            const initials = scholar.name ? scholar.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';
            const slug = scholar.name ? scholar.name.toLowerCase().trim().replace(/\s+/g, '-') : '#';
            const imageSrc = scholar.image ? getFileUrl(scholar.image) : null;

            const card = document.createElement('a');
            card.href = `phd.html?scholar=${slug}`;
            card.className = 'group block bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-leaf/50 hover:shadow-lg transition-all duration-300';

            card.innerHTML = `
                <div class="flex items-center gap-5">
                    <div class="flex-shrink-0">
                        ${imageSrc
                    ? `<img src="${imageSrc}" alt="${scholar.name}" class="w-20 h-20 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 group-hover:border-leaf/20 transition-colors">`
                    : `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">${initials}</div>`
                }
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-xl font-bold text-gray-800 dark:text-white group-hover:text-leaf transition-colors truncate">${scholar.name}</h4>
                        <div class="flex flex-wrap gap-2 mt-2">
                             ${scholar.researchAreas && scholar.researchAreas.length > 0
                    ? scholar.researchAreas.slice(0, 2).map(a => `<span class="px-2 py-0.5 bg-leaf/10 text-leaf text-xs rounded-full">${a}</span>`).join('')
                    : '<span class="text-sm text-gray-500 italic">PhD Scholar</span>'}
                        </div>
                    </div>
                    <div>
                        <svg class="w-6 h-6 text-gray-300 group-hover:text-leaf transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    // --- PROFILE VIEW ---
    function renderScholarProfile(scholars, slug) {
        const container = document.getElementById("phd-container");
        if (!container) return;

        const scholar = scholars.find(s => {
            const sSlug = s.name ? s.name.toLowerCase().trim().replace(/\s+/g, '-') : '';
            return sSlug === slug;
        });

        if (!scholar) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <p class="text-xl text-gray-500 mb-4">Scholar not found.</p>
                    <a href="phd.html" class="text-leaf hover:underline">← Back to List</a>
                </div>
            `;
            return;
        }

        // Update Page Title
        document.title = `${scholar.name} | DREAMRS Lab`;
        const headerTitle = document.querySelector('h3');
        if (headerTitle) headerTitle.classList.add('hidden'); // Hide main "PhD Scholars" title on profile

        const initials = scholar.name ? scholar.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';
        const imageSrc = scholar.image ? getFileUrl(scholar.image) : null;

        // --- RENDER PROFILE ---
        const profileHTML = `
            <div class="max-w-5xl mx-auto animate-fade-in text-left">
                <!-- Back Button -->
                <a href="phd.html" class="inline-flex items-center gap-2 text-gray-500 hover:text-leaf mb-8 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Scholars
                </a>

                <!-- Header Section -->
                <div class="flex flex-col md:flex-row gap-8 md:gap-12 mb-16 border-b border-gray-200 dark:border-gray-800 pb-12">
                    <div class="flex-shrink-0 mx-auto md:mx-0">
                        ${imageSrc
                ? `<img src="${imageSrc}" alt="${scholar.name}" class="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover shadow-xl border-4 border-white dark:border-gray-800">`
                : `<div class="w-40 h-40 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-4xl shadow-xl">${initials}</div>`
            }
                    </div>
                    <div class="flex-1 text-center md:text-left">
                        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">${scholar.name}</h1>
                        <p class="text-xl text-gray-600 dark:text-gray-300 font-light mb-6">PhD Scholar</p>
                        
                        <!-- Social/Contact Links -->
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                            ${scholar.email ? `
                                <a href="mailto:${scholar.email}" class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-leaf hover:text-white transition-all">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <span>${scholar.email}</span>
                                </a>` : ''}
                            ${scholar.linkedin ? `
                                <a href="${scholar.linkedin}" target="_blank" rel="noopener" class="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                </a>` : ''}
                            ${scholar.github ? `
                                <a href="${scholar.github}" target="_blank" rel="noopener" class="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-900 hover:text-white transition-all">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                </a>` : ''}
                            ${scholar.googleScholar ? `
                                <a href="${scholar.googleScholar}" target="_blank" rel="noopener" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-leaf hover:text-leaf transition-all text-sm font-medium">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM2.18 6.31A10.68 10.68 0 0 0 1.51 9H7l5-8-9.82 5.31z"/></svg>
                                    Google Scholar
                                </a>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    <!-- Left Sidebar -->
                    <div class="space-y-10">
                        ${scholar.education && scholar.education.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                <svg class="w-5 h-5 text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                                Education
                            </h3>
                            <ul class="space-y-4">
                                ${scholar.education.map(edu => `
                                    <li class="flex items-start gap-3 text-gray-600 dark:text-gray-300 relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                        <span>${edu}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>` : ''}

                        ${scholar.interests && scholar.interests.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                                <svg class="w-5 h-5 text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                Research Interests
                            </h3>
                            <div class="flex flex-wrap gap-2">
                                ${scholar.interests.map(int => `
                                    <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm font-medium border border-gray-200 dark:border-gray-700">
                                        ${int}
                                    </span>
                                `).join('')}
                            </div>
                        </div>` : ''}
                    </div>

                    <!-- Right Column (Research/Publications) -->
                    <div class="lg:col-span-2 space-y-12">
                        
                            ${scholar.publications && scholar.publications.length > 0 ? `
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                                <svg class="w-5 h-5 text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                                Selected Publications
                            </h3>
                            <div class="space-y-6">
                                ${scholar.publications.map(pub => {
                const link = pub.link || pub.doi || '#';
                const hasLink = link && link !== '#';
                const description = pub.note || pub.abstract || pub.apa;
                return `
                                    <div class="group">
                                        ${hasLink ? `<a href="${link}" target="_blank" rel="noopener" class="block group-hover:bg-gray-50 dark:group-hover:bg-gray-800 p-4 -mx-4 rounded-xl transition-colors">` : '<div class="block">'}
                                        
                                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-leaf transition-colors">
                                            ${pub.title}
                                        </h4>
                                        
                                        ${description ? `
                                            <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                                ${description}
                                            </p>
                                        ` : ''}

                                        ${hasLink ? '</a>' : '</div>'}
                                    </div>
                                    `;
            }).join('')}
                            </div>
                        </div>` : ''}

                    </div>
                </div>
            </div>
        `;

        container.innerHTML = profileHTML;
    }

    loadPhDScholars();
});

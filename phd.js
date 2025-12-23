document.addEventListener('DOMContentLoaded', function () {
    // --- API CONFIGURATION ---
    // Uses window.ENV from env.js
    const API_BASE_URL = window.ENV?.API_BASE_URL || window.API_CONFIG?.API_BASE_URL || '';

    // Helper to get file URL from backend
    function getFileUrl(filename) {
        if (!filename) return '';
        if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
        return `${API_BASE_URL}/api/files/download/${encodeURIComponent(filename)}`;
    }

    async function loadPhDTeam() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/data/team`);
            const team = await response.json();
            console.log('Team data loaded:', team);
            renderPhD(team);
        } catch (error) {
            console.error('Error loading team data:', error);
        }
    }

    function renderPhD(team) {
        const container = document.getElementById("phd-container");
        if (!container) return;

        // Filter only PhD Scholars
        const members = team["PhD Scholars"];

        if (!members || !Array.isArray(members) || members.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No PhD Scholars found.</p>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'flex flex-wrap justify-center gap-8 max-w-7xl mx-auto';

        members.forEach((member, index) => {
            const initials = member.name ? member.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';
            const card = document.createElement('div');
            // Flex layout, vertical orientation, centered items, consistent width
            card.className = 'w-full max-w-sm flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-transparent hover:border-leaf/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-2';
            // Allow card to stretch to full height of the row (default flex behavior), ensure internal footer pushes down
            card.style.height = 'auto';
            card.style.animationDelay = `${index * 50}ms`;

            // Image Source Logic
            let imageSrc = null;
            if (member.image) {
                imageSrc = getFileUrl(member.image);
            }

            let imageHTML = '';
            if (imageSrc) {
                imageHTML = `
                <div class="w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-white dark:border-gray-700 shadow-md group-hover:scale-105 transition-transform duration-300">
                    <img src="${imageSrc}" alt="${member.name}" class="w-full h-full object-cover">
                </div>
            `;
            } else {
                imageHTML = `
                <div class="w-48 h-48 rounded-full bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-4xl mb-6 border-4 border-white dark:border-gray-700 shadow-md group-hover:scale-105 transition-transform duration-300">
                    ${initials}
                </div>
                `;
            }

            card.innerHTML = `
                ${imageHTML}
                
                <h4 class="text-xl font-bold text-gray-800 dark:text-white text-center mb-3 group-hover:text-leaf transition-colors">${member.name}</h4>
                
                ${member.workDescription ? `<div class="text-gray-600 dark:text-gray-300 text-sm text-center leading-relaxed mb-4 line-clamp-4">${member.workDescription}</div>` : ''}
                
                <div class="mt-auto flex gap-4 opacity-80 group-hover:opacity-100 transition-opacity">
                     ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" class="text-gray-400 hover:text-leaf transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>` : ''}
                     ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" class="text-gray-400 hover:text-leaf transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    loadPhDTeam();
});

document.addEventListener('DOMContentLoaded', function () {
  // --- API CONFIGURATION ---
  const API_BASE_URL = window.ENV?.API_BASE_URL || window.API_CONFIG?.API_BASE_URL || '';

  function getFileUrl(filename) {
    if (!filename) return '';
    if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
    return `${API_BASE_URL}/api/files/download/${encodeURIComponent(filename)}`;
  }

  async function loadTeam() {
    try {
      const [teamRes, phdRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/data/team`),
        fetch(`${API_BASE_URL}/api/data/phd`)
      ]);

      const team = await teamRes.json();
      let phdData = { scholars: [] };
      try {
        phdData = await phdRes.json();
      } catch (e) {
        console.warn('Could not load separate PhD data');
      }

      console.log('Team data loaded:', team);

      // Merge PhD data from phd.json into team data
      if (phdData && phdData.scholars) {
        if (!team["PhD Scholars"]) team["PhD Scholars"] = [];

        const existingNames = new Set(team["PhD Scholars"].map(s => s.name));
        phdData.scholars.forEach(s => {
          if (!existingNames.has(s.name)) {
            team["PhD Scholars"].push(s);
          }
        });
      }

      renderTeam(team);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }

  function renderTeam(team) {
    const teamContainer = document.getElementById("team-container");
    if (!teamContainer) return;

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'space-y-12';

    // Category order and styling
    const categoryOrder = [
      "Principal Investigator",
      "PhD Scholars",
      "M.Tech Project Students",
      "B.Tech Project Students",
      "Independent Project Students"
    ];

    categoryOrder.forEach(category => {
      const members = team[category];
      if (!members || !Array.isArray(members) || members.length === 0) return;

      const section = document.createElement('div');
      section.className = 'team-section';

      const isCollapsible = category !== "Principal Investigator";
      const isExpandedByDefault = category === "Principal Investigator" || category === "PhD Scholars";

      // --- SECTION HEADER ---
      const header = document.createElement('div');
      header.className = `flex items-center gap-3 mb-6 pb-3 border-b-2 border-leaf/20 ${isCollapsible ? 'cursor-pointer group' : ''}`;

      header.innerHTML = `
        <div class="w-10 h-10 rounded-lg bg-leaf/10 flex items-center justify-center text-leaf">
          ${getCategoryIcon(category)}
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white group-hover:text-leaf transition-colors">${category}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">${members.length} member${members.length > 1 ? 's' : ''}</p>
        </div>
        ${isCollapsible ? `
          <div class="chevron transform transition-transform duration-300 ${isExpandedByDefault ? 'rotate-180' : ''}">
            <svg class="w-5 h-5 text-gray-400 group-hover:text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        ` : ''}
      `;

      section.appendChild(header);

      // --- MEMBERS CONTENT ---
      const content = document.createElement('div');

      if (category === "Principal Investigator") {
        // PI: Featured card layout
        content.className = 'space-y-4';
        members.forEach(member => {
          content.appendChild(createPICard(member));
        });
      } else if (category === "PhD Scholars") {
        // PhD: Card grid
        content.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        members.forEach(member => {
          content.appendChild(createScholarCard(member));
        });
      } else {
        // Students: Clean table-like list
        content.className = 'bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden';
        const table = createStudentTable(members);
        content.appendChild(table);
      }

      // --- COLLAPSIBLE WRAPPER ---
      if (isCollapsible) {
        const wrapper = document.createElement('div');
        wrapper.className = `transition-all duration-300 overflow-hidden ${isExpandedByDefault ? '' : 'max-h-0 opacity-0'}`;
        wrapper.appendChild(content);
        section.appendChild(wrapper);

        header.addEventListener('click', () => {
          const chevron = header.querySelector('.chevron');
          const isExpanded = !wrapper.classList.contains('max-h-0');

          if (isExpanded) {
            wrapper.classList.add('max-h-0', 'opacity-0');
            chevron?.classList.remove('rotate-180');
          } else {
            wrapper.classList.remove('max-h-0', 'opacity-0');
            chevron?.classList.add('rotate-180');
          }
        });
      } else {
        section.appendChild(content);
      }

      mainWrapper.appendChild(section);
    });

    teamContainer.innerHTML = '';
    teamContainer.appendChild(mainWrapper);
  }

  // --- PI CARD (Featured) ---
  function createPICard(member) {
    const card = document.createElement('div');
    card.className = 'group relative bg-gradient-to-r from-leaf/5 to-transparent dark:from-leaf/10 rounded-2xl p-6 border border-leaf/20 hover:border-leaf/40 transition-all duration-300';

    const initials = member.name ? member.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';
    const imageSrc = member.image ? getFileUrl(member.image) : null;

    card.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6 items-start">
        <div class="flex-shrink-0">
          ${imageSrc
        ? `<img src="${imageSrc}" alt="${member.name}" class="w-24 h-24 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-gray-700">`
        : `<div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">${initials}</div>`
      }
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${member.name}</h4>
          ${member.workDescription ? `<p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">${member.workDescription}</p>` : ''}
          <div class="flex items-center gap-3">
            ${member.github ? `
              <a href="${member.github}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-leaf hover:text-white transition-all text-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
            ` : ''}
            ${member.linkedin ? `
              <a href="${member.linkedin}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    return card;
  }

  // --- PHD SCHOLAR CARD ---
  // --- PHD SCHOLAR CARD ---
  function createScholarCard(member) {
    const card = document.createElement('div');
    // Minimal styling - no background box
    card.className = 'group flex items-center gap-5 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all rounded-lg px-3';

    const initials = member.name ? member.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';
    const imageSrc = member.image ? getFileUrl(member.image) : null;

    // Create slug for link
    const slug = member.name ? member.name.toLowerCase().trim().replace(/\s+/g, '-') : '#';

    card.innerHTML = `
        <div class="flex-shrink-0">
          ${imageSrc
        ? `<img src="${imageSrc}" alt="${member.name}" class="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-600 group-hover:border-leaf transition-colors">`
        : `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-xl">${initials}</div>`
      }
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-0.5">
             <a href="phd.html?scholar=${slug}" class="font-bold text-lg text-gray-800 dark:text-white group-hover:text-leaf transition-colors truncate">
                ${member.name}
             </a>
             <div class="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" class="text-gray-500 hover:text-leaf transition-colors"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>` : ''}
                ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" class="text-gray-500 hover:text-blue-500 transition-colors"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : ''}
             </div>
          </div>
          ${member.workDescription ? `<p class="text-sm text-gray-500 dark:text-gray-400 font-medium">${member.workDescription}</p>` : ''}
        </div>
    `;

    return card;
  }

  // --- STUDENT TABLE ---
  function createStudentTable(members) {
    const table = document.createElement('div');
    table.className = 'divide-y divide-gray-200 dark:divide-gray-700';

    members.forEach((member, index) => {
      const row = document.createElement('div');
      row.className = `flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${index % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'}`;

      row.innerHTML = `
        <div class="w-8 text-center text-sm text-gray-400 font-medium">${index + 1}</div>
        <div class="flex items-center gap-2 min-w-[200px] px-3">
          <span class="font-medium text-gray-800 dark:text-white">${member.name}</span>
          ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" class="p-1 rounded text-gray-400 hover:text-leaf transition-colors"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>` : ''}
          ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" class="p-1 rounded text-gray-400 hover:text-blue-500 transition-colors"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>` : ''}
        </div>
        <div class="flex-1"></div>
        <div class="min-w-[200px] text-right pr-4">
          ${member.workDescription ? `<span class="text-sm text-gray-500 dark:text-gray-400">${member.workDescription}</span>` : ''}
        </div>
      `;

      table.appendChild(row);
    });

    return table;
  }

  // --- CATEGORY ICONS ---
  function getCategoryIcon(category) {
    const icons = {
      "Principal Investigator": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`,
      "PhD Scholars": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>`,
      "M.Tech Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
      "B.Tech Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`,
      "Independent Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`
    };
    return icons[category] || icons["B.Tech Project Students"];
  }

  loadTeam();
});
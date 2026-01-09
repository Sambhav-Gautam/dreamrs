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

  async function loadTeam() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data/team`);
      const team = await response.json();
      console.log('Team data loaded:', team);
      renderTeam(team);
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  }

  function renderTeam(team) {
    const teamContainer = document.getElementById("team-container");
    if (!teamContainer) return;

    // Create the main container
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'space-y-8';

    // Category icons
    const categoryIcons = {
      "Principal Investigator": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`,
      "PhD Scholars": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>`,
      "M.Tech Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
      "B.Tech Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`,
      "Independent Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`
    };

    // Iterate through categories
    Object.entries(team).forEach(([category, members]) => {
      if (!members || !Array.isArray(members) || members.length === 0) return;

      const section = document.createElement('div');
      section.className = 'team-section';

      // Define collapsible categories and default state
      const isCollapsible = ["PhD Scholars", "M.Tech Project Students", "B.Tech Project Students", "Independent Project Students"].includes(category);
      const isExpandedByDefault = category === "PhD Scholars"; // PhD open by default, others closed

      // Category header
      const header = document.createElement('div');
      header.className = `flex items-center justify-between mb-4 ${isCollapsible ? 'cursor-pointer group select-none' : ''}`;

      const headerLeft = document.createElement('div');
      headerLeft.className = 'flex items-center gap-3';
      headerLeft.innerHTML = `
        <div>
          <h3 class="text-lg font-bold text-gray-800 dark:text-white group-hover:text-leaf transition-colors">${category}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">${members.length} member${members.length > 1 ? 's' : ''}</p>
        </div>
      `;
      header.appendChild(headerLeft);

      // Add chevron if collapsible
      let chevron;
      if (isCollapsible) {
        chevron = document.createElement('div');
        chevron.className = `transform transition-transform duration-300 ${isExpandedByDefault ? 'rotate-180' : ''}`;
        chevron.innerHTML = `<svg class="w-6 h-6 text-gray-400 group-hover:text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        header.appendChild(chevron);
      }

      section.appendChild(header);

      // Members Table
      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'overflow-x-auto'; // Ensure responsiveness

      const table = document.createElement('table');
      table.className = 'w-full text-left border-collapse table-fixed min-w-[600px]';

      // Table Header (Optional, but good for structure)
      // table.innerHTML = `
      //   <thead>
      //     <tr class="border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold tracking-wider">
      //       <th class="w-1/3 py-3 px-4">Name</th>
      //       <th class="w-1/3 py-3 px-4">Project Work</th>
      //       <th class="w-1/3 py-3 px-4 text-right">Links</th>
      //     </tr>
      //   </thead>
      // `;
      // User didn't explicitly ask for headers, but table structure implies it. 
      // I'll skip explicit headers for a cleaner "list-like" table unless it looks confusing, 
      // matching the "Openings" style which has no headers.
      // However, "3 columns" suggests separate fields.

      const tbody = document.createElement('tbody');
      tbody.className = 'divide-y divide-gray-100 dark:divide-gray-800';

      const showImage = category === "Principal Investigator" || category === "PhD Scholars";

      members.forEach((member) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group';

        // 1. Name Column (with optional Image)
        const nameCell = document.createElement('td');
        nameCell.className = `py-4 px-4 align-middle ${showImage ? 'w-1/3' : 'w-1/4'}`;

        let nameContent = `<div class="flex items-center gap-4">`;

        if (showImage) {
          let imageSrc = null;
          if (member.image) {
            imageSrc = getFileUrl(member.image);
          }

          const initials = member.name ? member.name.split(' ').map(n => n[0]).slice(0, 2).join('') : '??';

          if (imageSrc) {
            nameContent += `
                    <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                        <img src="${imageSrc}" alt="${member.name}" class="w-full h-full object-cover">
                    </div>`;
          } else {
            nameContent += `
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        ${initials}
                    </div>`;
          }
        } else {
          // Dot for others logic? Or just text. 
          // Existing code had a dot. Let's keep it clean or add a small dot.
          // User asked for "tabular form", simple is better.
          // nameContent += `<div class="w-1.5 h-1.5 rounded-full bg-leaf mr-2"></div>`;
        }

        nameContent += `
            <span class="font-semibold text-gray-800 dark:text-white text-base group-hover:text-leaf transition-colors text-ellipsis overflow-hidden whitespace-nowrap" title="${member.name}">${member.name}</span>
        </div>`;

        nameCell.innerHTML = nameContent;
        tr.appendChild(nameCell);

        // 2. Project Work Column
        const workCell = document.createElement('td');
        workCell.className = 'py-4 px-4 align-middle text-gray-600 dark:text-gray-300 text-sm';
        // Allow wrapping but limit lines?
        workCell.innerHTML = `<span class="line-clamp-2" title="${member.workDescription || ''}">${member.workDescription || '-'}</span>`;
        tr.appendChild(workCell);

        // 3. Links Column
        const linksCell = document.createElement('td');
        linksCell.className = 'py-4 px-4 align-middle text-right';

        let linksContent = `<div class="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">`;

        if (member.github) {
          linksContent += `
                <a href="${member.github}" target="_blank" rel="noopener" class="text-gray-400 hover:text-leaf transition-colors" title="GitHub">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>`;
        }

        if (member.linkedin) {
          linksContent += `
                <a href="${member.linkedin}" target="_blank" rel="noopener" class="text-gray-400 hover:text-leaf transition-colors" title="LinkedIn">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>`;
        }

        linksContent += `</div>`;

        linksCell.innerHTML = linksContent;
        tr.appendChild(linksCell);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      tableWrapper.appendChild(table);

      // Add to section based on collapsible status
      if (isCollapsible) {
        const wrapper = document.createElement('div');
        wrapper.className = `transition-all duration-300 overflow-hidden ${isExpandedByDefault ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`;
        wrapper.appendChild(tableWrapper);
        section.appendChild(wrapper);

        // Click handler
        header.addEventListener('click', () => {
          const isExpanded = wrapper.style.maxHeight !== '0px' && !wrapper.classList.contains('max-h-0');

          if (isExpanded) {
            // Collapse
            wrapper.style.maxHeight = '0px';
            wrapper.classList.add('max-h-0', 'opacity-0');
            wrapper.classList.remove('max-h-[2000px]', 'opacity-100');
            chevron.classList.remove('rotate-180');
          } else {
            // Expand
            wrapper.classList.remove('max-h-0', 'opacity-0');
            wrapper.classList.add('max-h-[2000px]', 'opacity-100');
            wrapper.style.maxHeight = '2000px';
            chevron.classList.add('rotate-180');
          }
        });
      } else {
        section.appendChild(tableWrapper);
      }

      mainWrapper.appendChild(section);
    });

    // Clear existing content and add new layout
    teamContainer.innerHTML = '';
    teamContainer.appendChild(mainWrapper);
  }

  loadTeam();

  // Removed manual iteration logic as it's now inside renderTeam called from loadTeam

});
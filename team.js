document.addEventListener('DOMContentLoaded', function () {
  // Team data organized by category
  const team = {
    "Principal Investigator": [
      {
        name: "Dr Sonal Keshwani",
        title: "Principal Investigator",
        subtitle: "",
        github: "",
        linkedin: "https://www.linkedin.com/in/sonal-keshwani-5a2034322/"
      }
    ],
    "PhD Scholars": [
      {
        name: "Rhea S Shrivastava",
        title: "PhD Scholar",
        subtitle: "",
        github: "https://github.com/RheaS18",
        linkedin: "http://www.linkedin.com/in/rhea-s-shrivastava-183344268"
      }
    ],
    "B.Tech Project Students": [
      {
        name: "Arbaaz Choudhari",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/Arbaaz21034",
        linkedin: "https://www.linkedin.com/in/arbaaz-choudhari-3a8346244/"
      },
      {
        name: "Vishesh Sah",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/Vish75",
        linkedin: "https://www.linkedin.com/in/vishesh-sah-0556431ba/"
      },
      {
        name: "Hardik Singh",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/hardik21390",
        linkedin: "http://www.linkedin.com/in/hardik-singh-b48167235"
      },
      {
        name: "Pratham Kumar",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/PratK5708",
        linkedin: "https://www.linkedin.com/in/pratham-kumar/"
      },
      {
        name: "Vipul Raj",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/vipul21435",
        linkedin: "https://www.linkedin.com/in/vipul-raj-jha-491b2023a/"
      },
      {
        name: "Aman Sharma",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/aammaan",
        linkedin: "https://www.linkedin.com/in/aman-sharrma/"
      },
      {
        name: "Komal",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/kd-456",
        linkedin: "https://www.linkedin.com/in/komal-736601258/"
      },
      {
        name: "Aditi Sharma",
        title: "B.Tech Student",
        subtitle: "B.Tech Project",
        github: "https://github.com/Aditi1409sharma",
        linkedin: "https://www.linkedin.com/in/aditi-sharma-as/"
      }
    ],
    "Independent Project Students": [
      {
        name: "Mayank Kaim",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/Mayank20387",
        linkedin: "https://www.linkedin.com/in/mayank-kaim-472b43242"
      },
      {
        name: "Yashila Arora",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/yashila21436",
        linkedin: "http://www.linkedin.com/in/yashila-arora-795936277"
      },
      {
        name: "Kanishk Kukreja",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/kanishk393",
        linkedin: "https://www.linkedin.com/in/kanishk-kukreja/"
      },
      {
        name: "Neev Swarnakar",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/neev13",
        linkedin: "https://in.linkedin.com/in/neev-swarnakar"
      },
      {
        name: "Jacqueline P Razafimiadana",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/Lilia2022",
        linkedin: "https://www.linkedin.com/in/jacqueline-pr%C3%A9cilia-razafimiadana-ab8344249"
      },
      {
        name: "Ayush Melty",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/AyushMelty",
        linkedin: "https://www.linkedin.com/in/ayush-melty-01831a272/"
      },
      {
        name: "Mohit Gupta",
        title: "B.Tech Student",
        subtitle: "Independent Project",
        github: "https://github.com/mohitg66",
        linkedin: "https://www.linkedin.com/in/mohitg66"
      }
    ]
  };

  const teamContainer = document.getElementById("team-container");

  if (!teamContainer) return;

  // Create the main container
  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'space-y-8';

  // Category icons
  const categoryIcons = {
    "Principal Investigator": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>`,
    "PhD Scholars": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>`,
    "B.Tech Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`,
    "Independent Project Students": `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`
  };

  // Iterate through categories
  Object.entries(team).forEach(([category, members]) => {
    const section = document.createElement('div');
    section.className = 'team-section';

    // Category header
    const header = document.createElement('div');
    header.className = 'flex items-center gap-3 mb-4';
    header.innerHTML = `
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white">
        ${categoryIcons[category] || categoryIcons["B.Tech Project Students"]}
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">${category}</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">${members.length} member${members.length > 1 ? 's' : ''}</p>
      </div>
    `;
    section.appendChild(header);

    // Members grid - use different layouts based on count
    const grid = document.createElement('div');
    if (category === "Principal Investigator") {
      grid.className = 'grid grid-cols-1 gap-3';
    } else if (members.length <= 2) {
      grid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
    } else {
      grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3';
    }

    members.forEach((member, index) => {
      const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('');

      const card = document.createElement('div');
      card.className = 'group relative p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-leaf/50 hover:shadow-md transition-all duration-300';
      card.style.animationDelay = `${index * 50}ms`;

      // Different layout for PI
      if (category === "Principal Investigator") {
        card.innerHTML = `
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              ${initials}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-gray-800 dark:text-white truncate group-hover:text-leaf transition-colors">${member.name}</h4>
              <p class="text-sm text-leaf font-medium">${member.title}</p>
            </div>
            <div class="flex items-center gap-2">
              ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-leaf hover:text-white transition-all" aria-label="LinkedIn">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>` : ''}
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-leaf/10 flex items-center justify-center text-leaf font-semibold text-sm flex-shrink-0">
              ${initials}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-sm text-gray-800 dark:text-white truncate group-hover:text-leaf transition-colors">${member.name}</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${member.subtitle || member.title}</p>
            </div>
          </div>
          <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${member.github ? `<a href="${member.github}" target="_blank" rel="noopener" class="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-leaf hover:text-white transition-all" aria-label="GitHub">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>` : ''}
            ${member.linkedin ? `<a href="${member.linkedin}" target="_blank" rel="noopener" class="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-leaf hover:text-white transition-all" aria-label="LinkedIn">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>` : ''}
          </div>
        `;
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);
    mainWrapper.appendChild(section);
  });

  // Clear existing content and add new layout
  teamContainer.innerHTML = '';
  teamContainer.appendChild(mainWrapper);
});
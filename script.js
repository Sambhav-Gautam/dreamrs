document.addEventListener('DOMContentLoaded', function () {
    // Header and Footer
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const headerHTML = `
    <header id="main-header" class="header-modern fixed w-full top-0 z-50 transition-all duration-500">
        <!-- Gradient Line Animation -->
        <div class="header-gradient-line absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 transition-opacity duration-500"></div>
        
        <div class="header-backdrop backdrop-blur-none bg-transparent border-b border-transparent transition-all duration-300">
            <div class="container mx-auto px-4 md:px-8">
                <div class="flex items-center justify-between py-3 md:py-4">
                    <!-- Logo with Hover Animation -->
                    <a href="index.html" class="logo-container flex items-center group">
                        <div class="logo-glow relative">
                            <img src="images/logo.png" alt="DREAMRS Lab" class="h-14 sm:h-16 md:h-20 transition-all duration-300 group-hover:scale-105">
                            <div class="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                        </div>
                    </a>
                    
                    <!-- Desktop Navigation with Animated Underline -->
                    <nav class="hidden lg:flex items-center gap-1">
                        <a href="index.html" class="nav-link-modern group">
                            <span>Home</span>
                            <span class="nav-underline"></span>
                        </a>
                        <a href="research.html" class="nav-link-modern group">
                            <span>Research</span>
                            <span class="nav-underline"></span>
                        </a>
                        <a href="teaching.html" class="nav-link-modern group">
                            <span>Teaching</span>
                            <span class="nav-underline"></span>
                        </a>
                        <a href="team.html" class="nav-link-modern group">
                            <span>Team</span>
                            <span class="nav-underline"></span>
                        </a>
                        <a href="pi.html" class="nav-link-modern group">
                            <span>Principal Investigator</span>
                            <span class="nav-underline"></span>
                        </a>
                        <a href="openings.html" class="nav-link-modern group">
                            <span>Openings</span>
                            <span class="nav-underline"></span>
                        </a>
                    </nav>
                    
                    <!-- Actions -->
                    <div class="flex items-center gap-3">
                        <!-- Theme Toggle with Animation -->
                        <button id="theme-toggle" class="theme-toggle-modern" aria-label="Toggle dark mode">
                            <svg class="sun-icon w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                            </svg>
                            <svg class="moon-icon w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                            </svg>
                        </button>
                        
                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-button" class="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-leaf/10 hover:text-leaf transition-all duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu with Slide Animation -->
        <div id="mobile-menu" class="mobile-menu-modern hidden lg:hidden">
            <nav class="container mx-auto px-4 py-4 space-y-2">
                <a href="index.html" class="mobile-nav-link">Home</a>
                <a href="research.html" class="mobile-nav-link">Research</a>
                <a href="teaching.html" class="mobile-nav-link">Teaching</a>
                <a href="team.html" class="mobile-nav-link">Team</a>
                <a href="pi.html" class="mobile-nav-link">Principal Investigator</a>
                <a href="openings.html" class="mobile-nav-link">Openings</a>
            </nav>
        </div>
    </header>
    `;

    const footerHTML = `
    <footer class="footer-modern relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div class="container mx-auto px-6 lg:px-12 py-12">
            <!-- Top CTA Banner -->
            <div class="mb-10 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-leaf/10 to-green-400/10 dark:from-leaf/15 dark:to-green-400/10 border border-leaf/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div>
                    <p class="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Interested in joining our lab?</p>
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Explore research opportunities and open positions</p>
                </div>
                <a href="openings.html" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-leaf text-white font-medium rounded-lg hover:bg-green-600 transition-colors">
                    View Openings
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </a>
            </div>

            <!-- Main Content Grid: 4 columns -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                
                <!-- Brand Section -->
                <div class="space-y-4">
                    <img src="images/logo.png" alt="DREAMRS Lab Logo" class="h-20 md:h-24 lg:h-32 footer-logo-animate">
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        Design Research and Human Factors Lab at IIIT Delhi.
                    </p>
                    <div class="flex gap-3">
                        <a href="https://scholar.google.co.in/citations?user=NLPFhkMAAAAJ&hl=en" target="_blank" class="footer-social-btn" aria-label="Google Scholar">
                            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21.35 11.1h-9.4v2.83h5.44c-.45 2.21-2.32 3.81-4.68 3.81a5.15 5.15 0 010-10.3c1.45 0 2.8.6 3.76 1.56l2.05-2.05A8.2 8.2 0 0012 3.92a8.08 8.08 0 00-8.14 8.08A8.08 8.08 0 0012 20.08c4.14 0 7.5-3.34 7.5-7.5 0-.5-.05-1-.15-1.48z"></path>
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com/in/sonal-keshwani-5a2034322/" target="_blank" class="footer-social-btn" aria-label="LinkedIn">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="footer-links-section">
                    <h4 class="footer-section-title">Navigation</h4>
                    <ul class="space-y-3">
                        <li><a href="index.html" class="footer-link-modern">Home</a></li>
                        <li><a href="research.html" class="footer-link-modern">Research</a></li>
                        <li><a href="teaching.html" class="footer-link-modern">Teaching</a></li>
                        <li><a href="team.html" class="footer-link-modern">Team</a></li>
                    </ul>
                </div>

                    <!-- Resources -->
                    <div class="footer-links-section">
                    <h4 class="footer-section-title">Resources</h4>
                    <ul class="space-y-3">
                        <li><a href="pi.html" class="footer-link-modern">Principal Investigator</a></li>
                        <li><a href="openings.html" class="footer-link-modern">Open Positions</a></li>
                        <li><a href="https://hcd.iiitd.ac.in/" target="_blank" class="footer-link-modern">HCD Department ↗</a></li>
                        <li><a href="https://iiitd.ac.in/" target="_blank" class="footer-link-modern">IIIT Delhi ↗</a></li>
                    </ul>
                </div>

                <!-- Contact -->
                <div class="footer-links-section">
                    <h4 class="footer-section-title">Get in Touch</h4>
                    <div class="space-y-4">
                        <a href="mailto:sonal.keshwani@iiitd.ac.in" class="footer-contact-item group">
                            <div class="footer-contact-icon-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800 dark:text-white group-hover:text-leaf transition-colors">Email Us</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">sonal.keshwani@iiitd.ac.in</p>
                            </div>
                        </a>
                        <div class="footer-contact-item">
                            <div class="footer-contact-icon-sm">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800 dark:text-white">Visit Us</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">A-405, R&D Building</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="footer-bottom mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">IIIT Delhi</span>
                        </div>
                        <span class="hidden md:block text-gray-300 dark:text-gray-600">|</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">Human Centred Design Department</span>
                    </div>
                    <p class="text-sm text-gray-400 dark:text-gray-500">
                        © 2025 DREAMRS Lab. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </footer>
    `;


    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
    });

    // Theme Toggle Functionality
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to system preference
    function getThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }

    // Initialize theme on page load
    applyTheme(getThemePreference());

    // Toggle theme on button click
    themeToggle.addEventListener('click', function () {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Change header background on scroll
    const header = document.querySelector('header');
    const heroSection = document.getElementById('Hero');
    // const peopleGroup = document.getElementById('People-Group');

    if (heroSection) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > heroSection.offsetHeight - header.offsetHeight) {
                header.classList.remove('bg-transparent', 'shadow');
                header.classList.add('bg-gray-50', 'dark:bg-gray-800', 'shadow');
                mobileMenu.classList.remove('bg-opacity-80');
                // mobileMenu.classList.add('bg-gray-50', 'dark:bg-gray-800');
                // peopleGroup.classList.remove('bg-transparent');
                // peopleGroup.classList.add('bg-gray-50', 'dark:bg-gray-800');
            } else {
                header.classList.remove('bg-gray-50', 'dark:bg-gray-800', 'shadow');
                header.classList.add('bg-transparent');
                // mobileMenu.classList.remove('bg-gray-50', 'dark:bg-gray-800');
                mobileMenu.classList.add('bg-opacity-80');
                // peopleGroup.classList.remove('bg-gray-50', 'dark:bg-gray-800');
                // peopleGroup.classList.add('bg-transparent');
            }
        });
    } else {
        header.classList.remove('bg-transparent', 'shadow');
        header.classList.add('bg-gray-50', 'dark:bg-gray-800', 'shadow');
        mobileMenu.classList.remove('bg-opacity-80');
        // mobileMenu.classList.add('bg-gray-50', 'dark:bg-gray-800');  
        // peopleGroup.classList.remove('bg-transparent');
        // peopleGroup.classList.add('bg-gray-50', 'dark:bg-gray-800');
    }


    // Publications
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const publicationsData = [
        {
            "Title": "Developing a method for creating structured representations of working of systems from natural language descriptions using the SAPPhIRE model of causality",
            "Author": "K Bhattacharya, A Majumder, AN Bhatt, <strong>S Keshwani</strong>, BSC Ranjan, ...",
            "Journal": "AI EDAM 38, e24",
            "Cited_by": "",
            "Year": 2024,
            "Link": "https://scholar.google.co.in/citations?view_op=view_citation&hl=en&user=NLPFhkMAAAAJ&citation_for_view=NLPFhkMAAAAJ:UebtZRa9Y70C"
        },
        {
            "Title": "Comparing Analogy-Based Methods—Bio-Inspiration and Engineering-Domain Inspiration for Domain Selection and Novelty",
            "Author": "<strong>S Keshwani</strong>, H Casakin",
            "Journal": "Biomimetics 9 (6), 344",
            "Cited_by": 2,
            "Year": 2024,
            "Link": "https://scholar.google.co.in/citations?view_op=view_citation&hl=en&user=NLPFhkMAAAAJ&citation_for_view=NLPFhkMAAAAJ:UebtZRa9Y70C"
        },
        {
            "Title": "Influence of analogical domains and comprehensiveness in explanation of analogy on the novelty of designs",
            "Author": "<strong>S Keshwani</strong>, A Chakrabarti",
            "Journal": "Research in Engineering Design 28 (3), 381-412",
            "Cited_by": 18,
            "Year": 2017,
            "Link": "https://scholar.google.co.in/citations?view_op=view_citation&hl=en&user=NLPFhkMAAAAJ&citation_for_view=NLPFhkMAAAAJ:IjCSPb-OGe4C"
        },
        {
            "Title": "Comparing novelty of designs from biological-inspiration with those from brainstorming",
            "Author": "<strong>S Keshwani</strong>, TA Lenau, S Ahmed-Kristensen, A Chakrabarti",
            "Journal": "Journal of Engineering Design 28 (10-12), 654-680",
            "Cited_by": 54,
            "Year": 2017,
            "Link": "https://scholar.google.co.in/citations?view_op=view_citation&hl=en&user=NLPFhkMAAAAJ&citation_for_view=NLPFhkMAAAAJ:u5HHmVD_uO8C"
        },
    ]
    const publications = document.getElementById('publications');

    if (publications) {
        publicationsData.forEach((item, index) => {
            const li = document.createElement('div');
            li.className = 'publication-card group relative p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg hover:border-leaf/50 transition-all duration-300 hover:-translate-y-1';
            li.style.animationDelay = `${index * 100}ms`;

            li.innerHTML = `
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-leaf to-green-400 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="px-2.5 py-1 text-xs font-semibold bg-leaf/10 text-leaf rounded-full">${item.Year}</span>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-leaf transition-colors">
                            <a class="hover:underline" rel="noopener" target="_blank" href="${item.Link}">${item.Title}</a>
                        </h3>
                        <p class="text-sm text-leaf font-medium mb-1">${item.Journal}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${item.Author}</p>
                    </div>
                    <a href="${item.Link}" target="_blank" rel="noopener" class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-leaf hover:text-white transition-all duration-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                    </a>
                </div>
            `;

            publications.appendChild(li);
        });
    }


    // Research Collaborations
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const collaborationsData = [
        {
            "name": "Prof. Gaetano Cascini",
            "link": "https://mecc.polimi.it/en/research/faculty/prof-gaetano-cascini",
            "position": "Full Professor",
            "department": "Department of Mechanical Engineering, Politecnico di Milano, Milan, <strong>Italy</strong>",
            "departmentLink": "https://www.mecc.polimi.it/en/"
        },
        {
            "name": "Prof. Hernan Casakin",
            "link": "https://scholar.google.co.il/citations?user=kr7wm4QAAAAJ&hl=iw",
            "position": "Associate Professor",
            "department": "Department of Architecture, Ariel University, <strong>Israel</strong>",
            "departmentLink": "https://cris.ariel.ac.il/en/organisations/school-of-architecture-2"
        },
        {
            "name": "Prof. Santosh Jagtap",
            "link": "https://sites.google.com/view/santoshdesign/home",
            "position": "Associate Professor",
            "department": "Department of Design, <strong>IIT Guwahati</strong>, India",
            "departmentLink": "https://www.iitg.ac.in/design/"
        },
        {
            "name": "Prof. Amaresh Chakrabarti",
            "link": "https://dm.iisc.ac.in/cpdm/facultyprofile.php?name=1",
            "position": "Professor and Chair",
            "department": "Centre for Product Design and Manufacturing, <strong>IISc Bangalore</strong>",
            "departmentLink": "https://dm.iisc.ac.in/dm/"
        },
        {
            "name": "Prof. E.Z. Opiyo",
            "link": "https://scholar.google.com/citations?user=3SAp_hIAAAAJ&hl=en",
            "position": "Professor",
            "department": "St. Joseph University, Dar-es-salaam, <strong>Tanzania</strong>",
            "departmentLink": "https://www.sjuit.ac.tz/"
        },
        {
            "name": "Prof. Srinivasan Venkataraman",
            "link": "https://sites.google.com/view/srinivasan-aboutme/home",
            "position": "Assistant Professor",
            "department": "Department of Design, <strong>IIT Delhi</strong>, India",
            "departmentLink": "https://www.iitg.ac.in/design/"
        },
        {
            "name": "Prof. Torben Anker Lenau",
            "link": "https://orbit.dtu.dk/en/persons/torben-anker-lenau",
            "position": "Associate Professor",
            "department": "Technical University of Denmark, <strong>Denmark</strong>",
            "departmentLink": "https://www.dtu.dk/english"
        },
        {
            "name": "Prof. Saeema Ahmed-Kristensen",
            "link": "https://experts.exeter.ac.uk/34981-saeema-ahmedkristensen",
            "position": "Professor",
            "department": "Design Engineering and Innovation, University of Exeter, <strong>England</strong>",
            "departmentLink": "https://www.exeter.ac.uk/"
        }
    ];

    const collaborations = document.getElementById('research-collaborations');

    if (collaborations) {
        collaborationsData.forEach(collab => {
            const card = document.createElement('div');
            card.className = 'card-enhanced p-6';
            card.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                    <a class="hover:text-leaf transition-colors" rel="noopener" target="_blank" href="${collab.link}">${collab.name}</a>
                </h3>
                <p class="text-sm text-leaf font-medium mt-1">${collab.position}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <a rel="noopener" target="_blank" class="hover:text-leaf transition-colors" href="${collab.departmentLink}">${collab.department}</a>
                </p>
            `;
            collaborations.appendChild(card);
        });
    }

    // Courses
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const courses = [
        {
            code: "DES102",
            title: "Introduction to Human Computer Interaction",
            description: "This course will provide a theoretical and practical understanding of human-computer interaction (HCI) design including concepts of user centered and design thinking, usability, interfaces, rapid prototyping, and evaluation. This is a project-based course where students can work on different user-centric prototypes.",
            link: "https://techtree.iiitd.edu.in/viewDescription/filename?=DES102"
        },
        {
            code: "DES523",
            title: "Cognition & Information Processing in Design",
            description: "In this course students will understand human cognition and its relevance in design. Through the course, the basic cognitive processes such as perception, attention, learning and memory will be discussed as separate entities. Students will also look at the role of various factors such as colour, form , shape and stress on cognition. Students will develop the skill to identify the application of these concepts to design. Students will be able to evaluate the subjective and objective methods of mental workload measures This course will enlighten students on all aspects of human cognition and design.",
            link: "https://techtree.iiitd.edu.in/viewDescription/filename?=DES523"
        },
        {
            code: "DES524",
            title: "Ergonomics / Human Factors for Design",
            description: "In designing, ergonomics takes care of the users' need, their limitations and abilities. Various aspects of basic anthropometry, physical, physiological, psychological and biomechanical limitations and abilities of the human body with reference to human centred design of products and systems will be explained. Students will: a) learn the principles, overview and background of ergonomics; b) develop the skill to identify the user friendly man machine environment system; and c) understand the methods and processes to evaluate the products, facilities, environment, jobs and tasks. This course will help in finding real time solutions to improve the quality of life and performance of an individual. ",
            link: "https://techtree.iiitd.edu.in/viewDescription/filename?=DES524"
        },
        {
            code: "DES533",
            title: "Interaction Design Perspectives & Methods",
            description: "This course provides description of various design methods at the various stages of designing. Students will learn to conduct in depth user analysis, understand the nuances of questionnaire design and analyze the user data quantitatively and qualitatively. Students will also be able to create prototypes and conduct usability testing of the developed prototypes.",
            link: "https://techtree.iiitd.edu.in/viewDescription/filename?=DES533"
        }
    ];

    const courseCardsContainer = document.getElementById('course-cards');

    if (courseCardsContainer) {
        courses.forEach(course => {
            const courseCard = document.createElement('a');
            courseCard.href = course.link;
            courseCard.target = "_blank";
            courseCard.rel = "noopener";
            courseCard.className = "card-enhanced group p-6 flex flex-col";

            courseCard.innerHTML = `
                <div class="flex items-center gap-3 mb-4">
                    <span class="px-3 py-1 bg-leaf/10 text-leaf text-sm font-bold rounded-lg">${course.code}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white group-hover:text-leaf transition-colors">${course.title}</h3>
                <p class="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-4">${course.description}</p>
                <div class="mt-auto pt-4 flex items-center text-leaf text-sm font-medium group-hover:gap-2 transition-all">
                    Learn more
                    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            `;

            courseCardsContainer.appendChild(courseCard);
        });
    }

    // Team
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // Refer to the team.js file for the team data

    // Header Scroll Effect - Add background when scrolled
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    const headerBackdrop = document.querySelector('.header-backdrop');
    if (headerBackdrop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                headerBackdrop.classList.remove('backdrop-blur-none', 'bg-transparent', 'border-transparent');
                headerBackdrop.classList.add('backdrop-blur-xl', 'bg-white/95', 'dark:bg-gray-900/95', 'border-gray-200/50', 'dark:border-gray-700/50', 'shadow-sm');
            } else {
                headerBackdrop.classList.add('backdrop-blur-none', 'bg-transparent', 'border-transparent');
                headerBackdrop.classList.remove('backdrop-blur-xl', 'bg-white/95', 'dark:bg-gray-900/95', 'border-gray-200/50', 'dark:border-gray-700/50', 'shadow-sm');
            }
        });
    }
});
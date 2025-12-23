document.addEventListener('DOMContentLoaded', function () {
    // --- API CONFIGURATION ---
    // Uses window.ENV from env.js
    const API_BASE_URL = window.ENV?.API_BASE_URL || window.API_CONFIG?.API_BASE_URL || '';

    // Helper to get file URL
    function getFileUrl(filename) {
        if (!filename) return '';
        if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
        return `${API_BASE_URL}/api/files/download/${encodeURIComponent(filename)}`;
    }

    // Load and apply theme color from settings
    // First apply cached color from localStorage for instant display
    const cachedTheme = localStorage.getItem('themeColor');
    if (cachedTheme) {
        applyThemeColor(cachedTheme);
    }

    async function loadThemeSettings() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings`);
            if (response.ok) {
                const settings = await response.json();
                if (settings.themeColor) {
                    applyThemeColor(settings.themeColor);
                    // Cache the theme color for instant loading on next page visit
                    localStorage.setItem('themeColor', settings.themeColor);
                }
            }
        } catch (e) {
            console.log('Using default/cached theme color');
        }
    }

    function applyThemeColor(color) {
        document.documentElement.style.setProperty('--leaf-color', color);
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

    // Load theme on page initialization
    loadThemeSettings();

    // Load PI content for dynamic rendering
    async function loadPIContent() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings`);
            if (response.ok) {
                const settings = await response.json();
                if (settings.piContent) {
                    // Update PI content containers on the page
                    document.querySelectorAll('.pi-content-dynamic').forEach(el => {
                        el.innerHTML = settings.piContent;
                    });
                }
            }
        } catch (e) {
            console.log('Using default PI content');
        }
    }

    // Get logo URL based on filename
    function getLogoUrl(filename) {
        if (!filename) return 'images/logo.png';
        if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('images/')) {
            return filename;
        }
        return `${API_BASE_URL}/api/files/download/${encodeURIComponent(filename)}`;
    }

    // Get initial logo URL from cache or default
    const cachedLogo = localStorage.getItem('siteLogo');
    const initialLogoUrl = cachedLogo ? getLogoUrl(cachedLogo) : 'images/logo.png';

    // Load logo settings and update header, footer, and favicon
    async function loadLogoSettings() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings`);
            if (response.ok) {
                const settings = await response.json();
                if (settings.siteLogo) {
                    localStorage.setItem('siteLogo', settings.siteLogo);
                    const logoUrl = getLogoUrl(settings.siteLogo);
                    updateAllLogos(logoUrl);
                }
            }
        } catch (e) {
            console.log('Using default/cached logo');
        }
    }

    // Update all logo instances across the page
    function updateAllLogos(logoUrl) {
        // Update header logos
        document.querySelectorAll('.header-logo-img').forEach(img => {
            img.src = logoUrl;
        });
        // Update footer logos
        document.querySelectorAll('.footer-logo-img').forEach(img => {
            img.src = logoUrl;
        });
        // Update favicon
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.href = logoUrl;
        }
    }

    // Header and Footer
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const headerHTML = `
    <header id="main-header" class="header-modern fixed w-full top-0 z-50 transition-all duration-500">
        <!-- Gradient Line Animation -->
        <div class="header-gradient-line absolute top-0 left-0 right-0 h-0.5 header-line-gradient opacity-0 transition-opacity duration-500"></div>
        
        <div class="header-backdrop backdrop-blur-none bg-transparent border-b border-transparent transition-all duration-300">
            <div class="container mx-auto px-4 md:px-8">
                <div class="flex items-center justify-between py-3 md:py-4">
                    <!-- Logo with Hover Animation -->
                    <a href="index.html" class="logo-container flex items-center group">
                        <div class="logo-glow relative">
                            <img src="${initialLogoUrl}" alt="DREAMRS Lab" class="header-logo-img h-14 sm:h-16 md:h-20 transition-all duration-300 group-hover:scale-105">
                            <div class="absolute inset-0 logo-glow-effect blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
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
                        <a href="phd.html" class="nav-link-modern group">
                            <span>PhD</span>
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
                <a href="phd.html" class="mobile-nav-link">PhD</a>
                <a href="pi.html" class="mobile-nav-link">Principal Investigator</a>
                <a href="openings.html" class="mobile-nav-link">Openings</a>
            </nav>
        </div>
    </header>
    `;

    const footerHTML = `
    <footer class="footer-modern relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div class="container mx-auto px-6 lg:px-12 py-12">

            <!-- Main Content Grid: 4 columns -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                
                <!-- Brand Section -->
                <div class="space-y-4">
                    <div class="logo-glow relative inline-block group">
                        <img src="${initialLogoUrl}" alt="DREAMRS Lab Logo" class="footer-logo-img h-20 md:h-24 lg:h-32 transition-all duration-300 group-hover:scale-105">
                        <div class="absolute inset-0 logo-glow-effect blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                    </div>
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

    // Load logo settings after header is in DOM
    loadLogoSettings();

    // Load PI content for dynamic sections
    loadPIContent();

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

    const publicationsData = []; // Will be populated from API

    async function loadResearch() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/data/research`);
            const data = await response.json();

            // Publications
            renderPublications(data.publications);

            // Collaborations
            renderCollaborations(data.collaborations);

            // Projects
            renderProjects(data.projects);
        } catch (error) {
            console.error('Error loading research data:', error);
        }
    }


    // Global Slideshow Logic
    let allPublicationImages = [];
    let currentGlobalSlide = 0;
    let globalSlideInterval;

    async function initGlobalSlideshow(publications) {
        allPublicationImages = [];

        try {
            // Fetch all images physically present in the directory
            const res = await fetch(`${API_BASE_URL}/api/files/list?dir=publications`);
            const files = await res.json();

            // Map files to slides
            files.forEach(filename => {
                // Ignore system files
                if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return;

                // Find metadata if available
                let title = "";
                let link = "#";

                // Search for this image in publications metadata
                // This is O(N*M) but N is small
                for (const pub of publications) {
                    if (pub.images && pub.images.includes(filename)) {
                        title = pub.Title;
                        link = pub.Link;
                        break;
                    }
                }

                // Use fallback title if not matched
                if (!title) title = "Research Image";

                allPublicationImages.push({
                    src: getFileUrl(filename),
                    title: title,
                    link: link
                });
            });
        } catch (e) {
            console.error("Failed to load slideshow images", e);
        }

        const container = document.getElementById('global-slideshow-container');
        if (!container) return; // Should not happen on research page

        if (allPublicationImages.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        renderGlobalSlides();
        startGlobalSlideshow();
    }

    function renderGlobalSlides() {
        const track = document.getElementById('global-slideshow-track');
        const indicators = document.getElementById('global-slideshow-indicators');

        track.innerHTML = allPublicationImages.map((img, index) => `
            <div class="min-w-full h-full relative group">
                <img src="${img.src}" class="w-full h-full object-contain bg-black/50" alt="${img.title}">
                <div class="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p class="font-bold truncate">${img.title}</p>
                </div>
            </div>
        `).join('');

        indicators.innerHTML = allPublicationImages.map((_, index) => `
            <button onclick="jumpToGlobalSlide(${index})" class="w-2 h-2 rounded-full transition-colors ${index === 0 ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}"></button>
        `).join('');
    }

    window.moveGlobalSlide = function (n) {
        if (allPublicationImages.length === 0) return;
        currentGlobalSlide = (currentGlobalSlide + n + allPublicationImages.length) % allPublicationImages.length;
        updateGlobalSlidePosition();
        resetGlobalTimer();
    };

    window.jumpToGlobalSlide = function (index) {
        currentGlobalSlide = index;
        updateGlobalSlidePosition();
        resetGlobalTimer();
    };

    function updateGlobalSlidePosition() {
        const track = document.getElementById('global-slideshow-track');
        track.style.transform = `translateX(-${currentGlobalSlide * 100}%)`;

        // Update indicators
        const indicators = document.getElementById('global-slideshow-indicators').children;
        Array.from(indicators).forEach((dot, idx) => {
            dot.className = `w-2 h-2 rounded-full transition-colors ${idx === currentGlobalSlide ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`;
        });
    }

    function startGlobalSlideshow() {
        if (globalSlideInterval) clearInterval(globalSlideInterval);
        globalSlideInterval = setInterval(() => {
            window.moveGlobalSlide(1);
        }, 3000); // 3 seconds
    }

    function resetGlobalTimer() {
        startGlobalSlideshow();
    }


    function renderPublications(items) {
        const publications = document.getElementById('research-publications');
        if (!publications) return;

        // Initialize Global Slideshow with all images
        initGlobalSlideshow(items);

        publications.innerHTML = '';
        items.forEach((item, index) => {
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
                        ${item.Cited_by ? `<p class="text-xs text-gray-500 mt-1">Cited by: ${item.Cited_by}</p>` : ''}
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

    // Global slideshow mover
    window.moveSlide = function (btn, n) {
        const container = btn.parentElement;
        const slides = container.getElementsByClassName('slide');
        let currentIndex = 0;

        // Find current active slide
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].classList.contains('opacity-100')) {
                currentIndex = i;
                break;
            }
        }

        slides[currentIndex].classList.remove('opacity-100');
        slides[currentIndex].classList.add('opacity-0');

        let newIndex = currentIndex + n;
        if (newIndex >= slides.length) newIndex = 0;
        if (newIndex < 0) newIndex = slides.length - 1;

        slides[newIndex].classList.remove('opacity-0');
        slides[newIndex].classList.add('opacity-100');
    };

    function renderCollaborations(items) {
        const collaborations = document.getElementById('research-collaborations');
        if (!collaborations) return;

        // Use a vertical list layout for better UI
        collaborations.className = "flex flex-col gap-4";

        collaborations.innerHTML = '';
        items.forEach((item, index) => {
            const li = document.createElement('div');
            // Styled as card like teams
            li.className = 'group w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg hover:border-leaf/50 transition-all duration-300';
            li.style.animationDelay = `${index * 100}ms`;

            // Assuming we don't have photos for external collaborators, we use a nice formatted text card
            li.innerHTML = `
                <div class="flex items-start gap-4">
                     <div class="w-12 h-12 rounded-full bg-gradient-to-br from-leaf to-green-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        ${item.name.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-leaf transition-colors mb-1">
                            <a href="${item.link}" target="_blank" rel="noopener">${item.name}</a>
                        </h4>
                        <p class="text-sm font-medium text-leaf mb-1">${item.position}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                             ${item.department}
                             ${item.departmentLink ? `<a href="${item.departmentLink}" target="_blank" class="ml-1 text-leaf hover:underline">↗</a>` : ''}
                        </p>
                    </div>
                </div>
            `;
            collaborations.appendChild(li);
        });
    }

    // Call the function if we are on the research page
    if (document.getElementById('research-publications') || document.getElementById('research-collaborations')) {
        loadResearch();
    }
    // Old publication rendering logic removed, handled in renderPublications functions


    // Research Collaborations
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Old collaborations data removed, handled in renderCollaborations

    // Old collaboration rendering logic removed, handled in renderCollaborations

    // Courses
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    function renderProjects(projectsData) {
        if (!projectsData) return;
        renderFundedProjects(projectsData.funded);
        renderOtherProjects(projectsData.other);
    }

    function renderFundedProjects(items) {
        const section = document.getElementById('funded-projects-section');
        const container = document.getElementById('funded-projects');
        if (!container || !section) return;

        container.innerHTML = '';

        if (!items || items.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = "glass-card rounded-2xl p-6 md:p-8 hover:shadow-lg transition-all duration-300";

            div.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                            </path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-white">${item.title}</h4>
                        ${item.duration ? `<p class="text-gray-500 dark:text-gray-400 mt-1">${item.duration}</p>` : ''}
                        
                        ${item.amount ? `
                        <p class="text-gray-600 dark:text-gray-300 mt-3">
                            <span class="font-medium text-leaf">Grant Amount:</span> ${item.amount}
                        </p>` : ''}
                        
                        ${item.agency ? `
                        <p class="text-gray-600 dark:text-gray-300 mt-1">
                            <span class="font-medium">Sponsoring body:</span> 
                            ${item.link ?
                        `<a rel="noopener" target="_blank" class="text-leaf hover:underline" href="${item.link}">${item.agency}</a>` :
                        item.agency
                    }
                        </p>` : ''}

                        ${item.description ? ` <p class="text-gray-500 dark:text-gray-400 mt-3 text-sm">${item.description}</p>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function renderOtherProjects(items) {
        const section = document.getElementById('other-projects-section');
        const container = document.getElementById('other-projects');
        if (!container || !section) return;

        container.innerHTML = '';

        if (!items || items.length === 0) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = "card-enhanced p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300";

            div.innerHTML = `
                <div class="w-10 h-10 rounded-lg bg-leaf/10 flex items-center justify-center flex-shrink-0">
                    <span class="text-leaf font-bold">${index + 1}</span>
                </div>
                <div>
                     <p class="text-gray-700 dark:text-gray-300 font-medium">${item.title}</p>
                     ${item.description ? `<p class="text-sm text-gray-500 mt-1">${item.description}</p>` : ''}
                     ${item.link ? `<a href="${item.link}" target="_blank" class="text-xs text-leaf hover:underline mt-1 inline-block">Learn more →</a>` : ''}
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Courses
    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
    async function loadCourses() {
        const courseCardsContainer = document.getElementById('course-cards');
        if (!courseCardsContainer) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/data/courses`);
            const courses = await response.json();

            courseCardsContainer.innerHTML = '';

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
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }
    loadCourses();

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

// --- PI Profile Rendering ---
async function loadPIProfile() {
    const containers = {
        bio: document.getElementById('pi-content-display'),
        education: document.getElementById('education-container'),
        experience: document.getElementById('experience-container'),
        awards: document.getElementById('awards-container')
    };

    // If no PI containers exist, we might not be on the PI page
    if (!Object.values(containers).some(c => c)) return;

    try {
        const res = await apiFetch('/api/settings');
        if (!res.ok) return;
        const settings = await res.json();

        // 1. Render Bio
        if (containers.bio && settings.piContent) {
            containers.bio.innerHTML = settings.piContent;
        }

        // 2. Render Education
        if (containers.education && settings.piEducation && settings.piEducation.length > 0) {
            const eduList = settings.piEducation;
            document.getElementById('education-section')?.classList.remove('hidden');
            containers.education.innerHTML = eduList.map(item => `
                <div class="bg-gray-50 dark:bg-gray-800 p-6 md:px-12 rounded-lg shadow-md transition-colors duration-300">
                    <h3 class="text-xl font-medium text-gray-700 dark:text-gray-200">${item.degree || ''}</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-400 font-medium">${item.institution || ''} <span class="text-gray-500 font-normal">(${item.year || ''})</span></p>
                    ${item.details ? `<div class="mt-2 text-gray-600 dark:text-gray-400">${item.details}</div>` : ''}
                </div>
            `).join('');
        }

        // 3. Render Experience
        if (containers.experience && settings.piExperience && settings.piExperience.length > 0) {
            const expList = settings.piExperience;
            document.getElementById('experience-section')?.classList.remove('hidden');
            containers.experience.innerHTML = expList.map(item => `
                <div class="bg-gray-50 dark:bg-gray-800 p-6 md:px-12 rounded-lg shadow-md transition-colors duration-300">
                    <h3 class="text-xl font-medium text-gray-700 dark:text-gray-200">${item.role || ''}</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">${item.institution || ''} <span class="text-gray-500">(${item.period || ''})</span></p>
                </div>
            `).join('');
        }

        // 4. Render Awards
        if (containers.awards && settings.piAwards && settings.piAwards.length > 0) {
            const awardsList = settings.piAwards;
            document.getElementById('awards-section')?.classList.remove('hidden');
            containers.awards.className = "mt-4 space-y-4"; // Ensure container has spacing for cards
            containers.awards.innerHTML = awardsList.map(item => `
                <div class="bg-gray-50 dark:bg-gray-800 p-6 md:px-12 rounded-lg shadow-md transition-colors duration-300">
                    <h3 class="font-medium text-gray-700 dark:text-gray-200">${item.title}</h3>
                    ${item.description ? `<div class="mt-2 text-gray-600 dark:text-gray-400 text-sm">${item.description}</div>` : ''}
                </div>
            `).join('');
        }

    } catch (e) {
        console.error('Error loading PI profile:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadPIProfile);
// --- Fixed PI Profile Rendering (Append) ---
async function initPIProfile() {
    const containers = {
        bio: document.getElementById('pi-content-display'),
        education: document.getElementById('education-container'),
        experience: document.getElementById('experience-container'),
        awards: document.getElementById('awards-container')
    };

    // If no PI containers exist, we might not be on the PI page
    if (!Object.values(containers).some(c => c)) return;

    // Get API_BASE_URL safely
    const API_BASE_URL = window.ENV?.API_BASE_URL || window.API_CONFIG?.API_BASE_URL || '';

    try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (!res.ok) return;
        const settings = await res.json();

        // 1. Render Bio
        if (containers.bio && settings.piContent) {
            containers.bio.innerHTML = settings.piContent;
        }

        // 2. Render Education
        if (containers.education && settings.piEducation && settings.piEducation.length > 0) {
            const eduList = settings.piEducation;
            document.getElementById('education-section')?.classList.remove('hidden');
            containers.education.innerHTML = eduList.map(item => `
                <div class="bg-gray-50 dark:bg-gray-800 p-6 md:px-12 rounded-lg shadow-md transition-colors duration-300">
                    <h3 class="text-xl font-medium text-gray-700 dark:text-gray-200">${item.degree || ''}</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-400 font-medium">${item.institution || ''} <span class="text-gray-500 font-normal">(${item.year || ''})</span></p>
                    ${item.details ? `<div class="mt-2 text-gray-600 dark:text-gray-400">${item.details}</div>` : ''}
                </div>
            `).join('');
        }

        // 3. Render Experience
        if (containers.experience && settings.piExperience && settings.piExperience.length > 0) {
            const expList = settings.piExperience;
            document.getElementById('experience-section')?.classList.remove('hidden');
            containers.experience.innerHTML = expList.map(item => `
                <div class="bg-gray-50 dark:bg-gray-800 p-6 md:px-12 rounded-lg shadow-md transition-colors duration-300">
                    <h3 class="text-xl font-medium text-gray-700 dark:text-gray-200">${item.role || ''}</h3>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">${item.institution || ''} <span class="text-gray-500">(${item.period || ''})</span></p>
                </div>
            `).join('');
        }

        // 4. Render Awards
        if (containers.awards && settings.piAwards && settings.piAwards.length > 0) {
            const awardsList = settings.piAwards;
            document.getElementById('awards-section')?.classList.remove('hidden');
            containers.awards.className = "mt-4 space-y-4";
            containers.awards.innerHTML = awardsList.map(item => `
                <div class="bg-gray-50 dark:bg-gray-800 p-6 md:px-12 rounded-lg shadow-md transition-colors duration-300">
                    <h3 class="font-medium text-gray-700 dark:text-gray-200">${item.title}</h3>
                    ${item.description ? `<div class="mt-2 text-gray-600 dark:text-gray-400 text-sm">${item.description}</div>` : ''}
                </div>
            `).join('');
        }

    } catch (e) {
        console.error('Error loading PI profile (init):', e);
    }
}

document.addEventListener('DOMContentLoaded', initPIProfile);

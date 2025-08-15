// PSSE Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    console.log('PSSE Website initializing...');
    initNavigation();
    initAnimations();
    initInteractiveElements();
    initImageHandling();
});

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.page-section');
    
    console.log('Initializing navigation with', navLinks.length, 'links and', sections.length, 'sections');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            console.log('Navigating to section:', targetSection);
            
            // Remove active class from all nav links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked nav link
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Show target section
            const targetSectionElement = document.getElementById(targetSection);
            if (targetSectionElement) {
                targetSectionElement.classList.add('active');
                targetSectionElement.style.display = 'block';
                
                // Scroll to top of the section
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 100);
                
                console.log('Section', targetSection, 'is now active');
            } else {
                console.error('Section not found:', targetSection);
            }
            
            // Update page title
            updatePageTitle(targetSection);
            
            // Close mobile navbar if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                if (navbarToggler) {
                    navbarToggler.click();
                }
            }
        });
    });
    
    // Ensure home section is visible by default
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.display = 'block';
    }
}

// Improved image error handling
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.officer-image img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.log('Image failed to load:', this.src);
            this.src = 'images/placeholder-image.png';
            this.style.opacity = '0.7'; // Indicate it's a fallback
        });
        
        img.addEventListener('load', function() {
            console.log('Image loaded successfully:', this.src);
            this.style.opacity = '1';
        });
    });
});

// Update page title based on active section
function updatePageTitle(section) {
    const titles = {
        'home': 'Philippine Society of Software Engineers',
        'about': 'About - Philippine Society of Software Engineers',
        'events': 'Events - Philippine Society of Software Engineers'
    };
    
    document.title = titles[section] || 'Philippine Society of Software Engineers';
}

// Initialize animations and scroll effects
function initAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe cards and important elements
    const animateElements = document.querySelectorAll('.card, .badge, h2, .lead');
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.custom-navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Initialize image handling with proper fallbacks
function initImageHandling() {
    console.log('Initializing image handling...');
    
    // Handle officer image errors
    const officerImages = document.querySelectorAll('.officer-image img');
    console.log('Found', officerImages.length, 'officer images');
    
    officerImages.forEach((img, index) => {
        img.addEventListener('error', function() {
            console.log('Officer image failed to load:', this.src);
            this.src = 'images/placeholder-image.jpg';
            this.alt = 'Officer Photo Placeholder';
        });
        
        img.addEventListener('load', function() {
            console.log('Officer image loaded successfully:', this.src);
            this.style.opacity = '1';
        });
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
    
    // Handle event image errors
    const eventImages = document.querySelectorAll('.event-card img.card-img-top');
    console.log('Found', eventImages.length, 'event images');
    
    eventImages.forEach(img => {
        img.addEventListener('error', function() {
            console.log('Event image failed to load:', this.src);
            this.style.display = 'none';
            const fallbackDiv = this.nextElementSibling;
            if (fallbackDiv && fallbackDiv.classList.contains('d-none')) {
                fallbackDiv.classList.remove('d-none');
                fallbackDiv.classList.add('d-flex');
            }
        });
        
        img.addEventListener('load', function() {
            console.log('Event image loaded successfully:', this.src);
            this.style.display = 'block';
            const fallbackDiv = this.nextElementSibling;
            if (fallbackDiv && fallbackDiv.classList.contains('d-flex')) {
                fallbackDiv.classList.remove('d-flex');
                fallbackDiv.classList.add('d-none');
            }
        });
    });
}

// Initialize interactive elements
function initInteractiveElements() {
    console.log('Initializing interactive elements...');
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'translateY(-5px)';
                this.style.transition = 'all 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to badges
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });
    
    // Handle Learn More buttons in events
    const learnMoreButtons = document.querySelectorAll('#events .btn-primary');
    console.log('Found', learnMoreButtons.length, 'learn more buttons');
    
    learnMoreButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            handleEventLearnMore(index);
        });
    });
    
    // Handle Join Us and Learn More buttons in hero
    const joinUsBtn = document.querySelector('.hero-section .btn-primary');
    const learnMoreBtn = document.querySelector('.hero-section .btn-outline-light');
    
    if (joinUsBtn) {
        joinUsBtn.addEventListener('click', function() {
            showModal('Join PSSE', 'Thank you for your interest in joining PSSE! To become an automatic member, you must be a software engineering student at Central Philippine University. We welcome all Software Engineering students who are passionate about technology and community building.');
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Navigate to about section
            const aboutNavLink = document.querySelector('.nav-link[data-section="about"]');
            if (aboutNavLink) {
                aboutNavLink.click();
            }
        });
    }
    
    // Add typing effect to hero tagline
    const tagline = document.querySelector('.hero-section .lead');
    if (tagline) {
        typeText(tagline, tagline.textContent, 50);
    }
    
    // Initialize officer card interactions
    initOfficerCards();
}

// Initialize officer card interactions
function initOfficerCards() {
    const officerCards = document.querySelectorAll('.officer-card');
    console.log('Initializing', officerCards.length, 'officer cards');
    
    officerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                const img = this.querySelector('.officer-image img');
                if (img) {
                    img.style.transform = 'scale(1.1)';
                }
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const img = this.querySelector('.officer-image img');
            if (img) {
                img.style.transform = 'scale(1)';
            }
        });
        
        // Add click interaction for officer cards
        card.addEventListener('click', function() {
            const officerTitle = this.querySelector('.card-title').textContent;
            showOfficerInfo(officerTitle);
        });
        
        // Make cards keyboard accessible
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Show officer information
function showOfficerInfo(officerTitle) {
    const officerDescriptions = {
        'President': 'The President leads the organization and represents PSSE in all official capacities. They oversee strategic planning and ensure the organization meets its goals.',
        'Vice President (External)': 'Responsible for external relations, partnerships with other organizations, and representing PSSE in inter-organizational activities.',
        'Vice President (Internal)': 'Manages internal affairs, member welfare, and ensures smooth day-to-day operations within the organization.',
        'Vice President (Media)': 'Oversees all media-related activities including social media management, documentation, and promotional materials.',
        'Vice President (Tech)': 'Leads technical initiatives, manages the organization\'s technical infrastructure, and oversees tech-related projects.',
        'Secretary': 'Maintains official records, handles correspondence, and ensures proper documentation of meetings and activities.',
        'Assistant Secretary': 'Supports the Secretary in documentation duties and assists in administrative tasks.',
        'General Treasurer': 'Manages the organization\'s overall finances and oversees all financial transactions.',
        '4th Year Treasurer': 'Handles financial matters specific to 4th year students and their activities.',
        '3rd Year Treasurer': 'Manages finances for 3rd year student activities and events.',
        '2nd Year Treasurer': 'Oversees financial responsibilities for 2nd year student programs.',
        '1st Year Treasurer': 'Handles financial matters for 1st year student activities and orientation programs.',
        'Auditor': 'Ensures financial transparency and conducts regular audits of organizational finances.',
        'Assistant Auditor': 'Supports the Auditor in financial oversight and transparency initiatives.',
        'Business Manager': 'Manages business partnerships, sponsorships, and revenue-generating activities.',
        'Assistant Business Manager': 'Assists in business development and partnership management.',
        'Public Information Officer': 'Handles public communications, press releases, and maintains the organization\'s public image.',
        '4th Year Representative': 'Represents the interests and concerns of 4th year students in organizational decisions.',
        '3rd Year Representative': 'Advocates for 3rd year student needs and facilitates communication with leadership.',
        '2nd Year Representative': 'Serves as liaison between 2nd year students and the organization leadership.',
        '1st Year Representative': 'Represents new students and helps with their integration into the organization.',
        'Ambassador': 'Serves as an official representative of PSSE in external events and partnerships.',
        'Ambassadress': 'Represents PSSE in official capacities and promotes the organization\'s mission.'
    };
    
    const description = officerDescriptions[officerTitle] || 'A dedicated officer contributing to PSSE\'s mission of shaping the next generation of software engineers.';
    showModal(officerTitle, description);
}

// Handle event learn more functionality
function handleEventLearnMore(eventIndex) {
    const events = [
        {
            title: 'Start-up Live Pitching Competition',
            details: 'PackUp, an innovative startup focused on solving packaging industry challenges, presented their groundbreaking solution. The competition featured live pitching sessions where teams demonstrated their entrepreneurial skills and technical expertise. This event showcased the business acumen and presentation skills of our software engineering students, bridging the gap between technical knowledge and business application.'
        },
        {
            title: 'National Champions - Math Platform',
            details: 'Our BSSE-3 students developed an innovative math platform that earned them the Champion title in a prestigious nationwide competition. Their solution addresses educational challenges in mathematics learning through interactive features and user-friendly design. This achievement demonstrates the high caliber of technical skills and problem-solving abilities of PSSE members.'
        },
        {
            title: 'Official Merchandise Design Contest',
            details: 'PSSE members showcased their creativity by designing official merchandise for our organization. The contest brought out amazing artistic talents from our software engineering community, proving that our members excel not just in coding but also in design and creative expression. The winning designs now represent our organization\'s identity and spirit.'
        }
    ];
    
    if (events[eventIndex]) {
        showModal(events[eventIndex].title, events[eventIndex].details);
    }
}

// Global variable to keep track of current modal instance
let currentModalInstance = null;

// Fixed modal functionality
function showModal(title, content) {
    // Close any existing modal first
    if (currentModalInstance) {
        currentModalInstance.hide();
        currentModalInstance = null;
    }
    
    // Create or get modal element
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = createModal();
        document.body.appendChild(modal);
    }
    
    // Update modal content
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${content}</p>`;
    
    // Create new Bootstrap modal instance
    currentModalInstance = new bootstrap.Modal(modal);
    
    // Add event listener for when modal is hidden
    modal.addEventListener('hidden.bs.modal', function() {
        currentModalInstance = null;
    });
    
    // Show modal
    currentModalInstance.show();
}

// Create modal element with fixed structure
function createModal() {
    const modalHTML = `
        <div class="modal fade" id="customModal" tabindex="-1" aria-labelledby="customModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="customModalLabel">Modal Title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Modal content goes here...</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary contact-btn">Contact Us</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    const modal = modalElement.firstElementChild;
    
    // Add contact button functionality with proper modal handling
    modal.querySelector('.contact-btn').addEventListener('click', function() {
        // Close current modal first, then show contact modal after a delay
        if (currentModalInstance) {
            currentModalInstance.hide();
            
            // Wait for the modal to close before showing the new one
            setTimeout(() => {
                showContactModal();
            }, 300);
        } else {
            showContactModal();
        }
    });
    
    return modal;
}

// Separate function for contact modal to avoid recursion issues
function showContactModal() {
    const contactContent = `
        You can reach us through:<br><br>
        📧 Email: psse@cpu.edu.ph<br>
        📱 Facebook: PSSE Central Philippine University<br>
        📍 Office: Central Philippine University, Software Engineering Department<br><br>
        We look forward to hearing from you!
    `;
    
    // Create a separate modal for contact info
    let contactModal = document.getElementById('contactModal');
    if (!contactModal) {
        contactModal = createContactModal();
        document.body.appendChild(contactModal);
    }
    
    // Update contact modal content
    const modalTitle = contactModal.querySelector('.modal-title');
    const modalBody = contactModal.querySelector('.modal-body');
    modalTitle.textContent = 'Contact PSSE';
    modalBody.innerHTML = `<div>${contactContent}</div>`;
    
    // Create new Bootstrap modal instance for contact
    const contactModalInstance = new bootstrap.Modal(contactModal);
    contactModalInstance.show();
}

// Create separate contact modal to avoid conflicts
function createContactModal() {
    const modalHTML = `
        <div class="modal fade" id="contactModal" tabindex="-1" aria-labelledby="contactModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="contactModalLabel">Contact PSSE</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div>Contact information goes here...</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    return modalElement.firstElementChild;
}

// Typing effect function (if used elsewhere in your code)
function typeText(element, text, speed) {
    if (!element || !text) return;
    
    element.textContent = '';
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}
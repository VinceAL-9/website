// PSSE Website JavaScript - Multi-Page Layout
// Enhanced with Merchandise Functionality and Merged Inline Scripts

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    console.log('PSSE Website initializing...');
    
    initAnimations();
    initInteractiveElements();
    initImageHandling();
    initMerchandise(); // Initialize merchandise system
    initCardHoverEffects(); // From inline scripts
    initScrollAnimations(); // From inline scripts
    initLoadingAnimation(); // From inline scripts
    
    const joinButtonHome = document.querySelector('.btn.btn-primary.btn-lg.me-3'); // The Join Us button on home page
    if (joinButtonHome) {
        joinButtonHome.addEventListener('click', function(e) {
            e.preventDefault();
            const joinUsModal = new bootstrap.Modal(document.getElementById('joinUsModal'));
            joinUsModal.show();
        });
    }
    
    const joinButtonEvents = document.querySelector('.btn btn-primary btn-lg me-3'); // The Join Us button on home page
    if (joinButtonEvents) {
        joinButtonEvents.addEventListener('click', function(e) {
            e.preventDefault();
            const joinUsModal = new bootstrap.Modal(document.getElementById('joinUsModal'));
            joinUsModal.show();
        });
    }
});

// ========================================================================
// CARD HOVER EFFECTS AND ANIMATIONS (From inline scripts)
// ========================================================================

function initCardHoverEffects() {
    // Add hover effect to officer cards
    const officerCards = document.querySelectorAll('.officer-card');
    officerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initScrollAnimations() {
    // Add animation to cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

function initLoadingAnimation() {
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}

// ========================================================================
// CORE INTERACTIVE FUNCTIONALITY (Optimized)
// ========================================================================

// Interactive elements initialization (Enhanced)
function initInteractiveElements() {
    console.log('Initializing interactive elements...');
    
    // Initialize any interactive elements that exist on the current page
    initButtons();
    initModals();
    
    console.log('Interactive elements initialized');
}

function initButtons() {
    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initModals() {
    // Initialize Bootstrap modals if they exist
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modal => {
        // Initialize Bootstrap modal
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            new bootstrap.Modal(modal);
        }
    });
}

// Image handling functionality
function initImageHandling() {
    console.log('Initializing image handling...');
    
    // Handle image loading errors
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Failed to load image:', this.src);
            // Optionally replace with placeholder
            // this.src = 'images/placeholder.jpg';
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });
}

// Animation system
function initAnimations() {
    console.log('Initializing animations...');
    
    // Fade in elements with animation class
    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ========================================================================
// MERCHANDISE SYSTEM - CORE FUNCTIONALITY
// ========================================================================

// Merchandise data structure (Mock database)
let merchandiseData = {
    lanyards: [
        {
            id: 'lan_001',
            name: 'PSSE Classic Lanyard',
            description: 'Official PSSE lanyard featuring the classic logo design with durable polyester material.',
            price: 150,
            image: 'images/merch/lanyard1.jpg',
            category: 'lanyard',
            stock: 25,
            addedDate: '2024-12-01',
            featured: true
        },
        {
            id: 'lan_002',
            name: 'PSSE Tech Lanyard',
            description: 'Modern design with tech-inspired patterns and RGB accents.',
            price: 180,
            image: 'images/merch/lanyard2.jpg',
            category: 'lanyard',
            stock: 8,
            addedDate: '2024-12-15',
            featured: false
        },
        {
            id: 'lan_003',
            name: 'PSSE Minimal Lanyard',
            description: 'Clean, minimal design perfect for professional settings.',
            price: 140,
            image: 'images/merch/lanyard3.jpg',
            category: 'lanyard',
            stock: 15,
            addedDate: '2024-11-20',
            featured: false
        },
        {
            id: 'lan_004',
            name: 'PSSE Alumni Lanyard',
            description: 'Special edition lanyard for PSSE alumni and graduating students.',
            price: 200,
            image: 'images/merch/lanyard4.jpg',
            category: 'lanyard',
            stock: 0,
            addedDate: '2024-10-10',
            featured: true
        }
    ],
    tshirts: [
        {
            id: 'tsh_001',
            name: 'PSSE Code Life T-Shirt',
            description: 'Comfortable cotton tee with "Code Life" design and PSSE branding.',
            price: 350,
            image: 'images/merch/tshirt1.jpg',
            category: 'tshirt',
            stock: 12,
            addedDate: '2024-11-30',
            featured: true
        },
        {
            id: 'tsh_002',
            name: 'PSSE Binary Dreams T-Shirt',
            description: 'Creative design featuring binary code patterns and software engineering quotes.',
            price: 380,
            image: 'images/merch/tshirt2.jpg',
            category: 'tshirt',
            stock: 6,
            addedDate: '2024-12-10',
            featured: false
        },
        {
            id: 'tsh_003',
            name: 'PSSE Retro Logo T-Shirt',
            description: 'Vintage-style PSSE logo on premium quality fabric.',
            price: 320,
            image: 'images/merch/tshirt3.jpg',
            category: 'tshirt',
            stock: 20,
            addedDate: '2024-11-15',
            featured: false
        },
        {
            id: 'tsh_004',
            name: 'PSSE Hackathon T-Shirt',
            description: 'Limited edition design celebrating PSSE hackathon winners.',
            price: 400,
            image: 'images/merch/tshirt4.jpg',
            category: 'tshirt',
            stock: 3,
            addedDate: '2024-12-20',
            featured: true
        }
    ]
};

// Order management system
let orderSystem = {
    orders: JSON.parse(localStorage.getItem('psseOrders') || '[]'),
    currentOrderId: localStorage.getItem('psseLastOrderId') || '1000',
    
    generateOrderId() {
        this.currentOrderId = (parseInt(this.currentOrderId) + 1).toString();
        localStorage.setItem('psseLastOrderId', this.currentOrderId);
        return `ORD-${this.currentOrderId}`;
    },
    
    saveToStorage() {
        localStorage.setItem('psseOrders', JSON.stringify(this.orders));
    },
    
    addOrder(orderData) {
        const order = {
            id: this.generateOrderId(),
            ...orderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.orders.unshift(order); // Add to beginning for newest first
        this.saveToStorage();
        return order;
    },
    
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            this.saveToStorage();
            return order;
        }
        return null;
    },
    
    cancelOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order && order.status !== 'completed') {
            // Restore stock
            const item = this.getItemById(order.itemId);
            if (item) {
                item.stock += order.quantity;
            }
            
            order.status = 'cancelled';
            order.updatedAt = new Date().toISOString();
            this.saveToStorage();
            return order;
        }
        return null;
    },
    
    getItemById(itemId) {
        const allItems = [...merchandiseData.lanyards, ...merchandiseData.tshirts];
        return allItems.find(item => item.id === itemId);
    }
};

// Initialize merchandise system
function initMerchandise() {
    console.log('Initializing merchandise system...');
    
    // Check if we're on the merchandise page by looking for any of the grid containers
    const allMerchGrid = document.getElementById('allMerchGrid');
    const lanyardGrid = document.getElementById('lanyardGrid');
    const tshirtGrid = document.getElementById('tshirtGrid');
    
    if (!allMerchGrid && !lanyardGrid && !tshirtGrid) {
        console.log('Not on merchandise page, skipping merchandise initialization');
        return;
    }
    
    // Load merchandise grid
    loadMerchandiseGrid();
    
    // Initialize tabs
    initMerchandiseTabs();
    
    // Load orders if any exist
    loadOrdersDisplay();
    
    // Initialize modal handlers
    initModalHandlers();
    
    // Initialize View Orders button
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleOrdersSection();
        });
    }
    
    console.log('Merchandise system initialized successfully');
}

// Load merchandise grid
function loadMerchandiseGrid() {
    const allItems = [...merchandiseData.lanyards, ...merchandiseData.tshirts];
    
    // Populate all items tab
    renderMerchandiseGrid('allMerchGrid', allItems);
    
    // Populate category-specific tabs
    renderMerchandiseGrid('lanyardGrid', merchandiseData.lanyards);
    renderMerchandiseGrid('tshirtGrid', merchandiseData.tshirts);
}

// FIXED: Render merchandise grid with proper Bootstrap column structure
function renderMerchandiseGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
    }
    
    if (items.length === 0) {
        container.innerHTML = '<div class="col-12"><div class="text-center py-5"><h5>No items available</h5></div></div>';
        return;
    }
    
    // Generate HTML for each item wrapped in Bootstrap columns
    const gridHTML = items.map(item => {
        const stockClass = item.stock === 0 ? 'out-of-stock' : item.stock <= 5 ? 'low-stock' : 'in-stock';
        const stockText = item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock';
        
        return `
            <div class="col-lg-4 col-md-6 col-sm-6 col-12">
                <div class="card merch-card h-100 position-relative">
                    <!-- Stock indicator badge -->
                    <div class="stock-indicator">
                        <span class="stock-badge ${stockClass}">${stockText}</span>
                    </div>
                    
                    <!-- Product image -->
                    <img src="${item.image}" class="card-img-top" alt="${item.name}" 
                         onerror="this.src='images/placeholder-merch.jpg'">
                    
                    <!-- Card body with product details -->
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text flex-grow-1">${item.description}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="h5 text-primary mb-0">₱${item.price}</span>
                                <small class="text-muted">Stock: ${item.stock}</small>
                            </div>
                            
                            <!-- Order button - disabled if out of stock -->
                            <button class="btn btn-primary w-100 order-btn" 
                                    data-item-id="${item.id}" 
                                    ${item.stock === 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart me-2"></i>
                                ${item.stock === 0 ? 'Out of Stock' : 'Order Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Insert the generated HTML into the container
    container.innerHTML = gridHTML;
    
    // Add click event listeners to order buttons
    container.querySelectorAll('.order-btn:not([disabled])').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            openOrderModal(itemId);
        });
    });
}

// Initialize merchandise tabs
function initMerchandiseTabs() {
    const tabs = document.querySelectorAll('#merchTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
        });
    });
}

// FIXED: Open order modal for a specific item with proper form validation
function openOrderModal(itemId) {
    const item = orderSystem.getItemById(itemId);
    if (!item || item.stock === 0) {
        alert('Sorry, this item is out of stock.');
        return;
    }
    
    // Create modal HTML for ordering
    const modalHTML = `
        <div class="modal fade" id="orderModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Order ${item.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="orderForm">
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <img src="${item.image}" class="img-fluid rounded" alt="${item.name}"
                                         onerror="this.src='images/placeholder-merch.jpg'">
                                </div>
                                <div class="col-md-8">
                                    <h6>${item.name}</h6>
                                    <p class="text-muted">${item.description}</p>
                                    <p class="h5 text-primary">₱${item.price}</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-control" id="customerName" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Student ID</label>
                                <input type="text" class="form-control" id="studentId" placeholder="Optional">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Contact Number</label>
                                <input type="tel" class="form-control" id="contactNumber" placeholder="Optional">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Quantity *</label>
                                <select class="form-control" id="quantity" required>
                                    ${Array.from({length: Math.min(item.stock, 10)}, (_, i) => 
                                        `<option value="${i + 1}">${i + 1}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Total Amount</label>
                                <input type="text" class="form-control" id="totalAmount" value="₱${item.price}" readonly>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submitOrder">Submit Order</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('orderModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize and show modal
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
    
    // Handle quantity change for total calculation
    const quantitySelect = document.getElementById('quantity');
    const totalAmountInput = document.getElementById('totalAmount');
    
    quantitySelect.addEventListener('change', function() {
        const quantity = parseInt(this.value);
        const total = item.price * quantity;
        totalAmountInput.value = `₱${total}`;
    });
    
    // Handle order submission
    document.getElementById('submitOrder').addEventListener('click', function() {
        const customerName = document.getElementById('customerName').value.trim();
        const studentId = document.getElementById('studentId').value.trim();
        const contactNumber = document.getElementById('contactNumber').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value);
        
        if (!customerName) {
            alert('Please enter your full name.');
            return;
        }
        
        // Create order
        const orderData = {
            itemId: item.id,
            itemName: item.name,
            itemPrice: item.price,
            customerName: customerName,
            studentId: studentId || null,
            contactNumber: contactNumber || null,
            quantity: quantity,
            totalAmount: item.price * quantity,
            status: 'reviewing'
        };
        
        // Reduce stock
        item.stock -= quantity;
        
        // Add to orders
        const order = orderSystem.addOrder(orderData);
        
        // Close modal
        modal.hide();
        
        // Show success message
        showOrderSuccessModal(order);
        
        // Refresh merchandise grid to update stock
        loadMerchandiseGrid();
        
        // Refresh orders display if visible
        loadOrdersDisplay();
    });
}

// Show order success modal
function showOrderSuccessModal(order) {
    const successModalHTML = `
        <div class="modal fade" id="orderSuccessModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>Order Successful!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
                        </div>
                        
                        <p class="lead text-center">Your order has been received and is being reviewed.</p>
                        
                        <div class="card bg-light">
                            <div class="card-body">
                                <p class="mb-2"><strong>Order ID:</strong> ${order.id}</p>
                                <p class="mb-2"><strong>Item:</strong> ${order.itemName}</p>
                                <p class="mb-2"><strong>Quantity:</strong> ${order.quantity}</p>
                                <p class="mb-2"><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
                                <p class="mb-0"><strong>Status:</strong> Under Review</p>
                            </div>
                        </div>
                        
                        <div class="mt-4">
                            <h6>Next Steps:</h6>
                            <ol>
                                <li>Send payment to:
                                    <ul class="mt-2">
                                        <li><strong>GCash:</strong> 0915-123-4567 (PSSE Treasurer)</li>
                                        <li><strong>BPI:</strong> 1234-5678-90 (Philippine Society of Software Engineers)</li>
                                    </ul>
                                </li>
                                <li class="mt-2">Visit our office or find our treasurer during these times:
                                    <ul class="mt-2">
                                        <li><strong>Monday-Friday:</strong> 10:00 AM - 4:00 PM</li>
                                        <li><strong>Location:</strong> CAS Building, Room 301</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it!</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing success modal if any
    const existingSuccessModal = document.getElementById('orderSuccessModal');
    if (existingSuccessModal) {
        existingSuccessModal.remove();
    }
    
    // Add success modal to body
    document.body.insertAdjacentHTML('beforeend', successModalHTML);
    
    // Show success modal
    const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
    successModal.show();
}

// Initialize modal handlers
function initModalHandlers() {
    console.log('Modal handlers initialized');
}

// Load orders display
function loadOrdersDisplay() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    const orders = orderSystem.orders;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h5>No orders found</h5>
                <p class="text-muted">Start shopping to see your orders here!</p>
            </div>
        `;
        return;
    }
    
    const ordersHTML = orders.map(order => {
        const createdDate = new Date(order.createdAt).toLocaleDateString();
        
        return `
            <div class="order-card">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-1">Order ${order.id}</h6>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <p class="mb-2"><strong>${order.itemName}</strong></p>
                <div class="row">
                    <div class="col-sm-6">
                        <p class="mb-1"><strong>Customer:</strong> ${order.customerName}</p>
                        ${order.studentId ? `<p class="mb-1"><strong>Student ID:</strong> ${order.studentId}</p>` : ''}
                        ${order.contactNumber ? `<p class="mb-1"><strong>Contact:</strong> ${order.contactNumber}</p>` : ''}
                    </div>
                    <div class="col-sm-6">
                        <p class="mb-1"><strong>Quantity:</strong> ${order.quantity}</p>
                        <p class="mb-1"><strong>Total:</strong> ₱${order.totalAmount}</p>
                        <p class="mb-1"><strong>Date:</strong> ${createdDate}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    ordersContainer.innerHTML = ordersHTML;
}

// Toggle orders section visibility
function toggleOrdersSection() {
    const ordersSection = document.getElementById('ordersSection');
    if (ordersSection) {
        ordersSection.classList.toggle('d-none');
        loadOrdersDisplay(); // Refresh orders when showing
    }
}

// ========================================================================
// CONTACT INFORMATION MODAL
// ========================================================================

// Function to show contact modal
function showContactModal() {
    const contactModalHTML = `
        <div class="modal fade" id="contactModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-envelope me-2"></i>Contact PSSE
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fab fa-facebook fa-3x text-primary mb-3"></i>
                                        <h6>PSSE Official Facebook Page</h6>
                                        <p class="text-muted mb-3">Follow us for updates and announcements</p>
                                        <a href="#" class="btn btn-primary">Visit Page</a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fas fa-envelope fa-3x text-primary mb-3"></i>
                                        <h6>psse.cpu@gmail.com</h6>
                                        <p class="text-muted mb-3">Send us your questions and concerns</p>
                                        <a href="mailto:psse.cpu@gmail.com" class="btn btn-primary">Send Email</a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fas fa-users fa-3x text-primary mb-3"></i>
                                        <h6>Contact any PSSE Officer</h6>
                                        <p class="text-muted mb-3">Reach out to our leadership team</p>
                                        <a href="about.html" class="btn btn-primary">View Officers</a>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                                        <h6>Visit Our Office</h6>
                                        <p class="text-muted mb-0">CAS Building, Room 301</p>
                                        <p class="text-muted mb-3">Mon-Fri: 10AM-4PM</p>
                                        <button class="btn btn-primary" disabled>Visit Us</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing contact modal if any
    const existingContactModal = document.getElementById('contactModal');
    if (existingContactModal) {
        existingContactModal.remove();
    }
    
    // Add contact modal to body
    document.body.insertAdjacentHTML('beforeend', contactModalHTML);
    
    // Show contact modal
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    contactModal.show();
}

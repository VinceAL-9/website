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
    
    // Only initialize if we're on the merchandise page
    if (!document.getElementById('allMerchGrid') && !document.getElementById('lanyardGrid') && !document.getElementById('tshirtGrid')) {
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

// Render merchandise grid
function renderMerchandiseGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4">No items available</p>';
        return;
    }
    
    const gridHTML = items.map(item => {
        const stockClass = item.stock === 0 ? 'out-of-stock' : item.stock <= 5 ? 'low-stock' : 'in-stock';
        const stockText = item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? 'Low Stock' : 'In Stock';
        
        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card merch-card h-100" data-item-id="${item.id}">
                    <div class="position-relative">
                        <img src="${item.image}" class="card-img-top" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                        <div class="stock-indicator">
                            <span class="stock-badge ${stockClass}">${stockText}</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text text-muted flex-grow-1">${item.description}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="h4 mb-0 text-primary">₱${item.price}</span>
                                <small class="text-muted">Stock: ${item.stock}</small>
                            </div>
                            <button class="btn btn-primary w-100 order-btn" 
                                    data-item-id="${item.id}" 
                                    ${item.stock === 0 ? 'disabled' : ''}>
                                ${item.stock === 0 ? 'Out of Stock' : 'Order Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = gridHTML;
    
    // Add event listeners for order buttons
    container.querySelectorAll('.order-btn').forEach(btn => {
        btn.addEventListener('click', handleOrderClick);
    });
}

// Initialize merchandise tabs
function initMerchandiseTabs() {
    const tabLinks = document.querySelectorAll('.nav-tabs .nav-link');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active tab
            tabLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            const targetTab = this.getAttribute('data-bs-target');
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            document.querySelector(targetTab).classList.add('show', 'active');
        });
    });
}

// Handle order button clicks
function handleOrderClick(event) {
    const itemId = event.target.getAttribute('data-item-id');
    const item = orderSystem.getItemById(itemId);
    
    if (!item || item.stock === 0) {
        alert('Sorry, this item is currently out of stock.');
        return;
    }
    
    showOrderModal(item);
}

// Show order modal
function showOrderModal(item) {
    const modalContent = `
        <div class="text-center mb-4">
            <img src="${item.image}" alt="${item.name}" class="img-fluid mb-3" style="max-height: 200px; object-fit: cover;">
            <h4>${item.name}</h4>
            <p class="text-muted">${item.description}</p>
            <h5 class="text-primary">₱${item.price}</h5>
        </div>
        
        <form id="orderForm">
            <div class="mb-3">
                <label for="quantity" class="form-label">Quantity</label>
                <select class="form-control" id="quantity" required>
                    ${Array.from({length: Math.min(item.stock, 10)}, (_, i) => 
                        `<option value="${i + 1}">${i + 1}</option>`
                    ).join('')}
                </select>
                <small class="text-muted">Available stock: ${item.stock}</small>
            </div>
            
            <div class="mb-3">
                <label for="customerName" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="customerName" required>
            </div>
            
            <div class="mb-3">
                <label for="studentId" class="form-label">Student ID</label>
                <input type="text" class="form-control" id="studentId" required>
            </div>
            
            <div class="mb-3">
                <label for="contactNumber" class="form-label">Contact Number</label>
                <input type="tel" class="form-control" id="contactNumber" required>
            </div>
            
            <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            
            <div class="mb-3">
                <label for="notes" class="form-label">Special Instructions (Optional)</label>
                <textarea class="form-control" id="notes" rows="3"></textarea>
            </div>
            
            <div class="alert alert-info">
                <strong>Total Amount: </strong>
                <span id="totalAmount">₱${item.price}</span>
            </div>
            
            <div class="d-flex gap-3">
                <button type="submit" class="btn btn-primary flex-fill">Place Order</button>
                <button type="button" class="btn btn-secondary contact-btn">Contact Us</button>
            </div>
        </form>
    `;
    
    showModal('Order Item', modalContent);
    
    // Add form submission handler
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder(item);
    });
    
    // Update total amount when quantity changes
    document.getElementById('quantity').addEventListener('change', function() {
        const quantity = parseInt(this.value);
        const total = item.price * quantity;
        document.getElementById('totalAmount').textContent = `₱${total}`;
    });
}

// Process order submission
function processOrder(item) {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    
    const orderData = {
        itemId: item.id,
        itemName: item.name,
        itemPrice: item.price,
        quantity: parseInt(formData.get('quantity')),
        customerName: formData.get('customerName'),
        studentId: formData.get('studentId'),
        contactNumber: formData.get('contactNumber'),
        email: formData.get('email'),
        notes: formData.get('notes'),
        totalAmount: item.price * parseInt(formData.get('quantity')),
        status: 'reviewing'
    };
    
    // Reduce stock
    item.stock -= orderData.quantity;
    
    // Add order to system
    const order = orderSystem.addOrder(orderData);
    
    // Close modal
    if (currentModalInstance) {
        currentModalInstance.hide();
    }
    
    // Show success message
    setTimeout(() => {
        showOrderSuccessModal(order);
    }, 300);
    
    // Refresh merchandise grid to reflect new stock levels
    loadMerchandiseGrid();
}

// Show order success modal
function showOrderSuccessModal(order) {
    const successContent = `
        <div class="text-center">
            <div class="mb-4">
                <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
            </div>
            <h4>Order Placed Successfully!</h4>
            <p class="text-muted">Your order has been received and is being reviewed.</p>
            
            <div class="order-summary mt-4 p-3 bg-light rounded">
                <h6>Order Details:</h6>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Item:</strong> ${order.itemName}</p>
                <p><strong>Quantity:</strong> ${order.quantity}</p>
                <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
                <p><strong>Status:</strong> Under Review</p>
            </div>
            
            <div class="alert alert-info mt-3">
                <strong>What's Next?</strong><br>
                We'll review your order and contact you within 24 hours with payment instructions.
            </div>
            
            <div class="mt-4">
                <h6>Payment Instructions:</h6>
                <p class="small text-muted">Send payment to:</p>
                <p class="small">
                    <strong>GCash:</strong> 0915-123-4567 (PSSE Treasurer)<br>
                    <strong>BPI:</strong> 1234-5678-90 (Philippine Society of Software Engineers)
                </p>
            </div>
            
            <div class="mt-4">
                <h6>Pickup Information:</h6>
                <p class="small text-muted">Visit our office or find our treasurer during these times:</p>
                <p class="small">
                    <strong>Monday-Friday:</strong> 10:00 AM - 4:00 PM<br>
                    <strong>Location:</strong> CAS Building, Room 301
                </p>
            </div>
            
            <button type="button" class="btn btn-primary contact-btn mt-3">Contact Us</button>
        </div>
    `;
    
    showModal('Order Confirmation', successContent);
}

// Load and display orders
function loadOrdersDisplay() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    if (orderSystem.orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-bag text-muted" style="font-size: 3rem;"></i>
                <p class="mt-3 text-muted">No orders found. Start shopping to see your orders here!</p>
            </div>
        `;
        return;
    }
    
    const ordersHTML = orderSystem.orders.map(order => {
        const statusInfo = getOrderStatusInfo(order.status);
        const createdDate = new Date(order.createdAt).toLocaleDateString();
        
        return `
            <div class="order-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 class="mb-1">${order.itemName}</h6>
                        <small class="text-muted">Order ID: ${order.id}</small>
                    </div>
                    <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Customer:</strong> ${order.customerName}</p>
                        <p class="mb-1"><strong>Student ID:</strong> ${order.studentId}</p>
                        <p class="mb-1"><strong>Contact:</strong> ${order.contactNumber}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Quantity:</strong> ${order.quantity}</p>
                        <p class="mb-1"><strong>Total:</strong> ₱${order.totalAmount}</p>
                        <p class="mb-1"><strong>Date:</strong> ${createdDate}</p>
                    </div>
                </div>
                
                <div class="mt-3">
                    <small class="text-muted">Current Status: ${getOrderStatusInfo(order.status).text}</small>
                </div>
            </div>
        `;
    }).join('');
    
    ordersContainer.innerHTML = ordersHTML;
}

// Get order status information
function getOrderStatusInfo(status) {
    const statusMap = {
        'reviewing': { text: 'Under Review', class: 'status-reviewing' },
        'awaiting-payment': { text: 'Awaiting Payment', class: 'status-awaiting-payment' },
        'pickup': { text: 'Ready for Pickup', class: 'status-pickup' },
        'completed': { text: 'Completed', class: 'status-completed' },
        'cancelled': { text: 'Cancelled', class: 'status-cancelled' }
    };
    
    return statusMap[status] || { text: 'Unknown', class: 'status-reviewing' };
}

// Modal system
let currentModalInstance = null;

function initModalHandlers() {
    // Initialize any existing modals on the page
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function() {
            if (currentModalInstance) {
                currentModalInstance = null;
            }
        });
    });
}

function showModal(title, content) {
    // Remove any existing dynamic modal
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal element
    const modal = createModal();
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = `... ${content}`;
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Create new Bootstrap modal instance
    currentModalInstance = new bootstrap.Modal(modal);
    
    // Add event listener for when modal is hidden
    modal.addEventListener('hidden.bs.modal', function() {
        currentModalInstance = null;
    }, { once: true });
    
    // Show modal
    currentModalInstance.show();
}

// Create main modal element with fixed structure
function createModal() {
    const modalHTML = `
        <div class="modal fade" id="dynamicModal" tabindex="-1" aria-labelledby="dynamicModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="dynamicModalLabel"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Content will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    const modal = modalElement.firstElementChild;
    
    // Add contact button functionality with proper modal handling
    modal.querySelector('.contact-btn')?.addEventListener('click', function() {
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
        <div class="text-center">
            <h4 class="mb-4">Contact PSSE</h4>
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="contact-method p-3 border rounded">
                        <i class="fab fa-facebook text-primary mb-2" style="font-size: 2rem;"></i>
                        <h6>Facebook</h6>
                        <p class="small text-muted">PSSE Official Facebook Page</p>
                        <a href="#" class="btn btn-sm btn-outline-primary">Visit Page</a>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="contact-method p-3 border rounded">
                        <i class="fas fa-envelope text-primary mb-2" style="font-size: 2rem;"></i>
                        <h6>Email</h6>
                        <p class="small text-muted">psse.cpu@gmail.com</p>
                        <a href="mailto:psse.cpu@gmail.com" class="btn btn-sm btn-outline-primary">Send Email</a>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="contact-method p-3 border rounded">
                        <i class="fas fa-phone text-primary mb-2" style="font-size: 2rem;"></i>
                        <h6>Phone</h6>
                        <p class="small text-muted">Contact any PSSE Officer</p>
                        <button class="btn btn-sm btn-outline-primary" disabled>See Officers</button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="contact-method p-3 border rounded">
                        <i class="fas fa-map-marker-alt text-primary mb-2" style="font-size: 2rem;"></i>
                        <h6>Visit Us</h6>
                        <p class="small text-muted">CAS Building, Room 301<br>Mon-Fri: 10AM-4PM</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showModal('Contact Information', contactContent);
}
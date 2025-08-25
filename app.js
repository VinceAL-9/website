// PSSE Website JavaScript - Enhanced Merchandise System with Demo Features
// Enhanced with Email Collection, Demo Payment, and Improved Order Tracking

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    console.log('PSSE Website initializing...');
    initAnimations();
    initInteractiveElements();
    initImageHandling();
    initMerchandise(); // Initialize enhanced merchandise system
    initCardHoverEffects();
    initScrollAnimations();
    initLoadingAnimation();

    // Initialize Join Us button handlers
    const joinButtonHome = document.querySelector('.btn.btn-primary.btn-lg.me-3');
    if (joinButtonHome) {
        joinButtonHome.addEventListener('click', function(e) {
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

function initInteractiveElements() {
    console.log('Initializing interactive elements...');
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
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            new bootstrap.Modal(modal);
        }
    });
}

function initImageHandling() {
    console.log('Initializing image handling...');
    // Handle image loading errors
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Failed to load image:', this.src);
            // Replace with placeholder for demo
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
        });
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });
}

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
// ENHANCED MERCHANDISE SYSTEM - CORE FUNCTIONALITY
// ========================================================================

// Enhanced merchandise data structure with more detailed information
let merchandiseData = {
    lanyards: [
        {
            id: 'lan_001',
            name: 'PSSE Classic Lanyard',
            description: 'Official PSSE lanyard featuring the classic logo design with durable polyester material. Perfect for daily use and events.',
            price: 150,
            image: 'images/merch/lanyard1.jpg',
            category: 'lanyard',
            stock: 25,
            addedDate: '2024-12-01',
            featured: true,
            specifications: ['Durable polyester material', 'Metal clasp', '90cm length', 'Screen printed logo']
        },
        {
            id: 'lan_002',
            name: 'PSSE Tech Lanyard',
            description: 'Modern design with tech-inspired patterns and RGB accents. Ideal for tech enthusiasts and developers.',
            price: 180,
            image: 'images/merch/lanyard2.jpg',
            category: 'lanyard',
            stock: 8,
            addedDate: '2024-12-15',
            featured: false,
            specifications: ['Premium nylon material', 'Breakaway safety feature', '85cm length', 'Digital print design']
        },
        {
            id: 'lan_003',
            name: 'PSSE Minimal Lanyard',
            description: 'Clean, minimal design perfect for professional settings. Subtle branding with elegant finish.',
            price: 140,
            image: 'images/merch/lanyard3.jpg',
            category: 'lanyard',
            stock: 15,
            addedDate: '2024-11-20',
            featured: false,
            specifications: ['Cotton blend material', 'Magnetic breakaway', '88cm length', 'Embossed logo']
        },
        {
            id: 'lan_004',
            name: 'PSSE Alumni Lanyard',
            description: 'Special edition lanyard for PSSE alumni and graduating students. Limited edition design with premium materials.',
            price: 200,
            image: 'images/merch/lanyard4.jpg',
            category: 'lanyard',
            stock: 0,
            addedDate: '2024-10-10',
            featured: true,
            specifications: ['Premium leather accent', 'Gold-plated hardware', '92cm length', 'Laser engraved details']
        }
    ],
    tshirts: [
        {
            id: 'tsh_001',
            name: 'PSSE Code Life T-Shirt',
            description: 'Comfortable cotton tee with "Code Life" design and PSSE branding. Perfect for coding sessions and casual wear.',
            price: 350,
            image: 'images/merch/tshirt1.jpg',
            category: 'tshirt',
            stock: 12,
            addedDate: '2024-11-30',
            featured: true,
            specifications: ['100% cotton fabric', 'Sizes: S, M, L, XL', 'Pre-shrunk material', 'Screen printed design']
        },
        {
            id: 'tsh_002',
            name: 'PSSE Binary Dreams T-Shirt',
            description: 'Creative design featuring binary code patterns and software engineering quotes. For the passionate programmer.',
            price: 380,
            image: 'images/merch/tshirt2.jpg',
            category: 'tshirt',
            stock: 6,
            addedDate: '2024-12-10',
            featured: false,
            specifications: ['Cotton-poly blend', 'Sizes: S, M, L, XL, XXL', 'Fade-resistant print', 'Tagless comfort']
        },
        {
            id: 'tsh_003',
            name: 'PSSE Retro Logo T-Shirt',
            description: 'Vintage-style PSSE logo on premium quality fabric. Classic design that never goes out of style.',
            price: 320,
            image: 'images/merch/tshirt3.jpg',
            category: 'tshirt',
            stock: 20,
            addedDate: '2024-11-15',
            featured: false,
            specifications: ['Ring-spun cotton', 'Sizes: XS, S, M, L, XL', 'Vintage wash finish', 'Double-stitched hems']
        },
        {
            id: 'tsh_004',
            name: 'PSSE Hackathon T-Shirt',
            description: 'Limited edition design celebrating PSSE hackathon winners. Commemorative piece for coding champions.',
            price: 400,
            image: 'images/merch/tshirt4.jpg',
            category: 'tshirt',
            stock: 3,
            addedDate: '2024-12-20',
            featured: true,
            specifications: ['Premium tri-blend fabric', 'Sizes: S, M, L, XL', 'Metallic foil print', 'Limited edition numbering']
        }
    ]
};

// Enhanced Order Management System with Email and Payment Tracking
let orderSystem = {
    orders: JSON.parse(localStorage.getItem('psseOrders') || '[]'),
    currentOrderId: localStorage.getItem('psseLastOrderId') || '1000',

    // Generate unique order ID
    generateOrderId() {
        this.currentOrderId = (parseInt(this.currentOrderId) + 1).toString();
        localStorage.setItem('psseLastOrderId', this.currentOrderId);
        return `ORD-${this.currentOrderId}`;
    },

    // Save orders to local storage
    saveToStorage() {
        localStorage.setItem('psseOrders', JSON.stringify(this.orders));
    },

    // Add new order with enhanced data structure
    addOrder(orderData) {
        const order = {
            id: this.generateOrderId(),
            ...orderData,
            status: 'pending_review', // Initial status: "Order is being reviewed"
            paymentStatus: 'pending',
            paymentMethod: null,
            paymentReference: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedPickup: this.calculateEstimatedPickup()
        };
        this.orders.unshift(order); // Add to beginning for newest first
        this.saveToStorage();
        return order;
    },

    // Calculate estimated pickup date (demo: 3-5 business days)
    calculateEstimatedPickup() {
        const today = new Date();
        const pickupDate = new Date(today);
        pickupDate.setDate(today.getDate() + Math.floor(Math.random() * 3) + 3); // 3-5 days
        return pickupDate.toISOString();
    },

    // Update order status with proper status flow
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            
            // Auto-update payment status based on order status
            if (newStatus === 'awaiting_payment') {
                order.paymentStatus = 'pending';
            } else if (newStatus === 'ready_pickup') {
                order.paymentStatus = 'completed';
            }
            
            this.saveToStorage();
            return order;
        }
        return null;
    },

    // Process payment (demo implementation)
    processPayment(orderId, paymentMethod, paymentReference = null) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.paymentStatus = 'processing';
            order.paymentMethod = paymentMethod;
            order.paymentReference = paymentReference;
            order.updatedAt = new Date().toISOString();

            // Simulate payment processing delay
            setTimeout(() => {
                order.paymentStatus = 'completed';
                order.status = 'ready_pickup';
                order.updatedAt = new Date().toISOString();
                this.saveToStorage();
                
                // Send demo email receipt
                this.sendEmailReceipt(order);
                
                // Update UI if order tracking is visible
                const trackingSection = document.getElementById('orderTrackingSection');
                if (trackingSection && trackingSection.style.display !== 'none') {
                    loadOrdersDisplay();
                }
            }, 2000); // 2 second demo delay

            this.saveToStorage();
            return order;
        }
        return null;
    },

    // Cancel order and restore stock
    cancelOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order && order.status !== 'completed' && order.status !== 'ready_pickup') {
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

    // Get item by ID from all categories
    getItemById(itemId) {
        const allItems = [...merchandiseData.lanyards, ...merchandiseData.tshirts];
        return allItems.find(item => item.id === itemId);
    },

    // Demo email receipt sending
    sendEmailReceipt(order) {
        console.log('📧 Demo: Sending email receipt to:', order.customerEmail);
        
        // Show demo notification
        showNotification(`📧 Receipt sent to ${order.customerEmail}`, 'success');
        
        // In real implementation, this would call a backend API to send actual email
        // For demo, we just log the email content
        const emailContent = this.generateEmailReceiptContent(order);
        console.log('Email Content:', emailContent);
    },

    // Generate email receipt content
    generateEmailReceiptContent(order) {
        const item = this.getItemById(order.itemId);
        return `
        Subject: PSSE Merchandise Order Receipt - ${order.id}
        
        Dear ${order.customerName},
        
        Thank you for your order! Here are your order details:
        
        Order ID: ${order.id}
        Item: ${item ? item.name : 'Unknown Item'}
        Quantity: ${order.quantity}
        Total Amount: ₱${order.totalAmount}
        Payment Method: ${order.paymentMethod}
        ${order.paymentReference ? `Payment Reference: ${order.paymentReference}` : ''}
        
        Order Date: ${new Date(order.createdAt).toLocaleDateString()}
        Status: Ready for Pickup
        
        Please present this receipt when collecting your merchandise.
        
        Best regards,
        PSSE Team
        `;
    },

    // Get status display text
    getStatusDisplayText(status) {
        const statusMap = {
            'pending_review': 'Order is being reviewed',
            'awaiting_payment': 'Awaiting Payment',
            'ready_pickup': 'Pickup/Distribution',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    },

    // Get payment status display text
    getPaymentStatusDisplayText(paymentStatus) {
        const statusMap = {
            'pending': 'Payment Pending',
            'processing': 'Processing Payment...',
            'completed': 'Payment Completed',
            'failed': 'Payment Failed'
        };
        return statusMap[paymentStatus] || paymentStatus;
    }
};

// Initialize enhanced merchandise system
function initMerchandise() {
    console.log('Initializing enhanced merchandise system...');
    
    // Check if we're on the merchandise page
    const allMerchGrid = document.getElementById('allMerchGrid');
    const lanyardGrid = document.getElementById('lanyardGrid');
    const tshirtGrid = document.getElementById('tshirtGrid');

    if (!allMerchGrid && !lanyardGrid && !tshirtGrid) {
        console.log('Not on merchandise page, skipping merchandise initialization');
        return;
    }

    // Load merchandise grids
    loadMerchandiseGrid();
    
    // Initialize tabs
    initMerchandiseTabs();
    
    // Initialize enhanced modal handlers
    initEnhancedModalHandlers();
    
    // Initialize order tracking
    initOrderTracking();
    
    // Load existing orders display
    loadOrdersDisplay();
    
    console.log('Enhanced merchandise system initialized successfully');
}

// Load merchandise grid with enhanced display
function loadMerchandiseGrid() {
    const allItems = [...merchandiseData.lanyards, ...merchandiseData.tshirts];
    
    // Populate all items tab
    renderMerchandiseGrid('allMerchGrid', allItems);
    
    // Populate category-specific tabs
    renderMerchandiseGrid('lanyardGrid', merchandiseData.lanyards);
    renderMerchandiseGrid('tshirtGrid', merchandiseData.tshirts);
}

// Enhanced merchandise grid rendering with better UI
function renderMerchandiseGrid(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
    }

    if (items.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No items available</p></div>';
        return;
    }

    container.innerHTML = items.map(item => {
        const addedDate = new Date(item.addedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const stockStatus = item.stock > 0 
            ? `<span class="text-success">${item.stock} in stock</span>`
            : `<span class="text-danger">Out of stock</span>`;
        
        const featuredBadge = item.featured 
            ? `<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">Featured</span>`
            : '';

        return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="card h-100 merchandise-card position-relative" data-item-id="${item.id}">
                ${featuredBadge}
                <img src="${item.image}" class="card-img-top merchandise-img" alt="${item.name}" 
                     style="height: 200px; object-fit: cover;" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text flex-grow-1">${item.description}</p>
                    <div class="mb-2">
                        <small class="text-muted">Added: ${addedDate}</small><br>
                        <small>${stockStatus}</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="h5 mb-0 text-primary">₱${item.price}</span>
                        <button class="btn btn-outline-primary btn-sm view-details-btn" 
                                data-item-id="${item.id}" ${item.stock === 0 ? 'disabled' : ''}>
                            ${item.stock === 0 ? 'Out of Stock' : 'View Details'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Add event listeners for view details buttons
    container.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            showItemDetailsModal(itemId);
        });
    });
}

// Show enhanced item details modal
function showItemDetailsModal(itemId) {
    const item = orderSystem.getItemById(itemId);
    if (!item) return;

    const addedDate = new Date(item.addedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create or update the modal content
    let modal = document.getElementById('itemDetailsModal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'itemDetailsModal';
        modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="itemDetailsTitle"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="itemDetailsBody"></div>
                <div class="modal-footer" id="itemDetailsFooter"></div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    // Update modal content
    document.getElementById('itemDetailsTitle').textContent = item.name;
    document.getElementById('itemDetailsBody').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${item.image}" class="img-fluid rounded" alt="${item.name}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="col-md-6">
                <h4 class="text-primary">₱${item.price}</h4>
                <p class="lead">${item.description}</p>
                
                <div class="mb-3">
                    <strong>Stock Available:</strong> 
                    <span class="${item.stock > 0 ? 'text-success' : 'text-danger'}">
                        ${item.stock > 0 ? `${item.stock} items` : 'Out of stock'}
                    </span>
                </div>
                
                <div class="mb-3">
                    <strong>Date Added:</strong> ${addedDate}
                </div>
                
                ${item.specifications ? `
                <div class="mb-3">
                    <strong>Specifications:</strong>
                    <ul class="list-unstyled">
                        ${item.specifications.map(spec => `<li>• ${spec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${item.stock > 0 ? `
                <div class="mb-3">
                    <label for="orderQuantity" class="form-label"><strong>Quantity:</strong></label>
                    <input type="number" class="form-control" id="orderQuantity" 
                           min="1" max="${Math.min(item.stock, 10)}" value="1">
                    <small class="text-muted">Maximum ${Math.min(item.stock, 10)} items per order</small>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    document.getElementById('itemDetailsFooter').innerHTML = item.stock > 0 ? `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" onclick="proceedToOrder('${item.id}')">
            Place Order
        </button>
    ` : `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-outline-secondary" disabled>Out of Stock</button>
    `;

    // Show the modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Proceed to order - collect customer information and email
function proceedToOrder(itemId) {
    const item = orderSystem.getItemById(itemId);
    if (!item) return;

    const quantity = parseInt(document.getElementById('orderQuantity')?.value || 1);
    const totalAmount = item.price * quantity;

    // Hide item details modal
    const itemModal = bootstrap.Modal.getInstance(document.getElementById('itemDetailsModal'));
    if (itemModal) itemModal.hide();

    // Show order confirmation modal
    setTimeout(() => {
        showOrderConfirmationModal(item, quantity, totalAmount);
    }, 300);
}

// Enhanced order confirmation modal with email collection
function showOrderConfirmationModal(item, quantity, totalAmount) {
    let modal = document.getElementById('orderConfirmationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'orderConfirmationModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Your Order</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> Please provide your details to confirm the order
                    </div>
                    <div id="orderConfirmationBody"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="confirmOrder()">Confirm Order</button>
                </div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('orderConfirmationBody').innerHTML = `
        <div class="order-summary mb-4">
            <h6>Order Summary</h6>
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small class="text-muted">Quantity: ${quantity}</small>
                        </div>
                        <div class="text-end">
                            <strong class="text-primary">₱${totalAmount}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <form id="orderForm" novalidate>
            <div class="mb-3">
                <label for="customerName" class="form-label">Full Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="customerName" required>
                <div class="invalid-feedback">Please provide your full name.</div>
            </div>
            
            <div class="mb-3">
                <label for="customerEmail" class="form-label">Email Address <span class="text-danger">*</span></label>
                <input type="email" class="form-control" id="customerEmail" required>
                <div class="invalid-feedback">Please provide a valid email address.</div>
                <small class="text-muted">Receipt will be sent to this email</small>
            </div>
            
            <div class="mb-3">
                <label for="studentId" class="form-label">Student ID (Optional)</label>
                <input type="text" class="form-control" id="studentId">
            </div>
            
            <div class="mb-3">
                <label for="contactNumber" class="form-label">Contact Number <span class="text-danger">*</span></label>
                <input type="tel" class="form-control" id="contactNumber" required>
                <div class="invalid-feedback">Please provide your contact number.</div>
            </div>
        </form>
    `;

    // Store current order data for confirmation
    window.currentOrderData = { item, quantity, totalAmount };

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Confirm order with validation and email collection
function confirmOrder() {
    const form = document.getElementById('orderForm');
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();

    // Reset validation states
    form.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });

    let isValid = true;

    // Validate required fields
    if (!customerName) {
        document.getElementById('customerName').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('customerName').classList.add('is-valid');
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
        document.getElementById('customerEmail').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('customerEmail').classList.add('is-valid');
    }

    if (!contactNumber) {
        document.getElementById('contactNumber').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('contactNumber').classList.add('is-valid');
    }

    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }

    const { item, quantity, totalAmount } = window.currentOrderData;

    // Check stock availability again
    if (item.stock < quantity) {
        showNotification('Sorry, insufficient stock available', 'error');
        return;
    }

    // Reduce stock
    item.stock -= quantity;

    // Create order
    const orderData = {
        itemId: item.id,
        itemName: item.name,
        quantity: quantity,
        unitPrice: item.price,
        totalAmount: totalAmount,
        customerName: customerName,
        customerEmail: customerEmail,
        studentId: studentId,
        contactNumber: contactNumber
    };

    const order = orderSystem.addOrder(orderData);

    // Hide confirmation modal
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('orderConfirmationModal'));
    if (confirmModal) confirmModal.hide();

    // Show success message and proceed to payment
    setTimeout(() => {
        showOrderSuccessModal(order);
        // Refresh merchandise grids to show updated stock
        loadMerchandiseGrid();
    }, 300);
}

// Show order success modal with payment options
function showOrderSuccessModal(order) {
    let modal = document.getElementById('orderSuccessModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'orderSuccessModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-check-circle"></i> Order Placed Successfully!
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="orderSuccessBody"></div>
                <div class="modal-footer" id="orderSuccessFooter"></div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('orderSuccessBody').innerHTML = `
        <div class="text-center mb-4">
            <div class="alert alert-success">
                <strong>Order ID: ${order.id}</strong><br>
                <small>Please keep this ID for reference</small>
            </div>
        </div>
        
        <div class="order-details mb-4">
            <h6>Order Details</h6>
            <ul class="list-unstyled">
                <li><strong>Item:</strong> ${order.itemName}</li>
                <li><strong>Quantity:</strong> ${order.quantity}</li>
                <li><strong>Total Amount:</strong> ₱${order.totalAmount}</li>
                <li><strong>Status:</strong> ${orderSystem.getStatusDisplayText(order.status)}</li>
            </ul>
        </div>
        
        <div class="payment-options">
            <h6>Choose Payment Method</h6>
            <p class="text-muted">Complete your payment to proceed with the order</p>
        </div>
    `;

    document.getElementById('orderSuccessFooter').innerHTML = `
        <button type="button" class="btn btn-outline-primary" onclick="payWithGCash('${order.id}')">
            <i class="fas fa-mobile-alt"></i> Pay with GCash
        </button>
        <button type="button" class="btn btn-outline-secondary" onclick="payInPerson('${order.id}')">
            <i class="fas fa-user"></i> Pay to Treasurer
        </button>
        <button type="button" class="btn btn-primary" onclick="viewOrderTracking('${order.id}')">
            <i class="fas fa-eye"></i> Track Order
        </button>
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Demo GCash payment process
function payWithGCash(orderId) {
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order) return;

    // Hide success modal
    const successModal = bootstrap.Modal.getInstance(document.getElementById('orderSuccessModal'));
    if (successModal) successModal.hide();

    // Show GCash payment modal
    setTimeout(() => {
        showGCashPaymentModal(order);
    }, 300);
}

// Show demo GCash payment modal
function showGCashPaymentModal(order) {
    let modal = document.getElementById('gcashPaymentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'gcashPaymentModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-mobile-alt"></i> GCash Payment
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="gcashPaymentBody"></div>
                <div class="modal-footer" id="gcashPaymentFooter"></div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    // Generate demo GCash reference number
    const gcashReference = 'GC' + Math.random().toString(36).substr(2, 8).toUpperCase();

    document.getElementById('gcashPaymentBody').innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> <strong>Demo Payment</strong> - This is a demonstration
        </div>
        
        <div class="payment-details mb-4">
            <h6>Payment Details</h6>
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <strong>Order ID:</strong><br>
                            <small>${order.id}</small>
                        </div>
                        <div class="col-6 text-end">
                            <strong>Amount:</strong><br>
                            <h5 class="text-primary mb-0">₱${order.totalAmount}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="gcash-instructions mb-4">
            <h6>GCash Payment Instructions</h6>
            <ol>
                <li>Open your GCash app</li>
                <li>Select "Pay Bills" or "Send Money"</li>
                <li>Enter the merchant details provided</li>
                <li>Enter amount: <strong>₱${order.totalAmount}</strong></li>
                <li>Enter reference: <strong>${gcashReference}</strong></li>
                <li>Complete the transaction</li>
            </ol>
        </div>
        
        <div class="demo-payment mb-3">
            <h6>Demo Payment Simulation</h6>
            <p class="text-muted">Click the button below to simulate a successful GCash payment</p>
        </div>
    `;

    document.getElementById('gcashPaymentFooter').innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-success" onclick="processGCashPayment('${order.id}', '${gcashReference}')">
            <i class="fas fa-credit-card"></i> Simulate Payment
        </button>
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Process demo GCash payment
function processGCashPayment(orderId, gcashReference) {
    // Update order status to awaiting payment first
    orderSystem.updateOrderStatus(orderId, 'awaiting_payment');
    
    // Show processing message
    showNotification('Processing GCash payment...', 'info');
    
    // Simulate payment processing
    setTimeout(() => {
        const order = orderSystem.processPayment(orderId, 'GCash', gcashReference);
        if (order) {
            // Hide GCash modal
            const gcashModal = bootstrap.Modal.getInstance(document.getElementById('gcashPaymentModal'));
            if (gcashModal) gcashModal.hide();
            
            showNotification('Payment successful! Order is ready for pickup.', 'success');
            
            // Refresh orders display if visible
            setTimeout(() => {
                const trackingSection = document.getElementById('orderTrackingSection');
                if (trackingSection && trackingSection.style.display !== 'none') {
                    loadOrdersDisplay();
                }
            }, 1000);
        }
    }, 2000);
}

// Pay in person option
function payInPerson(orderId) {
    const order = orderSystem.updateOrderStatus(orderId, 'awaiting_payment');
    if (order) {
        // Hide success modal
        const successModal = bootstrap.Modal.getInstance(document.getElementById('orderSuccessModal'));
        if (successModal) successModal.hide();
        
        showNotification('Order updated. Please pay to the assigned treasurer.', 'info');
        
        // Show in-person payment instructions
        setTimeout(() => {
            showInPersonPaymentModal(order);
        }, 300);
    }
}

// Show in-person payment modal
function showInPersonPaymentModal(order) {
    let modal = document.getElementById('inPersonPaymentModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'inPersonPaymentModal';
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-info text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-user"></i> In-Person Payment
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="inPersonPaymentBody"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it</button>
                </div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('inPersonPaymentBody').innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle"></i> Your order is now awaiting payment
        </div>
        
        <div class="payment-details mb-4">
            <h6>Payment Instructions</h6>
            <div class="card">
                <div class="card-body">
                    <ul class="list-unstyled mb-0">
                        <li><strong>Order ID:</strong> ${order.id}</li>
                        <li><strong>Amount to Pay:</strong> ₱${order.totalAmount}</li>
                        <li><strong>Payment Method:</strong> In-Person</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="instructions">
            <h6>Next Steps:</h6>
            <ol>
                <li>Contact the PSSE treasurer during office hours</li>
                <li>Present your Order ID: <strong>${order.id}</strong></li>
                <li>Make payment of <strong>₱${order.totalAmount}</strong></li>
                <li>Your order status will be updated to "Ready for Pickup"</li>
                <li>You'll receive an email receipt once payment is confirmed</li>
            </ol>
        </div>
        
        <div class="contact-info mt-4">
            <h6>Contact Information</h6>
            <p class="text-muted">
                <i class="fas fa-envelope"></i> psse.treasurer@email.com<br>
                <i class="fas fa-phone"></i> Contact through official PSSE channels
            </p>
        </div>
    `;

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Initialize merchandise tabs
function initMerchandiseTabs() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(e) {
            console.log('Tab switched:', e.target.getAttribute('data-bs-target'));
        });
    });
}

// Initialize enhanced modal handlers
function initEnhancedModalHandlers() {
    // Any additional modal setup can go here
    console.log('Enhanced modal handlers initialized');
}

// Initialize order tracking functionality
function initOrderTracking() {
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleOrdersSection();
        });
    }
}

// Toggle orders section visibility
function toggleOrdersSection() {
    const trackingSection = document.getElementById('orderTrackingSection');
    if (trackingSection) {
        if (trackingSection.style.display === 'none' || !trackingSection.style.display) {
            trackingSection.style.display = 'block';
            loadOrdersDisplay();
            // Scroll to section
            trackingSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            trackingSection.style.display = 'none';
        }
    }
}

// View specific order tracking
function viewOrderTracking(orderId) {
    // Hide success modal
    const successModal = bootstrap.Modal.getInstance(document.getElementById('orderSuccessModal'));
    if (successModal) successModal.hide();
    
    // Show orders section
    const trackingSection = document.getElementById('orderTrackingSection');
    if (trackingSection) {
        trackingSection.style.display = 'block';
        loadOrdersDisplay();
        // Scroll to section
        setTimeout(() => {
            trackingSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
}

// Enhanced orders display loading
function loadOrdersDisplay() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    const orders = orderSystem.orders;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
            <p class="text-muted">No orders found. Start shopping to see your orders here!</p>
        </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => {
        const createdDate = new Date(order.createdAt).toLocaleDateString();
        const item = orderSystem.getItemById(order.itemId);
        const canCancel = order.status !== 'completed' && order.status !== 'ready_pickup' && order.status !== 'cancelled';
        
        let statusBadge = '';
        switch(order.status) {
            case 'pending_review':
                statusBadge = '<span class="badge bg-warning text-dark">Order is being reviewed</span>';
                break;
            case 'awaiting_payment':
                statusBadge = '<span class="badge bg-info">Awaiting Payment</span>';
                break;
            case 'ready_pickup':
                statusBadge = '<span class="badge bg-success">Pickup/Distribution</span>';
                break;
            case 'completed':
                statusBadge = '<span class="badge bg-primary">Completed</span>';
                break;
            case 'cancelled':
                statusBadge = '<span class="badge bg-secondary">Cancelled</span>';
                break;
            default:
                statusBadge = `<span class="badge bg-light text-dark">${order.status}</span>`;
        }

        let paymentInfo = '';
        if (order.paymentMethod) {
            paymentInfo = `
            <div class="mt-2">
                <small class="text-muted">
                    <strong>Payment:</strong> ${order.paymentMethod}
                    ${order.paymentReference ? ` (Ref: ${order.paymentReference})` : ''}
                    - ${orderSystem.getPaymentStatusDisplayText(order.paymentStatus)}
                </small>
            </div>
            `;
        }

        return `
        <div class="card mb-3 order-card" data-order-id="${order.id}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <strong>Order ${order.id}</strong>
                    <small class="text-muted ms-2">${createdDate}</small>
                </div>
                <div>
                    ${statusBadge}
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6 class="card-title">${order.itemName}</h6>
                        ${order.customerName ? `<p class="mb-1"><strong>Customer:</strong> ${order.customerName}</p>` : ''}
                        ${order.studentId ? `<p class="mb-1"><strong>Student ID:</strong> ${order.studentId}</p>` : ''}
                        <p class="mb-1"><strong>Contact:</strong> ${order.contactNumber}</p>
                        <p class="mb-1"><strong>Email:</strong> ${order.customerEmail}</p>
                        <p class="mb-1"><strong>Quantity:</strong> ${order.quantity}</p>
                        <p class="mb-0"><strong>Total:</strong> ₱${order.totalAmount}</p>
                        ${paymentInfo}
                    </div>
                    <div class="col-md-4 text-end">
                        ${order.status === 'awaiting_payment' ? `
                        <div class="btn-group-vertical d-grid gap-2">
                            <button class="btn btn-primary btn-sm" onclick="payWithGCash('${order.id}')">
                                <i class="fas fa-mobile-alt"></i> Pay with GCash
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="payInPerson('${order.id}')">
                                <i class="fas fa-user"></i> Pay in Person
                            </button>
                        </div>
                        ` : ''}
                        ${canCancel ? `
                        <button class="btn btn-outline-danger btn-sm mt-2" onclick="cancelOrder('${order.id}')">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Cancel order function
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
        const order = orderSystem.cancelOrder(orderId);
        if (order) {
            showNotification('Order cancelled successfully. Stock has been restored.', 'info');
            loadOrdersDisplay();
            loadMerchandiseGrid(); // Refresh to show updated stock
        } else {
            showNotification('Unable to cancel order. Please contact support.', 'error');
        }
    }
}

// Utility Functions

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} custom-notification position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border: none;
    `;
    
    let icon = '';
    switch(type) {
        case 'success': icon = 'fas fa-check-circle'; break;
        case 'error': icon = 'fas fa-exclamation-circle'; break;
        case 'warning': icon = 'fas fa-exclamation-triangle'; break;
        default: icon = 'fas fa-info-circle'; break;
    }
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${icon} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

    // Add to document
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export for global access
window.orderSystem = orderSystem;
window.merchandiseData = merchandiseData;

console.log('Enhanced PSSE Merchandise System loaded successfully');
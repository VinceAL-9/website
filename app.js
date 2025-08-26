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
    
    // Initialize View Orders button - THIS IS THE KEY FIX
    initViewOrdersButton();
    
    console.log('Enhanced merchandise system initialized successfully');
}

// FIXED: Initialize View Orders button - This was missing!
function initViewOrdersButton() {
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('View Orders button clicked');
            
            // Load orders and display in modal
            loadOrdersDisplay();
            
            // Open the orders modal using Bootstrap API
            const ordersModal = document.getElementById('ordersModal');
            if (ordersModal) {
                const modal = new bootstrap.Modal(ordersModal);
                modal.show();
            } else {
                console.error('Orders modal not found in DOM');
            }
        });
        console.log('View Orders button initialized successfully');
    } else {
        console.warn('View Orders button not found');
    }
}

// FIXED: Load and display orders in the modal
function loadOrdersDisplay() {
    console.log('Loading orders display...');
    
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) {
        console.error('Orders list container not found');
        return;
    }
    
    const orders = orderSystem.orders;
    console.log('Found orders:', orders.length);
    
    if (orders.length === 0) {
        // Show "No orders yet" message
        ordersList.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-3">
                    <i class="fas fa-shopping-bag fa-3x text-muted"></i>
                </div>
                <h5 class="text-muted mb-2">No orders yet</h5>
                <p class="text-muted">Start shopping to see your orders here!</p>
            </div>
        `;
        return;
    }
    
    // Generate orders HTML
    let ordersHTML = '';
    orders.forEach(order => {
        const item = orderSystem.getItemById(order.itemId);
        const statusText = orderSystem.getStatusDisplayText(order.status);
        const paymentStatusText = orderSystem.getPaymentStatusDisplayText(order.paymentStatus);
        
        // Status badge color
        let statusBadgeClass = 'bg-secondary';
        switch (order.status) {
            case 'pending_review':
                statusBadgeClass = 'bg-warning';
                break;
            case 'awaiting_payment':
                statusBadgeClass = 'bg-info';
                break;
            case 'ready_pickup':
                statusBadgeClass = 'bg-success';
                break;
            case 'completed':
                statusBadgeClass = 'bg-primary';
                break;
            case 'cancelled':
                statusBadgeClass = 'bg-danger';
                break;
        }
        
        // Payment status badge
        let paymentBadgeClass = 'bg-secondary';
        switch (order.paymentStatus) {
            case 'pending':
                paymentBadgeClass = 'bg-warning';
                break;
            case 'processing':
                paymentBadgeClass = 'bg-info';
                break;
            case 'completed':
                paymentBadgeClass = 'bg-success';
                break;
            case 'failed':
                paymentBadgeClass = 'bg-danger';
                break;
        }
        
        const paymentInfo = order.paymentMethod ? `
            <div class="row mb-2">
                <div class="col-4"><strong>Payment:</strong></div>
                <div class="col-8">
                    <span class="badge ${paymentBadgeClass} me-2">${paymentStatusText}</span>
                    <small class="text-muted">${order.paymentMethod}</small>
                    ${order.paymentReference ? `<br><small class="text-muted">Ref: ${order.paymentReference}</small>` : ''}
                </div>
            </div>
        ` : '';
        
        ordersHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h6 class="card-title mb-1">${item ? item.name : 'Unknown Item'}</h6>
                            <small class="text-muted">Order ID: ${order.id}</small>
                        </div>
                        <span class="badge ${statusBadgeClass}">${statusText}</span>
                    </div>
                    
                    <div class="row small">
                        ${order.customerName ? `
                            <div class="row mb-2">
                                <div class="col-4"><strong>Customer:</strong></div>
                                <div class="col-8">${order.customerName}</div>
                            </div>
                        ` : ''}
                        
                        ${order.studentId ? `
                            <div class="row mb-2">
                                <div class="col-4"><strong>Student ID:</strong></div>
                                <div class="col-8">${order.studentId}</div>
                            </div>
                        ` : ''}
                        
                        ${order.contactNumber ? `
                            <div class="row mb-2">
                                <div class="col-4"><strong>Contact:</strong></div>
                                <div class="col-8">${order.contactNumber}</div>
                            </div>
                        ` : ''}
                        
                        ${order.customerEmail ? `
                            <div class="row mb-2">
                                <div class="col-4"><strong>Email:</strong></div>
                                <div class="col-8">${order.customerEmail}</div>
                            </div>
                        ` : ''}
                        
                        <div class="row mb-2">
                            <div class="col-4"><strong>Quantity:</strong></div>
                            <div class="col-8">${order.quantity}</div>
                        </div>
                        
                        ${paymentInfo}
                        
                        <div class="row mb-2">
                            <div class="col-4"><strong>Total:</strong></div>
                            <div class="col-8"><strong>₱${order.totalAmount}</strong></div>
                        </div>
                        
                        <div class="row">
                            <div class="col-4"><strong>Order Date:</strong></div>
                            <div class="col-8">${new Date(order.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                    
                    ${order.status === 'pending_review' || order.status === 'awaiting_payment' ? `
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelOrder('${order.id}')">
                                Cancel Order
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    ordersList.innerHTML = ordersHTML;
    console.log('Orders display loaded successfully');
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
    
    let html = '';
    items.forEach(item => {
        const isOutOfStock = item.stock === 0;
        const stockBadge = isOutOfStock ? 
            '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>' :
            item.stock <= 5 ? 
                `<span class="badge bg-warning position-absolute top-0 end-0 m-2">Only ${item.stock} left</span>` :
                '';
        
        const featuredBadge = item.featured ? 
            '<span class="badge bg-primary position-absolute top-0 start-0 m-2">Featured</span>' : '';
        
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 merchandise-card ${isOutOfStock ? 'out-of-stock' : ''}" data-item-id="${item.id}">
                    <div class="position-relative">
                        <img src="${item.image}" class="card-img-top merchandise-img" alt="${item.name}" style="height: 250px; object-fit: cover;">
                        ${stockBadge}
                        ${featuredBadge}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title">${item.name}</h6>
                        <p class="card-text text-muted small flex-grow-1">${item.description}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="h6 mb-0 text-primary">₱${item.price}</span>
                                <small class="text-muted">Stock: ${item.stock}</small>
                            </div>
                            <button class="btn btn-primary btn-sm w-100 order-btn" 
                                    data-item-id="${item.id}" 
                                    ${isOutOfStock ? 'disabled' : ''}>
                                ${isOutOfStock ? 'Out of Stock' : 'Order Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // FIXED: Add event listeners to all Order Now buttons after they are created
    container.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            
            if (!itemId) {
                console.error('No item ID found on button');
                return;
            }
            
            const item = orderSystem.getItemById(itemId);
            if (!item) {
                showNotification('Item not found', 'error');
                return;
            }
            
            if (item.stock === 0) {
                showNotification('This item is out of stock', 'warning');
                return;
            }
            
            // Call the existing order modal function
            openOrderModal(itemId);
        });
    });
    
    console.log(`Rendered ${items.length} items in ${containerId} with event listeners attached`);
}

// Initialize merchandise tabs
function initMerchandiseTabs() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(e) {
            // Re-initialize animations for newly visible items
            const targetPane = document.querySelector(e.target.getAttribute('data-bs-target'));
            if (targetPane) {
                const cards = targetPane.querySelectorAll('.card');
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 50);
                });
            }
        });
    });
}

// Initialize enhanced modal handlers for order processing
function initEnhancedModalHandlers() {
    // Handle order button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('order-btn')) {
            const itemId = e.target.getAttribute('data-item-id');
            openOrderModal(itemId);
        }
    });
    
    // Handle order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
}

// Global variable to store the order modal instance
let orderModalInstance = null;

// Open order modal with item details
function openOrderModal(itemId) {
    const item = getItemById(itemId);
    if (!item) {
        console.error('Item not found:', itemId);
        return;
    }
    
    // Update modal content
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.querySelector('#orderItemName').textContent = item.name;
        modal.querySelector('#orderItemPrice').textContent = `₱${item.price}`;
        modal.querySelector('#orderItemImage').src = item.image;
        modal.querySelector('#orderItemDescription').textContent = item.description;
        modal.querySelector('#itemId').value = itemId;
        
        // Reset form
        document.getElementById('orderForm').reset();
        document.getElementById('itemId').value = itemId;
        updateOrderTotal();
        
        // Create or reuse modal instance
        if (!orderModalInstance) {
            orderModalInstance = new bootstrap.Modal(modal);
        }
        
        // Show modal
        orderModalInstance.show();
    }
}

// Get item by ID from all categories
function getItemById(itemId) {
    const allItems = [...merchandiseData.lanyards, ...merchandiseData.tshirts];
    return allItems.find(item => item.id === itemId);
}

// Handle order form submission
function handleOrderSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const orderData = {
        itemId: formData.get('itemId'),
        quantity: parseInt(formData.get('quantity')),
        customerName: formData.get('customerName'),
        studentId: formData.get('studentId'),
        contactNumber: formData.get('contactNumber'),
        customerEmail: formData.get('customerEmail'),
        totalAmount: parseFloat(formData.get('totalAmount'))
    };
    
    // Validate form data
    if (!validateOrderData(orderData)) {
        return;
    }
    
    // Check stock availability
    const item = getItemById(orderData.itemId);
    if (!item || item.stock < orderData.quantity) {
        showNotification('Insufficient stock available', 'error');
        return;
    }
    
    // Reduce stock
    item.stock -= orderData.quantity;
    
    // Add order to system
    const order = orderSystem.addOrder(orderData);
    
    // Show success message
    showNotification(`Order ${order.id} placed successfully!`, 'success');
    
    // Close modal
    if (orderModalInstance) {
        orderModalInstance.hide();
    }
    
    // Refresh merchandise display
    loadMerchandiseGrid();
    
    console.log('Order placed:', order);
}

// Validate order data
function validateOrderData(data) {
    const requiredFields = ['customerName', 'studentId', 'contactNumber', 'customerEmail'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return false;
        }
    }
    
    if (data.quantity <= 0) {
        showNotification('Quantity must be greater than 0', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    return true;
}

// Update order total when quantity changes
function updateOrderTotal() {
    const quantityInput = document.querySelector('#orderModal input[name="quantity"]');
    const itemIdInput = document.querySelector('#orderModal input[name="itemId"]');
    const totalAmountInput = document.querySelector('#orderModal input[name="totalAmount"]');
    const totalDisplay = document.querySelector('#orderTotal');
    
    if (quantityInput && itemIdInput && totalAmountInput && totalDisplay) {
        const quantity = parseInt(quantityInput.value) || 1;
        const item = getItemById(itemIdInput.value);
        
        if (item) {
            const total = item.price * quantity;
            totalAmountInput.value = total;
            totalDisplay.textContent = `₱${total}`;
        }
    }
}

// Initialize order tracking
function initOrderTracking() {
    // Add quantity change listener
    const quantityInput = document.querySelector('#orderModal input[name="quantity"]');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateOrderTotal);
        quantityInput.addEventListener('change', updateOrderTotal);
    }
}

// Cancel order function
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const cancelledOrder = orderSystem.cancelOrder(orderId);
        if (cancelledOrder) {
            showNotification(`Order ${orderId} cancelled successfully`, 'success');
            loadOrdersDisplay(); // Refresh the orders display
            loadMerchandiseGrid(); // Refresh merchandise to show updated stock
        } else {
            showNotification('Unable to cancel order', 'error');
        }
    }
}

// Show notification (utility function)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}


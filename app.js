// PSSE Website JavaScript - Enhanced with Merchandise Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    console.log('PSSE Website initializing...');
    initNavigation();
    initAnimations();
    initInteractiveElements();
    initImageHandling();
    initMerchandise(); // NEW: Initialize merchandise system
});

// ========================================================================
// CORE NAVIGATION AND EXISTING FUNCTIONALITY (Optimized)
// ========================================================================

// Navigation functionality (Enhanced)
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.page-section');
    
    console.log('Initializing navigation with', navLinks.length, 'links and', sections.length, 'sections');
    
    // Use event delegation for better performance
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-link[data-section]');
        if (!navLink) return;
        
        e.preventDefault();
        const targetSection = navLink.getAttribute('data-section');
        navigateToSection(targetSection, navLinks, sections);
    });
    
    // Ensure home section is visible by default
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.display = 'block';
    }
}

// Optimized navigation function
function navigateToSection(targetSection, navLinks, sections) {
    console.log('Navigating to section:', targetSection);
    
    // Batch DOM operations for better performance
    requestAnimationFrame(() => {
        // Update navigation states
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        const activeNavLink = document.querySelector(`[data-section="${targetSection}"]`);
        if (activeNavLink) activeNavLink.classList.add('active');
        
        // Update section visibility
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const targetSectionElement = document.getElementById(targetSection);
        if (targetSectionElement) {
            targetSectionElement.classList.add('active');
            targetSectionElement.style.display = 'block';
            
            // Smooth scroll to top
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
        
        updatePageTitle(targetSection);
        closeNavbarIfOpen();
    });
}

// Helper function to close navbar on mobile
function closeNavbarIfOpen() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse?.classList.contains('show')) {
        const navbarToggler = document.querySelector('.navbar-toggler');
        navbarToggler?.click();
    }
}

// Update page title based on active section (Enhanced)
function updatePageTitle(section) {
    const titles = {
        'home': 'Philippine Society of Software Engineers',
        'about': 'About - Philippine Society of Software Engineers',
        'events': 'Events - Philippine Society of Software Engineers',
        'merchandise': 'Merchandise - Philippine Society of Software Engineers'
    };
    document.title = titles[section] || 'Philippine Society of Software Engineers';
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
        container.innerHTML = '<div class="col-12 empty-state"><i class="fas fa-box-open"></i><p>No items available</p></div>';
        return;
    }
    
    container.innerHTML = items.map(item => createMerchandiseCard(item)).join('');
    
    // Add event listeners for cards
    container.querySelectorAll('.merch-card').forEach(card => {
        const itemId = card.dataset.itemId;
        
        // View details button
        card.querySelector('.btn-view-details')?.addEventListener('click', () => showItemDetails(itemId));
        
        // Order button
        card.querySelector('.btn-order')?.addEventListener('click', () => showOrderModal(itemId));
    });
}

// Create merchandise card HTML
function createMerchandiseCard(item) {
    const stockClass = item.stock === 0 ? 'out-of-stock' : (item.stock <= 5 ? 'low-stock' : 'in-stock');
    const stockText = item.stock === 0 ? 'Out of Stock' : (item.stock <= 5 ? `Only ${item.stock} left` : 'In Stock');
    
    return `
        <div class="col-md-6 col-lg-3">
            <div class="card merch-card h-100" data-item-id="${item.id}">
                <div class="position-relative">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}" 
                         onerror="this.src='images/placeholder-merch.jpg'">
                    <div class="stock-indicator">
                        <span class="stock-badge ${stockClass}">${stockText}</span>
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <div class="merch-price">₱${item.price}</div>
                    <div class="merch-meta">
                        <small class="text-muted">Added: ${formatDate(item.addedDate)}</small>
                    </div>
                    <div class="merch-actions mt-auto">
                        <button class="btn btn-outline-primary btn-merch btn-view-details" ${item.stock === 0 ? '' : ''}>
                            <i class="fas fa-eye me-1"></i>Details
                        </button>
                        <button class="btn btn-primary btn-merch btn-order" ${item.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart me-1"></i>Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize merchandise tabs
function initMerchandiseTabs() {
    const tabButtons = document.querySelectorAll('#merchTabs .nav-link');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            console.log('Switching to tab:', target);
        });
    });
}

// Show item details modal
function showItemDetails(itemId) {
    const item = orderSystem.getItemById(itemId);
    if (!item) return;
    
    const modal = document.getElementById('merchDetailModal');
    const titleElement = document.getElementById('merchDetailTitle');
    const imageElement = document.getElementById('merchDetailImage');
    const contentElement = document.getElementById('merchDetailContent');
    
    // Update modal content
    titleElement.textContent = item.name;
    imageElement.src = item.image;
    imageElement.alt = item.name;
    
    const stockStatus = item.stock === 0 ? 'Out of Stock' : (item.stock <= 5 ? `Only ${item.stock} left!` : `${item.stock} available`);
    const stockClass = item.stock === 0 ? 'text-danger' : (item.stock <= 5 ? 'text-warning' : 'text-success');
    
    contentElement.innerHTML = `
        <div class="mb-3">
            <h6>Description</h6>
            <p class="text-muted">${item.description}</p>
        </div>
        <div class="mb-3">
            <h6>Price</h6>
            <div class="fs-4 text-primary fw-bold">₱${item.price}</div>
        </div>
        <div class="mb-3">
            <h6>Availability</h6>
            <span class="${stockClass} fw-medium">${stockStatus}</span>
        </div>
        <div class="mb-3">
            <h6>Added to Store</h6>
            <small class="text-muted">${formatDate(item.addedDate)}</small>
        </div>
        ${item.stock > 0 ? `
            <div class="mt-4">
                <button class="btn btn-primary w-100" onclick="showOrderModal('${item.id}'); hideCurrentModal();">
                    <i class="fas fa-shopping-cart me-2"></i>Place Order
                </button>
            </div>
        ` : ''}
    `;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Show order modal
function showOrderModal(itemId) {
    const item = orderSystem.getItemById(itemId);
    if (!item || item.stock === 0) return;
    
    const modal = document.getElementById('orderModal');
    const form = document.getElementById('orderForm');
    
    // Reset form
    form.reset();
    document.getElementById('orderItemId').value = itemId;
    
    // Update item summary
    const summaryElement = document.getElementById('orderItemSummary');
    summaryElement.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${item.name}" class="me-3" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div>
                <h6 class="mb-1">${item.name}</h6>
                <div class="text-primary fw-bold">₱${item.price}</div>
                <small class="text-muted">Stock: ${item.stock} available</small>
            </div>
        </div>
    `;
    
    // Update quantity options based on stock
    const quantitySelect = document.getElementById('orderQuantity');
    quantitySelect.innerHTML = '';
    for (let i = 1; i <= Math.min(5, item.stock); i++) {
        quantitySelect.innerHTML += `<option value="${i}">${i}</option>`;
    }
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Confirm order
function confirmOrder() {
    const form = document.getElementById('orderForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const itemId = document.getElementById('orderItemId').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const email = document.getElementById('orderEmail').value;
    const paymentMethod = document.getElementById('orderPaymentMethod').value;
    
    const item = orderSystem.getItemById(itemId);
    if (!item || item.stock < quantity) {
        showAlert('error', 'Sorry, insufficient stock available.');
        return;
    }
    
    // Create order
    const orderData = {
        itemId: itemId,
        itemName: item.name,
        itemPrice: item.price,
        itemImage: item.image,
        quantity: quantity,
        totalAmount: item.price * quantity,
        customerEmail: email,
        paymentMethod: paymentMethod,
        status: 'reviewing' // Order is being reviewed
    };
    
    // Reduce stock
    item.stock -= quantity;
    
    // Add to order system
    const order = orderSystem.addOrder(orderData);
    
    // Close order modal
    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    orderModal.hide();
    
    // Show success message
    showAlert('success', `Order ${order.id} placed successfully! You'll receive updates at ${email}.`);
    
    // Refresh displays
    loadMerchandiseGrid();
    loadOrdersDisplay();
    
    // Simulate order processing
    setTimeout(() => {
        orderSystem.updateOrderStatus(order.id, 'awaiting-payment');
        loadOrdersDisplay();
        showPaymentModal(order.id);
    }, 2000);
}

// Show payment modal
function showPaymentModal(orderId) {
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'awaiting-payment') return;
    
    const modal = document.getElementById('paymentModal');
    const contentElement = document.getElementById('paymentContent');
    
    let paymentContent = '';
    
    if (order.paymentMethod === 'gcash') {
        paymentContent = `
            <div class="gcash-info">
                <h6 class="text-white mb-3"><i class="fas fa-mobile-alt me-2"></i>GCash Payment</h6>
                <p class="mb-2">Send payment to:</p>
                <div class="fw-bold fs-5">+63 912 345 6789</div>
                <div class="small">PSSE Treasurer</div>
            </div>
            <div class="gcash-qr">
                <div class="mb-2">Or scan QR code:</div>
                <div class="bg-light p-3 rounded d-inline-block">
                    <i class="fas fa-qrcode fa-4x text-muted"></i>
                </div>
            </div>
            <div class="order-summary">
                <div class="summary-row">
                    <span>Order ID:</span>
                    <span class="fw-bold">${order.id}</span>
                </div>
                <div class="summary-row">
                    <span>Amount:</span>
                    <span class="fw-bold text-primary">₱${order.totalAmount}</span>
                </div>
            </div>
            <div class="alert alert-info">
                <small><i class="fas fa-info-circle me-1"></i>
                Please send a screenshot of your payment to our Facebook page or email the treasurer.
                </small>
            </div>
        `;
    } else {
        paymentContent = `
            <div class="treasurer-info">
                <h6 class="text-white mb-3"><i class="fas fa-user-tie me-2"></i>Pay to Treasurer</h6>
                <p>Visit our office or find our treasurer during these times:</p>
            </div>
            <div class="bg-light p-3 rounded mb-3">
                <div class="row">
                    <div class="col-6">
                        <strong>Office Hours:</strong><br>
                        Monday - Friday<br>
                        8:00 AM - 5:00 PM
                    </div>
                    <div class="col-6">
                        <strong>Location:</strong><br>
                        PSSE Office<br>
                        CPU Campus
                    </div>
                </div>
            </div>
            <div class="order-summary">
                <div class="summary-row">
                    <span>Order ID:</span>
                    <span class="fw-bold">${order.id}</span>
                </div>
                <div class="summary-row">
                    <span>Amount to Pay:</span>
                    <span class="fw-bold text-primary">₱${order.totalAmount}</span>
                </div>
            </div>
            <div class="alert alert-warning">
                <small><i class="fas fa-exclamation-triangle me-1"></i>
                Please bring your order ID when making payment.
                </small>
            </div>
        `;
    }
    
    contentElement.innerHTML = paymentContent;
    
    // Update confirm button
    const confirmBtn = document.getElementById('paymentConfirmBtn');
    confirmBtn.textContent = order.paymentMethod === 'gcash' ? 'I\'ve Sent Payment' : 'I\'ll Pay Later';
    confirmBtn.onclick = () => confirmPayment(orderId);
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Confirm payment
function confirmPayment(orderId) {
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Update order status
    orderSystem.updateOrderStatus(orderId, 'pickup');
    
    // Close modal
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();
    
    // Show success message
    showAlert('success', 'Payment confirmed! Your order is ready for pickup/distribution.');
    
    // Refresh orders display
    loadOrdersDisplay();
    
    // Simulate completion after pickup
    setTimeout(() => {
        orderSystem.updateOrderStatus(orderId, 'completed');
        loadOrdersDisplay();
        sendReceipt(orderId);
    }, 5000);
}

// Load and display orders
function loadOrdersDisplay() {
    const container = document.getElementById('ordersContainer');
    const orders = orderSystem.orders;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>No orders found. Start shopping to see your orders here!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
    
    // Add event listeners
    container.querySelectorAll('[data-order-id]').forEach(element => {
        const orderId = element.dataset.orderId;
        const action = element.dataset.action;
        
        element.addEventListener('click', () => {
            switch(action) {
                case 'cancel':
                    showCancelOrderModal(orderId);
                    break;
                case 'pay':
                    showPaymentModal(orderId);
                    break;
                case 'track':
                    showOrderTracking(orderId);
                    break;
            }
        });
    });
}

// Create order card HTML
function createOrderCard(order) {
    const statusInfo = getOrderStatusInfo(order.status);
    const canCancel = ['reviewing', 'awaiting-payment'].includes(order.status);
    const canPay = order.status === 'awaiting-payment';
    
    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order ${order.id}</div>
                    <div class="order-date">${formatDateTime(order.createdAt)}</div>
                </div>
                <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
            </div>
            
            <div class="order-item">
                <img src="${order.itemImage}" alt="${order.itemName}" class="order-item-image">
                <div class="order-item-details">
                    <div class="order-item-name">${order.itemName}</div>
                    <div class="order-item-meta">
                        Quantity: ${order.quantity} × ₱${order.itemPrice} 
                        | Payment: ${order.paymentMethod === 'gcash' ? 'GCash' : 'In-person'}
                    </div>
                </div>
            </div>
            
            <div class="order-footer">
                <div class="order-total">Total: ₱${order.totalAmount}</div>
                <div class="order-actions">
                    ${canPay ? `<button class="btn btn-primary btn-order-action" data-order-id="${order.id}" data-action="pay">Pay Now</button>` : ''}
                    ${canCancel ? `<button class="btn btn-outline-danger btn-order-action" data-order-id="${order.id}" data-action="cancel">Cancel</button>` : ''}
                    <button class="btn btn-outline-primary btn-order-action" data-order-id="${order.id}" data-action="track">Track</button>
                </div>
            </div>
        </div>
    `;
}

// Get order status information
function getOrderStatusInfo(status) {
    const statusMap = {
        'reviewing': { text: 'Order Being Reviewed', class: 'status-reviewing' },
        'awaiting-payment': { text: 'Awaiting Payment', class: 'status-awaiting-payment' },
        'pickup': { text: 'Ready for Pickup', class: 'status-pickup' },
        'completed': { text: 'Completed', class: 'status-completed' },
        'cancelled': { text: 'Cancelled', class: 'status-cancelled' }
    };
    return statusMap[status] || { text: 'Unknown', class: 'status-unknown' };
}

// Show cancel order modal
function showCancelOrderModal(orderId) {
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('cancelOrderModal');
    const summaryElement = document.getElementById('cancelOrderSummary');
    
    summaryElement.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${order.itemImage}" alt="${order.itemName}" class="me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
            <div>
                <div class="fw-medium">${order.itemName}</div>
                <div class="text-muted small">Order ${order.id} | Qty: ${order.quantity} | ₱${order.totalAmount}</div>
            </div>
        </div>
    `;
    
    // Update confirm button
    const confirmBtn = document.getElementById('confirmCancelBtn');
    confirmBtn.onclick = () => cancelOrder(orderId);
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Cancel order
function cancelOrder(orderId) {
    const cancelledOrder = orderSystem.cancelOrder(orderId);
    
    if (cancelledOrder) {
        // Close modal
        const cancelModal = bootstrap.Modal.getInstance(document.getElementById('cancelOrderModal'));
        cancelModal.hide();
        
        // Show success message
        showAlert('success', `Order ${orderId} has been cancelled successfully.`);
        
        // Refresh displays
        loadMerchandiseGrid();
        loadOrdersDisplay();
    } else {
        showAlert('error', 'Unable to cancel order. Please contact support.');
    }
}

// Send receipt (simulation)
function sendReceipt(orderId) {
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Simulate email sending
    console.log('Sending receipt to:', order.customerEmail);
    
    // Show success notification
    showAlert('success', `Receipt sent to ${order.customerEmail}! Thank you for supporting PSSE.`);
    
    // You could integrate with a real email service here
    // For now, we'll create a downloadable receipt
    generateReceiptPDF(order);
}

// Generate receipt PDF (mock)
function generateReceiptPDF(order) {
    const receiptContent = `
        PSSE MERCHANDISE RECEIPT
        ========================
        
        Order ID: ${order.id}
        Date: ${formatDateTime(order.createdAt)}
        
        ITEM DETAILS:
        ${order.itemName}
        Quantity: ${order.quantity}
        Unit Price: ₱${order.itemPrice}
        
        TOTAL: ₱${order.totalAmount}
        Payment Method: ${order.paymentMethod === 'gcash' ? 'GCash' : 'In-person'}
        
        Thank you for supporting PSSE!
        
        Philippine Society of Software Engineers
        Central Philippine University
    `;
    
    // Create downloadable text file (in real implementation, you'd use PDF library)
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PSSE_Receipt_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Toggle orders section visibility
function toggleOrdersSection() {
    const section = document.getElementById('ordersSection');
    const button = event.target;
    
    if (section.classList.contains('d-none')) {
        section.classList.remove('d-none');
        button.innerHTML = '<i class="fas fa-eye-slash me-2"></i>Hide Orders';
        loadOrdersDisplay();
    } else {
        section.classList.add('d-none');
        button.innerHTML = '<i class="fas fa-list me-2"></i>View Orders';
    }
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format date and time helper
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show alert helper
function showAlert(type, message) {
    // Create alert element
    const alertClass = type === 'success' ? 'alert-success-custom' : 'alert-error-custom';
    const iconClass = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    
    const alert = document.createElement('div');
    alert.className = `alert-custom ${alertClass}`;
    alert.innerHTML = `
        <i class="${iconClass} me-2"></i>${message}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
    `;
    
    // Insert at top of merchandise section
    const merchSection = document.getElementById('merchandise');
    const container = merchSection.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Hide current modal helper
function hideCurrentModal() {
    const openModal = document.querySelector('.modal.show');
    if (openModal) {
        const bsModal = bootstrap.Modal.getInstance(openModal);
        bsModal?.hide();
    }
}

// Initialize modal handlers
function initModalHandlers() {
    // Handle modal hidden events to cleanup
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function() {
            // Reset forms when modals are closed
            const form = this.querySelector('form');
            if (form) form.reset();
        });
    });
}

// Show order tracking (mock)
function showOrderTracking(orderId) {
    const order = orderSystem.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const trackingSteps = [
        { status: 'reviewing', text: 'Order Received & Being Reviewed', completed: true },
        { status: 'awaiting-payment', text: 'Awaiting Payment', completed: ['awaiting-payment', 'pickup', 'completed'].includes(order.status) },
        { status: 'pickup', text: 'Ready for Pickup/Distribution', completed: ['pickup', 'completed'].includes(order.status) },
        { status: 'completed', text: 'Order Completed', completed: order.status === 'completed' }
    ];
    
    let trackingHTML = `
        <div class="tracking-header mb-4">
            <h6>Order Tracking: ${order.id}</h6>
            <p class="text-muted mb-0">Current Status: <span class="fw-bold">${getOrderStatusInfo(order.status).text}</span></p>
        </div>
        <div class="tracking-steps">
    `;
    
    trackingSteps.forEach((step, index) => {
        const stepClass = step.completed ? 'completed' : 'pending';
        const iconClass = step.completed ? 'fas fa-check-circle text-success' : 'far fa-circle text-muted';
        
        trackingHTML += `
            <div class="tracking-step ${stepClass} mb-3">
                <div class="d-flex align-items-center">
                    <i class="${iconClass} me-3"></i>
                    <div>
                        <div class="fw-medium">${step.text}</div>
                        ${step.completed ? '<small class="text-success">Completed</small>' : '<small class="text-muted">Pending</small>'}
                    </div>
                </div>
            </div>
        `;
    });
    
    trackingHTML += '</div>';
    
    // Show in a modal (reuse the details modal)
    showModal('Order Tracking', trackingHTML);
}

// ========================================================================
// EXISTING FUNCTIONS (Optimized versions)
// ========================================================================

// Optimized image handling with better error management
function initImageHandling() {
    console.log('Initializing image handling...');
    
    // Use intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, { threshold: 0.1 });
    
    // Enhanced officer image handling
    const officerImages = document.querySelectorAll('.officer-image img');
    officerImages.forEach((img, index) => {
        img.addEventListener('error', function() {
            console.log('Officer image failed to load:', this.src);
            this.src = 'images/placeholder-image.jpg';
            this.alt = 'Officer Photo Placeholder';
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // Observe for lazy loading if needed
        if (img.dataset.src) {
            imageObserver.observe(img);
        }
    });
    
    // Enhanced event image handling
    const eventImages = document.querySelectorAll('.event-card img.card-img-top');
    eventImages.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const fallbackDiv = this.nextElementSibling;
            if (fallbackDiv?.classList.contains('d-none')) {
                fallbackDiv.classList.remove('d-none');
                fallbackDiv.classList.add('d-flex');
            }
        });
        
        img.addEventListener('load', function() {
            this.style.display = 'block';
            const fallbackDiv = this.nextElementSibling;
            if (fallbackDiv?.classList.contains('d-flex')) {
                fallbackDiv.classList.remove('d-flex');
                fallbackDiv.classList.add('d-none');
            }
        });
    });
}

// Enhanced animations with better performance
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate
    const animateElements = document.querySelectorAll('.card, .badge, h2, .lead');
    animateElements.forEach(element => observer.observe(element));
    
    // Optimized navbar scroll effect with throttling
    let ticking = false;
    function updateNavbar() {
        const navbar = document.querySelector('.custom-navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}

// Enhanced interactive elements with better event handling
function initInteractiveElements() {
    console.log('Initializing interactive elements...');
    
    // Optimized hover effects with passive event listeners
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'translateY(-5px)';
                this.style.transition = 'all 0.3s ease';
            }
        }, { passive: true });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        }, { passive: true });
    });
    
    // Enhanced badge interactions
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease';
            setTimeout(() => this.style.animation = '', 500);
        });
    });
    
    // Enhanced button handlers
    initButtonHandlers();
    initOfficerCards();
}

// Initialize button handlers
function initButtonHandlers() {
    // Join Us button
    const joinUsBtn = document.querySelector('.hero-section .btn-primary');
    if (joinUsBtn) {
        joinUsBtn.addEventListener('click', function() {
            showModal('Join PSSE', 
                'Thank you for your interest in joining PSSE! To become an automatic member, you must be a software engineering student at Central Philippine University. We welcome all Software Engineering students who are passionate about technology and community building.');
        });
    }
    
    // Learn More button
    const learnMoreBtn = document.querySelector('.hero-section .btn-outline-light');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            const aboutNavLink = document.querySelector('.nav-link[data-section="about"]');
            aboutNavLink?.click();
        });
    }
    
    // Event learn more buttons
    const learnMoreButtons = document.querySelectorAll('#events .btn-primary');
    learnMoreButtons.forEach((button, index) => {
        button.addEventListener('click', () => handleEventLearnMore(index));
    });
}

// Enhanced officer cards with better accessibility
function initOfficerCards() {
    const officerCards = document.querySelectorAll('.officer-card');
    console.log('Initializing', officerCards.length, 'officer cards');
    
    officerCards.forEach(card => {
        // Mouse interactions
        card.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                const img = this.querySelector('.officer-image img');
                if (img) img.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const img = this.querySelector('.officer-image img');
            if (img) img.style.transform = 'scale(1)';
        });
        
        // Click interaction
        card.addEventListener('click', function() {
            const officerTitle = this.querySelector('.card-title').textContent;
            showOfficerInfo(officerTitle);
        });
        
        // Accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${card.querySelector('.card-title')?.textContent}`);
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Enhanced modal system with better management
let currentModalInstance = null;

function showModal(title, content) {
    // Close existing modal
    if (currentModalInstance) {
        currentModalInstance.hide();
        currentModalInstance = null;
    }
    
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = createModal();
        document.body.appendChild(modal);
    }
    
    // Update content
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${content}</p>`;
    
    // Create and show modal
    currentModalInstance = new bootstrap.Modal(modal);
    
    modal.addEventListener('hidden.bs.modal', function() {
        currentModalInstance = null;
    }, { once: true });
    
    currentModalInstance.show();
}

// Create enhanced modal element
function createModal() {
    const modalHTML = `
        <div class="modal fade" id="customModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary contact-btn">Contact Us</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    const modal = modalElement.firstElementChild;
    
    // Enhanced contact button
    modal.querySelector('.contact-btn').addEventListener('click', function() {
        if (currentModalInstance) {
            currentModalInstance.hide();
            setTimeout(() => showContactModal(), 300);
        } else {
            showContactModal();
        }
    });
    
    return modal;
}

// Contact modal (enhanced)
function showContactModal() {
    const contactContent = `
        <div class="contact-info">
            <p><strong>You can reach us through:</strong></p>
            <div class="contact-methods">
                <div class="contact-item mb-3">
                    <i class="fab fa-facebook text-primary me-2"></i>
                    <span>Facebook: PSSE Central Philippine University</span>
                </div>
                <div class="contact-item mb-3">
                    <i class="fas fa-envelope text-primary me-2"></i>
                    <span>Email: psse@cpu.edu.ph</span>
                </div>
                <div class="contact-item mb-3">
                    <i class="fas fa-phone text-primary me-2"></i>
                    <span>Phone: +63 33 329 1971</span>
                </div>
                <div class="contact-item mb-3">
                    <i class="fas fa-map-marker-alt text-primary me-2"></i>
                    <span>Office: PSSE Office, CPU Campus, Jaro, Iloilo City</span>
                </div>
            </div>
        </div>
    `;
    
    showModal('Contact PSSE', contactContent);
}

// Enhanced officer info system
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

// Enhanced event learn more functionality
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

// Enhanced typing effect
function typeText(element, text, speed = 50) {
    if (!element || !text) return;
    
    element.textContent = '';
    let index = 0;
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }
    
    // Start typing after a small delay
    setTimeout(type, 500);
}

// Initialize typing effect for hero tagline
document.addEventListener('DOMContentLoaded', function() {
    const tagline = document.querySelector('.hero-section .lead');
    if (tagline) {
        const originalText = tagline.textContent;
        typeText(tagline, originalText, 50);
    }
});

console.log('PSSE Enhanced JavaScript loaded successfully!');
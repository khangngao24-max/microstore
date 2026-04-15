let GATEWAY_URL = '/api';
if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000') {
    GATEWAY_URL = 'http://localhost:8000/api';
}

// State
let cart = [];
let productsList = [];

// DOM Elements
const btnProducts = document.getElementById('btn-products');
const btnOrders = document.getElementById('btn-orders');
const viewProducts = document.getElementById('products-view');
const viewOrders = document.getElementById('orders-view');

const btnCart = document.getElementById('btn-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const btnCloseCart = document.getElementById('btn-close-cart');
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCountTitle = document.getElementById('cart-count-title');
const btnCheckout = document.getElementById('btn-checkout');

// Navigation
btnProducts.addEventListener('click', () => {
    btnProducts.classList.add('active'); btnOrders.classList.remove('active');
    viewProducts.classList.add('active'); viewOrders.classList.remove('active');
    fetchProducts();
});

btnOrders.addEventListener('click', () => {
    btnOrders.classList.add('active'); btnProducts.classList.remove('active');
    viewOrders.classList.add('active'); viewProducts.classList.remove('active');
    fetchOrders();
});

// Cart Toggle
function openCart() {
    cartSidebar.classList.add('show');
    cartOverlay.classList.add('show');
    renderCart();
}
function closeCart() {
    cartSidebar.classList.remove('show');
    cartOverlay.classList.remove('show');
}

btnCart.addEventListener('click', openCart);
btnCloseCart.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Toast
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.innerHTML = (isError ? '⚠️ ' : '✅ ') + message;
    toast.className = 'toast show ' + (isError ? 'error' : '');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

// Fetch Products
async function fetchProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';
    
    try {
        const response = await fetch(`${GATEWAY_URL}/products`);
        if (!response.ok) throw new Error('Không thể kết nối đến API Gateway');
        const data = await response.json();
        
        productsList = Array.isArray(data) ? data : (data.products || []);
        
        if (productsList.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1">Chưa có sản phẩm nào.</div>`;
            return;
        }

        grid.innerHTML = productsList.map(p => {
            const defaultImg = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80";
            return `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="${p.image_url || defaultImg}" alt="${p.name}" class="card-img" onerror="this.src='${defaultImg}'">
                    <span class="badge">Kho: ${p.stock}</span>
                </div>
                <div class="card-info">
                    <div class="card-title">${p.name}</div>
                    <div class="card-price">${formatPrice(p.price)}</div>
                </div>
                <button class="btn-action" onclick="addToCart(${p.id})">Thêm vào giỏ</button>
            </div>
        `}).join('');
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; color: var(--danger-color);">Lỗi tải dữ liệu. Hãy chắc chắn Backend đang chạy.</div>`;
    }
}

// Add to Cart
window.addToCart = function(productId) {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock <= 0) {
        showToast('Sản phẩm đã hết hàng', true);
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            showToast('Không thể thêm quá số lượng tồn kho', true);
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    showToast(`Đã thêm "${product.name}" vào giỏ`);
    
    // Animate badge
    cartBadge.classList.add('bump');
    setTimeout(() => cartBadge.classList.remove('bump'), 300);
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
        showToast('Đạt tối đa tồn kho', true);
    }
    updateCartUI();
}

function removeCartItem(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartCountTitle.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-state">Giỏ hàng đang trống.</div>';
        cartTotalPrice.textContent = '0 ₫';
        btnCheckout.disabled = true;
        return;
    }
    
    btnCheckout.disabled = false;
    let totalPrice = 0;
    
    cartItemsContainer.innerHTML = cart.map(item => {
        totalPrice += item.price * item.quantity;
        return `
        <div class="cart-item">
            <img src="${item.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80'}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)}</div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    <button class="btn-remove" onclick="removeCartItem(${item.id})">Xóa</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    cartTotalPrice.textContent = formatPrice(totalPrice);
}

// Checkout Process (Loops sequentially because API Gateway accepts 1 piece order create payload)
window.checkout = async function() {
    if (cart.length === 0) return;
    
    btnCheckout.disabled = true;
    btnCheckout.textContent = 'Đang xử lý...';
    
    let successCount = 0;
    
    for (const item of cart) {
        try {
            const response = await fetch(`${GATEWAY_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: item.id, quantity: item.quantity })
            });
            
            if (response.ok) {
                successCount++;
            } else {
                const errorData = await response.json();
                console.error(`Lỗi cho mặt hàng ${item.name}:`, errorData);
            }
        } catch (err) {
            console.error(`Lỗi request cho mặt hàng ${item.name}:`, err);
        }
    }
    
    if (successCount === cart.length) {
        showToast('🎉 Thanh toán thành công toàn bộ giỏ hàng!');
        cart = [];
        updateCartUI();
        closeCart();
        fetchProducts(); // refresh stock
    } else if (successCount > 0) {
        showToast(`Thanh toán hoàn tất một phần (${successCount}/${cart.length}). Kiểm tra lịch sử.`, true);
        // Refresh products and wipe cart for safety
        cart = []; updateCartUI(); fetchProducts();
    } else {
        showToast('Thanh toán thất bại. Hãy kiểm tra kết nối mạng.', true);
        btnCheckout.disabled = false;
        btnCheckout.textContent = 'Thanh toán ngay';
    }
}

// Fetch Orders
async function fetchOrders() {
    const listContainer = document.getElementById('orders-list');
    listContainer.innerHTML = '<div class="loading">Đang tải đơn hàng...</div>';
    
    try {
        const response = await fetch(`${GATEWAY_URL}/orders`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const orders = Array.isArray(data) ? data : (data.orders || []);
        
        if (orders.length === 0) {
            listContainer.innerHTML = `<div class="empty-state">Bạn chưa mua mặt hàng nào.</div>`;
            return;
        }

        listContainer.innerHTML = orders.reverse().map(o => `
            <div class="list-item">
                <div class="order-info">
                    <div class="order-id">Mã đơn: #${o.id}</div>
                    <div style="color: #94a3b8">Sản phẩm ID: ${o.product_id} | Số lượng: ${o.quantity}</div>
                    <div><span class="order-status">Hoàn tất thanh toán</span></div>
                </div>
                <div style="font-size: 1.4rem; font-weight: 800;">${formatPrice(o.total_price)}</div>
            </div>
        `).join('');
    } catch (error) {
        listContainer.innerHTML = `<div class="empty-state" style="color: var(--danger-color);">Lỗi tải lịch sử đơn hàng.</div>`;
    }
}

// Init
fetchProducts();

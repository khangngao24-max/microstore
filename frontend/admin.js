let GATEWAY_URL = '/api';
if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000') {
    GATEWAY_URL = 'http://localhost:8000/api';
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

function switchTab(tabId) {
    // Nav active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tabId}`).classList.add('active');
    
    // Panel active state
    document.querySelectorAll('.panel').forEach(el => el.classList.remove('active'));
    document.getElementById(`panel-${tabId}`).classList.add('active');

    // Title mapping
    const titles = {
        'dashboard': 'Tổng quan hệ thống',
        'inventory': 'Quản lý Kho hàng',
        'orders': 'Tất cả Đơn đặt hàng'
    };
    document.getElementById('page-title').textContent = titles[tabId];
}

async function fetchAllData() {
    try {
        const [prodResp, orderResp] = await Promise.all([
            fetch(`${GATEWAY_URL}/products`),
            fetch(`${GATEWAY_URL}/orders`)
        ]);

        const products = await prodResp.json();
        const orders = await orderResp.json();
        
        renderData(products, orders);
    } catch (err) {
        console.error('Error fetching admin data:', err);
        alert('Lỗi tải dữ liệu. Đảm bảo API Gateway đang chạy!');
    }
}

function renderData(productsData, ordersData) {
    const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
    const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
    
    // Calculate Stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);
    document.getElementById('stat-revenue').textContent = formatPrice(totalRevenue);
    document.getElementById('stat-total-orders').textContent = orders.length;
    document.getElementById('stat-products').textContent = products.length;

    // Render Inventory
    document.getElementById('inventory-list').innerHTML = products.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td style="font-weight: 700;">${p.name}</td>
            <td>${formatPrice(p.price)}</td>
            <td>
                <span class="stock-badge ${p.stock > 5 ? 'stock-high' : 'stock-low'}">
                    ${p.stock} sản phẩm
                </span>
            </td>
        </tr>
    `).join('');

    // Render Orders
    const renderOrdersHtml = (orderList) => {
        if(orderList.length === 0) return '<tr><td colspan="5" align="center">Chưa có đơn hàng nào</td></tr>';
        return orderList.reverse().map(o => `
            <tr>
                <td style="font-weight: 800;">#${o.id}</td>
                <td>SP-${o.product_id}</td>
                <td>${o.quantity}</td>
                <td style="font-weight: 700; color: #3b82f6;">${formatPrice(o.total_price)}</td>
                <td><span class="status-badge">Đã thanh toán</span></td>
            </tr>
        `).join('');
    };

    document.getElementById('all-orders-list').innerHTML = renderOrdersHtml([...orders]);
    document.getElementById('recent-orders-list').innerHTML = renderOrdersHtml([...orders].slice(-10));
}

// --- Authentication ---
const loginOverlay = document.getElementById('login-overlay');

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        loginOverlay.style.display = 'none';
        return true;
    } else {
        loginOverlay.style.display = 'flex';
        return false;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const errDiv = document.getElementById('login-error');
    const btn = e.target.querySelector('button');
    btn.textContent = 'Đang xử lý...';
    
    try {
        const resp = await fetch(`${GATEWAY_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        
        if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem('adminToken', data.token);
            errDiv.style.display = 'none';
            loginOverlay.style.display = 'none';
            fetchAllData();
        } else {
            errDiv.textContent = 'Sai tài khoản hoặc mật khẩu!';
            errDiv.style.display = 'block';
        }
    } catch (err) {
        errDiv.textContent = 'Lỗi kết nối tới máy chủ';
        errDiv.style.display = 'block';
    }
    btn.textContent = 'Đăng nhập';
}

function logout() {
    localStorage.removeItem('adminToken');
    loginOverlay.style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Clear display data to secure the dashboard when logged out
    document.getElementById('inventory-list').innerHTML = '';
    document.getElementById('all-orders-list').innerHTML = '';
    document.getElementById('recent-orders-list').innerHTML = '';
    document.getElementById('stat-revenue').textContent = '0 ₫';
    document.getElementById('stat-total-orders').textContent = '0';
    document.getElementById('stat-products').textContent = '0';
}

// Initial check and load
if (checkAuth()) {
    fetchAllData();
}

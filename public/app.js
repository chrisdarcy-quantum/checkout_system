let flags = {
    enableDarkMode: false,
    showNewHeader: false,
    enablePremiumFeatures: false,
    showPromotionalBanner: false,
    enableSearchFilter: false,
};

const productIcons = {
    'audio': '🎧',
    'accessories': '🔌',
    'peripherals': '⌨️',
    'video': '📹',
    'default': '💻'
};

async function init() {
    await loadFlags();
    renderHeader();
    renderPromotionalBanner();
    renderSearchBox();
    await loadProducts();
}

async function loadFlags() {
    try {
        const response = await fetch('http://localhost:3000/api/flags?userId=demo-user');
        flags = await response.json();
        applyFlags();
    } catch (error) {
        console.error('Error loading flags:', error);
    }
}

function applyFlags() {
    if (flags.enableDarkMode) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
}

function renderHeader() {
    const headerDiv = document.getElementById('header');
    
    if (flags.showNewHeader) {
        headerDiv.innerHTML = `
            <div class="header-new">
                <div class="header-content">
                    <div class="logo">
                        <span>⚡</span>
                        <span>TechHub</span>
                    </div>
                    <nav class="nav-links">
                        <a href="#">Products</a>
                        <a href="#">Deals</a>
                        <a href="#">Support</a>
                        <a href="#">🛒 Cart</a>
                    </nav>
                </div>
            </div>
        `;
    } else {
        headerDiv.innerHTML = `
            <div class="header">
                <div class="header-content">
                    <div class="logo">
                        <span>💻</span>
                        <span>TechHub</span>
                    </div>
                    <nav class="nav-links">
                        <a href="#">Products</a>
                        <a href="#">Deals</a>
                        <a href="#">Support</a>
                        <a href="#">🛒 Cart</a>
                    </nav>
                </div>
            </div>
        `;
    }
}

function renderPromotionalBanner() {
    const bannerDiv = document.getElementById('promotional-banner');
    
    if (flags.showPromotionalBanner) {
        bannerDiv.innerHTML = `
            <div class="promotional-banner">
                🎉 Holiday Sale: Get 20% off on all premium products! Use code TECH20 at checkout
            </div>
        `;
    } else {
        bannerDiv.innerHTML = '';
    }
}

function renderSearchBox() {
    const searchContainer = document.getElementById('search-container');
    
    if (flags.enableSearchFilter) {
        searchContainer.innerHTML = `
            <input 
                type="text" 
                class="search-input" 
                placeholder="Search for products..." 
                onkeyup="handleSearch(event)"
            />
        `;
    } else {
        searchContainer.innerHTML = '';
    }
}

async function handleSearch(event) {
    const query = event.target.value;
    if (query.length < 2) {
        await loadProducts();
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/search?q=${query}&userId=demo-user`);
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products?userId=demo-user');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products').innerHTML = '<p>Error loading products. Make sure the server is running.</p>';
    }
}

function renderProducts(products) {
    const productsDiv = document.getElementById('products');
    
    productsDiv.innerHTML = products.map(product => {
        const showPremiumBadge = flags.enablePremiumFeatures && product.premium;
        const icon = productIcons[product.category] || productIcons['default'];
        const description = product.description || '';
        
        return `
            <div class="product-card">
                ${showPremiumBadge ? '<span class="premium-badge">Premium</span>' : ''}
                <span class="product-icon">${icon}</span>
                <div class="product-name">${product.name}</div>
                ${description ? `<div class="product-description">${description}</div>` : ''}
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn">Add to Cart</button>
            </div>
        `;
    }).join('');
}

window.addEventListener('DOMContentLoaded', init);

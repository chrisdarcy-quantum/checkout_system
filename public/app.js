let flags = {
    enableDarkMode: false,
    showNewHeader: false,
    enablePremiumFeatures: false,
    showPromotionalBanner: false,
    enableSearchFilter: false,
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
        updateFlagStatus();
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
                <h1>🛒 Checkout System v2.0</h1>
                <p>Experience our new and improved interface!</p>
            </div>
        `;
    } else {
        headerDiv.innerHTML = `
            <div class="header-old">
                <h1>Checkout System</h1>
            </div>
        `;
    }
}

function renderPromotionalBanner() {
    const bannerDiv = document.getElementById('promotional-banner');
    
    if (flags.showPromotionalBanner) {
        bannerDiv.innerHTML = `
            <div class="promotional-banner">
                🎉 Special Offer: Get 20% off on all premium products! Limited time only!
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
                placeholder="🔍 Search products..." 
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
        
        return `
            <div class="product-card">
                ${showPremiumBadge ? '<span class="premium-badge">⭐ PREMIUM</span>' : ''}
                <div class="product-name">${product.name}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
    }).join('');
}

function toggleDarkMode() {
    flags.enableDarkMode = !flags.enableDarkMode;
    applyFlags();
    updateFlagStatus();
}

function toggleHeader() {
    flags.showNewHeader = !flags.showNewHeader;
    renderHeader();
    updateFlagStatus();
}

function updateFlagStatus() {
    const statusDiv = document.getElementById('flag-status');
    statusDiv.innerHTML = `
        <strong>Active Flags:</strong><br>
        Dark Mode: ${flags.enableDarkMode ? '✅' : '❌'} |
        New Header: ${flags.showNewHeader ? '✅' : '❌'} |
        Premium Features: ${flags.enablePremiumFeatures ? '✅' : '❌'} |
        Promotional Banner: ${flags.showPromotionalBanner ? '✅' : '❌'} |
        Search Filter: ${flags.enableSearchFilter ? '✅' : '❌'}
    `;
}

window.addEventListener('DOMContentLoaded', init);

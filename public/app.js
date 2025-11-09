let flags = {
    enableDarkMode: false,
    showNewHeader: false,
    enablePremiumFeatures: false,
    enableSearchFilter: false,
};


async function init() {
    await loadFlags();
    renderHeader();
    renderSearchBox();
    await loadPosts();
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
                        <span>TechHub Labs</span>
                    </div>
                    <nav class="nav-links">
                        <a href="#">Posts</a>
                        <a href="#">Research</a>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
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
                        <span>TechHub Labs</span>
                    </div>
                    <nav class="nav-links">
                        <a href="#">Posts</a>
                        <a href="#">Research</a>
                        <a href="#">About</a>
                        <a href="#">Contact</a>
                    </nav>
                </div>
            </div>
        `;
    }
}


function renderSearchBox() {
    const searchContainer = document.getElementById('search-container');
    
    if (flags.enableSearchFilter) {
        searchContainer.innerHTML = `
            <input 
                type="text" 
                class="search-input" 
                placeholder="Search papers by title, author, or topic..." 
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
        await loadPosts();
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/search?q=${query}&userId=demo-user`);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('Error searching posts:', error);
    }
}

async function loadPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts?userId=demo-user');
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('posts').innerHTML = '<p>Error loading posts. Make sure the server is running.</p>';
    }
}

function renderPosts(posts) {
    const postsDiv = document.getElementById('posts');
    
    postsDiv.innerHTML = posts.map(post => {
        const showPremiumBadge = flags.enablePremiumFeatures && post.premium;
        
        return `
            <div class="post-card">
                ${showPremiumBadge ? '<span class="premium-badge">Featured</span>' : ''}
                <div class="post-title">${post.title}</div>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span>•</span>
                    <span class="post-venue">${post.venue}</span>
                    <span class="post-category">${post.category}</span>
                </div>
                <div class="post-summary">${post.summary}</div>
                <div class="post-links">
                    <a href="${post.url}" target="_blank" class="post-link">Read Paper →</a>
                    ${post.arxiv ? `<a href="${post.arxiv}" target="_blank" class="post-link arxiv">arXiv →</a>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

window.addEventListener('DOMContentLoaded', init);

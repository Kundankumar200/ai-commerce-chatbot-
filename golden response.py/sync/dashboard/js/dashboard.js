const API_URL = 'http://localhost:5000/api';
let bookmarks = [];
let activeAuthTab = 'login';

document.addEventListener('DOMContentLoaded', () => {
    initNavigationRouting();
    checkSessionPersistence();
});

function renderToastNotification(msg, status = 'info') {
    const box = document.getElementById('toast-container');
    const note = document.createElement('div');
    note.className = `toast ${status}`;
    note.innerText = msg;
    box.appendChild(note);
    setTimeout(() => note.remove(), 4000);
}

function switchAuthTab(tab) {
    activeAuthTab = tab;
    document.querySelectorAll('.auth-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById('group-username').style.display = tab === 'signup' ? 'flex' : 'none';
}

function checkSessionPersistence() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-overlay').classList.remove('active');
        fetchEcosystemData();
    } else {
        document.getElementById('auth-overlay').classList.add('active');
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('auth-username').value;
    
    const targetEndpoint = activeAuthTab === 'signup' ? '/auth/register' : '/auth/login';
    const payload = activeAuthTab === 'signup' ? { username, email, password } : { email, password };

    try {
        const response = await fetch(`${API_URL}${targetEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            renderToastNotification('Identity handshake verified.', 'success');
            checkSessionPersistence();
        } else {
            renderToastNotification(data.message || 'Authentication error state.', 'error');
        }
    } catch (err) {
        renderToastNotification('Network link timeout during connectivity evaluation.', 'error');
    }
}

function logoutSession() {
    localStorage.removeItem('token');
    renderToastNotification('Session flushed and terminated.', 'info');
    checkSessionPersistence();
}

function initNavigationRouting() {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            
            link.classList.add('active');
            const targetedPanelId = link.getAttribute('data-target');
            document.getElementById(targetedPanelId).classList.add('active');
        });
    });
}

async function fetchEcosystemData() {
    const token = localStorage.getItem('token');
    try {
        const [profileRes, bookmarksRes] = await Promise.all([
            fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/bookmarks`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const profileData = await profileRes.json();
        const bookmarksData = await bookmarksRes.json();

        if (profileData.success) {
            document.getElementById('profile-name').innerText = profileData.user.username;
            document.getElementById('profile-email').innerText = profileData.user.email;
        }

        if (bookmarksData.success) {
            bookmarks = bookmarksData.bookmarks;
            populateFilterCategories();
            renderEcosystemCanvasLayout();
        }
    } catch (err) {
        renderToastNotification('Error synchronizing node matrices with cloud ecosystem.', 'error');
    }
}

function populateFilterCategories() {
    const filterSelect = document.getElementById('filter-category');
    const totalSet = new Set(bookmarks.map(b => b.category || 'Uncategorized'));
    filterSelect.innerHTML = '<option value="all">All Category Views</option>';
    totalSet.forEach(cat => {
        filterSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

function renderEcosystemCanvasLayout() {
    const homeRecentGrid = document.getElementById('recent-grid-view');
    
    document.getElementById('stat-total').innerText = bookmarks.length;
    document.getElementById('stat-favs').innerText = bookmarks.filter(b => b.isFavorite).length;
    document.getElementById('stat-categories').innerText = new Set(bookmarks.map(b => b.category)).size;

    homeRecentGrid.innerHTML = '';
    bookmarks.slice(0, 3).forEach(b => {
        homeRecentGrid.appendChild(buildNodeCardStructure(b));
    });

    filterSystemView();
}

function filterSystemView() {
    const query = document.getElementById('global-search').value.toLowerCase();
    const activeCategory = document.getElementById('filter-category')?.value || 'all';
    const activeSortingOrder = document.getElementById('sort-order')?.value || 'newest';
    const displayGridNode = document.getElementById('bookmarks-primary-grid');

    if (!displayGridNode) return;

    let processingStream = [...bookmarks];

    if (activeCategory !== 'all') {
        processingStream = processingStream.filter(b => (b.category || 'Uncategorized') === activeCategory);
    }

    if (query) {
        processingStream = processingStream.filter(b => 
            b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query)
        );
    }

    if (activeSortingOrder === 'newest') {
        processingStream.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeSortingOrder === 'alpha') {
        processingStream.sort((a, b) => a.title.localeCompare(b.title));
    }

    displayGridNode.innerHTML = '';
    processingStream.forEach(b => {
        displayGridNode.appendChild(buildNodeCardStructure(b));
    });
}

function buildNodeCardStructure(item) {
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.innerHTML = `
        <div class="card-header-row">
            <span class="card-tag">${item.category || 'Uncategorized'}</span>
            <i class="fa-star ${item.isFavorite ? 'fa-solid active' : 'fa-regular'} fav-toggle-icon" onclick="toggleFavoriteElement('${item._id}')"></i>
        </div>
        <div>
            <h4>${item.title}</h4>
            <p style="font-size:12px; color:var(--text-secondary); word-break:break-all;">${item.url}</p>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
            <button class="btn btn-secondary" onclick="window.open('${item.url}', '_blank')">Open</button>
            <button class="btn btn-secondary" style="color:var(--danger);" onclick="deleteNodePointer('${item._id}')">Delete</button>
        </div>
    `;
    return card;
}

function openCreateModal() {
    document.getElementById('modal-title').innerText = 'Append Node Pointer';
    document.getElementById('modal-form').reset();
    document.getElementById('entry-id').value = '';
    document.getElementById('modal-layer').classList.add('active');
}

function closeModalLayer() {
    document.getElementById('modal-layer').classList.remove('active');
}

async function handleFormSubmission(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
        title: document.getElementById('entry-title').value,
        url: document.getElementById('entry-url').value,
        category: document.getElementById('entry-category').value || 'Uncategorized',
        notes: document.getElementById('entry-notes').value
    };

    try {
        const response = await fetch(`${API_URL}/bookmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            closeModalLayer();
            fetchEcosystemData();
        }
    } catch (err) {
        renderToastNotification('Mutation request processing structural rejection.', 'error');
    }
}

async function deleteNodePointer(id) {
    if (!confirm('Confirm node removal?')) return;
    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/bookmarks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchEcosystemData();
    } catch (err) {
        renderToastNotification('Error executing deletion routing.', 'error');
    }
}

function exportDataSchema() {
    const serializationBlob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const localUrlAnchor = URL.createObjectURL(serializationBlob);
    const element = document.createElement('a');
    element.href = localUrlAnchor;
    element.download = `keepspace_vault_backup.json`;
    element.click();
}

function toggleThemeSystem() {
    const hostNode = document.documentElement;
    const isDark = hostNode.getAttribute('data-theme') === 'dark';
    hostNode.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

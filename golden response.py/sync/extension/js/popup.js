let currentAuthFormMode = 'login';
let selectedFavoriteState = false;
let extensionCachedBookmarks = [];
const DASHBOARD_UI_LANDING_URL = 'http://127.0.0.1:5500/dashboard/index.html';

document.addEventListener('DOMContentLoaded', async () => {
    initPopupFunctionalListeners();
    await evaluateExtensionSessionContext();
});

function triggerPopupToast(message, errorMode = false) {
    const toast = document.getElementById('ext-toast');
    if (!toast) return;
    toast.innerText = message;
    toast.style.background = errorMode ? 'var(--rose)' : 'var(--indigo)';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

function initPopupFunctionalListeners() {
    const redirectBtn = document.getElementById('redirect-dashboard-btn');
    if (redirectBtn) {
        redirectBtn.addEventListener('click', () => {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url: DASHBOARD_UI_LANDING_URL });
            } else {
                window.open(DASHBOARD_UI_LANDING_URL, '_blank');
            }
        });
    }

    const logoutBtn = document.getElementById('logout-trigger-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await AuthController.terminateSession();
            triggerPopupToast('Logged out');
            await evaluateExtensionSessionContext();
        });
    }

    document.getElementById('btn-toggle-login')?.addEventListener('click', () => toggleAuthViewLayout('login'));
    document.getElementById('btn-toggle-signup')?.addEventListener('click', () => toggleAuthViewLayout('signup'));
    document.getElementById('extension-auth-form')?.addEventListener('submit', handleAuthDispatch);
    document.getElementById('bookmark-capture-form')?.addEventListener('submit', handleBookmarkDispatch);
    document.getElementById('btn-quick-capture')?.addEventListener('click', pullActiveBrowserTabMetadata);
    
    const favStar = document.getElementById('btn-favorite-star');
    if (favStar) {
        favStar.addEventListener('click', () => {
            selectedFavoriteState = !selectedFavoriteState;
            favStar.classList.toggle('active', selectedFavoriteState);
            const icon = favStar.querySelector('i');
            if (icon) {
                icon.className = selectedFavoriteState ? 'fa-solid fa-star' : 'fa-regular fa-star';
            }
        });
    }
    document.getElementById('vault-search-input')?.addEventListener('input', runSearchFilterEngine);
}

async function evaluateExtensionSessionContext() {
    const activeToken = await StorageUtility.getLocalCache('token');
    const authView = document.getElementById('auth-panel-view');
    const spaceView = document.getElementById('workspace-panel-view');
    const userTag = document.getElementById('user-display-tag');
    const logoffBtn = document.getElementById('logout-trigger-btn');

    if (activeToken) {
        authView?.classList.remove('active');
        spaceView?.classList.add('active');
        if (logoffBtn) logoffBtn.style.display = 'block';
        
        const cachedUser = await StorageUtility.getLocalCache('user');
        if (userTag && cachedUser) {
            userTag.innerText = cachedUser.username || cachedUser.email || 'Online';
        }
        await fetchBookmarks();
    } else {
        authView?.classList.add('active');
        spaceView?.classList.remove('active');
        if (logoffBtn) logoffBtn.style.display = 'none';
        if (userTag) userTag.innerText = 'Offline';
    }
}

function toggleAuthViewLayout(mode) {
    currentAuthFormMode = mode;
    document.getElementById('btn-toggle-login')?.classList.toggle('active', mode === 'login');
    document.getElementById('btn-toggle-signup')?.classList.toggle('active', mode === 'signup');
    
    const usernameGroup = document.getElementById('ext-username-group');
    if (usernameGroup) {
        usernameGroup.style.display = mode === 'signup' ? 'block' : 'none';
        const usernameInput = document.getElementById('ext-auth-username');
        if (usernameInput) usernameInput.required = mode === 'signup';
    }
}

async function handleAuthDispatch(e) {
    e.preventDefault();
    const email = document.getElementById('ext-auth-email').value;
    const password = document.getElementById('ext-auth-password').value;
    const username = document.getElementById('ext-auth-username')?.value || '';

    const payload = currentAuthFormMode === 'signup' ? { username, email, password } : { email, password };
    
    const result = await AuthController.authenticateIdentity(currentAuthFormMode, payload);
    if (result.success) {
        triggerPopupToast('Authenticated Successfully');
        await evaluateExtensionSessionContext();
    } else {
        triggerPopupToast(result.message || 'Authentication Failed', true);
    }
}

async function handleBookmarkDispatch(e) {
    e.preventDefault();
    const title = document.getElementById('bookmark-title').value;
    const url = document.getElementById('bookmark-url').value;
    const category = document.getElementById('bookmark-category').value || 'Uncategorized';
    const notes = '';

    const payload = { title, url, category, notes, isFavorite: selectedFavoriteState };
    
    const response = await ApiClient.request('/bookmarks', 'POST', payload);
    if (response.success) {
        triggerPopupToast('Bookmark Saved!');
        document.getElementById('bookmark-capture-form').reset();
        
        selectedFavoriteState = false;
        const favStar = document.getElementById('btn-favorite-star');
        if (favStar) {
            favStar.classList.remove('active');
            const icon = favStar.querySelector('i');
            if (icon) icon.className = 'fa-regular fa-star';
        }
        
        await fetchBookmarks();
    } else {
        triggerPopupToast(response.message || 'Failed to save bookmark', true);
    }
}

async function pullActiveBrowserTabMetadata() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                const activeTab = tabs[0];
                const titleInput = document.getElementById('bookmark-title');
                const urlInput = document.getElementById('bookmark-url');
                if (titleInput) titleInput.value = activeTab.title || '';
                if (urlInput) urlInput.value = activeTab.url || '';
            }
        });
    } else {
        triggerPopupToast('Not in a browser extension context', true);
    }
}

async function fetchBookmarks() {
    const response = await ApiClient.request('/bookmarks', 'GET');
    if (response.success && response.bookmarks) {
        extensionCachedBookmarks = response.bookmarks;
        await StorageUtility.setLocalCache('cached_bookmarks', extensionCachedBookmarks);
        renderBookmarks(extensionCachedBookmarks);
    } else {
        const cached = await StorageUtility.getLocalCache('cached_bookmarks');
        if (cached) {
            extensionCachedBookmarks = cached;
            renderBookmarks(extensionCachedBookmarks);
        } else {
            triggerPopupToast('Failed to sync bookmarks', true);
        }
    }
}

function renderBookmarks(items) {
    const container = document.getElementById('popup-items-scroller');
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">No bookmark entries found.</div>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'vault-item-row';
        row.innerHTML = `
            <div class="row-header">
                <span class="row-badge">${item.category || 'Uncategorized'}</span>
                <i class="${item.isFavorite ? 'fa-solid fa-star' : 'fa-regular fa-star'}" style="color:${item.isFavorite ? 'var(--amber)' : 'var(--text-muted)'}; cursor:pointer;" onclick="toggleItemFavorite('${item._id}')"></i>
            </div>
            <div style="font-weight:600; font-size:13px; margin:4px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.title}">${item.title}</div>
            <div style="font-size:11px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; cursor:pointer;" onclick="window.open('${item.url}', '_blank')">${item.url}</div>
        `;
        container.appendChild(row);
    });
}

async function toggleItemFavorite(id) {
    const item = extensionCachedBookmarks.find(b => b._id === id);
    if (!item) return;
    
    const updatedFavoriteState = !item.isFavorite;
    const response = await ApiClient.request(`/bookmarks/${id}`, 'PUT', {
        title: item.title,
        url: item.url,
        category: item.category,
        notes: item.notes,
        isFavorite: updatedFavoriteState
    });

    if (response.success) {
        await fetchBookmarks();
    } else {
        triggerPopupToast('Failed to update favorite state', true);
    }
}

async function runSearchFilterEngine() {
    const query = document.getElementById('vault-search-input').value.toLowerCase();
    const filtered = extensionCachedBookmarks.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.url.toLowerCase().includes(query) || 
        (b.category && b.category.toLowerCase().includes(query))
    );
    renderBookmarks(filtered);
}

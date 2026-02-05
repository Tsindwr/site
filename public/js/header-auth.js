function $(elementID) {
    return document.getElementById(elementID);
}

// Helper to produce a stable URL for site assets using the optional global base URL
function assetUrl(relPath) {
    const base = (window.SUNDER_BASE_URL || '').replace(/\/$/, '');
    return base + '/' + String(relPath || '').replace(/^\/+/, '');
}

// Resolve an avatar value which may be absolute (http/s or //), root-absolute (/...), or relative (assets/...)
function resolveAvatar(avatar) {
    if (!avatar) return assetUrl('assets/favicon/sunder-logo.png');
    const s = String(avatar);
    // protocol-relative or absolute
    if (/^(https?:)?\/\//.test(s)) return s;
    // root-absolute: prepend base without duplicating slash
    if (s.startsWith('/')) {
        const base = (window.SUNDER_BASE_URL || '').replace(/\/$/, '');
        return base + s;
    }
    // relative path: resolve under base
    return assetUrl(s);
}

window.addEventListener("DOMContentLoaded", async () => {
    const userButton = $('user-button');
    const userDropdown = $('user-dropdown');
    const loginButton = $('login-button');
    const logoutButton = $('logout-button');
    const bookmarksButton = $('bookmarks-button');
    const userAvatar = $('user-avatar');
    const userNameSpan = $('user-name');

    // If the header elements aren't present, nothing to do
    if (!userButton || !userDropdown) return;

    // --- Dropdown open/close ---

    function toggleDropdown(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('user-dropdown--hidden');
    }

    function closeDropdown() {
        userDropdown.classList.add('user-dropdown--hidden');
    }

    userButton.addEventListener('click', toggleDropdown);
    document.addEventListener('click', closeDropdown);
    userDropdown.addEventListener('click', (e) => e.stopPropagation());

    // --- Auth wiring ---

    const auth = (window.sunder && window.sunder.auth) || null;

    function setLoggedOutUI() {
        if (userAvatar) userAvatar.src = assetUrl('assets/favicon/sunder-logo.png');
        if (userNameSpan) userNameSpan.textContent = 'Profile';

        if (loginButton) loginButton.style.display = 'block';
        if (bookmarksButton) bookmarksButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
    }

    function setUserUI(user) {
        if (!user) {
            setLoggedOutUI();
            return;
        }

        const meta = user.user_metadata || {};
        const name = meta.full_name || meta.name || meta.user_name || "Discord User";
        const avatar = resolveAvatar(meta.avatar_url || 'assets/favicon/sunder-logo.png');

        if (userAvatar) userAvatar.src = avatar;
        if (userNameSpan) userNameSpan.textContent = name;

        if (loginButton) loginButton.style.display = 'none';
        if (bookmarksButton) bookmarksButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'block';
    }

    // If auth isn't ready, just show a dummy profile badge
    if (!auth || !auth.getCurrentUser) {
        setLoggedOutUI();
        if (loginButton) loginButton.style.display = 'none';
        if (bookmarksButton) bookmarksButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        return;
    }

    // Initial user
    const user = await auth.getCurrentUser();
    setUserUI(user);

    // Subscribe to future changes
    if (auth.onAuthStateChange) {
        auth.onAuthStateChange(setUserUI);
    }

    // Button handlers
    if (loginButton) {
        loginButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await auth.requireUserOrLogin();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await auth.signOut();
            setLoggedOutUI();
        });
    }

    if (bookmarksButton) {
        bookmarksButton.addEventListener('click', async (e) => {
            e.preventDefault();
            window.location = window.SUNDER_BASE_URL + "/meta/bookmarks/";
        });
    }
});
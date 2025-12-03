import { supabase } from './auth.js';

function $(id) {
    return document.getElementById(id);
}

const userButton = $('user-button');
const userDropdown = $('user-dropdown');
const loginButton = $('login-button');
const logoutButton = $('logout-button');
const bookmarksButton = $('bookmarks-button');
const userAvatar = $('user-avatar');
const userNameSpan = $('user-name');

// Guard in case this runs on pages without header (build quirks)
if (userButton && userDropdown) {
    userButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = userDropdown.classList.contains('user-dropdown--hidden');
        userDropdown.classList.toggle('user-dropdown--hidden', !isHidden);
    });

    document.addEventListener('click', () => {
        userDropdown.classList.add('user-dropdown--hidden');
    });
}

async function signInWithDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: window.location.origin // your docs root
        }
    });

    if (error) {
        console.error('Discord login error', error);
        alert('Failed to sign in with Discord.');
    }
}

async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign out error', error);
    }
}

if (loginButton) {
    loginButton.addEventListener('click', () => {
        signInWithDiscord();
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut();
    });
}

if (bookmarksButton) {
    bookmarksButton.addEventListener('click', () => {
        window.location.href = '/meta/bookmarks/';
    });
}

function updateUserUI(user) {
    if (!user) {
        if (userAvatar) userAvatar.src = 'public/assets/default-avatar.svg';
        if (userNameSpan) userNameSpan.textContent = 'Guest';

        if (loginButton) loginButton.style.display = 'block';
        if (bookmarksButton) bookmarksButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        return;
    }

    const meta = user.user_metadata || {};
    const displayName = meta.full_name || meta.name || meta.user_name || 'Discord User';
    const avatarUrl = meta.avatar_url || '/images/default-avatar.svg';

    if (userAvatar) userAvatar.src = avatarUrl;
    if (userNameSpan) userNameSpan.textContent = displayName;

    if (loginButton) loginButton.style.display = 'none';
    if (bookmarksButton) bookmarksButton.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'none';
}

// Initial state on page load
(async () => {
    if (!supabase) return;

    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.warn('getUser error', error);
    }
    updateUserUI(data?.user ?? null);

    supabase.auth.onAuthStateChange((_event, session) => {
        updateUserUI(session?.user ?? null);
    });
})();
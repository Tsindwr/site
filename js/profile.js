window.sunder = window.sunder || {};

(function () {
    const page = document.querySelector('.sunder-profile-page');
    if (!page) return;

    const FLASH_SENSITIVE_KEY = 'sunder-flash-sensitive';

    const elements = {
        avatar: page.querySelector('[data-profile-avatar]'),
        eyebrow: page.querySelector('[data-profile-eyebrow]'),
        name: page.querySelector('[data-profile-name]'),
        handle: page.querySelector('[data-profile-handle]'),
        tagline: page.querySelector('[data-profile-tagline]'),
        status: page.querySelector('[data-profile-status]'),
    };

    function normalizeUser(userInfo) {
        if (!userInfo) return null;
        const meta = userInfo.user_metadata || {};
        return {
            id: userInfo.id,
            email: userInfo.email,
            meta,
        };
    }

    function resolveDisplayName(meta, email) {
        return meta.full_name || meta.name || meta.user_name || meta.preferred_username ||
            meta.custom_claims?.global_name || (email ? email.split('@')[0] : null);
    }

    function resolveHandle(meta, email) {
        const handle = meta.user_name || meta.preferred_username || meta.nickname;
        if (handle) return `@${handle.replace(/^@/, '')}`;
        if (email) return `@${email.split('@')[0]}`;
        return null;
    }

    function resolveAvatar(meta) {
        return meta.avatar_url || meta.picture || meta.avatar || meta.user_avatar_url || null;
    }

    function applyUserProfile(userInfo) {
        const normalized = normalizeUser(userInfo);
        if (!normalized) return;

        const { meta, email } = normalized;
        const displayName = resolveDisplayName(meta, email);
        const handle = resolveHandle(meta, email);
        const avatar = resolveAvatar(meta);
        const tagline = meta.bio || meta.tagline || meta.summary || null;
        const role = meta.role || meta.title || meta.player_role || null;

        if (displayName && elements.name) elements.name.textContent = displayName;
        if (handle && elements.handle) elements.handle.textContent = handle;
        if (avatar && elements.avatar) {
            elements.avatar.src = avatar;
            elements.avatar.alt = `${displayName || 'Player'} avatar`;
        }
        if (tagline && elements.tagline) elements.tagline.textContent = tagline;
        if (role && elements.eyebrow) elements.eyebrow.textContent = role;

        if (elements.status) {
            elements.status.textContent = '';
            elements.status.classList.add('sunder-profile-status--hidden');
        }
    }

    async function hydrate() {
        const auth = window.sunder?.auth;
        const cachedUser = auth?.getUserInfo ? auth.getUserInfo() : null;
        if (cachedUser) applyUserProfile(cachedUser);

        if (auth?.getCurrentUser) {
            try {
                const liveUser = await auth.getCurrentUser();
                if (liveUser) applyUserProfile(liveUser);
            } catch (err) {
                console.warn('Profile user fetch failed:', err);
            }
        }

        if (auth?.onAuthStateChange) {
            auth.onAuthStateChange((user) => {
                if (user) applyUserProfile(user);
            });
        }
    }

    function bindFlashSensitiveToggle() {
        const toggle = page.querySelector('[data-flash-sensitive-toggle]');
        if (!toggle) return;

        const theme = window.sunder?.theme || null;
        const getScheme = theme?.getScheme || (() => document.documentElement.getAttribute('data-md-color-scheme') || 'default');
        const setScheme = theme?.setScheme || ((scheme) => {
            document.documentElement.setAttribute('data-md-color-scheme', scheme);
            if (document.body) document.body.setAttribute('data-md-color-scheme', scheme);
            localStorage.setItem('sunder-color-scheme', scheme);
        });

        function readFlashSensitive() {
            return localStorage.getItem(FLASH_SENSITIVE_KEY) === 'true';
        }

        function updateToggleState() {
            toggle.checked = readFlashSensitive();
            if (toggle.checked && getScheme() !== 'default') {
                setScheme('default');
            }
        }

        updateToggleState();

        toggle.addEventListener('change', () => {
            localStorage.setItem(FLASH_SENSITIVE_KEY, toggle.checked ? 'true' : 'false');
            if (toggle.checked) {
                setScheme('default');
            }
        });

        window.addEventListener('storage', (event) => {
            if (event.key === FLASH_SENSITIVE_KEY) updateToggleState();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            hydrate();
            bindFlashSensitiveToggle();
        });
    } else {
        hydrate();
        bindFlashSensitiveToggle();
    }
})();

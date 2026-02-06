window.sunder = window.sunder || {};

(function () {
    const STORAGE_KEY = 'sunder-color-scheme';
    const VALID_SCHEMES = new Set(['default', 'slate']);
    const listeners = new Set();

    function readPaletteScheme() {
        if (!window.__md_get) return null;
        const palette = window.__md_get('__palette');
        return palette && palette.scheme ? palette.scheme : null;
    }

    function readStoredScheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return VALID_SCHEMES.has(stored) ? stored : null;
    }

    function resolveScheme() {
        return readPaletteScheme() ||
            readStoredScheme() ||
            document.documentElement.getAttribute('data-md-color-scheme') ||
            'slate';
    }

    function updateMeta(scheme) {
        const metaScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaScheme) metaScheme.setAttribute('content', scheme === 'slate' ? 'dark' : 'light');

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', scheme === 'slate' ? '#0b0f14' : '#5a2d82');
    }

    function applyScheme(scheme, persist) {
        const nextScheme = VALID_SCHEMES.has(scheme) ? scheme : 'default';
        const root = document.documentElement;
        root.setAttribute('data-md-color-scheme', nextScheme);
        if (document.body) document.body.setAttribute('data-md-color-scheme', nextScheme);

        if (window.__md_set) {
            const palette = window.__md_get('__palette') || {};
            palette.scheme = nextScheme;
            palette.primary = palette.primary || 'custom';
            palette.accent = palette.accent || 'custom';
            window.__md_set('__palette', palette);
        }

        if (persist) {
            localStorage.setItem(STORAGE_KEY, nextScheme);
        }

        updateMeta(nextScheme);
        listeners.forEach((handler) => handler(nextScheme));
    }

    function setScheme(scheme) {
        applyScheme(scheme, true);
    }

    function getScheme() {
        return resolveScheme();
    }

    function onChange(handler) {
        listeners.add(handler);
        return () => listeners.delete(handler);
    }

    function init() {
        const stored = readStoredScheme();
        const palette = readPaletteScheme();
        const scheme = resolveScheme();
        const shouldPersist = !stored && !palette;
        applyScheme(scheme, shouldPersist);

        window.addEventListener('storage', (event) => {
            if (event.key !== STORAGE_KEY || !event.newValue) return;
            applyScheme(event.newValue, false);
        });
    }

    window.sunder.theme = {
        getScheme,
        setScheme,
        onChange,
        applyScheme,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

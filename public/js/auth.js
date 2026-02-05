window.sunder = window.sunder || {};

(function () {
    const SUPABASE_URL = 'https://oqngifbqawctgqxgtxfl.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_yWdBi5JCNErFyMqF6F6pbw_iasqMQjj';
    const USER_STORAGE_KEY = 'sunder_user_info';

    if (!window.supabase || !window.supabase.createClient) {
        console.error(
            "Supabase JS library not loaded. Check the unpkg URL in mkdocs.yml."
        );
        return;
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Save user info to localStorage
    function saveUserInfo(user) {
        if (!user) {
            localStorage.removeItem(USER_STORAGE_KEY);
            return;
        }
        try {
            const userInfo = {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
        } catch (err) {
            console.warn("Failed to save user info to localStorage:", err);
        }
    }

    // Get cached user info from localStorage
    function getCachedUserInfo() {
        try {
            const cached = localStorage.getItem(USER_STORAGE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (err) {
            console.warn("Failed to read user info from localStorage:", err);
            return null;
        }
    }

    async function getCurrentUser() {
        try {
            const { data, error } = await client.auth.getUser();
            if (error) {
                console.warn("getUser error:", error);
                saveUserInfo(null); // Clear cached user on error
                return null;
            }
            const user = data.user || null;
            saveUserInfo(user); // Save to localStorage
            return user;
        } catch (err) {
            console.error("getUser threw:", err);
            saveUserInfo(null); // Clear cached user on error
            return null;
        }
    }

    // Get user info (returns cached version for quick access)
    function getUserInfo() {
        return getCachedUserInfo();
    }

    async function requireUserOrLogin() {
        const user = await getCurrentUser();
        if (user) return user;

        const { error } = await client.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: window.location.href,
            },
        });

        if (error) {
            console.error("Discord login error:", error);
            alert("Could not start Discord login.");
        }

        return null;
    }

    async function signOut() {
        const { error } = await client.auth.signOut();
        if (error) {
            console.error("Sign out error:", error);
            alert("Failed to log out.");
        } else {
            saveUserInfo(null); // Clear localStorage on successful logout
        }
    }

    function onAuthStateChange(callback) {
        client.auth.onAuthStateChange((_event, session) => {
            const user = session?.user || null;
            saveUserInfo(user); // Keep localStorage in sync
            callback(user);
        });
    }

    // Expose a simple auth API
    window.sunder.auth = {
        client,
        getCurrentUser,
        getUserInfo,
        requireUserOrLogin,
        signOut,
        onAuthStateChange,
    };
})();
window.sunder = window.sunder || {};

(function () {
    const SUPABASE_URL = 'https://oqngifbqawctgqxgtxfl.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_yWdBi5JCNErFyMqF6F6pbw_iasqMQjj';

    if (!window.supabase || !window.supabase.createClient) {
        console.error(
            "Supabase JS library not loaded. Check the unpkg URL in mkdocs.yml."
        );
        return;
    }

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    async function getCurrentUser() {
        try {
            const { data, error } = await client.auth.getUser();
            if (error) {
                console.warn("getUser error:", error);
                return null;
            }
            return data.user || null;
        } catch (err) {
            console.error("getUser threw:", err);
            return null;
        }
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
        }
    }

    function onAuthStateChange(callback) {
        client.auth.onAuthStateChange((_event, session) => {
            callback(session?.user || null);
        });
    }

    // Expose a simple auth API
    window.sunder.auth = {
        client,
        getCurrentUser,
        requireUserOrLogin,
        signOut,
        onAuthStateChange,
    };
})();
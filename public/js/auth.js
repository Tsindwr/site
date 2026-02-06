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
            // Attempt to extract the Discord provider user id (so we can mention them in Discord)
            let discordProviderId = null;

            // Supabase may expose an `identities` array on the user with provider information
            if (user.identities && Array.isArray(user.identities)) {
                const discordIdent = user.identities.find(i => (i.provider || '').toLowerCase() === 'discord');
                if (discordIdent) {
                    // identity_data commonly contains provider-specific fields (e.g. `id` for OAuth providers)
                    if (discordIdent.identity_data) {
                        discordProviderId = discordIdent.identity_data.id || discordIdent.identity_data.user_id || discordIdent.identity_data.sub || null;
                    }
                    // fallback fields
                    if (!discordProviderId) discordProviderId = discordIdent.provider_id || discordIdent.id || null;
                }
            }

            // Some setups may surface provider ids in user_metadata
            if (!discordProviderId && user.user_metadata) {
                discordProviderId = user.user_metadata.discord_id || user.user_metadata.id || null;
            }

            const userInfo = {
                id: user.id,
                // store a dedicated discord_id when available (otherwise null)
                discord_id: discordProviderId || null,
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

    // Get user's display name for contact field auto-fill
    // Discord OAuth user_metadata typically includes:
    // - full_name: Discord display name
    // - user_name: Discord username (without @)
    // - custom_claims.global_name: Discord global name (if set)
    function getUserDisplayName() {
        const userInfo = getCachedUserInfo();
        if (!userInfo) return null;

        const meta = userInfo.user_metadata || {};
        const username = meta.full_name || meta.name || meta.user_name || meta.custom_claims?.global_name;
        // Prefer the Discord provider id if we stored it; fallback to supabase user id
        const discordId = userInfo.discord_id || userInfo.id;

        if (username) {
            // Only format a Discord mention if the id looks like a numeric Discord id
            if (discordId && /^\d+$/.test(String(discordId))) {
                return `${username} <@${discordId}>`;
            }
            // Otherwise return the username (append non-numeric id for debugging if present)
            return username + (discordId ? ` (${discordId})` : '');
        } else if (userInfo.email) {
            return userInfo.email;
        }

        return null;
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
        getUserDisplayName,
        requireUserOrLogin,
        signOut,
        onAuthStateChange,
    };
})();
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
            const { data: sessionData, error: sessionError } = await client.auth.getSession();

            if (sessionError) {
                console.warn("getSession error:", sessionError);
                saveUserInfo(null);
                return null;
            }

            const session = sessionData?.session || null;

            if (!session) {
                // This is a normal signed-out state, not an auth failure
                saveUserInfo(null);
                return null;
            }

            const user = session.user || null;

            if (user) {
                saveUserInfo(user);
                return user;
            }

            const { data: userData, error: userError } = await client.auth.getUser();

            if (userError) {
                console.warn("getUser error with existing session:", error);
                saveUserInfo(null); // Clear cached user on error
                return null;
            }

            saveUserInfo(userData.user || null); // Save to localStorage
            return userData.user || null;
        } catch (err) {
            console.error("getCurrentUser threw:", err);
            saveUserInfo(null); // Clear cached user on error
            return null;
        }
    }

    async function getSession() {
        const { data, error } = await client.auth.getSession();

        if (error) {
            console.warn("getSession error:", error);
            return null;
        }

        const session = data.session || null;
        saveUserInfo(session?.user || null);
        return session;
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

    function getRedirectUrl() {
        if (window.SUNDER_SITE?.cleanCurrentUrl) {
            return window.SUNDER_SITE.cleanCurrentUrl();
        }

        return `${window.location.origin}${window.location.pathname}`;
    }

    async function requireUserOrLogin() {
        const user = await getCurrentUser();
        if (user) return user;

        const { error } = await client.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: getRedirectUrl(),
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
        client.auth.onAuthStateChange((event, session) => {
            const user = session?.user || null;
            saveUserInfo(user); // Keep localStorage in sync

            window.dispatchEvent(
                new CustomEvent("sunder-auth-state-change", {
                    detail: {
                        event,
                        user,
                        session,
                    },
                })
            );

            callback(user);
        });
    }

    async function syncInitialSession() {
        try {
            const { data, error } = await client.auth.getSession();

            if (error) {
                console.warn("[sunder auth] initial getSession error:", error);
                saveUserInfo(null);
                return null;
            }

            const user = data.session?.user || null;
            saveUserInfo(user);

            window.dispatchEvent(
                new CustomEvent("sunder-auth-session-synced", {
                    detail: {
                        user,
                        session: data.session || null,
                    },
                })
            );

            return data.session || null;
        } catch (error) {
            console.warn("[sunder auth] initial session sync failed:", error);
            saveUserInfo(null);
            return null;
        }
    }

    syncInitialSession();

    // Expose a simple auth API
    window.sunder.auth = {
        client,
        getCurrentUser,
        getUserInfo,
        getUserDisplayName,
        requireUserOrLogin,
        signOut,
        onAuthStateChange,
        getSession,
        getRedirectUrl,
    };

    window.SUNDER_AUTH = window.sunder.auth;
    window.sunderSupabase = client;
    window.SUNDER_SUPABASE_CLIENT = client;
    window.SUNDER_SUPABASE_URL = SUPABASE_URL;
    window.SUNDER_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

    client.auth.getSession()
        .then(({ data, error }) => {
            if (error) {
                console.warn("Initial auth session check failed:", error);
                saveUserInfo(null);
                return;
            }

            saveUserInfo(data.session?.user || null);
        })
        .catch((error) => {
            console.warn("Initial auth session check threw:", error);
            saveUserInfo(null);
        });

    window.dispatchEvent(
        new CustomEvent("sunder-auth-ready", {
            detail: { client },
        })
    );
})();

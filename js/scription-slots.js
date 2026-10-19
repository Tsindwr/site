(function () {
    const SLOT_SELECTOR = [
        "[data-premium-slot]",
        "[data-scription-slot]",
        ".sunder-premium-slot[data-content-code]",
        ".sunder-scription-slot[data-content-code]",
    ].join(",");

    const ACTIVATE_URL = window.SUNDER_SITE?.resolvePath
        ? window.SUNDER_SITE.resolvePath("meta/activate-scription/")
        : "/meta/activate-scription/";
    const KOFI_URL = "https://ko-fi.com/s/7a27b8b0ae";

    const SLOT_CACHE_PREFIX = "sunder:scription:slot:v1:";
    const SLOT_CACHE_INDEX_KEY = "sunder:scription:slot:index:v1";
    const SLOT_CACHE_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour per tab session

    let authSubscriptionAttached = false;
    let lastKnownUserId = null;

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function getMarkdownApi() {
        return window.SUNDER_MARKDOWN || window.MARKDOWN || null;
    }

    function getSupabaseClient() {
        if (window.sunder?.auth?.client) return window.sunder.auth.client;
        if (window.SUNDER_AUTH?.client) return window.SUNDER_AUTH.client;

        if (typeof window.SUNDER_SCRIPTION?.getSupabaseClient === "function") {
            return window.SUNDER_SCRIPTION.getSupabaseClient();
        }

        if (window.sunderSupabase) return window.sunderSupabase;
        if (window.supabaseClient) return window.supabaseClient;

        return null;
    }

    async function waitForAuthClient(timeoutMs = 5000) {
        const startedAt = Date.now();

        while (Date.now() - startedAt < timeoutMs) {
            const client = getSupabaseClient();

            if (client?.auth && typeof client.auth.getSession === "function") {
                return client;
            }

            await sleep(100);
        }

        return getSupabaseClient();
    }

    async function getSession(client) {
        const { data, error } = await client.auth.getSession();

        if (error) throw error;

        return data.session || null;
    }

    function getSupabaseUrl(client) {
        return window.SUPABASE_URL || window.SUNDER_SUPABASE_URL || client.supabaseUrl;
    }

    function getSlotCode(slot) {
        return (
            slot.dataset.premiumSlot ||
            slot.dataset.scriptionSlot ||
            slot.dataset.contentCode ||
            ""
        ).trim();
    }

    function getSlotCacheKey(userId, contentCode) {
        return `${SLOT_CACHE_PREFIX}${userId}:${contentCode}`;
    }

    function getSlotCacheIndex() {
        try {
            const raw = sessionStorage.getItem(SLOT_CACHE_INDEX_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function rememberSlotCacheKey(key) {
        const index = new Set(getSlotCacheIndex());
        index.add(key);
        sessionStorage.setItem(SLOT_CACHE_INDEX_KEY, JSON.stringify(Array.from(index)));
    }

    function readCachedFragment(userId, contentCode) {
        if (!userId || !contentCode) return null;

        try {
            const key = getSlotCacheKey(userId, contentCode);
            const raw = sessionStorage.getItem(key);

            if (!raw) return null;

            const cached = JSON.parse(raw);

            if (!cached || typeof cached.markdown !== "string") {
                sessionStorage.removeItem(key);
                return null;
            }

            if (cached.cachedAt && Date.now() - cached.cachedAt > SLOT_CACHE_MAX_AGE_MS) {
                sessionStorage.removeItem(key);
                return null;
            }

            return cached;
        } catch {
            return null;
        }
    }

    function writeCachedFragment(userId, contentCode, fragment) {
        if (!userId || !contentCode || !fragment?.markdown) return;

        const key = getSlotCacheKey(userId, contentCode);

        const cached = {
            code: contentCode,
            title: fragment.title || null,
            markdown: fragment.markdown,
            sourceSha: fragment.sourceSha || null,
            cachedAt: Date.now(),
        };

        sessionStorage.setItem(key, JSON.stringify(cached));
        rememberSlotCacheKey(key);
    }

    function clearScriptionSlotCache() {
        for (const key of getSlotCacheIndex()) {
            if (typeof key === "string" && key.startsWith(SLOT_CACHE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        }

        sessionStorage.removeItem(SLOT_CACHE_INDEX_KEY);

        // Failsafe in case the index was stale.
        for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
            const key = sessionStorage.key(i);

            if (key && key.startsWith(SLOT_CACHE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        }
    }

    function getPagePath() {
        if (window.SUNDER_SITE?.currentPagePath) {
            return window.SUNDER_SITE.currentPagePath();
        }

        let path = window.location.pathname || "/";
        if (!path.endsWith("/")) path += "/";
        return path;
    }

    function hasScriptionAccess(accessPayload) {
        if (!accessPayload) return false;

        if (accessPayload.hasScription === true) return true;
        if (accessPayload.hasPremium === true) return true;

        return (
            Array.isArray(accessPayload.activeProducts) &&
            accessPayload.activeProducts.includes("scription")
        );
    }

    async function getAccessState() {
        const helpers = window.SUNDER_SCRIPTION;

        if (!helpers?.getAccess) {
            return {
                ok: false,
                signedOut: false,
                hasAccess: false,
                message: "Scription access helper unavailable.",
            };
        }

        const result = await helpers.getAccess();

        if (result?.error) {
            const message = result.error.message || String(result.error);

            return {
                ok: false,
                signedOut:
                    message.toLowerCase().includes("sign in") ||
                    message.toLowerCase().includes("jwt") ||
                    message.toLowerCase().includes("unauthorized"),
                hasAccess: false,
                message,
            };
        }

        return {
            ok: true,
            signedOut: false,
            hasAccess: hasScriptionAccess(result.data),
            access: result.data,
            message: null,
        };
    }

    function normalizeFragmentsPayload(payload) {
        const map = new Map();

        const source =
            payload?.fragments ||
            payload?.data?.fragments ||
            payload?.content ||
            payload?.data ||
            null;

        if (Array.isArray(source)) {
            for (const item of source) {
                const code =
                    item.content_code ||
                    item.contentCode ||
                    item.code ||
                    item.id;

                const markdown =
                    item.markdown ||
                    item.body_markdown ||
                    item.bodyMarkdown ||
                    item.content ||
                    item.body ||
                    "";

                if (code && markdown) {
                    map.set(String(code), {
                        code: String(code),
                        markdown,
                        payload: item,
                    });
                }
            }

            return map;
        }

        if (source && typeof source === "object") {
            for (const [code, value] of Object.entries(source)) {
                if (typeof value === 'string') {
                    map.set(code, {
                        code,
                        markdown: value,
                        payload: { markdown: value },
                    });
                    continue;
                }

                if (value && typeof value === 'object') {
                    const markdown =
                        value.markdown ||
                        value.body_markdown ||
                        value.bodyMarkdown ||
                        value.content ||
                        value.body ||
                        "";

                    if (markdown) {
                        map.set(code, {
                            code,
                            markdown,
                            payload: value,
                        });
                    }
                }
            }
        }

        return map;
    }

    async function fetchFragmentsDirect(client, session, contentCodes) {
        const supabaseUrl = getSupabaseUrl(client);

        const res = await fetch(`${supabaseUrl}/functions/v1/premium-fragments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                pagePath: getPagePath(),
                legacyPagePath: window.SUNDER_SITE?.legacyPagePath
                    ? window.SUNDER_SITE.legacyPagePath(getPagePath())
                    : undefined,
                contentCodes,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `premium-fragments failed with ${res.status}`);
        }

        return await res.json();
    }

    async function fetchFragments(client, session, contentCodes) {
        const helpers = window.SUNDER_SCRIPTION;

        if (helpers?.getPremiumFragments) {
            const result = await helpers.getPremiumFragments(contentCodes, getPagePath());

            if (result?.error) {
                throw new Error(result.error.message || String(result.error));
            }

            return result.data || result;
        }

        return await fetchFragmentsDirect(client, session, contentCodes);
    }

    function renderFragmentIntoSlot(slot, fragment) {
        const markdownApi = getMarkdownApi();

        if (!markdownApi?.renderInto) {
            throw new Error("Shared Markdown renderer missing. Check sunder-markdown.js.");
        }

        const markdown = fragment.markdown || "";

        slot.classList.remove("sunder-scription-locked-page");
        slot.classList.add(
            "sunder-scription-unlocked-content",
            "sunder-scription-fragment-content"
        );

        markdownApi.renderInto(slot, markdown, {
            title: slot.dataset.scriptionTitle || "",
            stripFirstHeading: false,
        });

        markSlotState(slot, "unlocked");
    }

    async function activateScriptionSlots() {
        const slots = Array.from(document.querySelectorAll(SLOT_SELECTOR))
            .filter((slot) => getSlotCode(slot));

        if (slots.length === 0) return;

        const unloadedSlots = slots.filter((slot) => {
            return slot.dataset.scriptionSlotLoaded !== "true" &&
                slot.dataset.scriptionSlotLoading !== "true";
        });

        if (unloadedSlots.length === 0) return;

        for (const slot of unloadedSlots) {
            slot.dataset.scriptionSlotLoading = "true";
            markSlotState(slot, "loading");
        }

        let client = null;
        let session = null;

        try {
            client = await waitForAuthClient();

            if (!client?.auth) {
                throw new Error("Auth client unavailable.");
            }

            session = await getSession(client);

            const currentUserId = session?.user?.id || null;

            if (currentUserId && lastKnownUserId && lastKnownUserId !== currentUserId) {
                clearScriptionSlotCache();
            }

            lastKnownUserId = currentUserId;

            if (!session) {
                for (const slot of unloadedSlots) {
                    renderSignedOutSlot(slot);
                    markSlotState(slot, "signed-out");
                    delete slot.dataset.scriptionSlotLoading;
                }

                return;
            }

            const accessState = await getAccessState();

            if (!accessState.ok || !accessState.hasAccess) {
                for (const slot of unloadedSlots) {
                    if (accessState.signedOut) {
                        renderSignedOutSlot(slot);
                        markSlotState(slot, "signed-out");
                    } else {
                        renderLockedSlot(slot)
                        markSlotState(slot, "locked");
                    }

                    delete slot.dataset.scriptionSlotLoading;
                }

                return;
            }

            const userId = session.user.id;
            const slotsNeedingFetch = [];

            for (const slot of unloadedSlots) {
                const code = getSlotCode(slot);
                const cached = readCachedFragment(userId, code);

                if (cached?.markdown) {
                    renderFragmentIntoSlot(slot, cached);
                    slot.dataset.scriptionSlotLoaded = "true";
                    delete slot.dataset.scriptionSlotLoading;
                } else {
                    slotsNeedingFetch.push(slot);
                }
            }

            if (slotsNeedingFetch.length === 0) return;

            const contentCodes = Array.from(
                new Set(slotsNeedingFetch.map(getSlotCode).filter(Boolean))
            );

            const payload = await fetchFragments(client, session, contentCodes);
            const fragmentMap = normalizeFragmentsPayload(payload);

            for (const slot of slotsNeedingFetch) {
                const code = getSlotCode(slot);
                const fragment = fragmentMap.get(code);

                if (!fragment) {
                    console.warn("[sunder-scription-slots] Missing fragment:", code);
                    markSlotState(slot, "missing");
                    delete slot.dataset.scriptionSlotLoading;
                    continue;
                }

                writeCachedFragment(userId, code, fragment);
                renderFragmentIntoSlot(slot, fragment);

                slot.dataset.scriptionSlotLoaded = "true";
                delete slot.dataset.scriptionSlotLoading;
            }
        } catch (error) {
            console.warn("[sunder-scription-slots] Failed to replace slots:", error);

            for (const slot of unloadedSlots) {
                markSlotState(slot, "error");
                delete slot.dataset.scriptionSlotLoading;
            }
        }
    }

    function escapeHtmlSafe(value) {
        const markdownApi = getMarkdownApi();

        if (markdownApi?.escapeHtml) {
            return markdownApi.escapeHtml(value);
        }

        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function slotHasVisibleContent(slot) {
        return String(slot.innerHTML || "").trim().length > 0;
    }

    async function signInWithDiscordFallback() {
        if (window.sunder?.auth?.requireUserOrLogin) {
            return window.sunder.auth.requireUserOrLogin();
        }

        if (window.SUNDER_AUTH?.requireUserOrLogin) {
            return window.SUNDER_AUTH.requireUserOrLogin();
        }

        const client = getSupabaseClient();

        if (!client?.auth) {
            throw new Error("Sign-in is not ready yet. Try refreshing the page.");
        }

        const { error } = await client.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: window.SUNDER_SITE?.cleanCurrentUrl
                    ? window.SUNDER_SITE.cleanCurrentUrl()
                    : `${window.location.origin}${window.location.pathname}`,
            }
        });

        if (error) throw error;
        return null;
    }

    function attachSignedOutSlotHandlers(slot) {
        const button = slot.querySelector("[data-scription-signin]");
        const status = slot.querySelector("[data-scription-status]");

        if (!button) return;

        button.addEventListener("click", async () => {
            try {
                if (status) status.textContent = "Opening Discord sign-in...";
                await signInWithDiscordFallback();
            } catch (error) {
                if (status) {
                    status.textContent =
                        error instanceof Error ? error.message : "Could not start sign-in.";
                }

                console.warn("[sunder-scription-slots] Could not start sign-in:", error);
            }
        });
    }

    function renderLockedSlot(slot) {
        const label =
            slot.dataset.premiumLabel ||
            slot.dataset.premiumTitle ||
            slot.dataset.scriptionLabel ||
            slot.dataset.scriptionTitle ||
            "Scription content";

        slot.innerHTML = `
            <aside class="sunder-premium-locked sunder-scription-slot-access-required">
                <div class="sunder-scription-eyebrow">Scription</div>
                
                <strong>${escapeHtmlSafe(label)}</strong>
                
                <p>
                    This section is part of Scription, the premium Sunder rules expansion.
                </p>
                
                <p class="sunder-scription-support-copy">
                    This account does not currently have Scription access.
                </p>
                
                <div class="sunder-premium-locked-actions">
                    <a class="sunder-btn sunder-btn-primary" href="${ACTIVATE_URL}">
                        Redeem a code
                    </a>
                    
                    <a class="sunder-btn sunder-btn-secondary" href="${KOFI_URL}" target="_blank" rel="noopener">
                        Get Scription
                    </a>
                </div>
            </aside>
        `;
    }

    function renderLockedSlotIfEmpty(slot) {
        if (slotHasVisibleContent(slot)) return;
        renderLockedSlot(slot);
    }

    function renderSignedOutSlot(slot) {
        const label =
            slot.dataset.premiumLabel ||
            slot.dataset.premiumTitle ||
            slot.dataset.scriptionLabel ||
            slot.dataset.scriptionTitle ||
            "Scription content";

        slot.innerHTML = `
            <aside class="sunder-premium-locked sunder-scription-slot-auth-required">
                <div class="sunder-scription-eyebrow">Scription</div>
                
                <strong>${escapeHtmlSafe(label)}</strong>
                
                <p>
                    This section is part of Scription, the premium Sunder rules expansion.
                </p>
                
                <p class="sunder-scription-support-copy">
                    You are not signed in. Sign in first so Sunder can check whether this account already has Scription access.
                </p>
                
                <div class="sunder-premium-locked-actions">
                    <button class="sunder-btn sunder-btn-primary" type="button" data-scription-signin>
                        Sign in to check access
                    </button>
                </div>
                
                <p class="sunder-help-text" data-scription-status></p>
            </aside>
        `;

        attachSignedOutSlotHandlers(slot);
    }

    function renderLoadingSlot(slot) {
        const label =
            slot.dataset.premiumLabel ||
            slot.dataset.premiumTitle ||
            slot.dataset.scriptionLabel ||
            slot.dataset.scriptionTitle ||
            "Scription content";

        slot.innerHTML = `
            <aside class="sunder-premium-locked sunder-scription-slot-loading-card" aria-busy="true">
                <div class="sunder-scription-eyebrow">Scription</div>
                
                <strong>${escapeHtmlSafe(label)}</strong>
                
                <p>
                    Checking your sign-in status and Scription access...
                </p>
                
                <p class="sunder-help-text">
                    This section will unlock automatically if your account is a Scription member.
                </p>
            </aside>
        `;
    }

    function preserveLockedFallbacks() {
        const slots = Array.from(document.querySelectorAll(SLOT_SELECTOR))
            .filter((slot) => getSlotCode(slot));

        for (const slot of slots) {
            if (!slot.dataset.scriptionLockedHtml) {
                slot.dataset.scriptionLockedHtml = slot.innerHTML || "";
            }

            if (slot.dataset.scriptionSlotLoaded !== "true") {
                renderLoadingSlot(slot);
                markSlotState(slot, "loading");
            }
        }
    }

    function restoreLockedFallback(slot) {
        if (slot.dataset.scriptionLockedHtml) {
            slot.innerHTML = slot.dataset.scriptionLockedHtml;
        } else {
            renderLockedSlotIfEmpty(slot);
        }
    }

    function markSlotState(slot, state) {
        slot.dataset.scriptionSlotState = state;

        slot.classList.toggle("sunder-scription-slot-loading", state === 'loading');
        slot.classList.toggle("sunder-scription-slot-unlocked", state === 'unlocked');
        slot.classList.toggle('sunder-scription-slot-error', state === 'error');
        slot.classList.toggle('sunder-scription-slot-locked', state === 'locked');
        slot.classList.toggle('sunder-scription-slot-signed-out', state === 'signed-out');
        slot.classList.toggle('sunder-scription-slot-missing', state === 'missing');
    }

    function resetSlotsToSignedOut() {
        clearScriptionSlotCache();
        lastKnownUserId = null;

        const slots = Array.from(document.querySelectorAll(SLOT_SELECTOR))
            .filter((slot) => getSlotCode(slot));

        for (const slot of slots) {
            delete slot.dataset.scriptionSlotLoaded;
            delete slot.dataset.scriptionSlotLoading;

            slot.classList.remove(
                "sunder-scription-unloacked-content",
                "sunder-scription-fragment-content",
                "sunder-scription-rendered-content",
            );

            renderSignedOutSlot(slot);
            markSlotState(slot, "signed-out");
        }
    }

    function resetSlotsForSignedInRetry(session) {
        const userId = session?.user?.id || null;

        if (userId && lastKnownUserId && lastKnownUserId !== userId) {
            clearScriptionSlotCache();
        }

        lastKnownUserId = userId;

        const slots = Array.from(document.querySelectorAll(SLOT_SELECTOR))
            .filter((slot) => getSlotCode(slot));

        for (const slot of slots) {
            delete slot.dataset.scriptionSlotLoaded;
            delete slot.dataset.scriptionSlotLoading;

            if (!slot.dataset.scriptionLockedHtml) {
                slot.dataset.scriptionLockedHtml = slot.innerHTML || "";
            }

            renderLoadingSlot(slot);
            markSlotState(slot, "loading");
        }

        activateScriptionSlots();
    }

    function handleAuthChange(eventName, session) {
        if (eventName === "SIGNED_OUT" || !session) {
            resetSlotsToSignedOut();
            return;
        }

        if (
            eventName === "SIGNED_IN" ||
            eventName === "TOKEN_REFRESHED" ||
            eventName === "INITIAL_SESSION" ||
            session
        ) {
            resetSlotsForSignedInRetry(session);
        }
    }

    function subscribeToAuthEvents() {
        if (authSubscriptionAttached) return;
        authSubscriptionAttached = true;

        window.addEventListener("sunder-auth-state-change", (event) => {
            const detail = event.detail || {};
            handleAuthChange(detail.event, detail.session || null);
        });

        window.addEventListener("sunder-auth-session-synced", (event) => {
            const detail = event.detail || {};
            handleAuthChange(detail.session ? "INITIAL_SESSION" : "SIGNED_OUT", detail.session || null);
        });

        const client = getSupabaseClient();

        if (client?.auth && typeof client.auth.onAuthStateChange === "function") {
            client.auth.onAuthStateChange((event, session) => {
                handleAuthChange(event, session);
            });
        }
    }

    async function init() {
        subscribeToAuthEvents();
        preserveLockedFallbacks();
        await activateScriptionSlots();
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    if (window.document$ && typeof window.document$.subscribe === 'function') {
        window.document$.subscribe(init);
    }

    window.SUNDER_SCRIPTION_SLOTS = {
        activate: activateScriptionSlots,
        restoreLockedFallback,
    };
})();

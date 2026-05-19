(function () {
    const DEFAULT_KOFI_URL = "https://ko-fi.com/s/7a27b8b0ae";
    const DEFAULT_ACTIVATE_URL = "https://www.sunderttrpg.world/meta/activate-scription/";

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function getPageOptions(root) {
        return {
            contentCode: root.dataset.scriptionPage,
            title: root.dataset.scriptionTitle || "Scription Content",
            description:
                root.dataset.scriptionDescription ||
                "This page is part of Scription, the premium Sunder rules expansion.",
            kofiUrl: root.dataset.kofiUrl || DEFAULT_KOFI_URL,
            activateUrl: root.dataset.activateUrl ||
                (window.SUNDER_SITE?.resolvePath
                    ? window.SUNDER_SITE.resolvePath("meta/activate-scription/")
                    : DEFAULT_ACTIVATE_URL),
        };
    }

    function getSupabaseClient() {
        if (window.SUNDER_AUTH && window.SUNDER_AUTH.client) return window.SUNDER_AUTH.client;
        if (window.SUNDER_SCRIPTION && window.SUNDER_SCRIPTION.getSupabaseClient) {
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

            if (client && client.auth && typeof client.auth.getSession === 'function') {
                return client
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

    function setDocumentAccessState(state) {
        document.documentElement.classList.toggle("sunder-has-scription", state === "has-scription");
        document.documentElement.classList.toggle("sunder-no-scription", state === "no-scription");
        document.documentElement.classList.toggle("sunder-signed-out", state === "signed-out");
    }

    function renderLoadingPage(root, options) {
        root.innerHTML = `
      <section class="sunder-scription-locked-page">
        <div class="sunder-scription-eyebrow">Scription</div>
        <h2>${window.SUNDER_MARKDOWN.escapeHtml(options.title)}</h2>
        <p>Checking your account access...</p>
      </section>
    `;
    }

    function renderAuthUnavailablePage(root, options) {
        root.innerHTML = `
          <section class="sunder-scription-locked-page">
            <div class="sunder-scription-eyebrow">Scription</div>
    
            <h2>${window.SUNDER_MARKDOWN.escapeHtml(options.title)}</h2>
    
            <p>
              Sunder could not load the account checker for this page.
            </p>
            
            <p class="sunder-scription-support-copy">
              This usually means the authentication script did not expose its Supabase client.
              Try refreshing the page. If this keeps happening, the site scripts need to be checked.
            </p>
          </section>
        `;
    }

    function renderSignedOutPage(root, options) {
        root.innerHTML = `
            <section class="sunder-scription-locked-page">
              <div class="sunder-scription-eyebrow">Scription</div>
        
              <h2>${window.SUNDER_MARKDOWN.escapeHtml(options.title)}</h2>
        
              <p>
                ${window.SUNDER_MARKDOWN.escapeHtml(options.description)}
              </p>
        
              <p class="sunder-scription-support-copy">
                You are not signed in. Sunder needs you to sign in before it can check
                whether your account has Scription access.
              </p>
        
              <p class="sunder-scription-support-copy">
                If you already bought Scription or redeemed an access code, sign in with
                the same account you used to activate it.
              </p>
        
              <div class="sunder-scription-actions">
                <button class="sunder-btn sunder-btn-primary" type="button" data-scription-signin>
                  Sign in to check access
                </button>
        
                <a class="sunder-btn sunder-btn-secondary" href="${window.SUNDER_MARKDOWN.escapeHtml(options.activateUrl)}">
                  Activate an access code
                </a>
        
                <a class="sunder-btn sunder-btn-accent" href="${window.SUNDER_MARKDOWN.escapeHtml(options.kofiUrl)}" target="_blank" rel="noopener">
                  Get Scription on Ko-fi
                </a>
              </div>
        
              <p class="sunder-help-text" data-scription-status></p>
            </section>
          `;

        const signInButton = root.querySelector("[data-scription-signin]");
        const status = root.querySelector("[data-scription-status]");

        signInButton.addEventListener("click", async () => {
            try {
                status.textContent = "Opening Discord sign-in...";
                await signInWithDiscordFallback();
            } catch (error) {
                status.textContent =
                    error instanceof Error ? error.message : "Could not start sign-in.";
            }
        });
    }

    function renderLockedPage(root, options) {
        root.innerHTML = `
      <section class="sunder-scription-locked-page">
        <div class="sunder-scription-eyebrow">Scription</div>

        <h2>${window.SUNDER_MARKDOWN.escapeHtml(options.title)}</h2>

        <p>
          ${window.SUNDER_MARKDOWN.escapeHtml(options.description)}
        </p>

        <p class="sunder-scription-support-copy">
          This signed-in account does not currently have Scription access.
          Scription helps support continued Sunder development, rules revisions,
          expanded character options, GM tools, and future premium modules.
        </p>

        <div class="sunder-scription-actions">
          <a class="sunder-btn sunder-btn-primary" href="${window.SUNDER_MARKDOWN.escapeHtml(options.activateUrl)}">
            Activate an access code
          </a>

          <a class="sunder-btn sunder-btn-accent" href="${window.SUNDER_MARKDOWN.escapeHtml(options.kofiUrl)}" target="_blank" rel="noopener">
            Get Scription on Ko-fi
          </a>
        </div>
      </section>
    `;
    }

    function renderErrorPage(root, options, message) {
        root.innerHTML = `
      <section class="sunder-scription-locked-page">
        <div class="sunder-scription-eyebrow">Scription</div>

        <h2>${window.SUNDER_MARKDOWN.escapeHtml(options.title)}</h2>

        <p>
          Sunder could not finish checking this Scription page.
        </p>

        <p class="sunder-help-text">
          ${window.SUNDER_MARKDOWN.escapeHtml(message || "Try refreshing the page.")}
        </p>

        <div class="sunder-scription-actions">
          <button class="sunder-btn sunder-btn-primary" type="button" onclick="window.location.reload()">
            Reload page
          </button>

          <a class="sunder-btn sunder-btn-secondary" href="${window.SUNDER_MARKDOWN.escapeHtml(options.activateUrl)}">
            Activate Scription
          </a>
        </div>
      </section>
    `;
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

    async function signInWithDiscordFallback() {
        if (window.sunder?.auth?.requireUserOrLogin) {
            return window.sunder.auth.requireUserOrLogin();
        }

        if (window.SUNDER_AUTH?.requireUserOrLogin) {
            return window.SUNDER_AUTH.requireUserOrLogin();
        }

        if (window.SUNDER_SCRIPTION && window.SUNDER_SCRIPTION.signInWithDiscord) {
            return window.SUNDER_SCRIPTION.signInWithDiscord();
        }

        const client = getSupabaseClient();

        if (!client) {
            throw new Error("Sign-in is not ready yet. Try refreshing the page.");
        }

        const { error } = await client.auth.signInWithOAuth({
            provider: "discord",
            options: {
                redirectTo: window.SUNDER_SITE?.cleanCurrentUrl
                    ? window.SUNDER_SITE.cleanCurrentUrl()
                    : `${window.location.origin}${window.location.pathname}`,
            },
        });

        if (error) throw error;
    }

    async function fetchAccessState(helpers) {
        if (!helpers || !helpers.getAccess) {
            return {
                ok: false,
                signedOut: false,
                access: null,
                message: "Scription access helper is unavailable.",
            };
        }

        const result = await helpers.getAccess();

        if (result.error) {
            const message = result.error.message || "";

            if (
                message.toLowerCase().includes("sign in") ||
                message.toLowerCase().includes("jwt") ||
                message.toLowerCase().includes("unauthorized") ||
                message.toLowerCase().includes("authorization")
            ) {
                return {
                    ok: false,
                    signedOut: true,
                    access: null,
                    message,
                };
            }

            return {
                ok: false,
                signedOut: false,
                access: null,
                message,
            };
        }

        return {
            ok: true,
            signedOut: false,
            access: result.data,
            message: null,
        };
    }

    function renderMarkdown(root, options, payload) {
        const rawMarkdown =
            payload.markdown ||
            payload.body_markdown ||
            payload.bodyMarkdown ||
            payload.content ||
            "";

        const markdown = window.SUNDER_MARKDOWN.preprocessPremiumMarkdown(rawMarkdown, options);

        root.classList.remove("sunder-scription-locked-page");
        root.classList.add("sunder-scription-unlocked-content");

        if (!window.marked || !window.DOMPurify) {
            console.error("[sunder-scription-page] Markdown renderer missing.", {
                hasMarked: !!window.marked,
                hasDOMPurify: !!window.DOMPurify,
            });

            renderErrorPage(
                root,
                options,
                "The Markdown renderer did not load. Check that marked and DOMPurify are included before scription-page.js."
            );
            return;
        }

        window.marked.setOptions({
            gfm: true,
            breaks: true,
        });

        const unsafeHtml = window.marked.parse(markdown);

        const safeHtml = window.DOMPurify.sanitize(unsafeHtml, {
            ADD_ATTR: ["target", "rel", "class", "id", "title"],
            ADD_TAGS: ["details", "summary"],
        });

        root.innerHTML = safeHtml;

        window.SUNDER_MARKDOWN.enhanceRenderedContent(root);
    }

    async function loadProtectedPage(root) {
        const options = getPageOptions(root);

        renderLoadingPage(root, options);

        if (!options.contentCode) {
            renderErrorPage(root, options, "This page is missing its Scription content code.");
            return;
        }

        const client = await waitForAuthClient();

        if (!client || !client.auth) {
            setDocumentAccessState("auth-unavailable");
            renderAuthUnavailablePage(root, options);
            return;
        }

        let session = null;

        try {
            session = await getSession(client);
        } catch (error) {
            setDocumentAccessState("auth-unavailable");
            renderErrorPage(
                root,
                options,
                error instanceof Error ? error.message : "Could not read sign-in session."
            );
            return;
        }

        if (!session) {
            setDocumentAccessState("signed-out");
            renderSignedOutPage(root, options);
            return;
        }

        const helpers = window.SUNDER_SCRIPTION;

        if (!helpers || !helpers.getAccess) {
            renderErrorPage(
                root,
                options,
                "You are signed in, but the Scription access checker did not load. Try refreshing the page."
            );
            return;
        }

        const accessState = await fetchAccessState(helpers);

        if (accessState.signedOut) {
            setDocumentAccessState("signed-out");
            renderSignedOutPage(root, options);
            return;
        }

        if (!accessState.ok) {
            renderErrorPage(root, options, accessState.message);
            return;
        }

        if (!hasScriptionAccess(accessState.access)) {
            setDocumentAccessState("no-scription");
            renderLockedPage(root, options);
            return;
        }

        const supabaseUrl = getSupabaseUrl(client);

        const res = await fetch(
            `${supabaseUrl}/functions/v1/premium-content?contentCode=${encodeURIComponent(
                options.contentCode
            )}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            }
        );

        if (res.status === 401) {
            setDocumentAccessState("signed-out");
            renderSignedOutPage(root, options);
            return;
        }

        if (res.status === 403) {
            setDocumentAccessState("no-scription");
            renderLockedPage(root, options);
            return;
        }

        if (!res.ok) {
            const text = await res.text();
            renderErrorPage(root, options, text || `Request failed with status ${res.status}.`);
            return;
        }

        const payload = await res.json();

        setDocumentAccessState("has-scription");
        renderMarkdown(root, options, payload);
    }

    function initScriptionPages() {
        const pages = Array.from(document.querySelectorAll("[data-scription-page]"));

        for (const page of pages) {
            if (page.dataset.scriptionPageLoading === "true") continue;

            page.dataset.scriptionPageLoading = "true";

            loadProtectedPage(page)
                .catch((error) => {
                    const options = getPageOptions(page);

                    console.warn("[sunder-scription-page] Failed to load page:", error);

                    renderErrorPage(
                        page,
                        options,
                        error instanceof Error ? error.message : "Unexpected Scription page error."
                    );
                })
                .finally(() => {
                    delete page.dataset.scriptionPageLoading;
                });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initScriptionPages);
    } else {
        initScriptionPages();
    }

    if (window.document$ && typeof window.document$.subscribe === "function") {
        window.document$.subscribe(initScriptionPages);
    }
})();

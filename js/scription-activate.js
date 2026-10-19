(function() {
    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function render(root, state) {
        const kofiUrl = root.dataset.kofiUrl || "https://ko-fi.com/sunderttrpg";

        root.innerHTML = `
            <section class="sunder-scription-card">
                <h2>Redeem your Scription code</h2>
                <p>
                    Enter the access code you received after supporting Sunder.
                </p>
                
                <form id="sunder-scription-form" class="sunder-scription-form">
                    <label for="sunder-scription-code">Access code</label>
                    <input
                        id="sunder-scription-code"
                        class="sunder-input"
                        type="text"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="SUNDER-XXXX-XXXX-XXXX"
                    />
                    
                    <div class="sunder-scription-actions">
                        <button class="sunder-btn sunder-btn-primary" type="submit">
                            Activate Scription
                        </button>
                        
                        <button
                            class="sunder-btn sunder-btn-secondary"
                            type="button"
                            id="sunder-scription-signin"
                        >
                            Sign in with Discord
                        </button>
                    </div>
                    
                    <p id="sunder-scription-status" class="sunder-help-text">
                        ${escapeHtml(state.message || "")}
                    </p>
                </form>
                
                <aside class="sunder-scription-purchase">
                    <strong>Need a code?</strong>
                    <p>
                        Scription unlocks premium rules, advanced modules, and future premium additions. Your support helps us create new content for you to enjoy!
                    </p>
                    <a class="sunder-btn sunder-btn-accent" href="${escapeHtml(kofiUrl)}" target="_blank" rel="noopener">
                        Get Scription on Ko-fi
                    </a>
                </aside>
            </section>
        `;

        const form = root.querySelector("#sunder-scription-form");
        const input = root.querySelector("#sunder-scription-code");
        const status = root.querySelector("#sunder-scription-status");
        const signInButton = root.querySelector("#sunder-scription-signin");

        signInButton.addEventListener("click", async () => {
            try {
                status.textContent = "Opening Discord sign-in...";
                if (window.sunder?.auth?.requireUserOrLogin) {
                    await window.sunder.auth.requireUserOrLogin();
                } else {
                    await window.SUNDER_SCRIPTION.signInWithDiscord();
                }
            } catch (error) {
                status.textContent = error instanceof Error ? error.message : "Could not start sign-in.";
            }
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const code = input.value.trim();

            if (!code) {
                status.textContent = "Enter an access code first.";
                return;
            }

            status.textContent = "Redeeming code...";

            const result = await window.SUNDER_SCRIPTION.redeemCode(code);

            if (result.error) {
                status.textContent = result.error.message || "Could not redeem this code.";
                return;
            }

            status.textContent = "Scription activated. Reloading access...";

            const access = await window.SUNDER_SCRIPTION.getAccess();

            if (access.data && (access.data.hasScription || access.data.hasPremium)) {
                status.textContent = "Scription is active on this account.";
                document.documentElement.classList.add("sunder-has-scription");
            } else {
                status.textContent = "Code redeemed, but access did not refresh yet. "
                    + "Try reloading the page.";
            }
        });
    }

    async function init() {
        const root = document.getElementById("sunder-scription-activation");
        if (!root || !window.SUNDER_SCRIPTION) return;

        const access = await window.SUNDER_SCRIPTION.getAccess();

        if (access.data && (access.data.hasScription || access.data.hasPremium)) {
            root.innerHTML = `
                <section class="sunder-scription-card">
                    <h2>Scription is active</h2>
                    <p>Your account already has Scription access.</p>
                </section>
            `;
            document.documentElement.classList.add("sunder-has-scription");
            return;
        }

        render(root, {
            message: access.error ? "Sign in before redeeming your code." : "",
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

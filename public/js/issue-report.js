const ISSUE_API_URL = 'https://oqngifbqawctgqxgtxfl.supabase.co/functions/v1/report-bug';
const SUPABASE_ANON_JWT = '32D8C469-D89D-4206-B0A4-B0C36A22A0FE';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('issue-form');
    if (!form) return;

    const statusElement = document.getElementById('issue-status');
    const typeSelect = document.getElementById('issue-type');
    const pageInput = document.getElementById('issue-page');
    const descriptionInput = document.getElementById('issue-description');
    const contactInput = document.getElementById('issue-contact');

    // Auto-fill contact info if user is logged in
    if (contactInput && window.sunder && window.sunder.auth) {
        const userInfo = window.sunder.auth.getUserInfo();
        if (userInfo) {
            const meta = userInfo.user_metadata || {};
            const username = meta.full_name || meta.name || meta.user_name || meta.custom_claims?.global_name;
            const email = userInfo.email;
            
            // Prefer Discord username, fallback to email
            if (username && !contactInput.value) {
                contactInput.value = `Discord: ${username}`;
            } else if (email && !contactInput.value) {
                contactInput.value = email;
            }
        }
    }

    // Pre-fill page URL if provided in query params
    try {
        const params = new URLSearchParams(window.location.search);
        const quote = params.get("quote");
        const page = params.get("page");

        if (page && pageInput && !pageInput.value) {
            pageInput.value = page;
        }

        if (quote && descriptionInput && !descriptionInput.value) {
            descriptionInput.value = `"${quote}"\n\n[Please describe the issue here.]`;
        }
    } catch (_e) {
        // Ignore URL parsing errors
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!statusElement) return;

        const type = typeSelect ? typeSelect.value || 'unspecified' : 'unspecified';
        const page = pageInput ? pageInput.value.trim() : 'unspecified';
        const description = descriptionInput ? descriptionInput.value.trim() : '';
        const contact = contactInput ? contactInput.value.trim() : '';

        if (!description) {
            statusElement.textContent = 'Please describe the issue.';
            return;
        }

        const payload = {
            type,
            page,
            description,
            contact,
            url: window.location.href,
            userAgent: navigator.userAgent,
            // Once the site version is exposed globally:
            // version: window.SUNDER_VERSION || null,
        };

        statusElement.textContent = "Sending report...";

        try {
            const res = await fetch(ISSUE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_ANON_JWT,
    "Authorization": `Bearer ${SUPABASE_ANON_JWT}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            statusElement.textContent = "Thank you! Your report has been sent to the #feedback channel on Discord.";
            form.reset();
        } catch (err) {
            console.error(err);
            statusElement.textContent = "Something went wrong sending the report. Please try again later.";
        }
    });
});
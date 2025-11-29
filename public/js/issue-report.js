const ISSUE_API_URL = 'https://oqngifbqawctgqxgtxfl.supabase.co/functions/v1/report-bug';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('issue-form');
    if (!form) return;

    const statusElement = document.getElementById('issue-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!statusElement) return;

        const type = document.getElementById('issue-type').value || 'unspecified';
        const page = document.getElementById('issue-page').value.trim();
        const description = document.getElementById('issue-description').value.trim();
        const contact = document.getElementById('issue-contact').value.trim();

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
                    "Content-Type": "application/json"
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
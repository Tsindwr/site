(function () {
    async function checkScriptionAccess() {
        if (!window.SUNDER_SCRIPTION) return false;

        const result = await window.SUNDER_SCRIPTION.getAccess();

        if (result.error || !result.data) return false;

        return (
            result.data.hasScription === true ||
            result.data.hasPremium === true ||
            (Array.isArray(result.data.activeProducts) &&
                result.data.activeProducts.includes("scription"))
        );
    }

    async function initScriptionNav() {
        try {
            const hasScription = await checkScriptionAccess();

            document.documentElement.classList.toggle(
                "sunder-has-scription",
                hasScription
            );

            document.documentElement.classList.toggle(
                "sunder-no-scription",
                !hasScription
            );
        } catch (error) {
            console.warn("[sunder-scription-nav] Access check failed:", error);
            document.documentElement.classList.add("sunder-no-scription");
        }
    }

    function start() {
        initScriptionNav();
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

    // MkDocs Material instant navigation support, if enabled.
    if (window.document$ && typeof window.document$.subscribe === 'function') {
        window.document$.subscribe(start);
    }
})();
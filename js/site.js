(function () {
    window.sunder = window.sunder || {};

    function normalizeBasePath(value) {
        let base = String(value || "").trim();

        if (!base || base === "/") return "";

        base = base.replace(/^https?:\/\/[^/]+/i, "");
        base = `/${base.replace(/^\/+|\/+$/g, "")}`;

        return base === "/" ? "" : base;
    }

    function detectBasePath() {
        const path = window.location.pathname || "/";
        const host = window.location.hostname || "";

        if (
            host === "tsindwr.github.io" &&
            (path === "/site" || path.startsWith("/site/"))
        ) {
            return "/site";
        }

        const configured = normalizeBasePath(window.SUNDER_BASE_URL);
        if (configured && (path === configured || path.startsWith(`${configured}/`))) {
            return configured;
        }

        return "";
    }

    const basePath = detectBasePath();
    const baseUrl = `${window.location.origin}${basePath}/`;

    function stripBasePath(path) {
        let cleanPath = String(path || "/").split(/[?#]/)[0] || "/";
        if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;

        if (basePath && (cleanPath === basePath || cleanPath.startsWith(`${basePath}/`))) {
            cleanPath = cleanPath.slice(basePath.length) || "/";
        } else if (!basePath && cleanPath.startsWith("/site/")) {
            cleanPath = cleanPath.slice("/site".length) || "/";
        }

        return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    }

    function currentPagePath() {
        let path = stripBasePath(window.location.pathname || "/");

        if (!path.endsWith("/")) path += "/";

        return path;
    }

    function legacyPagePath(path) {
        const cleanPath = stripBasePath(path || window.location.pathname || "/");
        return `/site${cleanPath === "/" ? "/" : cleanPath}`.replace(/\/{2,}/g, "/");
    }

    function resolvePath(path) {
        const raw = String(path || "");

        if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
        if (raw.startsWith("#")) return raw;

        const [pathPart, suffix = ""] = raw.split(/([?#].*)/, 2);
        let cleanPath = pathPart.replace(/^\/+/, "");

        if (cleanPath.startsWith("site/")) cleanPath = cleanPath.slice("site/".length);

        const joined = `${basePath}/${cleanPath}`.replace(/\/{2,}/g, "/");
        let resolved = joined || "/";

        if (pathPart.endsWith("/") && !resolved.endsWith("/")) resolved += "/";
        if (!resolved.startsWith("/")) resolved = `/${resolved}`;

        return `${resolved}${suffix}`;
    }

    function resolveUrl(path) {
        return new URL(resolvePath(path), window.location.origin).toString();
    }

    function cleanCurrentUrl() {
        return resolveUrl(currentPagePath());
    }

    const api = {
        basePath,
        baseUrl,
        resolvePath,
        resolveUrl,
        cleanCurrentUrl,
        currentPagePath,
        legacyPagePath,
        stripBasePath,
    };

    window.SUNDER_SITE = api;
    window.sunder.site = api;
})();

document.addEventListener("DOMContentLoaded", () => {
    const version = window.SUNDER_VERSION;
    if (!version) return;

    const titleElement = document.querySelector(".md-header__topic");
    if (!titleElement) return;

    if (titleElement.querySelector(".sunder-version")) return;

    const span = document.createElement("span");
    span.className = "sunder-version";
    span.textContent = `v${version}`;

    titleElement.appendChild(span);

    // Also inject the version into the mobile nav drawer title (next to the logo/site name)
    const drawerTitle = document.querySelector(".md-nav__title[for='__drawer']");
    if (!drawerTitle || drawerTitle.querySelector(".sunder-nav-version")) return;

    const navSpan = document.createElement("span");
    navSpan.className = "sunder-nav-version";
    navSpan.textContent = `v${version}`;

    drawerTitle.appendChild(navSpan);
});
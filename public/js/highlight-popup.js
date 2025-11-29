(function () {
    const POP_ID = 'sunder-highlight-popover';
    let currentQuote = null;
    let currentPagePath = null;

    function getDocsContainer(node) {
        // Ensure selection is inside the docs content, not in nav/header/footer
        while (node) {
            if (node.classList && node.classList.contains("md-content")) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    function getPagePath() {
        // Try to build "Section > Subsection > Page" from the sidebar nav
        const activeLink = document.querySelector(
            ".md-nav__link.md-nav__link--active"
        );
        if (!activeLink) {
            // Fallback to document.title without site name suffix
            const title = document.title || "";
            return title.replace(/\s*[-–—]\s*.*$/, '').trim() || title;
        }

        const segments = [];

        const pageText = activeLink.textContent.trim();
        if (pageText) segments.push(pageText);

        // Walk up through nav items, collecting their link text
        let nav = activeLink.closest("nav.md-nav");
        while (nav) {
            const level = nav.getAttribute("data-md-level");

            // SKip the top-level navigation container (level 0 = "Navigation")
            if (level && level !== "0") {
                const titleElement = nav.querySelector(".md-nav__title");
                if (titleElement) {
                    const text = titleElement.textContent.trim();
                    if (text && !segments.includes(text)) {
                        segments.push(text);
                    }
                }
            }

            // Climb to the parent nav.md-nav, if any
            const parent = nav.parentElement;
            nav = parent ? parent.closest("nav.md-nav") : null;
        }

        // segments is like ["Resolution System", "Rolling Dice", "Ruleset"]
        // Reverse it to get "Ruleset > Rolling Dice > Resolution System"
        return segments.reverse().join(" > ");
    }

    function createPopover() {
        let pop = document.getElementById(POP_ID);
        if (pop) return pop;

        pop = document.createElement("div");
        pop.id = POP_ID;
        pop.className = "sunder-highlight-popover";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sunder-highlight-btn";
        btn.title = "Report an issue with this text";

        // Font Awesome icon - speech bubble with exclamation
        btn.innerHTML =
            `<i class="fa-solid fa-triangle-exclamation"></i>`;

        btn.addEventListener("click", () => {
            if (!currentQuote) return;
            const base = (window.SUNDER_BASE_URL || "").replace(/\/$/, "");
            const reportUrl = base + "/meta/report-issue/";

            const params = new URLSearchParams({
                quote: currentQuote,
                page: currentPagePath || "",
            });

            window.location.href = reportUrl + "?" + params.toString();
        });

        pop.appendChild(btn);
        document.body.appendChild(pop);
        return pop;
    }

    function hidePopover() {
        const pop = document.getElementById(POP_ID);
        if (pop) {
            pop.style.opacity = "0";
            pop.style.pointerEvents = "none";
        }

        currentQuote = null;
        currentPagePath = null;
    }

    function showPopoverForSelection() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            hidePopover();
            return;
        }

        const text = selection.toString().trim();
        if (!text || text.length < 3) {
            hidePopover();
            return;
        }

        const range = selection.getRangeAt(0);
        const containerNode =
            range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
                ? range.commonAncestorContainer
                : range.commonAncestorContainer.parentElement;

        if (!getDocsContainer(containerNode)) {
            hidePopover();
            return;
        }

        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            hidePopover();
            return;
        }

        currentQuote = text;
        currentPagePath = getPagePath();

        const pop = createPopover();
        const scrollX = window.scrollY || document.documentElement.scrollTop;
        const scrollY = window.scrollX || document.documentElement.scrollLeft;

        const top = rect.top + scrollY - pop.offsetHeight - 8;
        const left = rect.left + scrollX + rect.width / 2 - pop.offsetWidth / 2;

        pop.style.top = `${Math.max(top, scrollY + 8)}px`;
        pop.style.left = `${Math.max(left, scrollX + 8)}px`;
        pop.style.opacity = "1";
        pop.style.pointerEvents = "auto";
    }

    // Listen for mouseup and keyup (keyboard selection)
    document.addEventListener("mouseup", () => {
        setTimeout(showPopoverForSelection, 10);
    });

    document.addEventListener("keyup", (e) => {
        // After keyboard-based selection (Shift+Arrow, etc.)
        if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            setTimeout(showPopoverForSelection, 10);
        }
    });

    // Hide popover on scroll or clicking elsewhere
    document.addEventListener("mousedown", (e) => {
        const pop = document.getElementById(POP_ID);
        if (!pop) return;
        if (!pop.contains(e.target)) {
            // clicking outside popover - clear selection and hide
            const selection = window.getSelection();
            if (selection) selection.removeAllRanges();
            hidePopover();
        }
    });
})();
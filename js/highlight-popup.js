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

    function getSectionUrlFromSelection() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            return window.location.href;
        }

        const range = selection.getRangeAt(0);
        let node = range.commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentElement;
        }

        function isHeading(el) {
            return !!el && el.tagName && /^H[1-6]$/i.test(el.tagName);
        }

        let heading = null;
        let element = node;

        while (element && element !== document.body) {
            if (isHeading(element) && element.id) {
                heading = element;
                break;
            }
            element = element.parentElement;
        }

        // If no heading ancestor, look backwards through siblings
        if (!heading) {
            element = node;
            while (element && element !== document.body && !heading) {
                let sib = element.previousElementSibling;
                while (sib && !heading) {
                    if (isHeading(sib) && sib.id) {
                        heading = sib;
                        break;
                    }
                    sib = sib.previousElementSibling;
                }
                element = element.parentElement;
            }
        }

        const base = window.location.href.split('#')[0];
        if (heading && heading.id) {
            return `${base}#${heading.id}`;
        }
        return base;
    }

    function createLinkButton() {
        const linkBtn = document.createElement("button");
        linkBtn.type = "button";
        linkBtn.className = "sunder-highlight-btn sunder-highlight-btn--link";
        linkBtn.title = "Copy link to this section";

        linkBtn.innerHTML =
            `<i class="fa-solid fa-link"></i>`;

        linkBtn.addEventListener("click", async () => {
            const urlToCopy = getSectionUrlFromSelection();

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(urlToCopy);
                } else {
                    // Fallback for older browsers
                    const tmp = document.createElement("textarea");
                    tmp.value = urlToCopy;
                    tmp.style.position = "fixed";
                    tmp.style.left = "-9999px";
                    document.body.appendChild(tmp);
                    tmp.select();
                    document.execCommand("copy");
                    document.body.removeChild(tmp);
                }

                linkBtn.title = "Link copied!";
                linkBtn.innerHTML =
                    `<i class="fa-solid fa-check"></i>`;
                setTimeout(() => {
                    linkBtn.innerHTML =
                        `<i class="fa-solid fa-link"></i>`;
                    linkBtn.title = "Copy link to this section";
                }, 2000);
            } catch (err) {
                console.error("Failed to copy link: ", err);
                linkBtn.innerHTML =
                    `<i class="fa-solid fa-xmark"></i>`;
                linkBtn.title = "Failed to copy link";
                setTimeout(() => {
                    linkBtn.innerHTML =
                        `<i class="fa-solid fa-link"></i>`;
                    linkBtn.title = "Copy link to this section";
                }, 2000);
            }
        });

        return linkBtn;
    }

    function createCopyButton() {
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "sunder-copy-btn";
        copyBtn.title = "Copy highlighted text to clipboard";
        copyBtn.innerHTML =
            `<i class="fa-solid fa-clone"></i>`;

        copyBtn.addEventListener("click", async () => {
            if (!currentQuote) return;
            try {
                await navigator.clipboard.writeText(currentQuote);
                copyBtn.title = "Copied!";
                copyBtn.innerHTML =
                    `<i class="fa-solid fa-check"></i>`;
                setTimeout(() => {
                    copyBtn.innerHTML =
                        `<i class="fa-solid fa-clone"></i>`;
                    copyBtn.title = "Copy highlighted text to clipboard";
                }, 2000);
            } catch (err) {
                console.error("Failed to copy text: ", err);
                copyBtn.innerHTML =
                    `<i class="fa-solid fa-xmark"></i>`;
                copyBtn.title = "Failed to copy text";
                setTimeout(() => {
                    copyBtn.innerHTML =
                        `<i class="fa-solid fa-clone"></i>`;
                    copyBtn.title = "Copy highlighted text to clipboard";
                }, 2000);
            }
        });
        return copyBtn;
    }

    function createReportButton(pop) {
        pop = document.createElement("div");
        pop.id = POP_ID;
        pop.className = "sunder-highlight-popover";

        const reportBtn = document.createElement("button");
        reportBtn.type = "button";
        reportBtn.className = "sunder-highlight-btn";
        reportBtn.title = "Report an issue with this text";

        // Font Awesome icon - speech bubble with exclamation
        reportBtn.innerHTML =
            `<i class="fa-solid fa-triangle-exclamation"></i>`;

        reportBtn.addEventListener("click", () => {
            if (!currentQuote) return;
            const base = (window.SUNDER_BASE_URL || "").replace(/\/$/, "");
            const reportUrl = base + "/meta/report-issue/";

            const params = new URLSearchParams({
                quote: currentQuote,
                page: currentPagePath || "",
            });

            window.location.href = reportUrl + "?" + params.toString();
        });
        return {pop, reportBtn};
    }

    function createPopover() {
        let pop = document.getElementById(POP_ID);
        if (pop) return pop;

        const __ret = createReportButton(pop);
        pop = __ret.pop;
        const reportBtn = __ret.reportBtn;

        pop.appendChild(createCopyButton());
        pop.appendChild(reportBtn);
        pop.appendChild(createLinkButton());
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
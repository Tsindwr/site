window.sunder = window.sunder || {};
(function () {
    const POP_ID = 'sunder-highlight-popover';
    const MODAL_ID = 'sunder-question-modal';
    const QUESTION_API_URL = 'https://oqngifbqawctgqxgtxfl.supabase.co/functions/v1/ask-question';
    
    let currentQuote = null;
    let currentPagePath = null;
    let currentPage = null;
    let currentSectionUrl = null;
    let savedSelection = null;
    let selectionUpdateTimer = null;
    let useMobileHighlightUi = false;

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

    function getPage() {
        const title = document.title || "";
        return title.replace(/\s*[-–—]\s*.*$/, '').trim() || title;
    }

    function getPagePath() {
        // Try to build "Section > Subsection > Page" from the sidebar nav
        const activeLink = document.querySelector(
            ".md-nav__link.md-nav__link--active"
        );
        if (!activeLink) {
            // Fallback to document.title without site name suffix
            return getPage();
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
        if (window.sunder && window.sunder.auth && window.sunder.auth.getCurrentUser() !== null) {
            pop.appendChild(createBookmarkButton());
        }
        pop.appendChild(createAskButton());
        pop.appendChild(reportBtn);
        pop.appendChild(createLinkButton());
        document.body.appendChild(pop);
        return pop;
    }

    function hidePopover() {
        const pop = document.getElementById(POP_ID);
        if (pop) {
            pop.classList.remove("sunder-highlight-popover--mobile");
            pop.style.opacity = "0";
            pop.style.pointerEvents = "none";
            pop.style.top = "";
            pop.style.left = "";
            pop.style.bottom = "";
        }

        currentQuote = null;
        currentPagePath = null;
        currentSectionUrl = null;
    }

    // ==================== Question Modal ====================

    function createQuestionModal() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = MODAL_ID;
        modal.className = "sunder-question-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "sunder-question-title");

        modal.innerHTML = `
            <div class="sunder-question-modal-backdrop"></div>
            <div class="sunder-question-modal-content" role="document">
                <h2 id="sunder-question-title" class="sunder-question-modal-title">
                    <i class="fa-solid fa-circle-question"></i>
                    Ask a Question
                </h2>
                <button type="button" class="sunder-question-modal-close" aria-label="Close dialog">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                
                <div class="sunder-question-form-row">
                    <label>Quoted Text</label>
                    <div class="sunder-question-quote-container">
                        <blockquote id="sunder-question-quote" class="sunder-question-quote"></blockquote>
                        <button type="button" id="sunder-question-expand-btn" class="sunder-question-expand-btn" style="display: none;">
                            Show more
                        </button>
                    </div>
                </div>
                
                <div class="sunder-question-form-row">
                    <label>Page</label>
                    <div id="sunder-question-page" class="sunder-question-page"></div>
                </div>
                
                <div class="sunder-question-form-row">
                    <label for="sunder-question-text">Your Question <span class="sunder-required">*</span></label>
                    <textarea 
                        id="sunder-question-text" 
                        class="sunder-input sunder-textarea"
                        placeholder="What would you like to ask about this text?"
                        required
                    ></textarea>
                </div>
                
                <div class="sunder-question-form-row">
                    <label for="sunder-question-contact">Contact (optional)</label>
                    <input 
                        type="text" 
                        id="sunder-question-contact" 
                        class="sunder-input"
                        placeholder="Discord tag, email, etc."
                    />
                    <div class="sunder-help-text">Optional: provide a way for us to follow up with you.</div>
                </div>
                
                <div id="sunder-question-status" class="sunder-question-status"></div>
                
                <div class="sunder-question-modal-actions">
                    <button type="button" id="sunder-question-cancel" class="sunder-btn sunder-btn-secondary">
                        Cancel
                    </button>
                    <button type="button" id="sunder-question-submit" class="sunder-btn sunder-btn-primary">
                        <i class="fa-solid fa-paper-plane"></i>
                        Send Question
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup event listeners
        const backdrop = modal.querySelector(".sunder-question-modal-backdrop");
        const closeBtn = modal.querySelector(".sunder-question-modal-close");
        const cancelBtn = modal.querySelector("#sunder-question-cancel");
        const submitBtn = modal.querySelector("#sunder-question-submit");
        const expandBtn = modal.querySelector("#sunder-question-expand-btn");

        backdrop.addEventListener("click", closeQuestionModal);
        closeBtn.addEventListener("click", closeQuestionModal);
        cancelBtn.addEventListener("click", closeQuestionModal);
        submitBtn.addEventListener("click", submitQuestion);

        expandBtn.addEventListener("click", () => {
            const quoteEl = modal.querySelector("#sunder-question-quote");
            const isExpanded = quoteEl.classList.contains("expanded");
            quoteEl.classList.toggle("expanded");
            expandBtn.textContent = isExpanded ? "Show more" : "Show less";
        });

        // Keyboard handling
        modal.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeQuestionModal();
            }
            // Focus trap
            if (e.key === "Tab") {
                trapFocus(e, modal);
            }
        });

        return modal;
    }

    function trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                lastEl.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastEl) {
                firstEl.focus();
                e.preventDefault();
            }
        }
    }

    function openQuestionModal() {
        if (!currentQuote) return;

        // Save values before hidePopover clears them
        const savedQuote = currentQuote;
        const savedPagePath = currentPagePath;

        // Save the selection before opening modal
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedSelection = selection.getRangeAt(0).cloneRange();
        }

        currentSectionUrl = getSectionUrlFromSelection();
        
        // Hide the popover (this clears currentQuote and currentPagePath)
        hidePopover();
        
        // Restore the saved values for use in the modal
        currentQuote = savedQuote;
        currentPagePath = savedPagePath;

        const modal = createQuestionModal();
        
        // Populate modal content
        const quoteEl = modal.querySelector("#sunder-question-quote");
        const pageEl = modal.querySelector("#sunder-question-page");
        const expandBtn = modal.querySelector("#sunder-question-expand-btn");
        const questionInput = modal.querySelector("#sunder-question-text");
        const contactInput = modal.querySelector("#sunder-question-contact");
        const statusEl = modal.querySelector("#sunder-question-status");

        // Display quote (truncate if too long)
        const truncateLength = 300;
        if (currentQuote.length > truncateLength) {
            quoteEl.textContent = currentQuote;
            quoteEl.classList.remove("expanded");
            expandBtn.style.display = "inline-block";
            expandBtn.textContent = "Show more";
        } else {
            quoteEl.textContent = currentQuote;
            quoteEl.classList.add("expanded");
            expandBtn.style.display = "none";
        }

        pageEl.textContent = currentPagePath || window.location.pathname;
        
        // Reset form
        questionInput.value = "";
        contactInput.value = "";
        statusEl.textContent = "";
        statusEl.className = "sunder-question-status";

        // Auto-fill contact info if user is logged in
        if (window.sunder && window.sunder.auth) {
            const displayName = window.sunder.auth.getUserDisplayName();
            if (displayName) {
                contactInput.value = displayName;
                contactInput.disabled = true;
            }
        }

        // Show modal
        modal.classList.add("open");
        document.body.style.overflow = "hidden";

        // Focus the question textarea
        setTimeout(() => {
            questionInput.focus();
        }, 100);
    }

    function closeQuestionModal() {
        const modal = document.getElementById(MODAL_ID);
        if (modal) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }

        // Restore selection if possible
        if (savedSelection) {
            try {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(savedSelection);
            } catch (_e) {
                // Ignore if we can't restore selection
            }
            savedSelection = null;
        }
    }

    async function submitQuestion() {
        const modal = document.getElementById(MODAL_ID);
        if (!modal) return;

        const questionInput = modal.querySelector("#sunder-question-text");
        const contactInput = modal.querySelector("#sunder-question-contact");
        const statusEl = modal.querySelector("#sunder-question-status");
        const submitBtn = modal.querySelector("#sunder-question-submit");
        const quoteEl = modal.querySelector("#sunder-question-quote");

        const questionText = questionInput.value.trim();
        const quoteText = quoteEl ? quoteEl.textContent.trim() : "";

        if (!questionText) {
            statusEl.textContent = "Please enter your question.";
            statusEl.className = "sunder-question-status sunder-question-status--error";
            questionInput.focus();
            return;
        }

        if (!quoteText) {
            statusEl.textContent = "No quoted text found. Please re-select the text you want to ask about.";
            statusEl.className = "sunder-question-status sunder-question-status--error";
            return;
        }

        const payload = {
            quote: quoteText,
            pagePath: currentPagePath || window.location.pathname,
            sectionUrl: currentSectionUrl || window.location.href,
            question: questionText,
            contact: contactInput.value.trim() || null,
            userAgent: navigator.userAgent,
            version: window.SUNDER_VERSION || null,
        };

        statusEl.textContent = "Sending your question...";
        statusEl.className = "sunder-question-status";
        submitBtn.disabled = true;

        try {
            const res = await fetch(QUESTION_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Ask-question API error:", res.status, errorText);
                throw new Error(`API error: ${res.status} - ${errorText}`);
            }

            // Success
            closeQuestionModal();
            showToast("Your question has been sent to The Archivist.");
        } catch (err) {
            console.error("Failed to submit question:", err);
            statusEl.textContent = "Something went wrong. Please try again later, or reach out directly on Discord.";
            statusEl.className = "sunder-question-status sunder-question-status--error";
        } finally {
            submitBtn.disabled = false;
        }
    }

    function showToast(message) {
        // Remove existing toast if any
        const existingToast = document.querySelector(".sunder-toast");
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement("div");
        toast.className = "sunder-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.innerHTML = `
            <i class="fa-solid fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add("visible");
        }, 10);

        // Remove after delay
        setTimeout(() => {
            toast.classList.remove("visible");
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    // ==================== Ask Button ====================

    function createAskButton() {
        const askBtn = document.createElement("button");
        askBtn.type = "button";
        askBtn.className = "sunder-highlight-btn sunder-highlight-btn--ask";
        askBtn.title = "Ask a question about this text";

        askBtn.innerHTML = `<i class="fa-solid fa-circle-question"></i>`;

        askBtn.addEventListener("click", () => {
            openQuestionModal();
        });

        return askBtn;
    }

    // ==================== Bookmark Button ====================


    function createBookmarkButton() {
        const bookmarkBtn = document.createElement("button");
        bookmarkBtn.type = "button";
        bookmarkBtn.className = "sunder-highlight-btn sunder-highlight-btn--bookmark";
        bookmarkBtn.title = "Bookmark this highlight";

        bookmarkBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`

        bookmarkBtn.addEventListener("click", () => {
            if (!currentQuote) {
                console.warn("No current quote to bookmark.");
                return;
            }
            if (!currentSectionUrl) {
                console.error("No current section URL.");
                return;
            }
            if (!currentPage) {
                console.error("No current page title.");
                return;
            }

            const bookmarks = window.sunder && window.sunder.bookmarks;
            if (!bookmarks || !bookmarks.openBookmarkDialog) {
                console.error("Bookmarks helper not available.");
                return;
            }

            bookmarks.openBookmarkDialog({
                quote: currentQuote,
                pageUrl: currentSectionUrl,
                pageTitle: currentPage
            });
        });

        return bookmarkBtn;
    }

    function addBookmark() {
        return;
    }

    // ==================== Main Logic ====================

    function isMobileSelectionMode() {
        if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
            return true;
        }
        if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) {
            return true;
        }
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }

    function scheduleSelectionCheck(delay) {
        if (selectionUpdateTimer) {
            clearTimeout(selectionUpdateTimer);
        }
        selectionUpdateTimer = setTimeout(showPopoverForSelection, delay);
    }

    function showPopoverForSelection() {
        const modal = document.getElementById(MODAL_ID);
        if (modal && modal.classList.contains("open")) {
            return;
        }

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
        currentPage = getPage();
        currentSectionUrl = getSectionUrlFromSelection();
        currentPagePath = getPagePath();

        const pop = createPopover();
        if (useMobileHighlightUi) {
            pop.classList.add("sunder-highlight-popover--mobile");
            pop.style.top = "";
            pop.style.left = "";
            pop.style.bottom = "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)";
        } else {
            pop.classList.remove("sunder-highlight-popover--mobile");
            const scrollX = window.scrollX || document.documentElement.scrollLeft;
            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const top = rect.top + scrollY - pop.offsetHeight - 8;
            const left = rect.left + scrollX + rect.width / 2 - pop.offsetWidth / 2;

            pop.style.bottom = "";
            pop.style.top = `${Math.max(top, scrollY + 8)}px`;
            pop.style.left = `${Math.max(left, scrollX + 8)}px`;
        }

        pop.style.opacity = "1";
        pop.style.pointerEvents = "auto";
    }

    useMobileHighlightUi = isMobileSelectionMode();
    window.addEventListener("resize", () => {
        useMobileHighlightUi = isMobileSelectionMode();
    });

    // Listen for mouseup and keyup (keyboard selection)
    document.addEventListener("mouseup", () => {
        scheduleSelectionCheck(10);
    });

    // Mobile text selection (long press / drag handles)
    document.addEventListener("touchend", () => {
        scheduleSelectionCheck(40);
    }, { passive: true });

    // Reliable fallback for browsers that update selection asynchronously.
    document.addEventListener("selectionchange", () => {
        if (!useMobileHighlightUi) return;
        scheduleSelectionCheck(60);
    });

    document.addEventListener("keyup", (e) => {
        // After keyboard-based selection (Shift+Arrow, etc.)
        if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            scheduleSelectionCheck(10);
        }
    });

    // Hide popover on scroll or clicking elsewhere
    document.addEventListener("mousedown", (e) => {
        const pop = document.getElementById(POP_ID);
        const modal = document.getElementById(MODAL_ID);
        
        if (!pop) return;
        
        // Don't hide popover if clicking inside the modal
        if (modal && modal.contains(e.target)) return;
        
        if (!pop.contains(e.target)) {
            // clicking outside popover - clear selection and hide
            const selection = window.getSelection();
            if (selection) selection.removeAllRanges();
            hidePopover();
        }
    });

    document.addEventListener("touchstart", (e) => {
        const pop = document.getElementById(POP_ID);
        const modal = document.getElementById(MODAL_ID);

        if (!pop) return;
        if (modal && modal.contains(e.target)) return;

        if (!pop.contains(e.target)) {
            const selection = window.getSelection();
            if (selection) selection.removeAllRanges();
            hidePopover();
        }
    }, { passive: true });
})();

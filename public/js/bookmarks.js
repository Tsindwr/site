window.sunder = window.sunder || {};
window.sunder.bookmarks = (function () {
    const auth = window.sunder.auth;
    const supabase = auth && auth.client;

    if (!supabase) {
        console.error("Supabase client not available for bookmarks.");
    }

    async function addBookmark({ quote, pageUrl, pageTitle }) {
        if (!supabase || !auth) return;

        quote = (quote || "").trim();
        if (!quote) {
            alert("Cannot save an empty bookmark.");
            return;
        }

        const user = await auth.requireUserOrLogin();
        if (!user) return;

        const payload = {
            user_id: user.id,
            page_url: pageUrl || window.location.href,
            page_title: pageTitle || document.title,
            quote
        };

        const { error } = await supabase
            .from("bookmarks")
            .insert(payload);
        if (error) {
            console.error("Error inserting bookmark:", error);
            alert("Failed to save bookmark.");
            return;
        }

        console.log("Bookmark saved", payload);
    }

    async function fetchBookmarks() {
        if (!supabase || !auth) return [];

        const user = await auth.requireUserOrLogin();
        if (!user) return [];

        const { data, error } = await supabase
            .from("bookmarks")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Error loading bookmarks:", error);
            return [];
        }

        return data || [];
    }

    async function deleteBookmark(id) {
        console.log("Deleting bookmark", id);
        if (!supabase || !auth) {
            console.warn("Supabase or auth not available for deleting bookmark.");
            return;
        }
        const user = await auth.requireUserOrLogin();
        if (!user) {
            console.warn("No user logged in for deleting bookmark.");
            return;
        }

        const { data, error } = await supabase
            .from("bookmarks")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
            .select("id");

        console.log("Deleted bookmarks:", data);

        if (error) {
            console.error("Error deleting bookmark:", error);
            alert("Failed to delete bookmark.");
        }
    }

    // -------- Modal: "Add Bookmark" from highlight --------
    let modalEl = null;

    function ensureModal() {
        if (modalEl) return modalEl;

        modalEl = document.createElement("div");
        modalEl.className = "bookmark-modal-backdrop bookmark-modal-hidden";
        modalEl.innerHTML = `
            <div class="bookmark-modal">
                <div class="bookmark-modal-header">
                    <h2 class="bookmark-modal-title">Add bookmark</h2>
                    <button type="button" class="btn-close" aria-label="Close"></button>
                </div>
                <div class="bookmark-modal-body">
                    <label class="form-label">Selected text</label>
                    <blockquote class="bookmark-modal-quote" id="bm-modal-quote"></blockquote>
                    
                    <label class="form-label" for="bm-modal-note">Optional note</label>
                    <textarea id="bm-modal-note" class="form-control" rows="2" 
                        placeholder="Add a quick note for later..."></textarea>
                    </div>    
                    <div class="bookmark-modal-footer">
                        <button type="button" class="btn btn-secondary" id="bm-modal-cancel">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" id="bm-modal-save">
                            Save Bookmark
                        </button>
                    </div>
            </div>
        `;
        document.body.appendChild(modalEl);

        const closeBtn = modalEl.querySelector(".btn-close")
        const cancelBtn = modalEl.querySelector("#bm-modal-cancel");

        function hide() {
            modalEl.classList.add("bookmark-modal-hidden");
        }

        closeBtn.addEventListener("click", hide);
        cancelBtn.addEventListener("click", hide);

        modalEl.addEventListener("click", (e) => {
            if (e.target === modalEl) hide();
        });

        return modalEl;
    }

    function openBookmarkDialog({ quote, pageUrl, pageTitle }) {
        quote = (quote || "").trim();
        if (!quote) return;

        const el = ensureModal();
        const quoteEl = document.getElementById("bm-modal-quote");
        const noteEl = document.getElementById("bm-modal-note");
        const saveBtn = document.getElementById("bm-modal-save");

        quoteEl.textContent = `"${quote}"`;
        noteEl.value = "";

        const saveHandler = async () => {
            const note = noteEl.value.trim();
            const fullQuote = note ? `${quote}\n\n[Note] ${note}` : quote;

            await addBookmark({
                quote: fullQuote,
                pageUrl,
                pageTitle,
            });

            el.classList.add("bookmark-modal-hidden");
        };

        // Remove any old handler, then add fresh one
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        const newSaveBtn = document.getElementById("bm-modal-save");
        newSaveBtn.addEventListener("click", saveHandler);

        el.classList.remove("bookmark-modal-hidden");
    }

    // ---------- Page renderer for /bookmarks/ ----------

    document.addEventListener("DOMContentLoaded", async () => {
        const root = document.getElementById("bookmarks-root");
        const meta = document.getElementById("bookmarks-meta");
        const searchInput = document.getElementById("bookmarks-search");

        if (!root) return;

        let allBookmarks = [];
        let filteredBookmarks = [];

        function renderEmpty(message) {
            root.innerHTML = `<p>${message}</p>`;
            if (meta) meta.textContent = "";
        }

        function applyFilter() {
            const term = (searchInput?.value || "").toLowerCase().trim();
            if (!term) {
                filteredBookmarks = allBookmarks.slice();
            } else {
                filteredBookmarks = allBookmarks.filter((bm) => {
                    return (
                        (bm.quote || "").toLowerCase().includes(term) ||
                        (bm.page_title || "").toLowerCase().includes(term) ||
                        (bm.page_url || "").toLowerCase().includes(term)
                    );
                });
            }
            renderList();
        }

        /*
         // if quote has '\n\n[Note].*', separate that into note and quote
         */
        function separateNoteFromQuote(quote) {
            const noteMarker = '\n\n[Note]';
            const noteIndex = quote.indexOf(noteMarker);
            if (noteIndex === -1) {
                return { quote: quote, note: "" };
            } else {
                const mainQuote = quote.substring(0, noteIndex).trim();
                const note = quote.substring(noteIndex + noteMarker.length).trim();
                return { quote: mainQuote, note: note };
            }
        }

        function renderList() {
            if (!filteredBookmarks.length) {
                renderEmpty("No bookmarks match your search yet.");
                return;
            }

            root.innerHTML = "";
            if (meta) {
                meta.textContent = `${filteredBookmarks.length} bookmark${
                    filteredBookmarks.length === 1 ? "" : "s"
                }`;
            }

            filteredBookmarks.forEach((bm) => {
                const card = document.createElement("article");
                card.className = "bookmark-card card";

                const header = document.createElement("div");
                header.className = "bookmark-card-header";

                const title = document.createElement("a");
                title.className = 'bookmark-card-title';
                title.href = bm.page_url || "#";
                title.textContent = bm.page_title || "Untitled page";

                const badge = document.createElement("span");
                badge.className = "badge bg-secondary bookmark-card-badge";
                const dt = bm.created_at ? new Date(bm.created_at) : null;
                badge.textContent = dt ? dt.toLocaleString() : "Saved";

                header.appendChild(title);
                header.appendChild(badge);

                const body = document.createElement("div");
                body.className = "bookmark-card-body";

                const quote = document.createElement("blockquote");
                quote.className = "bookmark-card-quote";
                body.appendChild(quote);

                const { quote: quoteText, note } = separateNoteFromQuote(bm.quote || "");
                quote.textContent = quoteText || "";
                if (note && note.trim()) {
                    const noteWrapper = document.createElement("div");
                    noteWrapper.className = "bookmark-card-note";

                    const noteLabel = document.createElement("span");
                    noteLabel.className = "bookmark-card-note-label";
                    noteLabel.textContent = "Note:";

                    const noteText = document.createElement("p");
                    noteText.className = "bookmark-card-note-text";
                    noteText.textContent = note.trim();

                    noteWrapper.appendChild(noteLabel);
                    noteWrapper.appendChild(noteText);
                    body.appendChild(noteWrapper);
                }

                const footer = document.createElement("div");
                footer.className = "bookmark-card-footer";

                const openLink = document.createElement("a");
                openLink.href = bm.page_url || "#";
                openLink.className = "btn btn-sm btn-outline-primary";
                openLink.textContent = "Open";

                const delBtn = document.createElement("button");
                delBtn.type = "button";
                delBtn.className = "btn btn-sm btn-link text-danger";
                delBtn.textContent = "Delete";
                delBtn.addEventListener("click", async () => {
                    if (!confirm("Delete this bookmark?")) return;
                    await deleteBookmark(bm.id);
                    allBookmarks = allBookmarks.filter((x) => x.id !== bm.id);
                    applyFilter();
                });

                footer.appendChild(openLink);
                footer.appendChild(delBtn);

                card.append(header);
                card.append(body);
                card.append(footer);

                root.appendChild(card);
            });
        }

        root.innerHTML = "<p>Loading your bookmarks...</p>";

        allBookmarks = await fetchBookmarks();
        if (!allBookmarks.length) {
            renderEmpty("You don't have any bookmarks yet. Highlight text and add one from the popover.");
            return;
        }

        filteredBookmarks = allBookmarks.slice();
        renderList();

        if (searchInput) {
            searchInput.addEventListener("change", () => {
                applyFilter();
            });
        }
    });

    return {
        addBookmark,
        openBookmarkDialog,
        fetchBookmarks,
        deleteBookmark,
    };
})();
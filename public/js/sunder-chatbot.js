(function() {
    const state = {
        open: false,
        mode: 'rules',
        index: null,
        chunks: null,
        glossary: null,
        loaded: false,
    };

    const els = {
        launcher: null,
        panel: null,
        close: null,
        messages: null,
        form: null,
        textarea: null,
        modeButton: null,
        modeLabel: null,
        modeMenu: null,
    };

    async function loadData() {
        if (state.loaded) return;
        const base = window.SUNDER_CHAT_BASE || '/chat';
        const [indexRes, chunksRes, glossaryRes] = await Promise.all([
            fetch(`${base}/index.json`),
            fetch(`${base}/chunks.json`),
            fetch(`${base}/glossary.json`),
        ]);
        state.index = await indexRes.json();
        state.chunks = await chunksRes.json();
        state.glossary = await glossaryRes.json();
        state.loaded = true;
    }

    function normalize(text) {
        return text.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
    }

    function expandQueryTokens(query) {
        const baseTokens = normalize(query).split(" ").filter(Boolean);
        const expanded = new Set(baseTokens);

        for (const token of baseTokens) {
            const aliases = state.glossary?.[token];
            if (Array.isArray(aliases)) {
                aliases.forEach(alias => normalize(alias).split(" ").forEach(t => expanded.add(t)));
            }
        }

        return [...expanded];
    }

    function scoreEntry(entry, tokens, mode) {
        let score = 0;
        const hay = [
            entry.title || "",
            entry.heading || '',
            ...(entry.tokens || [])
        ].join(" ").toLowerCase();

        for (const token of tokens) {
            if (entry.title?.toLowerCase().includes(token)) score += 8;
            if (entry.heading?.toLowerCase().includes(token)) score += 5;
            if (hay.includes(token)) score += 2;
        }

        if (entry.mode?.includes(mode)) score += 4;
        return score;
    }

    function search(query, mode) {
        const tokens = expandQueryTokens(query);
        return (state.index.entries || [])
            .map(entry => ({ entry, score: scoreEntry(entry, tokens, mode) }))
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(x => ({
                ...x.entry,
                chunk: state.chunks[x.entry.id]
            }))
            .filter(x => x.chunk);
    }

    function synthesizeAnswer(query, results, mode) {
        if (!results.length) {
            return {
                text: "I couldn't find a strong match in the current Sunder docs for that. Try a more specific rule term, action name, or lore noun.",
                sources: []
            };
        }

        const top = results.slice(0, 3);

        if (mode === 'builder') {
            return {
                text:
                    "Here's the closes rules-grounded starting point for that ability idea. I pulled the most relevant building blocks below, but this should still be treated as a draft rather than a final ruling.",
                sources: top.map(r => ({
                    label: r.chunk.pageTitle,
                    url: r.chunk.url
                })),
                excerpts: top.map(r.chunk.text)
            };
        }

        if (mode === 'lore') {
            return {
                text: top[0].chunk.text.slice(0, 420),
                sources: top.map(r => ({
                    label: r.chunk.pageTitle,
                    url: r.chunk.url
                }))
            };
        }

        return {
            text: top[0].chunk.text.slice(0, 420),
            sources: top.map(r => ({
                label: r.chunk.pageTitle,
                url: r.chunk.url
            }))
        };
    }

    function appendMessage(role, html) {
        const msg = document.createElement("div");
        msg.className = `sunder-chatbot-msg sunder-chatbot-msg--${role}`;
        msg.innerHTML = html;
        els.messages.appendChild(msg);
        els.messages.scrollTop = els.messages.scrollHeight;
    }

    function renderSources(sources) {
        if (!sources?.length) return "";
        return `
            <div class="sunder-chatbot-sources">
                ${sources.map(s => `<a class="sunder-chatbot-source" href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join("")}
            </div>
        `;
    }

    async function handleSubmit(evt) {
        evt.preventDefault();
        const query = els.textarea.value.trim();
        if (!query) return;

        appendMessage("user", query);
        els.textarea.value = "";

        await loadData();
        const results = search(query, state.mode);
        const answer = synthesizeAnswer(query, results, state.mode);

        let body = `<div>${answer.text}</div>`;
        if (answer.excerpts?.length) {
            body += `<details><summary>Relevant rules text</summary>${answer.excerpts.map(x => `<p>${x}</p>`).join("")}</details>`;
        }
        body += renderSources(answer.sources);

        appendMessage("assistant", body);
    }

    function setMode(mode) {
        state.mode = mode;
        els.modeLabel.textContent =
            mode === 'builder' ? 'Ability Builder' :
            mode === 'lore' ? 'Lore' : 'Rules';
        els.modeMenu.hidden = true;
        els.modeButton.setAttribute('aria-expanded', 'false');
    }

    function openPanel() {
        state.open = true;
        els.panel.hidden = false;
        els.launcher.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add("sunder-chatbot-open");
        requestAnimationFrame(() => els.textarea.focus());
    }

    function closePanel() {
        state.open = false;
        els.panel.hidden = true;
        els.launcher.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove("sunder-chatbot-open");
    }

    function init() {
        els.launcher = document.getElementById("sunder-chatbot-launcher");
        els.panel = document.getElementById("sunder-chatbot-panel");
        els.close = document.getElementById("sunder-chatbot-close");
        els.messages = document.getElementById("sunder-chatbot-messages");
        els.form = document.getElementById("sunder-chatbot-form");
        els.textarea = document.getElementById("sunder-chatbot-textarea");
        els.modeButton = document.getElementById("sunder-chatbot-modebutton");
        els.modeLabel = document.getElementById("sunder-chatbot-mode-label");
        els.modeMenu = document.getElementById("sunder-chatbot-mode-menu");

        if (!els.launcher || !els.panel) return;

        closePanel();

        els.launcher.addEventListener("click", () => state.open ? closePanel() : openPanel());
        els.close.addEventListener("click", closePanel);
        els.form.addEventListener("submit", handleSubmit);

        els.modeButton.addEventListener("click", () => {
            const expanded = els.modeButton.getAttribute("aria-expanded") === 'true';
            els.modeButton.setAttribute('aria-expanded', String(!expanded));
            els.modeMenu.hidden = expanded;
        });

        document.querySelectorAll(".sunder-chatbot-mode-option").forEach(btn => {
            btn.addEventListener("click", () => setMode(btn.dataset.mode));
        });

        document.querySelectorAll("[data-chatbot-prompt]").forEach(btn => {
            btn.addEventListener("click", () => {
                openPanel();
                els.textarea.value = btn.dataset.chatbotPrompt || "";
                els.textarea.focus();
            });
        });

        setMode('rules');
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
(function() {
    const CACHE_PREFIX = "sunder-chatbot-cache";
    const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

    const state = {
        open: false,
        mode: 'rules',
        index: null,
        chunks: null,
        glossary: null,
        aliasMap: null,
        loaded: false,
        llmRequested: false,
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
        llmStatus: null,
    };

    function isMobileChatDisabled() {
        return window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
    }

    function normalize(text) {
        return (text || "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^\w\s-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function tokenize(text) {
        return normalize(text).split(" ").filter(Boolean);
    }

    function safeText(value) {
        return typeof value === 'string' ? value.trim() : "";
    }

    function formatSourceLabel(source) {
        const page = (source.label || "").trim();
        const heading = (source.heading || "").trim();

        if (!heading) return page;
        if (normalize(page) === normalize(heading)) return page;

        return heading;
    }

    function makeQueryFeatures(query, aliasMap) {
        const raw = normalize(query);
        const tokens = tokenize(query);
        const expanded = new Set(tokens);

        for (const token of tokens) {
            const related = aliasMap[token];
            if (related) {
                for (const phrase of related) {
                    for (const t of tokenize(phrase)) expanded.add(t);
                }
            }
        }

        if (aliasMap?.[raw]) {
            for (const phrase of aliasMap[raw]) {
                for (const t of tokenize(phrase)) expanded.add(t);
            }
        }

        return {
            raw,
            tokens,
            expandedTokens: [...expanded],
            phrases: [raw].filter(Boolean),
        }
    }

    function bm25(tf, df, fieldLen, avgFieldLen, totalDocs, k1 = 1.2, b = 0.75) {
        if (!tf || !df || !fieldLen || !avgFieldLen || !totalDocs) return 0;
        const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
        const denom = tf + k1 * (1 - b + b * (fieldLen / avgFieldLen));
        return idf * ((tf * (k1 + 1)) / denom);
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function getCacheKey() {
        const version = window.SUNDER_VERSION || "dev";
        return `${CACHE_PREFIX}:${version}`;
    }

    function loadCache() {
        try {
            const raw = localStorage.getItem(getCacheKey());
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (!parsed.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;

            return parsed.data || null
        } catch (err) {
            console.warn("[sunder-chatbot] Failed to read cache", err);
            return null;
        }
    }

    function saveCache(data) {
        try {
            localStorage.setItem(
                getCacheKey(),
                JSON.stringify({
                    savedAt: Date.now(),
                    data,
                })
            );
        } catch (err) {
            console.warn("[sunder-chatbot] Failed to save cache", err);
        }
    }

    function buildAliasMap(index, glossary) {
        const aliasMap = new Map();

        function addAliasPair(source, target) {
            const sourceNorm = normalize(source);
            const targetNorm = normalize(target);
            if (!sourceNorm || !targetNorm || sourceNorm === targetNorm) return;

            if (!aliasMap.has(sourceNorm)) aliasMap.set(sourceNorm, new Set());
            aliasMap.get(sourceNorm).add(targetNorm);
        }

        Object.entries(glossary || {}).forEach(([key, values]) => {
            const all = [key, ...(Array.isArray(values) ? values : [])];
            for (const source of all) {
                for (const target of all) {
                    addAliasPair(source, target);
                }
            }
        });

        for (const page of index?.pages || []) {
            const all = [page.title, ...(page.aliases || [])];
            for (const source of all) {
                for (const target of all) {
                    addAliasPair(source, target);
                }
            }
        }

        for (const entry of index?.entries || []) {
            const all = [entry.title, entry.heading, ...(entry.aliases || [])];
            for (const source of all) {
                for (const target of all) {
                    addAliasPair(source, target);
                }
            }
        }

        return aliasMap;
    }

    async function fetchData() {
        const base = window.SUNDER_CHAT_BASE || '/chat';
        const [indexRes, chunksRes, glossaryRes] = await Promise.all([
            fetch(`${base}/index.json`, { cache: "no-cache" }),
            fetch(`${base}/chunks.json`, { cache: "no-cache" }),
            fetch(`${base}/glossary.json`, { cache: "no-cache" }),
        ]);

        if (!indexRes.ok || !chunksRes.ok || !glossaryRes.ok) {
            throw new Error("Failed to fetch chatbot index files.");
        }

        const [index, chunks, glossary] = await Promise.all([
            indexRes.json(),
            chunksRes.json(),
            glossaryRes.json(),
        ]);

        return { index, chunks, glossary };
    }

    async function loadData() {
        if (state.loaded) return;

        const cached = loadCache();
        if (cached?.index && cached?.chunks && cached?.glossary) {
            state.index = cached.index;
            state.chunks = cached.chunks;
            state.glossary = cached.glossary;
            state.aliasMap = buildAliasMap(state.index, state.glossary);
            state.loaded = true;
            return;
        }

        const fresh = await fetchData();
        saveCache(fresh);

        state.index = fresh.index;
        state.chunks = fresh.chunks;
        state.glossary = fresh.glossary;
        state.aliasMap = buildAliasMap(state.index, state.glossary);
        state.loaded = true;
    }

    function expandQueryTokens(query) {
        const baseTokens = tokenize(query);
        const expanded = new Set(baseTokens);
        const fullNorm = normalize(query);

        if (state.aliasMap?.has(fullNorm)) {
            for (const alias of state.aliasMap.get(fullNorm)) {
                tokenize(alias).forEach((token) => expanded.add(token));
            }
        }

        for (const token of baseTokens) {
            if (state.aliasMap?.has(token)) {
                for (const alias of state.aliasMap.get(token)) {
                    tokenize(alias).forEach((t) => expanded.add(t));
                }
            }
        }

        return [...expanded];
    }

    function modePrior(section, mode) {
        const pageId = (section.pageId || "").toLowerCase();

        if (mode === "rules") {
            if (section.mode?.includes("rules")) return 2.0;
            if (pageId === 'index' || pageId.startsWith("lore/")) return -4.5;
            return 0;
        }

        if (mode === 'builder') {
            if (section.mode?.includes("builder")) return 2.0;
            if (pageId.startsWith("lore/")) return -2.0;
            return 0;
        }

        if (mode === 'lore') {
            if (pageId === 'index' || pageId.startsWith('lore/')) return 2.0;
            return 0;
        }

        return 0;
    }

    function structuralPrior(section, mode) {
        const path = section.norm.headingPath;

        if (mode === 'builder') {
            if (path.includes('anatomy of custom abilities')) return 3;
            if (path.includes('effect package costs')) return 2.5;
            if (path.includes('narrative effect')) return 2;
            if (path.includes('action cards')) return 1.5;
        }

        if (mode === 'rules') {
            if (path.includes('action tests')) return 2;
            if (path.includes('general actions')) return 2;
            if (path.includes('domains')) return 2;
        }

        return 0;
    }

    function getModeSlugBoost(pageId, mode) {
        const id = (pageId || "").toLowerCase();

        if (mode === 'builder') {
            if (id.includes('abilities')) return 10;
            if (id.includes('levels')) return 8;
            if (id.includes('spellcasting')) return 6;
            if (id.includes('actions')) return 6;
            if (id.includes('damage')) return 4;
        }

        if (mode === 'lore') {
            if (id.startsWith('lore/')) return 10;
            if (id === 'index') return 6;
            if (id.includes('proficiencies')) return 4;
        }

        if (mode === 'rules') {
            if (id.includes('resolution-system')) return 8;
            if (id.includes('stress-and-fallout')) return 6;
            if (id.includes('volatility-and-perks')) return 6;
            if (id.includes('actions')) return 5;
            if (id.includes('conditions')) return 4;
            if (id.includes('damage')) return 4;
        }

        return 0;
    }

    function scoreSection(section, q, stats, mode) {
        const fields = ['title', 'pageAliases', 'heading', 'headingPath', 'sectionAliases', 'body'];
        const weights = {
            title: 4.0,
            pageAliases: 3.5,
            heading: 3.0,
            headingPath: 2.0,
            sectionAliases: 1.2,
            body: 1.0,
        };

        let score = 0;

        for (const token of q.expandedTokens) {
            for (const field of fields) {
                const tf = section.term_freqs?.[field]?.[token] || 0;
                const df = stats.docFreqs?.[field]?.[token] || 0;
                const fieldLen = section.field_lengths?.[field] || 1;
                const avgFieldLen = stats.avgFieldLens?.[field] || 1;

                score += weights[field] * bm25(tf, df, fieldLen, avgFieldLen, stats.totalDocs);
            }
        }

        const titleNorm = section.norm?.title || "";
        const headingNorm = section.norm?.heading || "";
        const pathNorm = section.norm?.headingPath || "";
        const aliasNorms = [
            ...(section.norm?.pageAliases || []),
            ...(section.norm?.sectionAliases || [])
        ];
        const bodyNorm = section.norm?.body || "";

        for (const phrase of q.phrases) {
            if (titleNorm === phrase) score += 20;
            if (headingNorm === phrase) score += 22;
            if (aliasNorms.includes(phrase)) score += 24;

            if (titleNorm.includes(phrase)) score += 10;
            if (headingNorm.includes(phrase)) score += 9;
            if (pathNorm.includes(phrase)) score += 7;
            if (aliasNorms.some(a => a.includes(phrase))) score += 8;
            if (bodyNorm.includes(phrase)) score += 4;
        }

        const matchedRareTerms = q.expandedTokens.filter(t => (stats.globalIdf?.[t] || 0) > 3.5).length;
        score += matchedRareTerms * 2.5;

        score += modePrior(section, mode);
        score += structuralPrior(section, mode);

        return score;
    }

    function tokenSetFromSection(section) {
        return new Set([
            ...tokenize(section.norm?.title || ""),
            ...tokenize(section.norm?.heading || ""),
            ...tokenize(section.norm?.headingPath || ""),
            ...tokenize((section.norm?.sectionAliases || []).join(" ")),
            ...tokenize(section.norm?.body || ""),
        ]);
    }

    function jaccardSimilarity(a, b) {
        const aSet = tokenSetFromSection(a);
        const bSet = tokenSetFromSection(b);

        if (!aSet.size || !bSet.size) return 0;

        let intersection = 0;
        for (const token of aSet) {
            if (bSet.has(token)) intersection += 1;
        }

        const union = aSet.size + bSet.size - intersection;
        return union ? intersection / union : 0;
    }

    function mmrRerank(candidates, limit = 6, lambda = 0.78) {
        if (candidates.length <= 1) return candidates.slice(0, limit);

        const selected = [];
        const remaining = [...candidates];

        selected.push(remaining.shift());

        while (remaining.length && selected.length < limit) {
            let bestIdx = 0;
            let bestScore = -Infinity;

            for (let i = 0; i < remaining.length; i++) {
                const candidate = remaining[i];

                let maxSimilarity = 0;
                for (const chosen of selected) {
                    const sim = jaccardSimilarity(candidate, chosen);
                    if (sim > maxSimilarity) maxSimilarity = sim;
                }

                const mmrScore = lambda * candidate.relevance - (1 - lambda) * maxSimilarity;

                if (mmrScore > bestScore) {
                    bestScore = mmrScore;
                    bestIdx = i;
                }
            }

            selected.push(remaining.splice(bestIdx, 1)[0]);
        }

        return selected;
    }

    function scoreEntry(entry, tokens, query, mode) {
        const queryNorm = normalize(query);
        const title = normalize(entry.title);
        const heading = normalize(entry.heading);
        const headingPath = normalize((entry.headingPath || []).join(" "));
        const aliases = (entry.aliases || []).map(normalize);
        const tokenHaystack = normalize([
            entry.title || "",
            entry.heading || '',
            (entry.headingPath || []).join(' '),
            ...(entry.aliases || []),
            ...(entry.tokens || [])
        ].join(" "));

        let score = 0;

        if (title === queryNorm) score += 50;
        if (heading === queryNorm) score += 45;
        if (aliases.includes(queryNorm)) score += 48;

        if (title.includes(queryNorm) && queryNorm) score += 22;
        if (heading.includes(queryNorm) && queryNorm) score += 20;
        if (headingPath.includes(queryNorm) && queryNorm) score += 18;
        if (aliases.some((a) => a.includes(queryNorm)) && queryNorm) score += 20;
        if (tokenHaystack.includes(queryNorm) && queryNorm) score += 12;

        let matched = 0;
        for (const token of tokens) {
            if (!token) continue;

            if (title.split(" ").includes(token)) score += 8;
            else if (title.includes(token)) score += 5;

            if (heading.split(" ").includes(token)) score += 7;
            else if (heading.includes(token)) score += 4;

            if (aliases.some((a) => a.split(" ").includes(token))) score += 8;
            else if (aliases.some((a) => a.includes(token))) score += 4;

            if (headingPath.split(" ").includes(token)) score += 5;
            else if (headingPath.includes(token)) score += 3;

            if ((entry.tokens || []).includes(token)) score += 2;

            if (tokenHaystack.includes(token)) matched += 1;
        }

        if (tokens.length) {
            score += Math.round((matched / tokens.length) * 18);
        }

        if (entry.mode?.includes(mode)) score += 6;
        score += getModeSlugBoost(entry.pageId, mode);

        if (entry.anchor) score += 2;

        return score;
    }

    function uniqueByUrl(results) {
        const seen = new Set();
        const out = [];

        for (const item of results) {
            const key = item.chunk?.url || item.id;
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(item);
        }

        return out;
    }

    function search(query, mode, state) {
        const q = makeQueryFeatures(query, state.aliasMap || {});
        const stats = state.index?.stats;

        if (!stats) {
            console.warn('[sunder-chatbot] Missing stats in index.json');
            return [];
        }

        const scored = (state.index?.entries || [])
            .map((section) => {
                const relevance = scoreSection(section, q, stats, mode);
                return {
                    ...section,
                    relevance
                };
            })
            .filter((section) => section.relevance > 0)
            .sort((a, b) => b.relevance - a.relevance);

        const candidatePool = scored.slice(0, 18);
        const reranked = mmrRerank(candidatePool, 6, 0.78);

        return reranked.map((section) => ({
            ...section,
            chunk: state.chunks?.[section.id],
            url: section.url || state.chunks?.[section.id]?.url,
        }));
    }

    function excerpt(text, maxLen = 420) {
        const clean = normalize(text).replace(/\s+/g, " ").trim();
        if (clean.length <= maxLen) return clean;
        return `${clean.slice(0, maxLen).trimEnd()}...`;
    }

    function buildGroundedContext(results) {
        return results.slice(0, 4).map((r, i) => {
            const page = r?.chunk?.pageTitle || "Source";
            const heading = r?.chunk?.heading || "";
            const label = heading && normalize(page) !== normalize(heading)
                ? `${page} > ${heading}`
                : page;

            return [
                `<source index="${i + 1}">`,
                `<label>${label}</label>`,
                `<content>${r?.chunk?.text || ""}</content>`,
                `</source>`
            ].join('\n');
        }).join("\n\n");
    }

    function buildSystemPrompt(mode) {
        const shared = [
            "Answer using only the provided sources.",
            "Do not copy the source labels, XML tags, filenames, or raw markup into the answer.",
            "Write a short natural-language summary first.",
            "Do not enumerate the sources in the answer body.",
            "Only mention source names in short citations lik [{insert Source name}].",
            "If sources disagree or are irrelevant, ignore the irrelevant ones and state how any sources disagree.",
            "If the sources are noisy, ignore the noisy parts and answer from the relevant rule text only.",
        ];

        if (mode === 'builder') {
            return [
                "You are the Sunder ability builder assistant.",
                "Use the sources to propose a grounded draft, not a final ruling.",
                ...shared,
            ].join(" ");
        }

        if (mode === 'lore') {
            return [
                "You are the Sunder lore assistant.",
                "Answer from the provided excerpts only.",
                ...shared,
            ].join(" ");
        }

        return [
            "You are the Sunder rules assistant.",
            "Do not invent rules.",
            ...shared,
        ].join(" ");
    }

    function shouldUseLocalLLM(query, mode, results) {
        // return false; // DEV MODE
        if (!window.SUNDER_LLM?.isSupported?.()) return false;
        if (!results.length) return false;

        const q = normalize(query);

        if (mode === 'builder') return true;
        if (q.includes("how") || q.includes("build") || q.includes("explain")) return true;
        if (results.length > 1) return true;

        return false;
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
                    heading: r.chunk.heading,
                    url: r.chunk.url
                })),
                excerpts: top.map((r) => ({
                    label: r.chunk.heading,
                    text: excerpt(r.chunk.text, 260),
                }))
            };
        }

        if (mode === 'lore') {
            return {
                text: top[0].chunk.text.slice(0, 520),
                sources: top.map((r) => ({
                    label: r.chunk.pageTitle,
                    heading: r.chunk.heading,
                    url: r.chunk.url
                }))
            };
        }

        return {
            text: top[0].chunk.text.slice(0, 520),
            sources: top.map((r) => ({
                label: r.chunk.pageTitle,
                heading: r.chunk.heading,
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
                ${sources.map(
                    (s) => `
                        <a 
                            class="sunder-chatbot-source" 
                            href="${s.url}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="${escapeHtml(`${s.label} > ${s.heading || ""}`)}"
                        >
                            ${escapeHtml(formatSourceLabel(s))}
                        </a>
                    `
                )
                .join("")}
            </div>
        `;
    }

    function renderBuilderExcerpts(excerpts) {
        if (!excerpts?.length) return "";

        return `
            <details>
                <summary>Relevant build sections</summary>
                ${excerpts
                    .map(
                        (x) => `
                            <p>
                                <strong>${escapeHtml(x.heading || "Section")}:</strong>
                                ${escapeHtml(x.text)}
                            </p>
                        `
                    )
                    .join("")}
            </details>
        `;
    }

    function dedupeSources(results) {
        const seen = new Set();
        const out = [];

        for (const r of results) {
            const url = r.chunk?.url || r.url;
            if (!url || seen.has(url)) continue;
            seen.add(url);

            out.push({
                label: r.chunk.pageTitle,
                heading: r.chunk.heading,
                url,
            });
        }

        return out.slice(0, 4);
    }

    async function handleSubmit(evt) {
        evt.preventDefault();

        const query = els.textarea.value.trim();
        if (!query) return;

        appendMessage("user", escapeHtml(query));
        els.textarea.value = "";

        const thinkingEl = appendAssistantThinkingMessage();

        try {
            await loadData();

            const results = search(query, state.mode, state);
            const sources = dedupeSources(results);

            if (shouldUseLocalLLM(query, state.mode, results)) {

                const context = buildGroundedContext(results);
                const system = buildSystemPrompt(state.mode);

                const finalReply = await window.SUNDER_LLM.streamComplete({
                    system,
                    user: query,
                    context,
                    temperature: 0.2,
                    max_tokens: 260,
                    onToken: (fullText) => {
                        const partial = safeText(fullText);
                        if (!partial) return;

                        thinkingEl.classList.remove('sunder-chatbot.msg--thinking');
                        thinkingEl.innerHTML = `
                            <div class="sunder-chatbot-answer">${escapeHtml(partial)}</div>
                        `;
                        els.messages.scrollTop = els.messages.scrollHeight;
                    },
                });

                updateAssistantMessage(thinkingEl, finalReply, sources);
                return;
            }

            const fallback = synthesizeAnswer(query, results, state.mode);
            updateAssistantMessage(thinkingEl, fallback.text, fallback.sources);
        } catch (err) {
            console.error("[sunder-chatbot] submit failed", err);
            updateAssistantMessage(
                thinkingEl,
                "I hit a problem loading the assistant index. Refresh the page and try again.",
                []
            );
        }
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
        // if (!state.llmRequested)  {
        //     void window.SUNDER_LLM.ensureEngine();
        //     state.llmRequested = true;
        // }
    }

    function closePanel() {
        state.open = false;
        els.panel.hidden = true;
        els.launcher.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove("sunder-chatbot-open");
    }

    function appendAssistantThinkingMessage() {
        const msg = document.createElement("div");
        msg.className = "sunder-chatbot-msg sunder-chatbot.msg--assistant sunder-chatbot-msg--thinking";
        msg.innerHTML = `<div class="sunder-chatbot-thinking">Thinking</div>`;
        els.messages.appendChild(msg);
        els.messages.scrollTop = els.messages.scrollHeight;
        return msg;
    }

    function updateAssistantMessage(msgEl, text, sources = []) {
        const finalText = safeText(text);
        if (!finalText) return;

        msgEl.classList.remove("sunder-chatbot-msg--thinking");
        msgEl.innerHTML = `
            <div class="sunder-chatbot-answer">${escapeHtml(finalText)}</div>
            ${renderSources(sources)}
        `;
        els.messages.scrollTop = els.messages.scrollHeight;
    }

    function init() {
        if (isMobileChatDisabled()) {
            const root = document.getElementById("sunder-chatbot-root");
            if (root) root.remove();
            return;
        }
        els.launcher = document.getElementById("sunder-chatbot-launcher");
        els.panel = document.getElementById("sunder-chatbot-panel");
        els.close = document.getElementById("sunder-chatbot-close");
        els.messages = document.getElementById("sunder-chatbot-messages");
        els.form = document.getElementById("sunder-chatbot-form");
        els.textarea = document.getElementById("sunder-chatbot-textarea");
        els.modeButton = document.getElementById("sunder-chatbot-modebutton");
        els.modeLabel = document.getElementById("sunder-chatbot-mode-label");
        els.modeMenu = document.getElementById("sunder-chatbot-mode-menu");
        els.llmStatus = document.getElementById("sunder-chatbot-llm-status");

        if (window.SUNDER_LLM?.onStatusChange && els.llmStatus) {
            window.SUNDER_LLM.onStatusChange((status) => {
                let label = status;
                if (status.startsWith("loading:")) {
                    label = `loading ${status.split(":")[1]}%`;
                }
                els.llmStatus.textContent = `Local model: ${label}`;
            })
        }

        if (!els.launcher || !els.panel || !els.form) return;

        closePanel();

        let prewarmStarted = false;
        function startPrewarm() {
            if (prewarmStarted) return;
            prewarmStarted = true;
            window.SUNDER_LLM?.warmup?.().catch((err) => {
                console.warn("[sunder-chatbot] warmup failed", err);
            });
        }

        els.launcher.addEventListener("click", () => state.open ? closePanel() : openPanel());
        els.close?.addEventListener("click", closePanel);
        els.form.addEventListener("submit", handleSubmit);

        els.modeButton?.addEventListener("click", () => {
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

        els.textarea.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter" && !evt.shiftKey) {
                evt.preventDefault();
                els.form.requestSubmit();
            }
        });

        setMode('rules');
    }

    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
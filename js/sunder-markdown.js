(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function stripYamlFrontmatter(markdown) {
        let source = String(markdown || "");

        // Remove UTF-8 BOM and leading whitespace/newlines before frontmatter.
        source = source.replace(/^\uFEFF/, "").replace(/^\s+/, "");

        const lines = source.split(/\r?\n/);

        if (lines.length === 0) return source;

        // Frontmatter must start with --- or +++.
        const opening = lines[0].trim();

        if (opening !== "---" && opening !== "+++") {
            return source;
        }

        // Find matching closing delimiter.
        for (let i = 1; i < lines.length; i += 1) {
            if (lines[i].trim() === opening) {
                return lines.slice(i + 1).join("\n").replace(/^\s+/, "");
            }
        }

        // Failsafe: if frontmatter starts but never closes, hide known YAML-ish
        // metadata lines until the first real Markdown heading.
        const headingIndex = lines.findIndex((line, index) => {
            return index > 0 && /^#{1,6}\s+/.test(line);
        });

        if (headingIndex > 0) {
            return lines.slice(headingIndex).join("\n").replace(/^\s+/, "");
        }

        return source;
    }

    function normalizeHeadingText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/<[^>]+>/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function stripDuplicateFirstHeading(markdown, pageTitle) {
        const source = String(markdown || "").replace(/^\s+/, "");
        const match = source.match(/^#\s+(.+?)\s*(?:\r?\n|$)/);

        if (!match) return markdown;

        const heading = normalizeHeadingText(match[1]);
        const title = normalizeHeadingText(pageTitle);

        if (heading && title && heading === title) {
            return source.slice(match[0].length).replace(/^\s+/, "");
        }

        return markdown;
    }

    function escapeMarkdownLinkText(value) {
        return String(value || "").replace(/([\\[\]])/g, "\\$1");
    }

    function slugifyAnchor(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/<[^>]+>/g, "")
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
    }

    function getSiteBasePath() {
        return window.SUNDER_SITE?.basePath || "";
    }

    function internalPage(path) {
        if (window.SUNDER_SITE?.resolvePath) {
            return window.SUNDER_SITE.resolvePath(path);
        }

        const base = getSiteBasePath();
        const cleanPath = String(path || "").replace(/^\/+/, "").replace(/\/?$/, "/");
        return `${base}/${cleanPath}`;
    }

    function normalizeWikiKey(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\.md$/i, "")
            .replace(/^\/+/, "")
            .replace(/\s+/g, "-")
            .replace(/_/g, "-");
    }

    const SUNDER_WIKI_LINKS = {
        "abilities": "gameplay/scenes/",
        "experience-market": "scription/experience-market/",
        "ability": "gameplay/scenes/",
        "action-card": "gameplay/actions/",
        "action-cards": "gameplay/actions/",

        "actions": "gameplay/actions/",
        "action": "gameplay/actions",
        "attack": "gameplay/actions/",
        "movement": "gameplay/actions/",

        "scenes": "gameplay/scenes/",
        "initiative": "gameplay/scenes/",
        "surges": "gameplay/scenes/",
        "traits": "gameplay/scenes/",
        "reactions": "gameplay/scenes/",

        "resting": "gameplay/resting/",
        "short-rest": "gameplay/resting/",
        "long-rest": "gameplay/resting/",

        "spellcasting": "characters/spellcasting/",
        "spell-limits": "characters/spellcasting/",

        "adversaries": "gameplay/adversaries/",
        "monsters": "gameplay/adversaries/",

        "damage": "gameplay/damage/",
        "conditions": "gameplay/conditions/",


        "countdown-dice": "core/countdown-dice/",
        "countdown-die": "core/countdown-dice/",

        "resolution-system": "core/resolution-system/",
        "tests": "core/resolution-system/",
        "test": "core/resolution-system/",
        "advantage": "core/resolution-system/",
        "disadvantage": "core/resolution-system/",

        "volatility-and-perks": "core/volatility-and-perks/",
        "volatility": "core/volatility-and-perks/",
        "perks": "core/volatility-and-perks/",

        "stress-and-fallout": "core/stress-and-fallout/",
        "stress": "core/stress-and-fallout/",
        "fallout": "core/stress-and-fallout/",

        "tokens": "core/tokens/",
        "flavor-tokens": "core/tokens/",
        "loom": "core/tokens/",

        "equipment": "core/equipment/",
        "weapons": "core/equipment/",
        "armor": "core/equipment/",


        "experience": "characters/experience/",
        "experience-points": "characters/experience/",
        "beats": "characters/experience/",
        "strings": "characters/experience/",
        "milestones": "characters/experience/",

        "leveling": "characters/leveling/",
        "levels": "characters/leveling/",

        "origin": "characters/origin/",
        "background": "characters/origin/",
        "heritage": "characters/origin/",

        "archetypes": "characters/archetypes/",
        "archetype": "characters/archetypes/",
        "classes": "characters/archetypes/",

        "proficiencies": "characters/proficiencies/",
        "proficiency": "characters/proficiencies/",
        "knacks": "characters/proficiencies/",
        "domains": "characters/proficiencies/",

        "potentials-and-resistance": "characters/potentials-and-resistance/",
        "potentials": "characters/potentials-and-resistance/",
        "potential": "characters/potentials-and-resistance/",
        "resistance": "characters/potentials-and-resistance/",
        "skills": "characters/potentials-and-resistance/",
    };

    function resolveWikiLink(rawTarget) {
        const target = String(rawTarget || "").trim();
        const [rawPagePart, rawAnchorPart] = target.split("#");

        const pageKey = normalizeWikiKey(rawPagePart);
        const mappedPath = SUNDER_WIKI_LINKS[pageKey];

        let href;

        if (mappedPath) {
            href = internalPage(mappedPath);
        } else {
            // Fallback for unknown wiki links.
            href = internalPage(pageKey);
        }

        if (rawAnchorPart) {
            href += `#${slugifyAnchor(rawAnchorPart)}`;
        }

        return href;
    }

    function convertObsidianLinks(markdown) {
        return String(markdown || "").replace(
            /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
            (_match, target, label) => {
                const rawTarget = String(target || "").trim();
                const displayText =
                    label ||
                    rawTarget.split("#")[1] ||
                    rawTarget.split("#")[0] ||
                    rawTarget;

                const href = resolveWikiLink(rawTarget);
                const text = escapeMarkdownLinkText(displayText);

                return `[${text}](${href})`;
            }
        );
    }

    const OBSIDIAN_CALLOUT_TYPE_MAP = {
        note: "note",
        abstract: "abstract",
        summary: "abstract",
        tldr: "abstract",
        info: "info",
        todo: "tip",
        tip: "tip",
        hint: "tip",
        important: "tip",
        success: "success",
        check: "success",
        done: "success",
        question: "question",
        help: "question",
        faq: "question",
        warning: "warning",
        caution: "warning",
        attention: "warning",
        failure: "failure",
        missing: "failure",
        fail: "failure",
        danger: "danger",
        error: "danger",
        bug: "bug",
        example: "example",
        quote: "quote",
        cite: "quote",
    };

    function normalizeCalloutType(type) {
        const clean = String(type || "note").toLowerCase().trim();
        return OBSIDIAN_CALLOUT_TYPE_MAP[clean] || clean || "note";
    }

    function convertObsidianCallouts(markdown) {
        const lines = String(markdown || "").split(/\r?\n/);
        const output = [];

        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            const match = line.match(/^>\s*\[!([a-zA-Z][\w-]*)(?:[+-])?\]\s*(.*)$/);

            if (!match) {
                output.push(line);
                i += 1;
                continue;
            }

            const rawType = match[1];
            const calloutType = normalizeCalloutType(rawType);
            const title =
                match[2]?.trim() ||
                rawType.charAt(0).toUpperCase() + rawType.slice(1);

            const bodyLines = [];
            i += 1;

            while (i < lines.length) {
                const bodyLine = lines[i];

                if (!bodyLine.startsWith(">")) break;

                // Stop if a new callout begins immediately.
                if (/^>\s*\[![a-zA-Z][\w-]*(?:[+-])?\]/.test(bodyLine)) break;

                bodyLines.push(bodyLine.replace(/^>\s?/, ""));
                i += 1;
            }

            const bodyMarkdown = bodyLines.join("\n").trim();

            let bodyHtml = "";

            if (bodyMarkdown) {
                if (window.marked) {
                    bodyHtml = window.marked.parse(bodyMarkdown).trim();
                } else {
                    bodyHtml = `<p>${escapeHtml(bodyMarkdown)}</p>`;
                }
            }

            const calloutHtml = [
                "",
                `<div class="admonition ${escapeHtml(calloutType)} sunder-obsidian-callout sunder-obsidian-callout-${escapeHtml(calloutType)}">`,
                `<p class="admonition-title">${escapeHtml(title)}</p>`,
                bodyHtml,
                `</div>`,
                "",
            ].join("\n");

            output.push(calloutHtml);
        }

        return output.join("\n").replace(/\n{3,}/g, "\n\n");
    }

    function separateHtmlBlocksForMarked(markdown) {
        const lines = String(markdown || "").split(/\r?\n/);
        const output = [];

        for (let i = 0; i < lines.length; i += 1) {
            const line = lines[i];
            const trimmed = line.trim();
            const next = lines[i + 1] || "";
            const nextTrimmed = next.trim();

            output.push(line);

            if (!nextTrimmed) continue;

            const closesBlockHtml =
                /<\/(div|section|article|aside|details|summary|table|thead|tbody|tr|td|th|ul|ol|li|p|h[1-6])>\s*$/i.test(trimmed);

            const nextLooksLikeMarkdown =
                /^#{1,6}\s+/.test(nextTrimmed) ||
                /^[-*+]\s+/.test(nextTrimmed) ||
                /^\d+\.\s+/.test(nextTrimmed) ||
                /^\|/.test(nextTrimmed) ||
                /^>\s*/.test(nextTrimmed) ||
                /^\*\*/.test(nextTrimmed) ||
                /^\*[^*\s]/.test(nextTrimmed) ||
                /^\[[^\]]+\]\(/.test(nextTrimmed) ||
                /^[A-Za-z0-9"'“‘(]/.test(nextTrimmed);

            const nextLooksLikeHtmlContinuation =
                /^<\/?(div|section|article|aside|details|summary|table|thead|tbody|tr|td|th|ul|ol|li|span|p|h[1-6])\b/i.test(nextTrimmed);

            if (closesBlockHtml && nextLooksLikeMarkdown && !nextLooksLikeHtmlContinuation) {
                output.push("");
            }
        }

        return output.join("\n");
    }

    function normalizeFootnoteLabel(label) {
        return String(label || "")
            .trim()
            .toLowerCase()
            .replace(/[^\w-]+/g, "-");
    }

    function extractFootnotes(markdown) {
        const lines = String(markdown || "").split(/\r?\n/);
        const bodyLines = [];
        const footnotes = [];

        let i = 0;

        while (i < lines.length) {
            const line = lines[i];
            const match = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);

            if (!match) {
                bodyLines.push(line);
                i += 1;
                continue;
            }

            const label = match[1].trim();
            const contentLines = [match[2] || ""];

            i += 1;

            while (i < lines.length) {
                const nextLine = lines[i];

                // A new footnote starts.
                if (/^\[\^[^\]]+\]:\s*/.test(nextLine)) {
                    break;
                }

                // Continuation lines for a footnote are usually intended.
                if (/^( {2,}|\t)/.test(nextLine)) {
                    contentLines.push(nextLine.replace(/^( {2,}|\t)/, ""));
                    i += 1;
                    continue;
                }

                // Allow blank lines inside/after footnotes.
                if (nextLine.trim() === "") {
                    contentLines.push("");
                    i += 1;
                    continue;
                }

                // Non-indented normal Markdown means the footnote block is done.
                break;
            }

            footnotes.push({
                label,
                id: normalizeFootnoteLabel(label),
                markdown: contentLines.join("\n").trim(),
            });
        }

        return {
            markdown: bodyLines.join("\n"),
            footnotes,
        };
    }

    function replaceFootnoteRefs(markdown, footnotes) {
        if (!footnotes.length) return markdown;

        const known = new Set(footnotes.map((note) => note.label));

        return String(markdown || "").replace(/\[\^([^\]]+)\]/g, (match, rawLabel) => {
            const label = rawLabel.trim();

            if (!known.has(label)) {
                return match;
            }

            const id = normalizeFootnoteLabel(label);

            return `<sup id="fnref:${escapeHtml(id)}" class="footnote-ref"><a href="#fn:${escapeHtml(id)}">${escapeHtml(label)}</a></sup>`;
        });
    }

    function renderFootnotesHtml(footnotes) {
        if (!footnotes.length) return "";

        const items = footnotes
            .map((note) => {
                let bodyHtml = "";

                if (window.marked) {
                    bodyHtml = window.marked.parseInline(note.markdown || "");
                } else {
                    bodyHtml = escapeHtml(note.markdown || "");
                }

                return [
                    `<li id="fn:${escapeHtml(note.id)}">`,
                    `<p>${bodyHtml} <a href="#fnref:${escapeHtml(note.id)}" class="footnote-backref" aria-label="Back to reference">↩</a></p>`,
                    `</li>`,
                ].join("\n");
            })
            .join("\n");

        return [
            "",
            `<section class="footnote">`,
            `<hr>`,
            `<ol>`,
            items,
            `</ol>`,
            `</section>`,
            "",
        ].join("\n");
    }

    function convertFootnotes(markdown) {
        const extracted = extractFootnotes(markdown);
        const bodyWithRefs = replaceFootnoteRefs(extracted.markdown, extracted.footnotes);
        const footnotesHtml = renderFootnotesHtml(extracted.footnotes);

        return `${bodyWithRefs.trim()}\n\n${footnotesHtml}`.trim();
    }

    function getMarkdownFromPayload(payload) {
        return(
            payload?.markdown ||
            payload?.body_markdown ||
            payload?.bodyMarkdown ||
            payload?.content ||
            payload?.body ||
            ""
        );
    }

    function preprocessPremiumMarkdown(markdown, options) {
        let source = String(markdown || "");

        source = stripYamlFrontmatter(source);

        if (options.stripFirstHeading !== false) {
            source = stripDuplicateFirstHeading(source, options.title || "");
        }

        source = convertObsidianLinks(source);
        source = convertObsidianCallouts(source);
        source = protectMath(source);
        source = separateHtmlBlocksForMarked(source);
        source = convertFootnotes(source);

        return source.trim();
    }

    function enhanceRenderedContent(root) {
        root.querySelectorAll("a[href^='http']").forEach((link) => {
            if (link.hostname !== window.location.hostname) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
            }
        });

        root.querySelectorAll("h2, h3, h4, h5, h6").forEach((heading) => {
            if (!heading.id) {
                heading.id = slugifyAnchor(heading.textContent);
            }

            // if (!heading.querySelector(".headerLink")) {
            //     const anchor = document.createElement("a");
            //     anchor.className = "headerLink";
            //     anchor.href = `#${heading.id}`;
            //     anchor.title = "Permanent link";
            //     anchor.textContent = "¶";
            //     heading.appendChild(anchor);
            // }
        });

        if (window.renderMathInElement) {
            window.renderMathInElement(root, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "\\[", right: "\\]", display: true },
                    { left: "$", right: "$", display: false },
                    { left: "\\(", right: "\\)", display: false },
                ],
                throwOnError: false,
            });
        }
    }

    function markdownToHtml(markdown, options) {
        if (!window.marked || !window.DOMPurify) {
            throw new Error("Markdown renderer missing: marked and DOMPurify are required.")
        }

        window.marked.setOptions({
            gfm: true,
            breaks: true,
        });

        const preprocessed = preprocessPremiumMarkdown(markdown, options);
        const unsafeHtml = window.marked.parse(preprocessed);

        return window.DOMPurify.sanitize(unsafeHtml, {
            ADD_ATTR: ["target", "rel", "class", "id", "title", "style"],
            ADD_TAGS: ["details", "summary", "span", "div"],
        });
    }

    function renderInto(root, markdownOrPayload, options = {}) {
        if (!root) {
            throw new Error("renderInto requires a target element.");
        }

        const markdown =
            typeof markdownOrPayload === 'string'
                ? markdownOrPayload
                : getMarkdownFromPayload(markdownOrPayload);

        const html = markdownToHtml(markdown, options);

        root.innerHTML = html;

        root.classList.add("sunder-scription-rendered-content");

        enhanceRenderedContent(root);

        return root;
    }

    function normalizeMathBody(value) {
        return String(value || "")
            .replace(/\r\n/g, "\n")
            .trim();
    }

    function escapeHtmlPreserveMath(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }

    function protectDisplayMath(markdown) {
        return String(markdown || "").replace(
            /\$\$([\s\S]*?)\$\$/g,
            (_match, body) => {
                const math = normalizeMathBody(body);

                return [
                    "",
                    `<div class="arithmatex">\\[`,
                    escapeHtmlPreserveMath(math),
                    `\\]</div>`,
                    "",
                ].join("\n");
            }
        );
    }

    function protectInlineMath(markdown) {
        return String(markdown || "").replace(
            /(^|[^$\\])\$([^\n$]+?)\$([^$]|$)/g,
            (_match, before, body, after) => {
                const math = normalizeMathBody(body);

                return `${before}<span class="arithmatex">\\(${escapeHtmlPreserveMath(math)}\\)</span>${after}`;
            }
        );
    }

    function protectMath(markdown) {
        let source = String(markdown || "");

        source = protectDisplayMath(source);
        source = protectInlineMath(source);

        return source;
    }
    
    window.SUNDER_MARKDOWN = {
        escapeHtml,
        slugifyAnchor,
        preprocessPremiumMarkdown,
        markdownToHtml,
        renderInto,
        getMarkdownFromPayload,
        enhanceRenderedContent,
    };

    window.MARKDOWN = window.SUNDER_MARKDOWN;
})();

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import json
import html
import re
from datetime import datetime, timezone
from typing import Any
from collections import Counter, defaultdict
import math

import yaml

@dataclass
class SectionRecord:
    id: str
    page_id: str
    page_title: str
    page_aliases: list[str]
    heading: str
    heading_path: list[str]
    section_aliases: list[str]
    anchor: str | None
    url: str
    mode: list[str]
    body: str
    tokens: list[str]
    field_lengths: dict[str, int]
    term_freqs: dict[str, dict[str, int]]

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
CHAT = PUBLIC / "chat"
CHAT.mkdir(parents=True, exist_ok=True)

DOC_FOLDERS = ["core", "gameplay", "characters", "meta"]

FRONTMATTER_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", re.DOTALL)
MD_HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
HTML_HEADING_RE = re.compile(r"^\s*<h([1-6])[^>]*>(.*?)</h\1>\s*$", re.IGNORECASE)
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
TAG_RE = re.compile(r"<[^>]+>")
MULTISPACE_RE = re.compile(r"\s+")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")
HTML_ATTR_RE = re.compile(r'\b(class|style|id)=["\;][^"\']*["\']', re.IGNORECASE)
HTML_TAG_RE = re.compile(r"</?[a-zA-Z0-9:-]+[^>]*>")

MODE_BY_TOP_FOLDER = {
    "core": ["rules"],
    "gameplay": ["rules", "builder"],
    "characters": ["rules", "builder"],
    "meta": []
}

STATIC_GLOSSARY = {
    "aoe": ["area of effect"],
    "jinx": ["jinx threshold"],
    "domains": ["pantheon"],
    "close": ["30 feet"],
    "near": ["10 feet"],
    "here": ["5 feet"],
    "there": ["60 feet"],
    "far": ["120 feet"],
    "yonder": ["line of sight"]
}

SEARCH_FIELDS = ('title', 'pageAliases', 'heading', 'headingPath', 'sectionAliases', 'body')

def normalize_space(text: str) -> str:
    return MULTISPACE_RE.sub(" ", text).strip()

def strip_tags(text: str) -> str:
    return TAG_RE.sub(" ", text)

def wikilink_to_label(match: re.Match[str]) -> str:
    value = match.group(1)
    parts = value.split("|")
    return parts[-1].strip()

def clean_text(text: str) -> str:
    text = WIKILINK_RE.sub(wikilink_to_label, text)
    text = html.unescape(text)
    text = strip_tags(text)
    text = HTML_ATTR_RE.sub(" ", text)
    text = HTML_TAG_RE.sub(" ", text)
    text = normalize_space(text)
    return text

def norm_text(text: str) -> str:
    return clean_text(text).lower()

def norm_list(values: list[str]) -> list[str]:
    out = []
    seen = set()
    for value in values:
        item = norm_text(value)
        if item and item not in seen:
            seen.add(item)
            out.append(item)

    return out

def count_terms_text(text: str) -> dict[str, int]:
    return dict(Counter(tokenise(text)))

def count_terms_list(values: list[str]) -> dict[str, int]:
    counter = Counter()
    for value in values:
        counter.update(tokenise(value))
    return dict(counter)

def compute_field_lengths(term_freqs: dict[str, dict[str, int]]) -> dict[str, int]:
    return {field: sum(freqs.values()) for field, freqs in term_freqs.items()}

def slugify(value: str) -> str:
    value = clean_text(value).lower()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[\s_]+", "-", value).strip('-')
    return value

def parse_frontmatter(raw: str) -> tuple[dict[str, Any], str]:
    match = FRONTMATTER_RE.match(raw)
    if not match:
        return {}, raw

    frontmatter_text, body = match.groups()
    data = yaml.safe_load(frontmatter_text) or {}
    if not isinstance(data, dict):
        data = {}
    return data, body

def extract_aliases(frontmatter: dict[str, Any]) -> list[str]:
    aliases = frontmatter.get("aliases", [])
    if isinstance(aliases, str):
        aliases = [aliases]
    if not isinstance(aliases, list):
        return []
    cleaned = [clean_text(str(x)) for x in aliases if str(x).strip()]
    return [x for x in cleaned if x]

def infer_modes(path: Path) -> list[str]:
    rel = path.relative_to(PUBLIC)
    top = rel.parts[0] if rel.parts else ""
    return MODE_BY_TOP_FOLDER.get(top, ['rules'])

def page_url(path: Path) -> str:
    rel = path.relative_to(PUBLIC).with_suffix("")
    parts = list(rel.parts)

    if parts == ["index"]:
        return "/site/"

    if parts and parts[-1] == "index":
        return "/site/" + "/".join(parts[:-1]) + "/"

    return "/site/" + "/".join(parts) + "/"

def prettify_stem(stem: str) -> str:
    return stem.replace("-", " ").replace("_", " ").title()

def parse_headings(body: str, fallback_title: str) -> tuple[str, list[dict[str, Any]]]:
    lines = body.splitlines()

    discovered_title = fallback_title
    heading_path: list[str] = []
    current_anchor: str | None = None
    current_lines: list[str] = []
    sections: list[dict[str, Any]] = []

    def flush_section() -> None:
        nonlocal current_lines, current_anchor, heading_path
        text = "\n".join(current_lines).strip()
        if not text:
            current_lines = []
            return

        clean = clean_text(text)
        if not clean:
            current_lines = []
            return

        path = heading_path[:] if heading_path else [discovered_title]
        sections.append(
            {
                "heading_path": path,
                "heading": path[-1] if path else discovered_title,
                "anchor": current_anchor,
                "text": clean
            }
        )
        current_lines = []

    for line in lines:
        md_match = MD_HEADING_RE.match(line)
        html_match = HTML_HEADING_RE.match(line)

        level = None
        heading_text = None
        if md_match:
            level = len(md_match.group(1))
            heading_text = clean_text(md_match.group(2))
        elif html_match:
            level = int(html_match.group(1))
            heading_text = clean_text(html_match.group(2))

        if level is not None and heading_text:
            flush_section()

            if level == 1:
                discovered_title = heading_text
                heading_path = [heading_text]
            else:
                if not heading_path:
                    heading_path = [discovered_title]
                while len(heading_path) >= level:
                    heading_path.pop()
                heading_path.append(heading_text)

            current_anchor = slugify(heading_text) or None
        else:
            current_lines.append(line)

    flush_section()
    return discovered_title, sections

def split_blocks(text: str) -> list[str]:
    raw_blocks = re.split(r"\n\s*\n", text)
    blocks = [normalize_space(x) for x in raw_blocks]
    return [x for x in blocks if x]

def split_long_block(block: str, max_chars: int) -> list[str]:
    if len(block) <= max_chars:
        return [block]

    sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(block) if s.strip()]
    if len(sentences) <= 1:
        return [block[i:i + max_chars] for i in range(0, len(block), max_chars)]

    pieces: list[str] = []
    current = ''

    for sentence in sentences:
        candidate = f"{current} {sentence}".strip()
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                pieces.append(current)
            if len(sentence) > max_chars:
                pieces.extend([sentence[i:i + max_chars] for i in range(0, len(sentence), max_chars)])
                current = ''
            else:
                current = sentence

    if current:
        pieces.append(current)

    return pieces

def chunk_section_text(text: str, min_chars: int = 280, max_chars: int = 1100) -> list[str]:
    blocks = split_blocks(text)
    normalize_blocks: list[str] = []

    for block in blocks:
        normalize_blocks.extend(split_long_block(block, max_chars=max_chars))

    chunks: list[str] = []
    current = ''

    for block in normalize_blocks:
        candidate = f"{current}\n\n{block}".strip() if current else block
        if len(candidate) <= max_chars:
            current = candidate
            continue

        if current:
            chunks.append(current)
        current = block

    if current:
        chunks.append(current)

    merged: list[str] = []
    buffer = ''

    for chunk in chunks:
        if not buffer:
            buffer = chunk
            continue

        if len(buffer) < min_chars:
            buffer = f'{buffer}\n\n{chunk}'.strip()
        else:
            merged.append(buffer)
            buffer = chunk

    if buffer:
        merged.append(buffer)

    return merged

def tokenise(*values: str) -> list[str]:
    combined = " ".join(values).lower()
    combined = re.sub(r"[^\w\s-]", " ", combined)
    tokens = [t for t in combined.split() if len(t) > 1]
    seen = set()
    out = []
    for token in tokens:
        if token not in seen:
            seen.add(token)
            out.append(token)
    return out

def build_alias_glossary_entry(glossary: dict[str, list[str]], canonical: str, related: list[str]) -> None:
    canonical_norm = clean_text(canonical).lower()
    related_clean = []
    for item in related:
        item_clean = clean_text(item).lower()
        if item_clean and item_clean != canonical_norm:
            related_clean.append(item_clean)

    if not canonical_norm:
        return

    existing = glossary.setdefault(canonical_norm, [])
    for item in related_clean:
        if item not in existing:
            existing.append(item)

def build():
    version = 'dev'
    mkdocs_path = ROOT / "mkdocs.yml"
    if mkdocs_path.exists():
        mkdocs_data = yaml.safe_load(mkdocs_path.read_text(encoding='utf-8')) or {}
        version = str((mkdocs_data.get('extra') or {}).get('sunder_version', 'dev'))

    index: dict[str, Any] = {
        "version": version,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "pages": [],
        "entries": []
    }
    chunks: dict[str, Any] = {}
    glossary: dict[str, list[str]] = {k: v[:] for k, v in STATIC_GLOSSARY.items()}

    doc_freqs: dict[str, defaultdict[str, int]] = {
        field: defaultdict(int) for field in SEARCH_FIELDS
    }
    field_len_totals: dict[str, int] = {field: 0 for field in SEARCH_FIELDS}
    total_docs = 0

    for folder in DOC_FOLDERS:
        folder_path = PUBLIC / folder
        if not folder_path.exists():
            continue

        for md_path in sorted(folder_path.rglob("*.md")):
            raw = md_path.read_text(encoding='utf-8')
            frontmatter, body = parse_frontmatter(raw)
            page_aliases = extract_aliases(frontmatter)

            fallback_title = prettify_stem(md_path.stem)
            page_title, sections = parse_headings(body, fallback_title)

            url = page_url(md_path)
            page_id = md_path.relative_to(PUBLIC).with_suffix("").as_posix()
            modes = infer_modes(md_path)

            index["pages"].append({
                "id": page_id,
                "title": page_title,
                "url": url,
                "section": folder.title(),
                "aliases": page_aliases,
                "mode": modes,
            })

            if page_aliases:
                for alias in [page_title] + page_aliases:
                    build_alias_glossary_entry(glossary, alias, [page_title] + page_aliases)

            if not sections:
                clean_body = clean_text(body)
                if clean_body:
                    sections = [
                        {
                            "heading_path": [page_title],
                            "heading": page_title,
                            "anchor": None,
                            "text": clean_body,
                        }
                    ]

            for section_idx, section in enumerate(sections):
                heading_path = section["heading_path"]
                heading = section['heading']
                anchor = section['anchor']
                section_chunks = chunk_section_text(section['text'])

                for chunk_idx, chunk_text in enumerate(section_chunks):
                    chunk_id = f"{page_id}::{section_idx}:{chunk_idx}"
                    chunk_url = f'{url}#{anchor}' if anchor else url

                    section_aliases = list(dict.fromkeys([
                        h for h in heading_path[1:] if clean_text(h) and clean_text(h) != clean_text(heading)
                    ]))

                    aliases_for_entry = list(dict.fromkeys(page_aliases + heading_path))
                    norm = {
                        "title": norm_text(page_title),
                        "pageAliases": norm_list(page_aliases),
                        "heading": norm_text(heading),
                        "headingPath": norm_text(" ".join(heading_path)),
                        "sectionAliases": norm_list(section_aliases),
                        "body": norm_text(chunk_text),
                    }

                    term_freqs = {
                        "title": count_terms_text(page_title),
                        "pageAliases": count_terms_list(page_aliases),
                        "heading": count_terms_text(heading),
                        "headingPath": count_terms_text(" ".join(heading_path)),
                        "sectionAliases": count_terms_list(section_aliases),
                        "body": count_terms_text(chunk_text),
                    }

                    field_lengths = compute_field_lengths(term_freqs)

                    for field in SEARCH_FIELDS:
                        field_len_totals[field] += field_lengths[field]
                        for token in term_freqs[field].keys():
                            doc_freqs[field][token] += 1

                    total_docs += 1

                    index["entries"].append({
                        "id": chunk_id,
                        "pageId": page_id,
                        "title": page_title,
                        "heading": heading,
                        "headingPath": heading_path,
                        "sectionAliases": section_aliases,
                        "anchor": anchor,
                        "url": chunk_url,
                        "mode": modes,
                        "aliases": aliases_for_entry,
                        "tokens": tokenise(
                            page_title,
                            heading,
                            " ".join(heading_path),
                            " ".join(page_aliases),
                            chunk_text,
                        )[:220],
                        "norm": norm,
                        "field_lengths": field_lengths,
                        "term_freqs": term_freqs,
                    })

                    chunks[chunk_id] = {
                        "pageTitle": page_title,
                        "url": chunk_url,
                        "heading": heading,
                        "headingPath": heading_path,
                        "anchor": anchor,
                        "text": chunk_text,
                        "aliases": aliases_for_entry,
                        "tags": modes
                    }

    avg_field_lens = {
        field: (field_len_totals[field] / total_docs if total_docs else 1.0)
        for field in SEARCH_FIELDS
    }

    all_tokens = set()
    for field in SEARCH_FIELDS:
        all_tokens.update(doc_freqs[field].keys())

    global_idf: dict[str, float] = {}
    for token in all_tokens:
        df = max(doc_freqs[field].get(token, 0) for field in SEARCH_FIELDS)
        if df:
            global_idf[token] = math.log(1 + (total_docs - df + 0.5) / (df + 0.5))
        else:
            global_idf[token] = 0.0

    index['stats'] = {
        'totalDocs': total_docs,
        'avgFieldLens': avg_field_lens,
        "docFreqs": {field: dict(values) for field, values in doc_freqs.items()},
        "globalIdf": global_idf,
    }

    (CHAT / "index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding='utf-8')
    (CHAT / "chunks.json").write_text(json.dumps(chunks, indent=2, ensure_ascii=False), encoding='utf-8')
    (CHAT / "glossary.json").write_text(json.dumps(glossary, indent=2, ensure_ascii=False), encoding='utf-8')

    print(f"Wrote {CHAT / 'index.json'}")
    print(f"Wrote {CHAT / 'chunks.json'}")
    print(f"Wrote {CHAT / 'glossary.json'}")

if __name__ == "__main__":
    build()
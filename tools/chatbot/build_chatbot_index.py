from pathlib import Path
import json
import re
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
CHAT = PUBLIC / "chat"
CHAT.mkdir(parents=True, exist_ok=True)

DOC_FOLDERS = ["core", "gameplay", "characters", "lore", "meta"]

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")

MODE_BY_PATH = {
    "core": ["rules", "builder"],
    "gameplay": ["rules", "builder"],
    "characters": ["rules", "builder", "lore"],
    "lore": ["lore"],
    "meta": []
}

ALIASES = {
    "aoe": ["area of effect"],
    "jinx": ["jinx threshold"],
    "domains": ["pantheons"]
}

def clean_text(text: str) -> str:
    text = WIKILINK_RE.sub(lambda m: m.group(1).split("|")[-1], text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def page_url(path: Path) -> str:
    rel = path.relative_to(PUBLIC).with_suffix("")
    return f"/site/{rel.as_posix()}/"

def parse_markdown(path: Path):
    raw = path.read_text(encoding='utf-8')
    lines = raw.splitlines()

    page_title = path.stem.replace("-", " ").title()
    current_heading = page_title
    buffer = []
    sections = []

    def flush():
        nonlocal buffer, current_heading
        text = clean_text("\n".join(buffer)).strip()
        if text:
            sections.append((current_heading, text))
        buffer = []

    for line in lines:
        m = HEADING_RE.match(line)
        if m:
            flush()
            current_heading = clean_text(m.group(2))
        else:
            buffer.append(line)
    flush()
    return page_title, sections

def infer_modes(path: Path):
    first = path.parts[len(PUBLIC.parts)]
    return MODE_BY_PATH.get(first, ['rules'])

def build():
    index = {"version": "dev", "generatedAt": datetime.now(timezone.utc).isoformat(), "pages": [], "entries": []}
    chunks = {}
    glossary = ALIASES.copy()

    for folder in DOC_FOLDERS:
        folder_path = PUBLIC / folder
        if not folder_path.exists():
            continue

        for md in folder_path.rglob("*.md"):
            title, sections = parse_markdown(md)
            url = page_url(md)
            page_id = md.relative_to(PUBLIC).with_suffix("").as_posix()
            modes = infer_modes(md)

            index["pages"].append({
                "id": page_id,
                "title": title,
                "url": url,
                "section": folder.title()
            })

            for i, (heading, text) in enumerate(sections):
                if len(text) < 40:
                    continue

                chunk_id = f"{page_id}::{i}"
                tokens = re.findall(r"[a-zA-Z0-9-]+", f"{title} {heading} {text}".lower())

                index["entries"].append({
                    "id": chunk_id,
                    "pageId": page_id,
                    "title": title,
                    "heading": heading,
                    "mode": modes,
                    "tokens": sorted(set(tokens))[:120]
                })

                chunks[chunk_id] = {
                    "pageTitle": title,
                    "url": url,
                    "heading": heading,
                    "text": text,
                    "tags": modes
                }

    (CHAT / "index.json").write_text(json.dumps(index, indent=2), encoding='utf-8')
    (CHAT / "chunks.json").write_text(json.dumps(chunks, indent=2), encoding='utf-8')
    (CHAT / "glossary.json").write_text(json.dumps(glossary, indent=2), encoding='utf-8')

if __name__ == "__main__":
    build()
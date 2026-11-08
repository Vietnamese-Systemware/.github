"""Check built local links, anchors, search data, and original download integrity."""
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.duplicate_ids = set()
        self.links = []
        self.language = None
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.language = attrs.get("lang")
        if "id" in attrs:
            if attrs["id"] in self.ids:
                self.duplicate_ids.add(attrs["id"])
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            if key in attrs:
                self.links.append(attrs[key])


def main():
    pages = {p.resolve(): Page(p) for p in SITE.rglob("*.html")}
    assert pages, "Build the site first."
    failures = []
    checked = 0
    for path, page in pages.items():
        if page.language != "en":
            failures.append(f"{path.relative_to(SITE)}: expected English HTML language")
        if page.duplicate_ids:
            failures.append(f"{path.relative_to(SITE)}: duplicate IDs {sorted(page.duplicate_ids)}")
        if re.search(r"[\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01a0\u01a1\u01af\u01b0\u1ea0-\u1ef9]", path.read_text(encoding="utf-8")):
            failures.append(f"{path.relative_to(SITE)}: Vietnamese text remains")
        for link in page.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                continue
            raw = unquote(url.path)
            if not raw:
                target = path
            elif raw.startswith("/"):
                target = SITE / raw.lstrip("/")
            else:
                target = path.parent / raw
            target = target.resolve()
            if target.is_dir():
                target /= "index.html"
            checked += 1
            if not target.is_file():
                failures.append(f"{path.relative_to(SITE)}: missing {link}")
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                failures.append(f"{path.relative_to(SITE)}: missing anchor {link}")
    manifest = json.loads((SITE / "downloads/source-manifest.json").read_text())
    for item in manifest:
        source = ROOT.parent / item["source"]
        published = SITE / "downloads" / source.name
        assert sha256(source.read_bytes()).hexdigest() == item["sha256"]
        assert published.read_bytes() == source.read_bytes(), f"Download changed: {source.name}"
    index = json.loads((SITE / "search/search_index.json").read_text())
    search_text = " ".join(d.get("text", "") for d in index["docs"])
    for term in ("RBOSTA", "VSUART", "BRG", "ral_env"):
        assert term in search_text, f"Missing search term: {term}"
    assert not failures, "\n".join(failures)
    print(f"PASS: {len(pages)} HTML files, {checked} local links/assets/anchors, "
          f"{len(manifest)} original downloads, source hashes, search index, English language and unique IDs.")


if __name__ == "__main__":
    main()

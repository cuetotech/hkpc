#!/usr/bin/env python3
"""Capture the public vahope.net site as a deterministic static snapshot.

Unauthenticated public content only. The crawler canonicalizes cache-busting
query parameters, rewrites internal links to static files, disables forms, and
records unresolved external dependencies.
"""
from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import re
import shutil
import sys
import time
from collections import deque
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit, unquote

import requests
from bs4 import BeautifulSoup

SOURCE = "http://vahope.net"
HOSTS = {"vahope.net", "www.vahope.net"}
OUT = Path("site")
MAX_PAGES = 1000
MAX_ASSETS = 6000
MAX_BYTES = 700 * 1024 * 1024
MAX_FILE_BYTES = 95 * 1024 * 1024
CACHE_KEYS = {"update", "ver", "v", "_", "cb", "cache", "cachebuster", "timestamp", "ts", "t"}
DANGEROUS_WORDS = {"logout", "login", "register", "signup", "write", "delete", "modify", "admin"}
ASSET_EXTS = {
    ".css", ".js", ".mjs", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".otf", ".eot", ".pdf", ".doc", ".docx", ".xls", ".xlsx",
    ".ppt", ".pptx", ".hwp", ".hwpx", ".zip", ".txt", ".xml", ".json", ".mp3", ".mp4",
    ".webm", ".wav", ".ogg", ".m4a", ".mov"
}
PAGE_EXTS = {"", ".html", ".htm", ".php", ".asp", ".aspx", ".jsp"}
SEEDS = [
    "/",
    "/main/main.html",
    "/main/sub.html?pageCode=1",
    "/main/sub.html?pageCode=3",
    "/main/sub.html?pageCode=15",
]

session = requests.Session()
session.headers.update({"User-Agent": "HKPC-Website-Preservation/2.0 (+https://github.com/cuetotech/hkpc)"})

page_queue: deque[str] = deque()
asset_queue: deque[str] = deque()
queued_pages: set[str] = set()
queued_assets: set[str] = set()
done_pages: set[str] = set()
done_assets: set[str] = set()
external_refs: set[str] = set()
failures: list[dict] = []
redirects: list[dict] = []
saved: dict[str, str] = {}
total_bytes = 0


def safe_segment(value: str) -> str:
    value = unquote(value)
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", value)
    value = re.sub(r"\s+", "_", value).strip(" ._")
    return value or "_"


def canonicalize(raw: str, base: str) -> str | None:
    if not raw:
        return None
    raw = raw.strip()
    if raw.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    absolute = urljoin(base, raw)
    parts = urlsplit(absolute)
    host = (parts.hostname or "").lower()
    if host not in HOSTS:
        if parts.scheme in {"http", "https"}:
            external_refs.add(absolute)
        return absolute
    query = []
    for key, val in parse_qsl(parts.query, keep_blank_values=True):
        if key.lower() in CACHE_KEYS:
            continue
        query.append((key, val))
    query.sort()
    return urlunsplit(("http", "vahope.net", parts.path or "/", urlencode(query, doseq=True), ""))


def looks_dangerous(url: str) -> bool:
    parts = urlsplit(url)
    text = (parts.path + "?" + parts.query).lower()
    return any(re.search(rf"(^|[/?&=_-]){re.escape(word)}([/?&=_-]|$)", text) for word in DANGEROUS_WORDS)


def looks_asset(url: str) -> bool:
    return Path(urlsplit(url).path).suffix.lower() in ASSET_EXTS


def query_suffix(url: str) -> str:
    query = urlsplit(url).query
    if not query:
        return ""
    pairs = parse_qsl(query, keep_blank_values=True)
    slug = "__" + "__".join(f"{safe_segment(k)}-{safe_segment(v)}" for k, v in pairs)
    if len(slug) > 100:
        slug = "__q-" + hashlib.sha1(query.encode()).hexdigest()[:12]
    return slug


def local_path(url: str, kind: str) -> Path:
    parts = urlsplit(url)
    raw_parts = [safe_segment(p) for p in parts.path.split("/") if p]
    if kind == "page":
        if not raw_parts or parts.path in {"/", "/main/main.html"}:
            return Path("index.html")
        p = Path(*raw_parts)
        suffix = p.suffix.lower()
        stem = p.stem if suffix else p.name
        parent = p.parent
        ext = suffix if suffix in {".html", ".htm"} else ".html"
        return parent / f"{stem}{query_suffix(url)}{ext}"

    if not raw_parts:
        raw_parts = ["asset"]
    p = Path(*raw_parts)
    suffix = p.suffix
    if parts.query:
        stem = p.stem if suffix else p.name
        q = "__q-" + hashlib.sha1(parts.query.encode()).hexdigest()[:10]
        p = p.parent / f"{stem}{q}{suffix}"
    return p


def rel_link(from_file: Path, to_file: Path) -> str:
    return Path(os.path.relpath(to_file, start=from_file.parent)).as_posix()


def enqueue_page(url: str) -> None:
    if url in queued_pages or url in done_pages or looks_dangerous(url):
        return
    if len(queued_pages) + len(done_pages) >= MAX_PAGES:
        return
    queued_pages.add(url)
    page_queue.append(url)


def enqueue_asset(url: str) -> None:
    if url in queued_assets or url in done_assets or looks_dangerous(url):
        return
    if len(queued_assets) + len(done_assets) >= MAX_ASSETS:
        return
    queued_assets.add(url)
    asset_queue.append(url)


def fetch(url: str) -> requests.Response | None:
    global total_bytes
    try:
        response = session.get(url, timeout=25, allow_redirects=True, stream=True)
        response.raise_for_status()
        if response.url != url:
            redirects.append({"from": url, "to": response.url, "status": response.status_code})
        data = bytearray()
        for chunk in response.iter_content(65536):
            if not chunk:
                continue
            data.extend(chunk)
            if len(data) > MAX_FILE_BYTES:
                raise RuntimeError(f"file exceeds {MAX_FILE_BYTES} bytes")
            if total_bytes + len(data) > MAX_BYTES:
                raise RuntimeError(f"capture exceeds {MAX_BYTES} bytes")
        response._content = bytes(data)
        response._content_consumed = True
        total_bytes += len(data)
        return response
    except Exception as exc:
        failures.append({"url": url, "error": str(exc)})
        return None


def write_bytes(path: Path, data: bytes) -> None:
    full = OUT / path
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_bytes(data)
    saved[path.as_posix()] = hashlib.sha256(data).hexdigest()


def rewrite_css(text: str, source_url: str, source_path: Path) -> str:
    pattern = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)

    def repl(match: re.Match) -> str:
        raw = match.group(2).strip()
        target = canonicalize(raw, source_url)
        if not target or urlsplit(target).hostname not in HOSTS:
            return match.group(0)
        enqueue_asset(target)
        return f"url('{rel_link(source_path, local_path(target, 'asset'))}')"

    text = pattern.sub(repl, text)

    import_pat = re.compile(r"@import\s+(['\"])(.*?)\1", re.I)

    def import_repl(match: re.Match) -> str:
        target = canonicalize(match.group(2), source_url)
        if not target or urlsplit(target).hostname not in HOSTS:
            return match.group(0)
        enqueue_asset(target)
        return f"@import '{rel_link(source_path, local_path(target, 'asset'))}'"

    return import_pat.sub(import_repl, text)


def rewrite_html(data: bytes, source_url: str, source_path: Path) -> bytes:
    encoding = "utf-8"
    text = data.decode(encoding, errors="replace")
    soup = BeautifulSoup(text, "html.parser")

    if soup.head:
        meta = soup.new_tag("meta")
        meta.attrs["name"] = "robots"
        meta.attrs["content"] = "noindex,nofollow,noarchive"
        soup.head.append(meta)

    attr_specs = [
        ("a", "href", "auto"),
        ("link", "href", "asset"),
        ("script", "src", "asset"),
        ("img", "src", "asset"),
        ("img", "data-src", "asset"),
        ("source", "src", "asset"),
        ("video", "poster", "asset"),
        ("audio", "src", "asset"),
        ("iframe", "src", "auto"),
    ]

    for tag_name, attr, mode in attr_specs:
        for tag in soup.find_all(tag_name):
            raw = tag.get(attr)
            if not raw:
                continue
            target = canonicalize(raw, source_url)
            if not target:
                continue
            if urlsplit(target).hostname not in HOSTS:
                continue

            if mode == "asset":
                kind = "asset"
            elif mode == "auto":
                kind = "asset" if looks_asset(target) else "page"
            else:
                kind = mode

            if kind == "page":
                enqueue_page(target)
            else:
                enqueue_asset(target)
            fragment = urlsplit(urljoin(source_url, raw)).fragment
            rewritten = rel_link(source_path, local_path(target, kind))
            if fragment:
                rewritten += "#" + fragment
            tag[attr] = rewritten

    for tag in soup.find_all(["img", "source"]):
        raw = tag.get("srcset")
        if not raw:
            continue
        pieces = []
        for item in raw.split(","):
            bits = item.strip().split()
            if not bits:
                continue
            target = canonicalize(bits[0], source_url)
            if target and urlsplit(target).hostname in HOSTS:
                enqueue_asset(target)
                bits[0] = rel_link(source_path, local_path(target, "asset"))
            pieces.append(" ".join(bits))
        tag["srcset"] = ", ".join(pieces)

    for tag in soup.find_all(style=True):
        tag["style"] = rewrite_css(tag["style"], source_url, source_path)

    for form in soup.find_all("form"):
        original = form.get("action")
        if original:
            form["data-original-action"] = original
        form["action"] = "#"
        form["onsubmit"] = "return false;"

    return str(soup).encode("utf-8")


def save_page(url: str) -> None:
    response = fetch(url)
    if response is None:
        return
    ctype = response.headers.get("Content-Type", "").lower()
    if "html" not in ctype and not urlsplit(response.url).path.lower().endswith((".html", ".htm", ".php", ".asp", ".aspx", ".jsp", "/")):
        enqueue_asset(url)
        return
    path = local_path(url, "page")
    body = rewrite_html(response.content, url, path)
    write_bytes(path, body)


def save_asset(url: str) -> None:
    response = fetch(url)
    if response is None:
        return
    ctype = response.headers.get("Content-Type", "").lower()
    path = local_path(url, "asset")
    data = response.content
    if "text/css" in ctype or path.suffix.lower() == ".css":
        text = data.decode("utf-8", errors="replace")
        data = rewrite_css(text, url, path).encode("utf-8")
    write_bytes(path, data)


def main() -> int:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    for seed in SEEDS:
        url = canonicalize(seed, SOURCE + "/")
        if url:
            enqueue_page(url)

    while page_queue:
        url = page_queue.popleft()
        queued_pages.discard(url)
        if url in done_pages:
            continue
        done_pages.add(url)
        print(f"PAGE {len(done_pages):03d} {url}", flush=True)
        save_page(url)
        time.sleep(0.03)

    while asset_queue:
        url = asset_queue.popleft()
        queued_assets.discard(url)
        if url in done_assets:
            continue
        done_assets.add(url)
        if len(done_assets) % 50 == 0:
            print(f"ASSET {len(done_assets):04d} {url}", flush=True)
        save_asset(url)
        time.sleep(0.01)

    (OUT / ".nojekyll").write_text("", encoding="utf-8")
    report = {
        "source": SOURCE,
        "generated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pages_attempted": len(done_pages),
        "assets_attempted": len(done_assets),
        "files_saved": len(saved),
        "bytes_saved": total_bytes,
        "external_references": sorted(external_refs),
        "failure_count": len(failures),
        "failures": failures,
        "redirects": redirects,
        "files": saved,
        "limits": {
            "max_pages": MAX_PAGES,
            "max_assets": MAX_ASSETS,
            "max_capture_bytes": MAX_BYTES,
            "max_file_bytes": MAX_FILE_BYTES,
        },
    }
    (OUT / "capture-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("pages_attempted", "assets_attempted", "files_saved", "bytes_saved", "failure_count")}, indent=2))

    if not (OUT / "index.html").exists():
        print("index.html was not captured", file=sys.stderr)
        return 2
    if len(saved) < 25:
        print("capture produced too few files", file=sys.stderr)
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

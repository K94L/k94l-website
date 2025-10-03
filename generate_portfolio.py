#!/usr/bin/env python3
"""Generate static portfolio markup from data/portfolio.csv.

Reads the CSV, builds the portfolio cards HTML, updates index.html between
`<!-- PORTFOLIO:START -->` / `<!-- PORTFOLIO:END -->`, and refreshes the
stat blocks so active companies and exits stay in sync with the CSV.
"""
from __future__ import annotations

import csv
import html
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
CSV_PATH = PROJECT_ROOT / "data" / "portfolio.csv"
INDEX_PATH = PROJECT_ROOT / "index.html"

START_MARKER = "<!-- PORTFOLIO:START -->"
END_MARKER = "<!-- PORTFOLIO:END -->"

STATUS_CLASS = {
    "invested": "status-badge status-invested",
    "exited": "status-badge status-exited",
    "rip": "status-badge status-rip",
}


def load_portfolio_rows() -> list[dict[str, str]]:
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV file not found: {CSV_PATH}")

    with CSV_PATH.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        rows = [
            {k: (v or "").strip() for k, v in row.items()}
            for row in reader
            if any((v or "").strip() for v in row.values())
        ]
    return rows


def normalise_status(value: str) -> str:
    if not value:
        return "Unknown"
    cleaned = value.lower()
    if cleaned in STATUS_CLASS:
        return cleaned.title()
    if cleaned in {"inactive", "closed"}:
        return "RIP"
    return value


def card_markup(entry: dict[str, str]) -> str:
    name = html.escape(entry.get("name") or "Untitled company")
    industry = html.escape(entry.get("industry") or "—")
    raw_status = entry.get("status", "")
    status = normalise_status(raw_status)
    status_class = STATUS_CLASS.get(status.lower(), "status-badge status-rip")
    url = (entry.get("url") or "").strip()
    year = html.escape(entry.get("year") or "—")

    if url:
        safe_url = html.escape(url, quote=True)
        if not safe_url.startswith(("http://", "https://")):
            safe_url = "https://" + safe_url
        link_markup = (
            "                <a href=\"{url}\" target=\"_blank\" rel=\"noopener noreferrer\">"
            "Visit Website</a>\n"
        ).format(url=safe_url)
    else:
        link_markup = "                <span></span>\n"

    return (
        "            <article class=\"portfolio-card\">\n"
        "              <div class=\"portfolio-card-header\">\n"
        "                <div>\n"
        "                  <h3>{name}</h3>\n"
        "                  <p class=\"industry\">{industry}</p>\n"
        "                </div>\n"
        "                <span class=\"{status_class}\">{status}</span>\n"
        "              </div>\n"
        "              <div class=\"portfolio-card-footer\">\n"
        "{link}"
        "                <div class=\"year\">\n"
        "                  <span>{year}</span>\n"
        "                  <span class=\"year-caption\">Year</span>\n"
        "                </div>\n"
        "              </div>\n"
        "            </article>\n"
    ).format(
        name=name,
        industry=industry,
        status_class=status_class,
        status=html.escape(status),
        link=link_markup,
        year=year,
    )


def build_portfolio_html(rows: list[dict[str, str]]) -> str:
    if not rows:
        return "            <p class=\"portfolio-empty\">No portfolio entries yet.</p>\n"
    entries = [card_markup(row) for row in rows]
    return "".join(entries)


def calculate_stats(rows: list[dict[str, str]]) -> dict[str, int]:
    active = 0
    exits = 0
    for row in rows:
        status = normalise_status(row.get("status", ""))
        status_lower = status.lower()
        if status_lower != "rip":
            active += 1
        if status_lower == "exited":
            exits += 1
    return {"active": active, "exits": exits}


def update_index(content: str, stats: dict[str, int]) -> None:
    text = INDEX_PATH.read_text(encoding="utf-8")
    if START_MARKER not in text or END_MARKER not in text:
        raise SystemExit("Portfolio markers not found in index.html")

    before, rest = text.split(START_MARKER, 1)
    _, after = rest.split(END_MARKER, 1)

    new_segment = f"{START_MARKER}\n{content}{END_MARKER}"
    updated = before + new_segment + after

    updated = replace_stat_value(updated, "portfolio-count", stats["active"])
    updated = replace_stat_value(updated, "exit-count", stats["exits"])

    INDEX_PATH.write_text(updated, encoding="utf-8")


def replace_stat_value(text: str, element_id: str, value: int) -> str:
    pattern = rf"<div class=\"stat-value\" id=\"{element_id}\">.*?</div>"
    if not re.search(pattern, text):
        raise SystemExit(f"Could not find stat element with id '{element_id}' in index.html")
    replacement = f"<div class=\"stat-value\" id=\"{element_id}\">{value}</div>"
    return re.sub(pattern, replacement, text, count=1)


def main() -> None:
    rows = load_portfolio_rows()
    stats = calculate_stats(rows)
    content = build_portfolio_html(rows)
    update_index(content, stats)
    print(
        "Updated portfolio with {total} rows ({active} active, {exits} exits).".format(
            total=len(rows), active=stats["active"], exits=stats["exits"]
        )
    )


if __name__ == "__main__":
    main()

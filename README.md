# VSUART documentation website

An English MkDocs Material website for Vietnamese Systemware UART IP. The layout follows technical documentation conventions: a fixed 340 px sidebar with search and section navigation, and a main article column with breadcrumbs. The article background fills the available viewport width in both light and dark modes. Deep red and yellow accents are retained, with responsive navigation and light/dark modes. Technical content is based on `../99_Doc` and the local RTL/testbench.

## Run locally

From the VSUART project directory containing `0_rtl`, `99_Doc`, and `.venv`:

```bash
# For a fresh checkout only:
python3 -m venv .venv
.venv/bin/python -m pip install -r VSUART_webpage/requirements.txt

# Start the documentation server:
.venv/bin/python -m mkdocs serve -f VSUART_webpage/mkdocs.yml
```

Open http://127.0.0.1:8000/. Static output is generated in `VSUART_webpage/site/`.

## Build and validate

```bash
.venv/bin/python -m mkdocs build --strict -f VSUART_webpage/mkdocs.yml
.venv/bin/python VSUART_webpage/scripts/check_site.py
node VSUART_webpage/scripts/check_baudrate.cjs
node VSUART_webpage/scripts/check_frames.cjs
```

The site checker verifies all local links/assets/anchors, the search index, original download hashes, English content, and duplicate IDs. JavaScript checks exercise the baud calculator and UART frame logic, including parity and bit ordering.

## Website structure

- `mkdocs.yml`: English navigation, search, palette, and Markdown settings.
- `docs/index.md`: technical introduction, documentation outline, key parameters, and original source links.
- `overrides/main.html`: shared documentation layout, sidebar, and breadcrumbs.
- `overrides/partials/header.html`: project identity, theme switch, sidebar search, and mobile header.
- `docs/stylesheets/extra.css`: responsive red/yellow theme and documentation styling.
- `docs/javascripts/frame-explorer.js`: educational 8N1, 8E1, and 9N2 waveforms with hexadecimal input validation, displayed on the Features & frame formats page.
- `docs/javascripts/baudrate.js`: FunctionalSpec §§3.5–3.6 calculations, range checks, and clock ordering checks.
- `docs/specification/`, `design/`, `verification/`, and `reference/`: source-based technical documentation.
- `hooks/source_assets.py`: build-time source downloads, SHA-256 manifest, searchable workbook cells, and two extracted workbook images.

## Source handling

The hook reads the four originals in `99_Doc` and leaves them untouched. It uses Python's standard library and MkDocs' generated-file API. Workbook values are HTML-escaped and never executed. PDF references use physical page numbers.

Editorial pages and architecture illustrations require review when specifications or implementation change. `reference/known-gaps.md` records document/RTL differences. The site describes available tests without claiming unsupported regression results or coverage percentages.

All fonts, artwork, scripts, and styles are local; no external CDN or backend is required to serve the built website. Search and interactive tools require JavaScript. The static output can be served at a domain root or under a path prefix. This repository task builds a local website without registering a hosted Site.

Customization follows the [Material for MkDocs theme extension documentation](https://squidfunk.github.io/mkdocs-material/customization/).

The layout reference is the [CVA6 documentation](https://cva6.readthedocs.io/en/latest/). On desktop the sidebar remains fixed and scrolls independently. On smaller screens the navigation opens from the menu button.

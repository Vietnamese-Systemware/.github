"""Expose original 99_Doc files and workbook content without changing sources."""
from datetime import datetime, timedelta
from hashlib import sha256
from html import escape
from pathlib import Path
from zipfile import ZipFile
import json
import posixpath
import xml.etree.ElementTree as ET
from mkdocs.structure.files import File

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
SOURCE_NAMES = ("VSUART_FunctionalSpec.pdf", "VSUART_DesignSpec.pdf", "VSUART_TestEnv.xlsx", "VSUART_Testplan.xlsx")


def workbook_markdown(path):
    """Read OOXML values; never execute workbook content."""
    sections = ["# TestEnv workbook reader\n",
        "Generated directly from `99_Doc/VSUART_TestEnv.xlsx` on every build. "
        "Worksheet names, cell addresses, and content are preserved. For layout, merged cells, "
        "and Excel formatting, open the [original workbook](../downloads/VSUART_TestEnv.xlsx). "
        "Sheets containing only headings are retained without inferred details.\n"]
    with ZipFile(path) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ["".join(t.text or "" for t in item.findall(".//s:t", NS))
                       for item in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
        rels = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(
            archive.read("xl/_rels/workbook.xml.rels"))}
        sheets = ET.fromstring(archive.read("xl/workbook.xml")).find("s:sheets", NS)
        for sheet in sheets:
            name = sheet.attrib["name"]
            sections.extend([f"\n## {name}\n", "| Cell | Content |", "| --- | --- |"])
            target = rels[sheet.attrib[f"{{{REL_NS}}}id"]]
            member = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
            root = ET.fromstring(archive.read(member))
            for cell in root.findall(".//s:sheetData/s:row/s:c", NS):
                value = cell.findtext("s:v", default="", namespaces=NS)
                if cell.get("t") == "s":
                    value = strings[int(value)]
                elif cell.get("t") == "inlineStr":
                    value = "".join(t.text or "" for t in cell.findall(".//s:t", NS))
                if not value:
                    continue
                if name == "2. History" and cell.get("r") in {"B8", "B9"}:
                    value = (datetime(1899, 12, 30) + timedelta(days=float(value))).date().isoformat()
                value = escape(value).replace("|", "&#124;").replace("\n", "<br>")
                for char in ("*", "_", "`", "[", "]"):
                    value = value.replace(char, f"&#{ord(char)};")
                sections.append(f"| `{cell.attrib['r']}` | {value} |")
            if name == "3. Env overview":
                sections.append("\n![Original environment diagram from the workbook](../assets/source/testenv-architecture.png)\n")
            elif name == "4. clk_rst_env":
                sections.append("\n![Original reset timing from the workbook](../assets/source/reset-timing.png)\n")
    return "\n".join(sections) + "\n"


def on_files(files, config):
    source_dir = Path(config.config_file_path).resolve().parent.parent / "99_Doc"
    manifest = []
    for name in SOURCE_NAMES:
        path = source_dir / name
        data = path.read_bytes()
        files.append(File.generated(config, f"downloads/{name}", abs_src_path=str(path)))
        manifest.append({"source": f"99_Doc/{name}", "bytes": len(data), "sha256": sha256(data).hexdigest()})
    files.append(File.generated(config, "downloads/source-manifest.json",
                                content=json.dumps(manifest, indent=2) + "\n"))
    workbook = source_dir / "VSUART_TestEnv.xlsx"
    with ZipFile(workbook) as archive:
        for member, name in [("xl/media/image1.png", "testenv-architecture.png"),
                             ("xl/media/image2.png", "reset-timing.png")]:
            files.append(File.generated(config, f"assets/source/{name}", content=archive.read(member)))
    return files

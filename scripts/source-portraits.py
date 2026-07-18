#!/usr/bin/env python3
"""Sources portrait files from Wikimedia Commons for the fig. A plates.

For each figure, tries an ordered list of candidate file titles, verifies the
license via the Commons API (extmetadata), and accepts only licenses in the
allowlist. Downloads the ~1600px thumb and records a provenance entry
(artist, license, file page) that the site renders as the plate's credit.

Run from the repo root:
  <venv>/python scripts/source-portraits.py <workdir>
Outputs: <workdir>/src-<id>.<ext> + scripts/portraits-provenance.json
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "fc-dossier-engraver/1.0 (https://www.franciscocascalheira.com; francisco.cascalheira2006@gmail.com)"}
API = "https://commons.wikimedia.org/w/api.php"

ALLOWED = re.compile(
    r"^(public domain|pd|cc0|no restrictions|copyrighted free use|attribution"
    r"|cc by(?:-sa)? \d\.\d.*)$",
    re.I,
)

# Candidate Commons file titles, canonical portrait first.
CANDIDATES: dict[str, list[str]] = {
    # NOTE: first title = the one that actually shipped (kept in
    # portraits-provenance.json); Commons redirects may canonicalize titles.
    "dostoevsky": [
        "File:Vasily Perov - Портрет Ф.М.Достоевского - Google Art Project.jpg",
    ],
    "homer": [
        "File:Rembrandt Harmensz. van Rijn - Homerus - Google Art Project.jpg",
        "File:Homer British Museum.jpg",
    ],
    "dante": [
        "File:Portrait de Dante.jpg",
        "File:Dante Alighieri's portrait by Sandro Botticelli.jpg",
    ],
    "cervantes": [
        "File:Cervantes Jáuregui.jpg",
        "File:Miguel de Cervantes.jpg",
    ],
    "stendhal": [
        "File:Stendhal.jpg",
        "File:Olof Johan Södermark - Portrait of Stendhal.jpg",
    ],
    "flaubert": [
        "File:Gustave Flaubert.jpg",
        "File:Gustave flaubert.jpg",
    ],
    "proust": [
        "File:Marcel Proust 1900-2.jpg",
        "File:Marcel Proust 1895.jpg",
    ],
    "girard": [
        "File:René Girard.jpg",
        "File:Rene Girard.jpg",
    ],
    "tolstoy": [
        "File:Ilya Efimovich Repin (1844-1930) - Portrait of Leo Tolstoy (1887).jpg",
        "File:L.N.Tolstoy Prokudin-Gorsky.jpg",
    ],
    "nabokov": [
        "File:Vladimir Nabokov 1973.jpg",
        "File:Vladimir Nabokov 1969.jpg",
    ],
    "solzhenitsyn": [
        "File:Aleksandr Solzhenitsyn 1974crop.jpg",
        "File:Alexander Solzhenitsyn photo.jpg",
    ],
    "ortega": [
        "File:JoseOrtegayGasset.jpg",
        "File:José Ortega y Gasset.jpg",
        "File:Jose Ortega y Gasset 1920s.jpg",
    ],
    "marias": [
        "File:Julián Marías.JPG",
        "File:Julián Marías.jpg",
        "File:Julian Marias.jpg",
    ],
    "unamuno": [
        "File:Miguel de Unamuno Meurisse 1925.jpg",
        "File:Unamuno Kaulak.jpg",
        "File:Miguel de Unamuno.jpg",
    ],
    "mises": [
        "File:Ludwig von Mises.jpg",
        "File:Young Ludwig von Mises.jpg",
    ],
    "hayek": [
        "File:Friedrich Hayek portrait.jpg",
        "File:Hayek portrait.jpg",
    ],
    "rothbard": [
        "File:Murray Rothbard.jpg",
        "File:MurrayBW.jpg",
    ],
    "hoppe": [
        "File:Hans-Hermann Hoppe by Gage Skidmore.jpg",
        "File:Hans-Hermann Hoppe 2017.jpg",
        "File:HansHermannHoppe.jpg",
    ],
    "camoes": [
        "File:Luís de Camões por François Gérard.jpg",
        "File:Camoes por Fernao Gomes.jpg",
        "File:Luis de Camões.jpg",
    ],
    "pessoa": [
        "File:Pessoa chapeu.jpg",
        "File:Fernando Pessoa 1934.jpg",
        "File:Fernando Pessoa photo.jpg",
        "File:Fernando Pessoa em 1934.jpg",
    ],
    "vieira": [
        "File:António Vieira.jpg",
        "File:Padre António Vieira.jpg",
    ],
    "hardy": [
        "File:Godfrey Harold Hardy 1.jpg",
        "File:Ghhardy@72.jpg",
        "File:GH Hardy.jpg",
        "File:Godfrey Harold Hardy 1.jpg",
    ],
    "turing": [
        "File:Alan Turing (1912-1954) in 1936 at Princeton University.jpg",
        "File:Alan Turing az 1930-as években.jpg",
        "File:Alan Turing Aged 16.jpg",
    ],
    "knuth": [
        "File:KnuthAtOpenContentAlliance.jpg",
        "File:Donald Knuth 2005.jpg",
    ],
    "lamport": [
        "File:Leslie Lamport.jpg",
        "File:Leslie Lamport 2005.jpg",
    ],
    # The stage, the poets, the investors — added 2026-07 in the fig. A rebuild.
    "virgil": [
        "File:Virgil Mosaic Bardo Museum Tunis.jpg",
    ],
    "shakespeare": [
        "File:Shakespeare.jpg",
    ],
    "sophocles": [
        "File:Head of Sophocles, Roman copy of Greek original, marble - Fitchburg Art Museum - DSC08630.JPG",
    ],
    "goethe": [
        "File:Joseph Karl Stieler portrait de Johann Wolfgang von Goethe.jpg",
        "File:Goethe (Stieler 1828).jpg",
    ],
    "beckett": [
        "File:Samuel Beckett, Pic, 1 bw.jpg",
    ],
    "machado_poet": [
        "File:Antonio Machado, por Joaquín Sorolla.jpg",
    ],
    "yeats": [
        "File:William Butler Yeats 1.jpg",
    ],
    "simons": [
        "File:Jim Simons at MSRI (cropped).jpg",
        "File:Jim Simons at MSRI.jpg",
    ],
    "munger": [
        "File:Charlie Munger.jpg",
    ],
    "bogle": [
        "File:Photo of a John C. Bogle By Bill Cramer.jpg",
    ],
    # fonseca is now owner-provided (the Proença-a-Nova statue), not Commons —
    # kept out of this list on purpose; see portraits-provenance.json.
}


def api(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def try_file(title):
    d = api({
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": "1600",
    })
    page = next(iter(d["query"]["pages"].values()))
    if "imageinfo" not in page:
        return None
    ii = page["imageinfo"][0]
    em = ii.get("extmetadata", {})
    lic = strip_html(em.get("LicenseShortName", {}).get("value", ""))
    if not ALLOWED.match(lic):
        return {"rejected": lic, "title": title}
    return {
        "title": page["title"],
        "thumb": ii.get("thumburl") or ii["url"],
        "license": lic,
        "artist": strip_html(em.get("Artist", {}).get("value", ""))[:90],
        "page": ii.get("descriptionurl", ""),
    }


def main(workdir):
    out = Path(workdir)
    out.mkdir(parents=True, exist_ok=True)
    provenance, misses = {}, {}
    for fid, titles in CANDIDATES.items():
        got = None
        for i, t in enumerate(titles):
            if i:
                time.sleep(0.25)
            try:
                r = try_file(t)
            except Exception as e:
                print(f"  ! {fid}: {t}: {e}")
                continue
            if r and "rejected" in r:
                print(f"  – {fid}: {t} rejected ({r['rejected']})")
                continue
            if r:
                got = r
                break
        if not got:
            misses[fid] = titles
            print(f"✗ {fid}: no accepted candidate")
            continue
        ext = got["thumb"].split(".")[-1].split("?")[0].lower()
        ext = ext if ext in ("jpg", "jpeg", "png") else "jpg"
        dst = out / f"src-{fid}.{ext}"
        req = urllib.request.Request(got["thumb"], headers=UA)
        dst.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        provenance[fid] = {**got, "local": dst.name}
        print(f"✓ {fid}: {got['title']}  [{got['license']}]")
        time.sleep(0.3)

    Path("scripts/portraits-provenance.json").write_text(
        json.dumps({"accepted": provenance, "missing": misses}, indent=2, ensure_ascii=False)
    )
    print(f"\naccepted {len(provenance)}, missing {len(misses)} → scripts/portraits-provenance.json")


if __name__ == "__main__":
    main(sys.argv[1])

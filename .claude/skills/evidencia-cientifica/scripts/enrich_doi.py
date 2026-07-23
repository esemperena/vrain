#!/usr/bin/env python3
"""Enriquece un DOI con metadatos de CrossRef, enlace de acceso abierto
(Unpaywall) y citas/estado de retraccion (OpenAlex).

Sin dependencias externas (solo stdlib). Salida: JSON a stdout.

Uso:
    python enrich_doi.py 10.3390/nu11112661
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CONTACT_EMAIL = os.environ.get("RESEARCH_CONTACT_EMAIL", "research@vrain.local")


def http_get_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": f"vrain-research ({CONTACT_EMAIL})"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_crossref(doi):
    url = f"https://api.crossref.org/works/{urllib.parse.quote(doi)}"
    data = http_get_json(url)["message"]
    authors = data.get("author", [])
    author_str = ", ".join(f"{a.get('family', '')} {a.get('given', '')}".strip() for a in authors)
    return {
        "title": (data.get("title") or [None])[0],
        "container_title": (data.get("container-title") or [None])[0],
        "authors": author_str,
        "year": (data.get("published", {}).get("date-parts", [[None]]) or [[None]])[0][0],
        "volume": data.get("volume"),
        "issue": data.get("issue"),
        "page": data.get("page"),
        "type": data.get("type"),
        "is_retracted": any(
            rel.get("id-type") == "doi" for rel in data.get("relation", {}).get("is-retracted-by", [])
        ) if data.get("relation") else False,
    }


def get_unpaywall(doi):
    url = f"https://api.unpaywall.org/v2/{urllib.parse.quote(doi)}?email={urllib.parse.quote(CONTACT_EMAIL)}"
    data = http_get_json(url)
    best = data.get("best_oa_location") or {}
    return {
        "is_oa": data.get("is_oa"),
        "oa_url": best.get("url_for_pdf") or best.get("url"),
        "oa_host_type": best.get("host_type"),
    }


def get_openalex(doi):
    url = f"https://api.openalex.org/works/doi:{urllib.parse.quote(doi)}"
    data = http_get_json(url)
    return {
        "cited_by_count": data.get("cited_by_count"),
        "is_retracted": data.get("is_retracted", False),
        "topics": [t.get("display_name") for t in (data.get("topics") or [])[:3]],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("doi")
    args = parser.parse_args()
    doi = args.doi.strip()

    out = {"doi": doi}
    for name, fn in (("crossref", get_crossref), ("unpaywall", get_unpaywall), ("openalex", get_openalex)):
        try:
            out[name] = fn(doi)
        except (urllib.error.URLError, urllib.error.HTTPError) as e:
            out[name] = {"error": str(e)}

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

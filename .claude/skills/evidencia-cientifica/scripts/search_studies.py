#!/usr/bin/env python3
"""Busca estudios cientificos en Europe PMC y PubMed (NCBI E-utilities).

Sin dependencias externas (solo stdlib). Salida: JSON a stdout.

Uso:
    python search_studies.py "vegan omega-3 DHA supplementation" --max-results 15
    python search_studies.py "ALA to DHA conversion humans" --source europepmc
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CONTACT_EMAIL = os.environ.get("RESEARCH_CONTACT_EMAIL", "research@vrain.local")
NCBI_API_KEY = os.environ.get("NCBI_API_KEY", "")

# Tipos de publicacion que priorizamos (coincide con los criterios de
# inclusion del vault: meta-analisis, revisiones sistematicas, posiciones
# oficiales por encima de estudios individuales).
HIGH_VALUE_TYPES = {
    "meta-analysis", "systematic review", "review", "practice guideline",
    "consensus development conference", "guideline",
}


def http_get_json(url, params, headers=None):
    qs = urllib.parse.urlencode(params)
    full_url = f"{url}?{qs}"
    req = urllib.request.Request(full_url, headers=headers or {"User-Agent": f"vrain-research ({CONTACT_EMAIL})"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def search_europepmc(query, max_results):
    params = {
        "query": query,
        "format": "json",
        "pageSize": min(max_results, 25),
        "resultType": "core",
    }
    data = http_get_json("https://www.ebi.ac.uk/europepmc/webservices/rest/search", params)
    results = []
    for item in data.get("resultList", {}).get("result", []):
        pub_types = [t.lower() for t in item.get("pubTypeList", {}).get("pubType", [])]
        oa_url = None
        for ft in item.get("fullTextUrlList", {}).get("fullTextUrl", []):
            if ft.get("documentStyle") == "pdf" or ft.get("availability", "").lower().startswith("open"):
                oa_url = ft.get("url")
                break
        results.append({
            "source": "europepmc",
            "pmid": item.get("pmid"),
            "pmcid": item.get("pmcid"),
            "doi": item.get("doi"),
            "title": item.get("title"),
            "authors": item.get("authorString"),
            "year": item.get("pubYear"),
            "journal": item.get("journalInfo", {}).get("journal", {}).get("title"),
            "pub_types": pub_types,
            "cited_by_count": item.get("citedByCount", 0),
            "is_open_access": item.get("isOpenAccess") == "Y",
            "oa_url": oa_url,
            "abstract": item.get("abstractText"),
        })
    return results


def fetch_pubmed_abstracts(ids):
    """Devuelve {pmid: abstract_text} via efetch (una sola llamada por lote)."""
    params = {
        "db": "pubmed",
        "id": ",".join(ids),
        "rettype": "abstract",
        "retmode": "xml",
        "tool": "vrain-research",
        "email": CONTACT_EMAIL,
    }
    if NCBI_API_KEY:
        params["api_key"] = NCBI_API_KEY
    qs = urllib.parse.urlencode(params)
    req = urllib.request.Request(
        f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?{qs}",
        headers={"User-Agent": f"vrain-research ({CONTACT_EMAIL})"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        xml_bytes = resp.read()
    root = ET.fromstring(xml_bytes)
    abstracts = {}
    for article in root.findall(".//PubmedArticle"):
        pmid_el = article.find(".//PMID")
        if pmid_el is None:
            continue
        parts = [el.text or "" for el in article.findall(".//AbstractText")]
        if parts:
            abstracts[pmid_el.text] = " ".join(parts).strip()
    return abstracts


def search_pubmed(query, max_results):
    esearch_params = {
        "db": "pubmed",
        "term": query,
        "retmax": min(max_results, 25),
        "retmode": "json",
        "tool": "vrain-research",
        "email": CONTACT_EMAIL,
    }
    if NCBI_API_KEY:
        esearch_params["api_key"] = NCBI_API_KEY
    esearch = http_get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi", esearch_params)
    ids = esearch.get("esearchresult", {}).get("idlist", [])
    if not ids:
        return []

    time.sleep(0.34 if not NCBI_API_KEY else 0.11)  # respeta el limite de 3/seg (10/seg con api key)

    esummary_params = {
        "db": "pubmed",
        "id": ",".join(ids),
        "retmode": "json",
        "tool": "vrain-research",
        "email": CONTACT_EMAIL,
    }
    if NCBI_API_KEY:
        esummary_params["api_key"] = NCBI_API_KEY
    esummary = http_get_json("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi", esummary_params)
    uids = esummary.get("result", {}).get("uids", [])
    if not uids:
        return []

    time.sleep(0.34 if not NCBI_API_KEY else 0.11)
    try:
        abstracts = fetch_pubmed_abstracts(uids)
    except (urllib.error.URLError, urllib.error.HTTPError, ET.ParseError):
        abstracts = {}

    results = []
    for uid in uids:
        doc = esummary["result"][uid]
        doi = None
        for aid in doc.get("articleids", []):
            if aid.get("idtype") == "doi":
                doi = aid.get("value")
                break
        results.append({
            "source": "pubmed",
            "pmid": uid,
            "pmcid": None,
            "doi": doi,
            "title": doc.get("title"),
            "authors": ", ".join(a.get("name", "") for a in doc.get("authors", [])),
            "year": (doc.get("pubdate") or "")[:4],
            "journal": doc.get("fulljournalname") or doc.get("source"),
            "pub_types": [t.lower() for t in doc.get("pubtype", [])],
            "cited_by_count": None,
            "is_open_access": None,
            "oa_url": None,
            "abstract": abstracts.get(uid),
        })
    return results


def score(record):
    priority = 1 if any(t in HIGH_VALUE_TYPES for t in record.get("pub_types") or []) else 0
    citations = record.get("cited_by_count") or 0
    return (priority, citations)


def dedupe(records):
    seen = {}
    for r in records:
        key = r.get("doi") or r.get("pmid") or r.get("title")
        if key not in seen:
            seen[key] = r
        else:
            # si una fuente trae abstract y otra no, quedate con la mas completa
            if not seen[key].get("abstract") and r.get("abstract"):
                seen[key] = r
    return list(seen.values())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", help="Query de busqueda (en ingles suele dar mejores resultados en estas APIs)")
    parser.add_argument("--source", choices=["europepmc", "pubmed", "both"], default="both")
    parser.add_argument("--max-results", type=int, default=15)
    args = parser.parse_args()

    records = []
    errors = []
    try:
        if args.source in ("europepmc", "both"):
            records += search_europepmc(args.query, args.max_results)
    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        errors.append(f"europepmc: {e}")
    try:
        if args.source in ("pubmed", "both"):
            records += search_pubmed(args.query, args.max_results)
    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        errors.append(f"pubmed: {e}")

    records = dedupe(records)
    records.sort(key=score, reverse=True)

    print(json.dumps({"query": args.query, "count": len(records), "results": records, "errors": errors}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

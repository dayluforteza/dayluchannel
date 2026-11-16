"""Audita las webs de los negocios (como webAudit.js del Prospector anterior) y recalcula la puntuación."""
import json, sys, re, datetime, concurrent.futures as cf, urllib.request, ssl
UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Mobile Safari/537.36"
WEIGHT = {"WEB_DOWN":18,"NO_MOBILE":14,"NO_HTTPS":10,"OLD_SITE":10,"NO_SEO":8,"SLOW":6,"NO_CTA":5}
FREE = ["facebook.com","instagram.com","wixsite","business.site","negocio.site","blogspot","wordpress.com","jimdo","webnode"]
YEAR = datetime.date.today().year

def audit(url):
    u = url if re.match(r"^https?://", url, re.I) else "http://" + url
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=10)
        html = r.read(400_000).decode("utf-8", "ignore"); final = r.geturl()
    except Exception:
        return {"url": u, "reachable": False}
    head = html[:60000]
    years = [int(y) for y in re.findall(r"(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d{2})", html, re.I)]
    title = (re.search(r"<title[^>]*>([^<]*)</title>", head, re.I) or [None, ""])[1].strip()
    desc = re.search(r"""<meta[^>]+name=["']description["'][^>]+content=["'][^"']{30,}""", head, re.I)
    gen = re.search(r"""<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)""", head, re.I)
    return {"url": final, "reachable": True, "https": final.startswith("https://"),
            "mobile": bool(re.search(r"""<meta[^>]+name=["']viewport["']""", head, re.I)),
            "seo": len(title) >= 10 and bool(desc), "lastUpdateYear": max(years) if years else None,
            "cta": bool(re.search(r"""href=["'](?:tel:|https?://(?:wa\.me|api\.whatsapp\.com))""", html, re.I)),
            "cms": gen[1][:40] if gen else None}

def classify(l, w):
    if not l["web"]:
        return "none", ["NO_WEB"]
    if any(f in l["web"] for f in FREE):
        return "outdated", ["FREE_SITE"]
    if not w or not w.get("reachable"):
        return "outdated", ["WEB_DOWN"]
    iss = []
    if w["mobile"] is False: iss.append("NO_MOBILE")
    if w["https"] is False: iss.append("NO_HTTPS")
    if w["lastUpdateYear"] and YEAR - w["lastUpdateYear"] >= 5: iss.append("OLD_SITE")
    if w["seo"] is False: iss.append("NO_SEO")
    if w["cta"] is False: iss.append("NO_CTA")
    severe = any(i in ("NO_MOBILE","NO_HTTPS","OLD_SITE") for i in iss)
    return ("outdated" if severe or len(iss) >= 3 else "modern"), iss

def score(l):
    s = {"none":55,"outdated":30,"modern":4}[l["webStatus"]] + sum(WEIGHT.get(i,0) for i in l["issues"])
    if "FREE_SITE" in l["issues"]: s += 15
    s += 15 if l["telefono"] else -25
    if l["redes"] and not l["web"]: s += 5
    if l.get("cadena"): s -= 60
    if l.get("rating"):
        r, n = l["rating"], l.get("reviews", 0)
        s += 12 if r >= 4.5 else 7 if r >= 4 else -8 if r < 3.5 else 0
        s += 10 if n >= 80 else 5 if n >= 25 else -5 if n < 8 else 0
    return max(1, min(99, round(s)))

if __name__ == "__main__":
    p = sys.argv[1]; leads = json.load(open(p))
    todo = {l["web"] for l in leads if l["web"] and not any(f in l["web"] for f in FREE)}
    res = {}
    with cf.ThreadPoolExecutor(24) as ex:
        for u, w in zip(todo, ex.map(audit, todo)): res[u] = w
    for l in leads:
        l["cadena"] = any(m.startswith("Cadena") for m in l.get("motivos", []))
        w = res.get(l["web"]); l["auditWeb"] = w
        l["webStatus"], l["issues"] = classify(l, w)
        l["puntuacion"] = score(l)
    leads.sort(key=lambda x: (-x["puntuacion"], x["nombre"] or ""))
    json.dump(leads, open(p, "w"), ensure_ascii=False, separators=(",",":"))
    import collections
    print(len(todo), "webs auditadas;", collections.Counter(l["webStatus"] for l in leads), collections.Counter(i for l in leads for i in l["issues"]).most_common())

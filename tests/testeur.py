#!/usr/bin/env python3
"""
Robot testeur : chaque matin, il pose de vraies questions au site EN LIGNE, comme un visiteur sur téléphone,
et vérifie les réponses. Si une réponse est fausse, vide ou « à côté », il ouvre (ou complète) un signalement
GitHub « Robot testeur » ; quand tout est revenu dans l'ordre, il le ferme.

Deux sortes de questions :
  - tests/questions.json : questions fixes avec la réponse attendue (écrites à la main, vérifiées) ;
  - un tirage au hasard dans les données du site lui-même (lieux célèbres avec leur hauteur pour Dix Mille
    Escales, accidents pour Cotes & Routes) : chaque jour des questions différentes.

  pip install playwright && python3 -m playwright install --with-deps chromium
  python3 tests/testeur.py --site dix-mille-escales --hasard 40
"""
import argparse, gzip, json, os, random, re, sys, time, urllib.request
from playwright.sync_api import sync_playwright

BASE = os.environ.get("TESTEUR_BASE", "https://pablopacaut17-sudo.github.io/")
ESPACES = re.compile(r"[\s  ]+")


def lire(url, gz=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "robot-testeur"}), timeout=60) as r:
        b = r.read()
    return json.loads(gzip.decompress(b) if gz else b)


def nombre(x):  # même présentation que le site : 58,4 m · 209 m · 1 250 m
    if x < 100:
        return (str(round(x * 10) / 10).rstrip("0").rstrip(".") if round(x * 10) % 10 else str(int(round(x)))).replace(".", ",") + "m"
    return f"{int(round(x)):,}".replace(",", "") + "m"


def hasard_dme(n):
    """Questions tirées au hasard dans l'index des lieux célèbres : « hauteur de X à Ville » → la hauteur attendue."""
    tests, cles = [], [a + b for a in "abcdefghilmnoprstv" for b in "aeiolnrsu"]
    random.shuffle(cles)
    for cle in cles:
        if len(tests) >= n:
            break
        try:
            l = lire(f"{BASE}dix-mille-escales/static/celebres/{cle}.json.gz", gz=True)
        except Exception:
            continue
        c = [x for x in l if len(x) > 3 and isinstance(x[3].get("ha"), (int, float)) and 2 <= x[3]["ha"] <= 900 and len(x[0]) >= 8]
        random.shuffle(c)
        for x in c[:3]:
            tests.append({"q": f"Quelle est la hauteur de {x[0]} à {x[2]} ?", "contient": [nombre(x[3]["ha"])], "hasard": True})
    return tests[:n]


def hasard_cr(n):
    """Accidents tirés au hasard : « accident <lieu> <année> » → le nombre de morts attendu."""
    import io
    with urllib.request.urlopen(f"{BASE}cotes-et-routes/data/accidents-index.json.gz", timeout=60) as r:
        d = json.loads(gzip.decompress(r.read()))
    a = [x for x in d["accidents"] if x[1] and x[5] and x[5] >= 20 and x[0][:4] >= "1970"]
    random.shuffle(a)
    return [{"q": f"accident {x[1].split(',')[0]} {x[0][:4]}", "contient": [f"{x[5]}|{x[0][:4]}"], "interdit": ["L’avion est-il sûr"], "hasard": True} for x in a[:n]]


def poser_dme(page, q):
    page.goto(BASE + "dix-mille-escales/", wait_until="domcontentloaded")
    page.fill(".q-input", q)
    page.press(".q-input", "Enter")
    t0 = time.time()
    while time.time() - t0 < 25:
        page.wait_for_timeout(700)
        txt = page.inner_text(".q-rep")
        if txt.strip() and "Je cherche" not in txt:
            page.wait_for_timeout(1500)  # mémoire de l'IA, compléments
            return page.inner_text(".q-rep")
    return page.inner_text(".q-rep")


def poser_cr(page, q):
    if "cotes-et-routes" not in page.url:
        page.goto(BASE + "cotes-et-routes/#accueil", wait_until="load")
        page.wait_for_timeout(4000)
    champ = next((i for i in ("#gq3", "#gq2", "#gq") if page.locator(i).count() and page.is_visible(i)), "#gq")  # sur téléphone : #gq3
    page.fill(champ, "")
    page.fill(champ, q)
    page.press(champ, "Enter")
    page.wait_for_timeout(4000)
    return page.inner_text("#gAns") + "\n" + page.inner_text("#gRes")


def verifier(t, rep):
    plat = ESPACES.sub("", rep).lower()
    pb = []
    for x in t.get("contient", []):
        if not any(ESPACES.sub("", y).lower() in plat for y in x.split("|")):
            pb.append(f"devrait contenir « {x} »")
    for x in t.get("interdit", []):
        if ESPACES.sub("", x).lower() in plat:
            pb.append(f"ne devrait pas contenir « {x} »")
    if len(rep.strip()) < 20:
        pb.append("réponse vide")
    return pb


def signaler(site, echecs, total):
    jeton, depot = os.environ.get("GITHUB_TOKEN"), os.environ.get("GITHUB_REPOSITORY")
    if not jeton or not depot:
        return
    def api(methode, chemin, corps=None):
        r = urllib.request.Request(f"https://api.github.com/repos/{depot}{chemin}", method=methode,
                                   data=json.dumps(corps).encode() if corps is not None else None,
                                   headers={"Authorization": f"Bearer {jeton}", "Accept": "application/vnd.github+json"})
        with urllib.request.urlopen(r, timeout=60) as x:
            return json.loads(x.read() or b"null")
    ouverts = [i for i in api("GET", "/issues?state=open&labels=robot-testeur&per_page=10") or [] if "pull_request" not in i]
    if echecs:
        corps = (f"Le robot testeur a posé {total} questions au site en ligne ce matin : **{len(echecs)} réponse(s) à revoir**.\n\n"
                 + "\n".join(f"- **{e['q']}** : {' ; '.join(e['pb'])}{' (tirée au hasard)' if e.get('hasard') else ''}\n  > {e['rep'][:300]!r}" for e in echecs[:40]))
        if ouverts:
            api("POST", f"/issues/{ouverts[0]['number']}/comments", {"body": corps})
        else:
            api("POST", "/issues", {"title": f"Robot testeur : {len(echecs)} réponse(s) à revoir", "body": corps, "labels": ["robot-testeur"]})
    else:
        for i in ouverts:
            api("POST", f"/issues/{i['number']}/comments", {"body": f"Ce matin, les {total} questions du robot testeur ont reçu une bonne réponse : signalement fermé."})
            api("PATCH", f"/issues/{i['number']}", {"state": "closed"})


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--site", required=True, choices=["dix-mille-escales", "cotes-et-routes"])
    p.add_argument("--hasard", type=int, default=30)
    a = p.parse_args()
    ici = os.path.dirname(os.path.abspath(__file__))
    tests = json.load(open(os.path.join(ici, "questions.json"), encoding="utf-8"))
    try:
        tests += hasard_dme(a.hasard) if a.site == "dix-mille-escales" else hasard_cr(a.hasard)
    except Exception as e:
        print(f"Tirage au hasard impossible : {e}")
    echecs = []
    with sync_playwright() as pw:
        nav = pw.chromium.launch()
        page = nav.new_page(viewport={"width": 390, "height": 844}, user_agent="Mozilla/5.0 (Linux; Android 14) robot-testeur Mobile")
        erreurs = []
        page.on("pageerror", lambda e: erreurs.append(str(e)))
        for t in tests:
            try:
                rep = (poser_dme if a.site == "dix-mille-escales" else poser_cr)(page, t["q"])
            except Exception as e:
                rep = f"(erreur : {e})"
            pb = verifier(t, rep)
            print(("ÉCHEC " if pb else "ok    ") + t["q"] + (" → " + " ; ".join(pb) if pb else ""))
            if pb:
                echecs.append({"q": t["q"], "pb": pb, "rep": " ".join(rep.split()), "hasard": t.get("hasard")})
        if erreurs:
            echecs.append({"q": "(erreurs JavaScript sur la page)", "pb": sorted(set(erreurs))[:5], "rep": ""})
        nav.close()
    # Les questions fixes comptent toutes ; pour le tirage au hasard, quelques échecs peuvent venir de données
    # ambiguës (deux lieux du même nom) : signalés aussi, pour être examinés.
    print(f"\n{len(tests) - len(echecs)} / {len(tests)} bonnes réponses.")
    signaler(a.site, echecs, len(tests))
    os.makedirs("journal", exist_ok=True)
    json.dump({"date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "questions": len(tests), "echecs": echecs},
              open("journal/testeur.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()

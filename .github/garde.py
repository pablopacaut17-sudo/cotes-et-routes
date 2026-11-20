"""Cotes & Routes : contrôle avant enregistrement. Lancé par chaque robot juste avant « git add » :
un fichier de données illisible, ou vidé alors qu'il était rempli, n'est pas enregistré (l'ancien est gardé)."""
import os, json, gzip, subprocess, pathlib, datetime
os.chdir(os.environ.get("GITHUB_WORKSPACE") or ".")
def sh(*a): return subprocess.run(list(a), capture_output=True)
def lire(b, nom):
    if nom.endswith(".gz"): b = gzip.decompress(b)
    return json.loads(b.decode("utf-8"))
def vide(j): return not j or (isinstance(j, dict) and all(not v for k, v in j.items() if k not in ("maj", "updated", "source", "url", "licence", "date")))
J = []
for l in sh("git", "status", "--porcelain", "-uall", "--", "data").stdout.decode("utf-8", "replace").splitlines():
    p = l[3:].strip().strip('"')
    if "/logs/" in p or not (p.endswith(".json") or p.endswith(".json.gz")) or not os.path.isfile(p): continue
    b = pathlib.Path(p).read_bytes(); ancien = sh("git", "show", f"HEAD:{p}").stdout
    try: neuf = lire(b, p)
    except Exception:
        if ancien: pathlib.Path(p).write_bytes(ancien); J.append(f"🛡️ {p} : fichier abîmé non enregistré, ancienne version gardée")
        else: os.remove(p); J.append(f"🛡️ {p} : nouveau fichier abîmé non enregistré")
        continue
    if len(b) < 400 and vide(neuf) and ancien:
        try: bon = not vide(lire(ancien, p))
        except Exception: bon = False
        if bon: pathlib.Path(p).write_bytes(ancien); J.append(f"🛡️ {p} : fichier vidé non enregistré, ancienne version gardée")
for m in J: print(m, flush=True)
if J:
    L = pathlib.Path("data/logs/garde.txt"); L.parent.mkdir(parents=True, exist_ok=True)
    t = (L.read_text(encoding="utf-8") if L.exists() else "").splitlines()[-300:]
    L.write_text("\n".join(t + [f"{datetime.datetime.utcnow():%Y-%m-%d %H:%M} {m}" for m in J]) + "\n", encoding="utf-8")

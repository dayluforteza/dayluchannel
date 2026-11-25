import asyncio, json, sys, edge_tts, subprocess, ssl, os
import edge_tts.communicate as _c
_ca = os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
if os.path.exists(_ca): _c._SSL_CTX = ssl.create_default_context(cafile=_ca)
g = json.load(open("guion.json"))
async def one(i, e):
    c = edge_tts.Communicate(e["texto"], g["voz"], rate="+8%", boundary="WordBoundary")
    words = []
    with open(f"public/{e['id']}.mp3", "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"]/1e7, "d": ch["duration"]/1e7, "w": ch["text"]})
    dur = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f"public/{e['id']}.mp3"]).decode())
    return {"id": e["id"], "texto": e["texto"], "dur": dur, "words": words}
async def main():
    out = [await one(i, e) for i, e in enumerate(g["escenas"])]
    json.dump(out, open("src/timing.json", "w"), ensure_ascii=False, indent=1)
    for o in out: print(o["id"], round(o["dur"],2), len(o["words"]))
import os; os.makedirs("src", exist_ok=True)
asyncio.run(main())

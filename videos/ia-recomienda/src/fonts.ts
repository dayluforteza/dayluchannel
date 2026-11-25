import { continueRender, delayRender, staticFile } from "remotion";
import list from "./fonts.json";

// Tipografías servidas desde public/fonts (Chromium no puede descargarlas durante el render)
const handle = delayRender("Cargando tipografías locales");
Promise.all(
  (list as [string, string, string, string][]).map(([fam, w, file, range]) => {
    const ff = new FontFace(fam, `url(${staticFile("fonts/" + file)}) format("woff2")`, { weight: w, unicodeRange: range });
    return ff.load().then((f) => document.fonts.add(f));
  })
)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });

# Paketoi pelin yhdeksi HTML-tiedostoksi jakelua varten (esim. Artifact-linkki).
#
#     python3 tyokalut/paketoi.py [kohde.html]
#
# Ei muuta pelin koodia eikä ulkoasua - siirtää vain css/js-tiedostot inlineksi samassa
# järjestyksessä kuin index.html ne lataa, ja upottaa kuvat/-kansion kuvat data-URI:eina
# (paketissa ei ole erillisiä tiedostoja joita selain voisi hakea).
#
# HUOM kuvien painosta: 126 kuvaa a ~40 kt on noin 5 Mt, ja base64 kasvattaa sen ~6,7 Mt:iin.
# Kun kuvasto on kokonaan valmis, oikea jakelutapa on GitHub Pages erillisillä tiedostoilla
# ja lazy-latauksella - silloin selain hakee vain sen kuukauden pari kuvaa. Tämä paketointi
# on tarkoitettu nopeaan jakoon ja pelitestaukseen.

import base64
import pathlib
import re
import sys

JUURI = pathlib.Path(__file__).resolve().parent.parent
KOHDE = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else JUURI / "dictator-paketti.html"

MIME = {".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}

html = (JUURI / "index.html").read_text(encoding="utf-8")

# Runko: kaikki <body>:n sisältä, ilman script-tageja (ne lisätään inlinenä perään).
runko = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
runko = re.sub(r'\s*<script src="[^"]*"></script>', "", runko).strip()

tyylit = (JUURI / "css" / "tyyli.css").read_text(encoding="utf-8").strip()

skriptit = re.findall(r'<script src="([^"]*)"></script>', html)
osat = []
for polku in skriptit:
    koodi = (JUURI / polku).read_text(encoding="utf-8").strip()
    if "</script>" in koodi:
        raise SystemExit(f"{polku} sisältää </script>:n — inline rikkoutuisi")
    osat.append(f"<!-- {polku} -->\n<script>\n{koodi}\n</script>")

# Kuvat data-URI:eina. Avain on sama jonka kuvanOsoite muodostaa: "kansio/tunnus".
kuvakansio = JUURI / "kuvat"
upotetut = {}
for tiedosto in sorted(kuvakansio.glob("*/*")):
    if tiedosto.suffix.lower() not in MIME:
        continue
    avain = f"{tiedosto.parent.name}/{tiedosto.stem}"
    data = base64.b64encode(tiedosto.read_bytes()).decode("ascii")
    upotetut[avain] = f"data:{MIME[tiedosto.suffix.lower()]};base64,{data}"

if upotetut:
    parit = ",\n".join(f'  {avain!r}: "{arvo}"' for avain, arvo in upotetut.items())
    osat.append(
        "<!-- upotetut kuvat -->\n<script>\nObject.assign(KUVAT_UPOTETUT, {\n"
        + parit
        + "\n});\n</script>"
    )

# Paketissa paikanvaraajat piilotetaan: puuttuva kuva ei ole jaettavassa versiossa
# tarkistuslista vaan pelkkä häiriö. Kehityksessä (index.html) ne näkyvät normaalisti.
osat.append("<!-- jakeluversio: ei paikanvaraajia -->\n<script>\nasetaPuuttuvienNaytto(false);\n</script>")

# Charset ensimmäisenä tavuina: index.html:n <head> jää pois paketoinnissa, ja ilman tätä
# ääkköset menevät rikki (selain arvaa latin-1:n).
sivu = f"""<meta charset="UTF-8">
<title>Dictator — Ritimban Tasavalta</title>

<style>
{tyylit}
</style>

{runko}

{chr(10).join(osat)}
"""

KOHDE.write_text(sivu, encoding="utf-8")
koko = len(sivu.encode("utf-8")) / 1024
print(f"OK: {KOHDE} ({koko:.0f} kt, {len(skriptit)} skriptiä, {len(upotetut)} kuvaa)")

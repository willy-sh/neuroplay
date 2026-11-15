"""Genera datos/acatlan.js a partir de datos oficiales del INEGI (Censo de Población y Vivienda 2020, ITER Jalisco).

Es reproducible: cualquiera puede volver a correrlo y obtener el mismo archivo.
    python herramientas/generar_datos.py

No inventa ni estima nada: cada número sale de una columna del ITER (nombre de la variable entre paréntesis en los comentarios).
Las localidades pequeñas que el INEGI reserva con "*" se dejan en blanco (null) para proteger la confidencialidad estadística.
"""
import csv, io, json, re, urllib.request, zipfile, pathlib, datetime
import openpyxl   # pip install openpyxl

URL = "https://www.inegi.org.mx/contenidos/programas/ccpv/2020/datosabiertos/iter/iter_14_cpv2020_csv.zip"
RAIZ = pathlib.Path(__file__).resolve().parent.parent
ZIP = RAIZ / "herramientas" / "iter_14_cpv2020_csv.zip"
SALIDA = RAIZ / "datos" / "acatlan.js"
MUN_CLAVE = "002"          # Acatlán de Juárez (clave INEGI 14002)

if not ZIP.exists():
    print("Descargando Censo 2020 (ITER Jalisco) del INEGI…")
    urllib.request.urlretrieve(URL, ZIP)

raw = zipfile.ZipFile(ZIP).read("iter_14_cpv2020/conjunto_de_datos/conjunto_de_datos_iter_14CSV20.csv").decode("utf-8-sig")
filas = list(csv.DictReader(io.StringIO(raw)))


def num(v):
    """Número o None si el INEGI lo reserva ('*' o 'N/D')."""
    v = (v or "").strip()
    return float(v) if re.fullmatch(r"-?\d+(\.\d+)?", v) else None


def pct(a, b):
    a, b = num(a), num(b)
    return None if a is None or not b else round(100 * a / b, 1)


def indicadores(r):
    """Los indicadores que usa NeuroPlay, calculados con las variables del Censo."""
    return {
        "pob": num(r["POBTOT"]),                                  # POBTOT
        "pob12a14": num(r["P_12A14"]),                            # P_12A14
        "noAsiste12a14": num(r["P12A14NOA"]),                     # P12A14NOA
        "pctNoAsiste12a14": pct(r["P12A14NOA"], r["P_12A14"]),    # % de 12 a 14 años que no asiste a la escuela
        "pob12a14M": num(r["P_12A14_F"]), "noAsisteM": num(r["P12A14NOAF"]),      # mujeres de 12 a 14 años y las que no asisten
        "pob12a14H": num(r["P_12A14_M"]), "noAsisteH": num(r["P12A14NOAM"]),      # hombres
        "pctNoAsisteMujeres": pct(r["P12A14NOAF"], r["P_12A14_F"]),
        "pctNoAsisteHombres": pct(r["P12A14NOAM"], r["P_12A14_M"]),
        "escolaridad": num(r["GRAPROES"]),                        # grado promedio de escolaridad (15 años y más)
        "pctAnalfabetismo": pct(r["P15YM_AN"], r["P_15YMAS"]),    # % de 15 años y más que no sabe leer ni escribir un recado
        "viviendas": num(r["TVIVPARHAB"]),                        # viviendas particulares habitadas
        "pctInternet": pct(r["VPH_INTER"], r["TVIVPARHAB"]),      # % de viviendas con internet
        "pctComputadora": pct(r["VPH_PC"], r["TVIVPARHAB"]),      # % con computadora, laptop o tablet
        "pctCelular": pct(r["VPH_CEL"], r["TVIVPARHAB"]),         # % con teléfono celular
        "pctSinComputadoraNiInternet": pct(r["VPH_SINCINT"], r["TVIVPARHAB"]),
    }


def grados(txt):
    """'103°35'14.000" W' -> -103.5872 (grados decimales)."""
    m = re.match(r"(\d+)°(\d+)'([\d.]+)\"\s*([NSEW])", txt or "")
    if not m:
        return None
    g = int(m[1]) + int(m[2]) / 60 + float(m[3]) / 3600
    return round(-g if m[4] in "SW" else g, 5)


estado = next(r for r in filas if r["MUN"] == "000" and r["LOC"] == "0000")
municipios = [r for r in filas if r["LOC"] == "0000" and r["MUN"] != "000"]
acatlan = next(r for r in municipios if r["MUN"] == MUN_CLAVE)

# Posición de Acatlán entre los 125 municipios (1 = valor más alto) para cada indicador
rank = {}
for k in ("pctNoAsiste12a14", "pctInternet", "escolaridad", "pctAnalfabetismo", "pctComputadora"):
    orden = sorted(((indicadores(r)[k], r["MUN"]) for r in municipios if indicadores(r)[k] is not None), reverse=True)
    rank[k] = {"lugar": [m for _, m in orden].index(MUN_CLAVE) + 1, "de": len(orden)}

# Ajuste de lectura: "Villa de los Niños" es una institución de residencia con 1,549 habitantes (~1,060 de 12 a 14 años, casi todos en la escuela)
# y el INEGI reserva sus datos con "*". Sumando solo las localidades con dato publicado se obtiene la tasa de la población en hogares.
con_dato = [l for l in (dict(clave=r["LOC"], **indicadores(r)) for r in filas if r["MUN"] == MUN_CLAVE and r["LOC"] not in ("0000", "9998", "9999")) if l["pob12a14"] is not None]
ajuste = {
    "nota": "Suma de las localidades con dato publicado (excluye Villa de los Niños, institución de residencia, y localidades diminutas reservadas por el INEGI).",
    "localidades": len(con_dato),
    "pob12a14": sum(l["pob12a14"] for l in con_dato), "noAsiste12a14": sum(l["noAsiste12a14"] for l in con_dato),
    "pctNoAsiste12a14": round(100 * sum(l["noAsiste12a14"] for l in con_dato) / sum(l["pob12a14"] for l in con_dato), 1),
    "pctNoAsisteMujeres": round(100 * sum(l["noAsisteM"] for l in con_dato) / sum(l["pob12a14M"] for l in con_dato), 1),
    "pctNoAsisteHombres": round(100 * sum(l["noAsisteH"] for l in con_dato) / sum(l["pob12a14H"] for l in con_dato), 1),
    "mujeres12a14": sum(l["pob12a14M"] for l in con_dato), "hombres12a14": sum(l["pob12a14H"] for l in con_dato),
}

# Todos los municipios (para ver dónde cae Acatlán en la distribución estatal)
todos = [{"mun": r["MUN"], "nombre": r["NOM_MUN"], **{k: v for k, v in indicadores(r).items() if k in ("pob", "pctNoAsiste12a14", "pctInternet", "escolaridad", "pctAnalfabetismo")}} for r in municipios]

# Localidades de Acatlán con su posición real (longitud/latitud del propio Censo)
locs = []
for r in filas:
    if r["MUN"] == MUN_CLAVE and r["LOC"] not in ("0000", "9998", "9999"):
        lon, lat = grados(r["LONGITUD"]), grados(r["LATITUD"])
        if lon is None:
            continue
        locs.append({"clave": r["LOC"], "nombre": r["NOM_LOC"], "lon": lon, "lat": lat, **indicadores(r)})
locs.sort(key=lambda x: -(x["pob"] or 0))

# ---------- Segundo dataset: CONEVAL, medición de pobreza municipal 2010-2020 (rezago educativo y pobreza) ----------
CONEVAL_URL = "https://coneval.org.mx/Medicion/Documents/Pobreza_municipal/2020/Concentrado_indicadores_de_pobreza_2020.zip"
CZIP = RAIZ / "herramientas" / "coneval_pobreza_municipal_2020.zip"
if not CZIP.exists():
    print("Descargando anexo estadístico de CONEVAL…")
    urllib.request.urlretrieve(CONEVAL_URL, CZIP)
zc = zipfile.ZipFile(CZIP)
wb = openpyxl.load_workbook(io.BytesIO(zc.read("Concentrado_indicadores_de_pobreza_2020.xlsx")), read_only=True, data_only=True)


def serie(fila, desde):
    """Porcentajes 2010, 2015 y 2020 de un bloque de columnas (el bloque trae primero los 3 porcentajes)."""
    return {"2010": round(fila[desde], 1), "2015": round(fila[desde + 1], 1), "2020": round(fila[desde + 2], 1)}


def coneval(fila, d):
    # d = desplazamiento: la hoja municipal trae 2 columnas más (clave y nombre de municipio) que la estatal
    return {
        "pobreza": serie(fila, 8 - d), "pobrezaExtrema": serie(fila, 17 - d), "rezagoEducativo": serie(fila, 56 - d),
        "accesoServiciosBasicosVivienda": serie(fila, 92 - d),
        "rezagoEducativoPersonas2020": round(fila[61 - d]),
    }


filas_m = [r for r in wb["Concentrado municipal"].iter_rows(values_only=True) if r and str(r[1]) == "14" and r[3]]
fila_acat = next(r for r in filas_m if str(r[3]) == "14" + MUN_CLAVE)
fila_edo = next(r for r in wb["Concentrado estatal"].iter_rows(values_only=True) if r and str(r[2]) == "Jalisco")
rank_c = {}
for nombre, col in (("rezagoEducativo", 58), ("pobreza", 10), ("pobrezaExtrema", 19)):
    orden = sorted(((r[col], str(r[3])) for r in filas_m), reverse=True)
    rank_c[nombre] = {"lugar": [m for _, m in orden].index("14" + MUN_CLAVE) + 1, "de": len(orden)}
conev_mun = [{"mun": str(r[3])[2:], "nombre": r[4], "rezagoEducativo2020": round(r[58], 1), "pobreza2020": round(r[10], 1)} for r in filas_m]

salida = {
    "fuenteConeval": {
        "nombre": "Medición de la pobreza a nivel municipio 2010-2020 (anexo estadístico: rezago educativo y pobreza)",
        "institucion": "CONEVAL (hoy INEGI)", "periodo": "2010, 2015 y 2020", "cobertura": "Municipal (125 municipios de Jalisco) y estatal",
        "url": "https://www.coneval.org.mx/Medicion/Paginas/Pobreza-municipio-2010-2020.aspx", "descarga": CONEVAL_URL,
    },
    "coneval": {"municipio": {"poblacionConeval2020": fila_acat[7], **coneval(fila_acat, 0)}, "estado": {"poblacionConeval2020": fila_edo[5], **coneval(fila_edo, 2)}, "posicion": rank_c, "municipios": conev_mun},
    "fuente": {
        "nombre": "Censo de Población y Vivienda 2020 — Principales resultados por localidad (ITER), Jalisco",
        "institucion": "INEGI",
        "periodo": "2020 (levantamiento: marzo de 2020)",
        "cobertura": "Municipal y por localidad; 125 municipios de Jalisco",
        "url": "https://www.inegi.org.mx/programas/ccpv/2020/",
        "descarga": URL,
        "generado": datetime.date.today().isoformat(),
    },
    "municipio": {"clave": "14" + MUN_CLAVE, "nombre": acatlan["NOM_MUN"], **indicadores(acatlan)},
    "estado": {"nombre": estado["NOM_ENT"], **indicadores(estado)},
    "ajusteHogares": ajuste,
    "posicion": rank,
    "municipios": todos,
    "localidades": locs,
}
SALIDA.parent.mkdir(exist_ok=True)
SALIDA.write_text("/* Generado por herramientas/generar_datos.py — no editar a mano. Fuente: INEGI, Censo de Población y Vivienda 2020. */\nwindow.DATOS = " + json.dumps(salida, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
print("Listo:", SALIDA, "·", len(locs), "localidades ·", len(todos), "municipios")
print("Acatlán:", {k: v for k, v in salida["municipio"].items() if k.startswith("pct") or k == "escolaridad"})
print("Jalisco:", {k: v for k, v in salida["estado"].items() if k.startswith("pct") or k == "escolaridad"})
print("Ajuste sin institución:", ajuste)
print("Posición:", rank)
print("CONEVAL Acatlán:", salida["coneval"]["municipio"])
print("CONEVAL Jalisco:", salida["coneval"]["estado"])
print("CONEVAL posición:", rank_c)

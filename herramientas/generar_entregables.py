"""Genera los entregables del hackathon a partir de los MISMOS datos que usa la plataforma (datos/acatlan.js).
    python herramientas/generar_entregables.py
Crea en entregables/: reporte científico (.docx), manual de usuario (.docx), pitch (.pptx, 8 diapositivas) y guion de video (.md).
Las cifras no se escriben a mano: salen del archivo de datos. Lo que el equipo debe completar está marcado con [POR COMPLETAR]."""
import json, pathlib, re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from pptx import Presentation
from pptx.util import Inches, Pt as PPt
from pptx.dml.color import RGBColor as PRGB
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAL = RAIZ / "entregables"; SAL.mkdir(exist_ok=True)
t = (RAIZ / "datos" / "acatlan.js").read_text(encoding="utf-8")
D = json.loads(t[t.index("{"): t.rindex("}") + 1])
M, E, AJ, C = D["municipio"], D["estado"], D["ajusteHogares"], D["coneval"]
bella = next(l for l in D["localidades"] if l["nombre"] == "Bellavista"); cab = D["localidades"][0]
f = lambda n: f"{n:,.0f}".replace(",", ",")          # 11,110
p = lambda n: f"{n:.1f}".replace(".", ",") + " %"     # 11,9 %
EQUIPO = "[POR COMPLETAR: nombre del equipo]"; NUM = "[POR COMPLETAR: n.º de equipo]"

HECHOS = {
    "pct_total": p(M["pctNoAsiste12a14"]), "pct_hogares": p(AJ["pctNoAsiste12a14"]), "pct_edo": p(E["pctNoAsiste12a14"]),
    "n_hogares": f"{f(AJ['noAsiste12a14'])} de {f(AJ['pob12a14'])}", "bella": f"{f(bella['noAsiste12a14'])} de {f(bella['pob12a14'])} ({p(bella['pctNoAsiste12a14'])})",
    "cab": p(cab["pctNoAsiste12a14"]), "int_m": p(M["pctInternet"]), "int_e": p(E["pctInternet"]), "sin_m": p(M["pctSinComputadoraNiInternet"]), "sin_e": p(E["pctSinComputadoraNiInternet"]),
    "cel": p(M["pctCelular"]), "pc_m": p(M["pctComputadora"]),
    "rez10": p(C["municipio"]["rezagoEducativo"]["2010"]), "rez20": p(C["municipio"]["rezagoEducativo"]["2020"]), "rez_e": p(C["estado"]["rezagoEducativo"]["2020"]),
    "pob10": p(C["municipio"]["pobreza"]["2010"]), "pob20": p(C["municipio"]["pobreza"]["2020"]), "pob_e": p(C["estado"]["pobreza"]["2020"]),
    "rez_pos": f"{C['posicion']['rezagoEducativo']['lugar']} de {C['posicion']['rezagoEducativo']['de']}",
}
H = HECHOS


def doc_base(titulo, sub):
    d = Document(); s = d.styles["Normal"]; s.font.name = "Calibri"; s.font.size = Pt(11)
    for sec in d.sections: sec.left_margin = sec.right_margin = Cm(2.2)
    h = d.add_heading(titulo, 0); d.add_paragraph(sub)
    return d


def bullets(d, items):
    for i in items: d.add_paragraph(i, style="List Bullet")


def tabla(d, filas, cab):
    t_ = d.add_table(rows=1, cols=len(cab)); t_.style = "Light Grid Accent 1"
    for i, c in enumerate(cab): t_.rows[0].cells[i].text = c
    for fila in filas:
        r = t_.add_row().cells
        for i, c in enumerate(fila): r[i].text = str(c)
    d.add_paragraph()


# ===================== REPORTE CIENTÍFICO =====================
d = doc_base("NEUROPLAY · Reporte científico", f"Reto 04: Educación y Talento · Hackathon Jalisco Internacional 2026 · Equipo {NUM} · {EQUIPO}")
d.add_heading("1. Resumen", 1)
d.add_paragraph(f"NEUROPLAY es una plataforma web que une tres cosas que normalmente van separadas: (A) el contexto educativo y social de un municipio con datos oficiales, (B) un espacio privado y voluntario donde estudiantes cuentan cómo aprenden, y (C) un universo STEM con mentores, actividades y evaluación inicial y final. Delimitamos el problema en Acatlán de Juárez, Jalisco, para estudiantes de secundaria (12 a 14 años). Con datos oficiales del INEGI (Censo 2020) y de CONEVAL (2010–2020) encontramos que el promedio municipal esconde diferencias: {H['pct_total']} de las personas de 12 a 14 años no asiste a la escuela en todo el municipio, pero {H['pct_hogares']} en las localidades con hogares (Jalisco: {H['pct_edo']}), y en Bellavista son {H['bella']}. No afirmamos reducir la deserción: la plataforma es un prototipo funcional cuyo impacto aún no se ha medido.")
d.add_heading("2. Problema y delimitación", 1)
d.add_paragraph("Pregunta guía: ¿qué factores personales, familiares, sociales y educativos se relacionan con las dificultades de aprendizaje y la interrupción de los estudios? Son factores por investigar, no causas demostradas: rezago educativo, desigualdad socioeconómica, acceso limitado a tecnología, infraestructura educativa, dificultades de comprensión, falta de acompañamiento y condiciones personales y familiares.")
bullets(d, ["Territorio: Acatlán de Juárez, Jalisco (clave INEGI 14002). Escuelas candidatas para un piloto: Secundaria Técnica 105 y Secundaria Valentín Gómez Farías, sujeto a viabilidad, permisos y colaboración institucional.",
            "Quién la usaría: estudiantes de secundaria (usuarios), y docentes y orientadores (para ver patrones de grupo, sin datos individuales).",
            "Indicadores para medir si la situación mejora (a medir en un piloto, aún no medidos): porcentaje de 12 a 14 años que asiste a la escuela, cambio entre evaluación inicial y final, y uso de la plataforma."])
d.add_heading("3. Datasets utilizados", 1)
d.add_paragraph("Usamos dos fuentes oficiales del catálogo del reto y mostramos qué tomamos de cada una y para qué.")
tabla(d, [
    ["#32 Rezago educativo y condición de pobreza", "CONEVAL (hoy INEGI)", "2010, 2015 y 2020", "Municipal (125 municipios de Jalisco)", f"% de población en rezago educativo y en pobreza de Acatlán y de Jalisco; posición de Acatlán entre los 125 municipios ({H['rez_pos']} en rezago educativo)", "Describir el problema (contexto) y comprobar la tendencia 2010–2020"],
    ["Censo de Población y Vivienda 2020: principales resultados por localidad (programa ccpv/2020, también listado como #04 del catálogo)", "INEGI", "2020 (marzo)", "Localidad, municipio y estado", "Personas de 12 a 14 años que no asisten a la escuela; viviendas con internet, con computadora y con celular; posición geográfica de las 32 localidades de Acatlán", "Describir el problema (escuela y brecha digital) y diseñar la solución (mapa; plataforma pensada para celular y que funciona sin internet)"],
], ["Dataset", "Institución", "Periodo", "Cobertura", "Qué tomamos", "Para qué"])
d.add_paragraph("Fuentes identificadas y aún no integradas (honestidad): #28 SEJ/SEP (deserción por municipio), #29 IIEG (indicadores educativos), #31 SEP Formato 911 (conectividad escolar), #33 ENDUTIH y #34 ANUIES. Son trabajo futuro.")
d.add_paragraph("Nota: el Censo es el mismo programa del que se alimentan varios indicadores del catálogo (por ejemplo #04 y los del IIEG). El equipo debe confirmar con la organización que el uso de las variables educativas y de tecnología del Censo 2020 cuenta como dataset del catálogo; si no, la segunda fuente obligatoria puede ser #29 (IIEG) o #17 (CONAPO). [POR COMPLETAR: confirmar]")
d.add_heading("4. Método", 1)
bullets(d, ["Descarga reproducible: el programa herramientas/generar_datos.py descarga los archivos oficiales (ITER Jalisco del Censo 2020 y el anexo estadístico de CONEVAL) y calcula los porcentajes. No se escribió ningún número a mano.",
            "Indicadores: % de 12 a 14 años que no asiste = P12A14NOA ÷ P_12A14; % de viviendas con internet = VPH_INTER ÷ TVIVPARHAB; con computadora = VPH_PC ÷ TVIVPARHAB; sin computadora ni internet = VPH_SINCINT ÷ TVIVPARHAB.",
            "Privacidad estadística: no se muestra un porcentaje de localidades con menos de 30 personas de la base; el INEGI reserva con «*» las cifras muy pequeñas y las dejamos vacías.",
            f"Lectura crítica: el Censo cuenta a Villa de los Niños (institución de residencia, 1,549 habitantes, cerca de 1,060 personas de 12 a 14 años casi todas en la escuela) dentro del municipio. Sumando solo las {AJ['localidades']} localidades con dato publicado obtuvimos «Acatlán en hogares»: {H['n_hogares']} = {H['pct_hogares']}. Es una estimación nuestra con datos oficiales, no una cifra publicada por el INEGI."])
d.add_heading("5. Resultados con datos reales", 1)
tabla(d, [
    ["Personas de 12 a 14 años que no asisten a la escuela", H["pct_total"], H["pct_hogares"] + " (cálculo propio)", H["pct_edo"]],
    ["Viviendas con internet", H["int_m"], "—", H["int_e"]],
    ["Viviendas sin computadora ni internet", H["sin_m"], "—", H["sin_e"]],
    ["Rezago educativo 2020 (CONEVAL)", H["rez20"], "—", H["rez_e"]],
    ["Pobreza 2020 (CONEVAL)", H["pob20"], "—", H["pob_e"]],
], ["Indicador", "Acatlán (todo)", "Acatlán en hogares", "Jalisco"])
bullets(d, [f"El promedio puede engañar: {H['pct_total']} (todo el municipio) frente a {H['pct_hogares']} en hogares; Jalisco, {H['pct_edo']}.",
            f"Diferencias entre localidades: Bellavista, {H['bella']}, frente a {H['cab']} en la cabecera.",
            f"Brecha digital: solo {H['int_m']} de las viviendas tiene internet (Jalisco {H['int_e']}); el celular llega a {H['cel']} pero la computadora solo a {H['pc_m']}. De ahí el diseño para celular.",
            f"Tendencia (CONEVAL): el rezago educativo de Acatlán baja de {H['rez10']} (2010) a {H['rez20']} (2020), y la pobreza de {H['pob10']} a {H['pob20']}.",
            "Estos patrones describen grupos. Ver una relación entre datos no significa que una cosa cause la otra."])
d.add_heading("6. La solución", 1)
bullets(d, ["Mi zona: mapa de las localidades reales de Acatlán con cuatro capas (escuela, internet, computadora, sin computadora ni internet), comparación con Jalisco y posición entre los 125 municipios, más una tabla para docentes y orientadores sobre dónde conviene enfocar apoyo (solo localidades con al menos 30 personas de base).",
            "Cuéntame: cuestionario privado, voluntario y sin nombre ni domicilio (sin texto libre); análisis solo de grupos (mínimo 5 respuestas) en la zona de adultos.",
            "Mundo STEM: un mapa con 5 islas (Ciencia, Tecnología, Ingeniería, Mates y Retos) y 7 actividades interactivas con el ciclo situación → idea → experimento → pregunta → resultado, con muy poco texto por pantalla.",
            "Diseño para 12 a 14 años: navegación con 5 iconos, una idea por pantalla, pictogramas («de cada 100») en lugar de párrafos y una zona aparte para adultos con fuentes, tablas y límites.",
            "Mentores: 4 biografías verificables (Guillermo González Camarena, Katherine Johnson, Mae Jemison y Marie Curie), con historia, obstáculos, aportaciones y un reto relacionado. No se inventan citas.",
            "Evaluación inicial y final (las mismas 6 preguntas) para ver el cambio sin calificar a nadie.",
            "Recorrido flexible y no obligatorio: me conozco (Cuéntame), descubro (Mi zona), encuentro inspiración (Mentores), experimento (Mundo) y construyo mi camino (Yo)."])
d.add_heading("7. Tres áreas de conocimiento", 1)
tabla(d, [["Educación y pedagogía", "Aprendizaje por indagación, evaluación inicial y final sin calificar, mentores como modelo a seguir."],
          ["Ciencia de datos y estadística", "Obtención y procesamiento reproducible de datos oficiales, cálculo de porcentajes, comparación entre localidades y lectura crítica de promedios."],
          ["Ciencias sociales y diseño inclusivo", "Brecha digital, equidad de género, pertinencia cultural y accesibilidad."],
          ["Ingeniería de software", "Prototipo web sin dependencias, que funciona sin internet una vez cargado."]], ["Área", "Qué aportó"])
d.add_heading("8. Accesibilidad, equidad de género y pertinencia cultural", 1)
bullets(d, ["Accesibilidad: tamaño de letra ajustable, alto contraste, lectura en voz alta, navegación con teclado, etiquetas para lectores de pantalla, tablas con encabezados, color nunca como única señal (cada valor del mapa tiene su número) y respeto a «reducir movimiento».",
            "Equidad de género: 3 de los 4 mentores son mujeres científicas e ingenieras; el lenguaje evita estereotipos. En los datos de Acatlán la diferencia entre mujeres y hombres que no asisten en hogares se muestra con cautela (cifras en el apartado 5 de datos y en «Ciencia y datos»); no la usamos para sacar conclusiones.",
            "Pertinencia cultural: un mentor jalisciense (González Camarena), ejemplos cotidianos (limonada, autobús) y datos del propio municipio; falta incluir a profesionales mexicanos contemporáneos con su permiso. Pendiente: pruebas con estudiantes de la región.",
            "Brecha digital: pensada para celular y sin necesidad de internet tras la primera carga."])
d.add_heading("9. Validación (qué hicimos y qué falta)", 1)
bullets(d, ["Hecho: prueba automatizada de recorridos completos de la plataforma (todas las secciones y las 7 actividades) sin errores; revisión de accesibilidad del código.",
            "Falta (honesto): prueba con usuarios reales y encuesta corta con estudiantes de secundaria. [POR COMPLETAR: número de estudiantes, fecha, resultados y evidencia (fotos, formulario sin datos personales)]. Si no es posible antes de la entrega, debe decirse con claridad que está pendiente.",
            "No afirmamos reducir la deserción sin estudios con seguimiento en el tiempo."])
d.add_heading("10. Viabilidad y escalabilidad", 1)
bullets(d, ["Costo bajo: sitio estático sin servidor, alojable gratis; funciona en celulares modestos y abre sin internet después de la primera visita (service worker).",
            "Piloto: Acatlán de Juárez, 2.º de secundaria, con autorización de la escuela y consentimiento de madres, padres o tutores.",
            "Crecimiento: más escuelas y municipios (los datos de los 125 municipios ya están integrados), más mentores y áreas STEM, almacenamiento seguro de respuestas con aviso de privacidad, integración de #28, #29, #31, #33 y #34, y otros niveles educativos.",
            "Impacto esperado, no medido aún."])
d.add_heading("11. Privacidad y ética (menores de edad)", 1)
bullets(d, ["Participación voluntaria; se puede omitir cualquier pregunta; sin nombre completo ni domicilio; recolección mínima.",
            "En este prototipo las respuestas se guardan solo en el navegador y no se envían a ningún servidor. Para un piloto se requiere consentimiento y autorización institucional.",
            "Solo resultados agregados y anónimos (mínimo 5 respuestas). Sin diagnósticos psicológicos, sin etiquetar ni exponer a estudiantes. Complementa, no sustituye, a docentes ni psicólogos; ante riesgo se sigue el protocolo de la escuela."])
d.add_heading("12. Limitaciones", 1)
bullets(d, ["Los datos del Censo son de marzo de 2020; describen contexto y no explican causas.",
            "Los datos de la pantalla «Análisis» marcados como de prueba son inventados y solo muestran cómo se vería con un grupo real.",
            "Mentores: falta agregar el enlace exacto de cada fuente y la fecha de consulta. [POR COMPLETAR]",
            "No hay servidor ni cuentas: no hay seguimiento entre dispositivos."])
d.add_heading("13. Declaración de uso de inteligencia artificial", 1)
d.add_paragraph("Parte del código y de los textos de este prototipo se elaboró con ayuda de herramientas de inteligencia artificial; el equipo los revisó, probó y adaptó. [POR COMPLETAR: indicar cuáles herramientas y qué partes, y quién las revisó]. Los datos oficiales no los generó una IA: se descargaron de INEGI y CONEVAL con un programa reproducible. La plataforma no usa IA en su funcionamiento: las ayudas del guía son mensajes preescritos.")
d.add_heading("14. Fuentes", 1)
bullets(d, [f"INEGI. Censo de Población y Vivienda 2020: principales resultados por localidad (ITER), Jalisco. {D['fuente']['url']} · archivo: {D['fuente']['descarga']}",
            f"CONEVAL. Medición de la pobreza a nivel municipio 2010–2020 (anexo estadístico). {D['fuenteConeval']['url']} · archivo: {D['fuenteConeval']['descarga']}",
            "Comité Organizador del Hackathon Jalisco Internacional 2026. Retos y catálogo de datasets (noviembre de 2026).",
            "NASA, biografía de Katherine Johnson y de Mae Jemison; NobelPrize.org, biografía de Marie Curie; fuentes sobre Guillermo González Camarena (IMPI y biografías institucionales). [POR COMPLETAR: enlaces exactos y fecha de consulta]"])
d.save(SAL / "1_Reporte_cientifico_NEUROPLAY.docx")

# ===================== MANUAL DE USUARIO =====================
m = doc_base("NEUROPLAY · Manual de usuario", "Para estudiantes, docentes y orientadores")
m.add_heading("1. Cómo abrirla", 1)
bullets(m, ["Abre el archivo index.html con cualquier navegador moderno (Chrome, Edge, Firefox o Safari), en computadora o celular.", "No necesita instalación, cuenta ni internet después de cargar (si la ponemos en un sitio web, solo se abre el enlace)."])
m.add_heading("2. El recorrido en 5 pasos (no es un examen)", 1)
tabla(m, [["1 Me conozco", "«Cuéntame» (botón en el Mundo): cuenta cómo aprendes (opcional); «Siguiente misión» ofrece el punto de partida de 6 preguntas."], ["2 Descubro", "«Mi zona»: mapa de Acatlán de Juárez con datos reales y descubrimientos."], ["3 Encuentro inspiración", "«Mentores»: historias verificadas de personas que abrieron camino."], ["4 Experimento y aprendo", "«Mundo»: 5 islas y 7 retos."], ["5 Construyo mi camino", "«Yo»: medallas, antes y después, y áreas para explorar."]], ["Paso", "Dónde y qué hacer"])
m.add_heading("3. Cada sección", 1)
bullets(m, ["Mundo: toca una isla (Ciencia, Tecnología, Ingeniería, Mates o Retos) y luego un reto. Primero eliges una idea, luego experimentas, respondes y ves el resultado. Si fallas, puedes intentar de nuevo. «Siguiente misión» te lleva al próximo reto.",
            "Mi zona: elige una capa (Escuela, Internet, Compu, Sin nada) y toca un círculo: cada uno es una localidad real. Gris significa muy pocos datos. Abajo hay tres «descubrimientos» que se cambian con las flechas.",
            "Mentores: toca a una persona para ver su historia en tres pasos, su obstáculo, su aportación y un reto relacionado.",
            "Cuéntame (botón del Mundo): preguntas cortas, anónimas y opcionales. No pedimos nombre ni domicilio y no hay texto libre.",
            "Yo: puntos, medallas, tu antes y después y áreas para explorar. «Borrar mis datos» elimina todo lo guardado en el navegador.",
            "Adultos: fuentes y método, datos completos de la zona (tabla de dónde enfocar apoyo, comparación con los 125 municipios y tendencia 2010–2020) y análisis de grupo con descarga de resumen. Es la zona para docentes, orientadores y jurado."])
m.add_heading("4. Accesibilidad", 1)
bullets(m, ["En el engranaje ⚙️ de arriba: A− y A+ (tamaño de letra), ◐ (alto contraste) y 🔊 (lee en voz alta la pantalla o la ventana abierta, según el navegador). El ❓ da una pista de la pantalla.", "Se puede usar solo con teclado (Tab, Enter, Espacio, Esc para cerrar ventanas).", "Respeta la preferencia del sistema de reducir movimiento."])
m.add_heading("5. Para docentes y orientadores", 1)
bullets(m, ["Solo se ven patrones de grupos, nunca personas. En «Adultos > Análisis de grupo» puede descargarse un resumen agregado (CSV) sin datos personales.", "Si se usa con grupos de menores, se necesita autorización de la escuela y de madres, padres o tutores. Complementa, no sustituye, a docentes ni psicólogos."])
m.add_heading("6. Limitaciones", 1)
bullets(m, ["Los datos oficiales son de 2020 (Censo) y 2010–2020 (CONEVAL).", "Las respuestas se guardan solo en el navegador de cada persona: si borra los datos del navegador, se pierden. No hay servidor ni seguimiento entre dispositivos.", "Los datos de «Análisis de grupo» marcados como de prueba son inventados.", "No es una herramienta de diagnóstico ni de evaluación psicológica."])
m.save(SAL / "2_Manual_de_usuario_NEUROPLAY.docx")

# ===================== PITCH (8 diapositivas) =====================
AZ, MO, NA, TX = PRGB(0x2F, 0x5B, 0xFF), PRGB(0x7B, 0x4D, 0xFF), PRGB(0xFF, 0x8A, 0x2B), PRGB(0x1B, 0x21, 0x50)
pr = Presentation(); pr.slide_width, pr.slide_height = Inches(13.33), Inches(7.5)


def slide(titulo, puntos=None, sub=None, grande=False):
    s = pr.slides.add_slide(pr.slide_layouts[6])
    band = s.shapes.add_shape(1, 0, 0, pr.slide_width, Inches(1.25)); band.fill.solid(); band.fill.fore_color.rgb = AZ; band.line.fill.background()
    tb = s.shapes.add_textbox(Inches(.6), Inches(.2), Inches(12), Inches(.9)); tf = tb.text_frame; tf.word_wrap = True
    r = tf.paragraphs[0].add_run(); r.text = titulo; r.font.size = PPt(34 if not grande else 40); r.font.bold = True; r.font.color.rgb = PRGB(255, 255, 255)
    if sub:
        sb = s.shapes.add_textbox(Inches(.6), Inches(1.4), Inches(12), Inches(.6)); r = sb.text_frame.paragraphs[0].add_run(); r.text = sub; r.font.size = PPt(18); r.font.color.rgb = MO; r.font.bold = True
    if puntos:
        bx = s.shapes.add_textbox(Inches(.7), Inches(2.1 if sub else 1.6), Inches(12), Inches(4.8)); tf = bx.text_frame; tf.word_wrap = True
        for i, x in enumerate(puntos):
            para = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); para.space_after = PPt(10)
            rr = para.add_run(); rr.text = "• " + x; rr.font.size = PPt(22); rr.font.color.rgb = TX
    ft = s.shapes.add_textbox(Inches(.6), Inches(7.0), Inches(12), Inches(.4)); r = ft.text_frame.paragraphs[0].add_run()
    r.text = "NEUROPLAY · Reto 04: Educación y Talento · Hackathon Jalisco Internacional 2026"; r.font.size = PPt(11); r.font.color.rgb = PRGB(0x70, 0x70, 0x90)
    return s


slide("NEUROPLAY", ["Plataforma interactiva de acompañamiento, inspiración y exploración educativa STEM", f"Equipo {NUM} · {EQUIPO}", "Comprender su historia. Descubrir sus posibilidades. Construir su futuro."], sub="Explora. Comprende. Descubre.", grande=True)
slide("El problema: un promedio que esconde diferencias", [f"Acatlán de Juárez, Jalisco · 12 a 14 años (secundaria) · datos oficiales (INEGI y CONEVAL)", f"A simple vista: {H['pct_total']} de las personas de 12 a 14 años no asiste a la escuela", f"Pero en localidades con hogares son {H['n_hogares']} = {H['pct_hogares']} (Jalisco: {H['pct_edo']})", f"En Bellavista: {H['bella']} · brecha digital: solo {H['int_m']} de viviendas con internet (Jalisco {H['int_e']})", "Factores por investigar, no causas demostradas"])
s3 = slide("Qué muestran los datos", None, sub="Personas de 12 a 14 años que no asisten a la escuela (%)")
cd = CategoryChartData(); cd.categories = ["Acatlán (todo el municipio)", "Acatlán en hogares*", "Jalisco"]; cd.add_series("% que no asiste", (M["pctNoAsiste12a14"], AJ["pctNoAsiste12a14"], E["pctNoAsiste12a14"]))
ch = s3.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(.8), Inches(2.0), Inches(7.2), Inches(4.7), cd).chart; ch.has_legend = False; ch.plots[0].has_data_labels = True; ch.plots[0].data_labels.font.size = PPt(16); ch.plots[0].series[0].format.fill.solid(); ch.plots[0].series[0].format.fill.fore_color.rgb = MO
tx = s3.shapes.add_textbox(Inches(8.3), Inches(2.1), Inches(4.5), Inches(4.5)); tf = tx.text_frame; tf.word_wrap = True
for i, x in enumerate([f"*Sin Villa de los Niños (institución de residencia, 1,549 hab.): cálculo propio con datos del Censo 2020", f"Rezago educativo (CONEVAL): {H['rez10']} en 2010 → {H['rez20']} en 2020", "Los datos describen grupos; una relación no es una causa"]):
    para = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); para.space_after = PPt(10); r = para.add_run(); r.text = x; r.font.size = PPt(18); r.font.color.rgb = TX
slide("La solución: tres pilares conectados", ["A · Comprender el contexto: mapa con datos oficiales reales de las localidades de Acatlán", "B · Escuchar y comprender: espacio privado, voluntario y anónimo (sin nombre ni domicilio)", "C · Inspirar y desarrollar: Universo STEM con 5 regiones, 7 actividades y 4 mentores", "Se diferencia: no solo entrega contenido ni solo muestra indicadores; conecta contexto, experiencias protegidas e inspiración"])
slide("Demostración", ["Mi zona: mapa real con 4 capas y tres descubrimientos; para adultos, la comparación con los 125 municipios", "Mundo: Ciencia, Tecnología, Ingeniería, Mates y Retos (detective de datos con datos reales)", "Mentores: Katherine Johnson, Mae Jemison, Marie Curie y el jalisciense Guillermo González Camarena; sin citas inventadas", "Evaluación inicial y final de 6 preguntas, sin calificar; muy poco texto por pantalla y accesibilidad: letra, contraste, voz y teclado"], sub="Video de la plataforma funcionando")
slide("Datos, ciencia y tres áreas de conocimiento", ["Datasets: #32 CONEVAL (rezago educativo y pobreza, 2010–2020) y Censo 2020 INEGI (escuela y tecnología por localidad)", "Qué tomamos y para qué: describir el problema, diseñar la solución (celular, sin internet) y comprobar la tendencia", "Áreas: educación y pedagogía · ciencia de datos y estadística · ciencias sociales y diseño inclusivo", "Reproducible: un programa descarga y calcula todo; ningún número escrito a mano"])
slide("Ética, equidad, límites y uso de IA", ["Menores de edad: voluntario, mínimo de datos, solo resultados agregados y anónimos, sin diagnósticos psicológicos", "Equidad de género: 3 de 4 mentores son mujeres; pertinencia cultural: mentor jalisciense y datos del municipio", "Límites: datos de 2020; no afirmamos reducir la deserción; prueba con usuarios aún por completar [POR COMPLETAR]", "Declaramos uso de IA en código y textos, revisado por el equipo; la plataforma no usa IA al funcionar"])
slide("Viabilidad y siguientes pasos", ["Bajo costo: sitio estático gratuito; funciona en celulares modestos y sin internet tras cargar", "Piloto en Acatlán (2.º de secundaria) con permisos de la escuela y consentimiento de tutores", "Escala: los 125 municipios ya están integrados; sumar #28, #29, #31, #33 y #34, más mentores y otros niveles", "Impacto esperado, no medido aún: se medirá con asistencia y cambio entre evaluación inicial y final"])
pr.save(SAL / "3_Pitch_NEUROPLAY_8_diapositivas.pptx")

# ===================== GUION DE VIDEO =====================
(SAL / "4_Guion_de_video_y_lista_de_entrega.md").write_text(f"""# Guion del video (demostración, 3 a 4 minutos)

Graba la pantalla de la computadora (por ejemplo con la barra de juegos de Windows: Win + G, o con OBS) y habla con tu voz. Muestra el software funcionando.

| Tiempo | Qué se ve | Qué se dice |
|---|---|---|
| 0:00 | Inicio de NEUROPLAY | «Somos el equipo {EQUIPO}. NEUROPLAY ayuda a estudiantes de secundaria a comprender su contexto, ser escuchados y descubrir el mundo STEM.» |
| 0:20 | «Mi zona», capa Escuela | «Usamos datos oficiales del INEGI y de CONEVAL. Cada círculo es una localidad real de Acatlán de Juárez.» |
| 0:50 | Toca Bellavista, luego el recuadro «El promedio puede engañar» | «En todo el municipio {H['pct_total']} de 12 a 14 años no asiste, pero sin una institución de residencia son {H['pct_hogares']}. En Bellavista, {H['bella']}. Un promedio puede esconder diferencias.» |
| 1:20 | Capas Internet y Sin nada | «Solo {H['int_m']} de las viviendas tiene internet. Por eso la plataforma funciona en celular y sin conexión.» |
| 1:40 | «Cuéntame» (privacidad) y el punto de partida | «Es voluntario y anónimo; no pedimos nombre ni domicilio.» |
| 2:00 | El Mundo: la isla de Tecnología (robot) y la de Retos (detective de datos) | «Cinco regiones. Aquí se programa un robot y aquí se usan datos reales para leer críticamente un porcentaje.» |
| 2:50 | «Mentores» (Katherine Johnson) | «Biografías verificables, sin frases inventadas, con un reto relacionado.» |
| 3:10 | «Yo» y la pestaña «Adultos» (fuentes y límites) | «Medimos antes y después. Declaramos fuentes, límites y uso de IA. Es un prototipo; el impacto aún no se mide.» |

Consejos: cierra otras pestañas, sube el volumen del micrófono, usa pantalla completa y no muestres datos personales reales.

# Lista de entrega (límite: 15 de noviembre de 2026)

- [ ] Carpeta en la nube (Google Drive) con permiso de lectura para cualquier persona con el enlace.
- [ ] Reporte científico (completar los [POR COMPLETAR]: nombre y número del equipo, prueba con usuarios, herramientas de IA, enlaces de mentores).
- [ ] Infografía (entregables/infografia.png).
- [ ] Manual de usuario.
- [ ] Entregable técnico: toda la carpeta del proyecto (index.html, script.js, styles.css, datos/, herramientas/).
- [ ] Pitch de máximo 8 diapositivas.
- [ ] Video de demostración.
- [ ] Confirmar con contacto@solacyt.org (indicando el número de equipo) si el Censo 2020 cuenta como segundo dataset del catálogo.
- [ ] Presentación virtual de 15 minutos: 11 y 12 de diciembre.
""", encoding="utf-8")
print("Entregables en", SAL)
for a in sorted(SAL.iterdir()): print(" -", a.name)

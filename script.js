/* NEUROPLAY v4 · script.js
   Pensado para chicos de 12 a 14 años: pocas palabras, iconos grandes y un mundo que se recorre tocando.
   Lo que necesitan los adultos (fuentes, tablas, análisis) vive en la pestaña «Adultos».
   1) estado  2) datos  3) mundo  4) región y actividades  5) mi zona  6) mentores  7) mi espacio y evaluación
   8) yo  9) adultos  10) arranque
   Los datos oficiales viven en datos/acatlan.js (lo genera herramientas/generar_datos.py desde INEGI y CONEVAL). */

/* ===== 1) ESTADO: localStorage NO es almacenamiento seguro; es solo demostración ===== */
const KEY = 'neuroplay_v4';
/* Como en un videojuego: cada vez que se abre o recarga la página, la partida empieza de cero (pon false para conservar el progreso). */
const REINICIAR_AL_CARGAR = false; // true: cada recarga empieza de cero (útil para probar el flujo completo)
if (REINICIAR_AL_CARGAR) { try { localStorage.removeItem(KEY); } catch (e) {} }
let S = JSON.parse(localStorage.getItem(KEY) || 'null') ||
  { nick: '', xp: 0, badges: [], acts: [], concepts: [], resp: [], interests: [], layers: [], mentors: [], pre: null, post: null, skipPre: false };
S.hist = S.hist || { prologo: false, intro: {}, cierre: {}, pistas: [], final: false };
S.arena = S.arena || {}; // resultados de las arenas de combate: { isla: { ok, estrellas, mejor } }
if (typeof Sfx !== 'undefined') Sfx.set(!S.mute);
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const $ = s => document.querySelector(s);
const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 2800); };
const level = () => Math.floor(S.xp / 100) + 1;
const D = window.DATOS;                                   // datos oficiales reales (INEGI, CONEVAL)
const fmt = n => (n === null || n === undefined) ? '—' : Number(n).toLocaleString('es-MX');
const pc = n => (n === null || n === undefined) ? '—' : `${String(n).replace('.', ',')}%`;
const r0 = n => Math.round(n);
const BADGES = [
  { id: 'a1', ico: '🚀', n: 'Primer descubrimiento', ok: () => S.acts.length >= 1 },
  { id: 'a4', ico: '🏅', n: 'Explorador/a', ok: () => S.acts.length >= 4 },
  { id: 'a7', ico: '🏆', n: 'Mundo completo', ok: () => S.acts.length >= 7 },
  { id: 'map', ico: '🗺️', n: 'Cartógrafo/a', ok: () => S.layers.length >= 3 },
  { id: 'voz', ico: '💬', n: 'Tu voz cuenta', ok: () => S.resp.length >= 1 },
  { id: 'men', ico: '🌟', n: 'Inspiración', ok: () => S.mentors.length >= 2 },
];
function gain(xp, concept) {
  S.xp += xp;
  if (concept && !S.concepts.includes(concept)) S.concepts.push(concept);
  BADGES.forEach(b => { if (!S.badges.includes(b.id) && b.ok()) { S.badges.push(b.id); toast(`${b.ico} ¡Nueva medalla: ${b.n}!`); } });
  save(); render();
}

/* Avatar guía: el mismo personaje pixelado del mundo */
const avatar = () => `<img class="px guia" src="arte/heroe.png" onerror="this.onerror=null;this.src='${Px.url('guia', 4)}';this.width=56" width="51" height="64" alt="Guía">`;
const say = (t, mood) => `<div class="say">${avatar(mood)}<span>${t}</span></div>`;
let view = 'inicio';
const HELP = { inicio: 'Toca una isla para jugar.', stem: 'Toca una actividad.', mapa: 'Toca una capa y luego un círculo.', mentores: 'Toca a una persona.', espacio: 'Responde solo lo que quieras.', progreso: 'Aquí ves tu avance.', datos: 'Zona para docentes y jurado.' };

/* ===== 2) DATOS ===== */
const REGIONES = [
  { id: 'ciencia', ico: '🔬', n: 'Ciencia', c: 'var(--ciencia)', d: 'Experimenta' },
  { id: 'tec', ico: '💻', n: 'Tecnología', c: 'var(--tec)', d: 'Programa' },
  { id: 'ing', ico: '⚙️', n: 'Ingeniería', c: 'var(--ing)', d: 'Construye' },
  { id: 'mate', ico: '📐', n: 'Mates', c: 'var(--mate)', d: 'Calcula' },
  { id: 'int', ico: '🧩', n: 'Retos', c: 'var(--int)', d: 'Une todo' },
];
const POS = { ciencia: ['27%', '24%', '30%'], tec: ['73%', '21%', '30%'], mate: ['20%', '58%', '28%'], ing: ['72%', '54%', '30%'], int: ['46%', '80%', '30%'] };
const QS = [
  { id: 'q1', cat: 'Académicas', q: '¿Qué materia te cuesta más?', o: ['Matemáticas', 'Física', 'Química', 'Español', 'Ninguna'], demo: [48, 39, 31, 17, 22] },
  { id: 'q2', cat: 'Académicas', q: '¿Cómo aprendes mejor?', o: ['Experimentando', 'Con videos', 'Jugando', 'En equipo', 'Leyendo'], demo: [56, 44, 61, 38, 14] },
  { id: 'q3', cat: 'Contextuales', q: '¿Qué te lo complica?', o: ['Poco tiempo', 'Lejos de la escuela', 'Poco espacio', 'Temas difíciles', 'Prefiero no decir'], demo: [35, 22, 27, 52, 18] },
  { id: 'q4', cat: 'Acceso tecnológico', q: '¿Qué tienes en casa?', o: ['Celular', 'Computadora', 'Internet', 'Nada de esto'], demo: [92, 41, 63, 9] },
  { id: 'q5', cat: 'Personales y sociales', q: '¿Qué cambiarías?', o: ['Más práctica', 'Explicar mejor', 'Más apoyo', 'Más recursos'], demo: [58, 47, 36, 29] },
];
const INTERESTS = ['Matemáticas', 'Física', 'Química', 'Tecnología', 'Ingeniería'];
const INT_DEMO = [26, 34, 22, 48, 30];
const COLORS = ['#14c9c1', '#2f5bff', '#7b4dff', '#ff8a2b', '#ffd23f'];
const CAMINOS = { 'Matemáticas': 'Matemáticas, Actuaría, Ciencia de datos', 'Física': 'Física, Ingeniería civil, Energías renovables', 'Química': 'Química, Ingeniería química, Biotecnología', 'Tecnología': 'Computación, Sistemas, Mecatrónica', 'Ingeniería': 'Ingeniería industrial, Mecánica, Electrónica' };
const PREGUNTAS_EVAL = [
  { a: 'Mates', q: '3 limones para 4 vasos. ¿Cuántos limones para 8 vasos?', o: ['4', '6', '8'], ok: 1 },
  { a: 'Física', q: 'El autobús frena de golpe. Tu cuerpo tiende a…', o: ['Ir hacia atrás', 'Seguir avanzando', 'Quedarse quieto'], ok: 1 },
  { a: 'Química', q: 'Un hielo que se derrite sigue siendo…', o: ['Otra sustancia', 'Agua', 'Aire'], ok: 1 },
  { a: 'Tecnología', q: 'Una lista ordenada de pasos para resolver algo es un…', o: ['Pantalla', 'Algoritmo', 'Archivo'], ok: 1 },
  { a: 'Ingeniería', q: '4 kg a 3 m se equilibran con 6 kg a…', o: ['1 m', '2 m', '3 m'], ok: 1 },
  { a: 'Datos', q: '12 de cada 100 no van a la escuela. ¿Qué porcentaje es?', o: ['1,2 %', '12 %', '88 %'], ok: 1 },
];

/* ===== 3) MUNDO (inicio): un juego en pixel art; las islas se tocan ===== */
const cuatro = () => ['ciencia', 'mate', 'tec', 'ing'].every(i => S.hist.cierre[i]);
const regionCompleta = id => ACTS.filter(a => a.reg === id).every(a => S.acts.includes(a.id));
function estadoMundo() { const hechas = {}, total = {}; REGIONES.forEach(r => { const as = ACTS.filter(a => a.reg === r.id); total[r.id] = as.length; hechas[r.id] = as.filter(a => S.acts.includes(a.id)).length; }); return { hechas, total, recuperadas: { ...S.hist.cierre }, bloqueada: { int: !cuatro() } }; }
let yendo = false;
function irIsla(id) {
  if (yendo || document.body.classList.contains('en-dialogo')) return;
  if (id === 'int' && !cuatro()) { Mundo.sacudir('int'); Historia.mostrar([{ q: 'chispa', t: 'La Torre está sellada. Recupera las chispas de las otras cuatro islas.' }]); return; }
  if (!S.hist.cierre[id]) { Historia.mostrar([{ q: 'chispa', t: 'Esa isla se abre desde la Mansión: usa el portal de su sala.' }]); return; }
  yendo = true;
  Mundo.ir(id, () => { // historia de la isla -> arena de combate -> cierre del capítulo (dato real + mentor + tus dudas)
    const pelear = () => { if (typeof Arena === "undefined" || !Arena.CFG[id]) { yendo = false; return entrar(id); } Arena.jugar(id, ok => { yendo = false; if (ok) cerrarCapitulo(id); }); };
    if (!S.hist.intro[id]) { S.hist.intro[id] = true; save(); Historia.mostrar(Historia.INTRO[id], pelear); } else pelear();
  });
}
function cerrarCapitulo(id) {
  const primera = !S.hist.cierre[id]; S.hist.cierre[id] = true; save();
  if (id === 'int') { if (primera || !S.hist.final) Historia.mostrar(Historia.FINAL_JUEGO, () => Guion.carta(() => { render(); go('inicio'); })); else { render(); Guion.carta(() => render()); } return; }
  if (!primera) { render(); toast('¡Arena superada otra vez!'); return; }
  Historia.mostrar(Historia.CIERRE[id], () => Guion.reflexion(id, () => { render(); const sig = Historia.ORDEN.find(i => !S.hist.cierre[i]); if (sig) toast('Siguiente misión: ' + REGIONES.find(r => r.id === sig).n); }));
}
function retosMenu() {
  modal(`<h2>🧪 Retos extra</h2><p class="small">Experimentos y ejercicios para practicar más.</p><div class="grid">${REGIONES.map(r => `<div class="card"><h3>${r.ico} ${r.n}</h3><button class="btn" onclick="closeModal();abrirRegion('${r.id}')">Abrir</button></div>`).join('')}</div>`);
}
function confirmaReinicio() {
  modal(`<h2>¿Empezar de cero?</h2><p>Se borra todo tu progreso y vuelves a vivir la historia desde el principio.</p><div class="row" style="justify-content:center"><button class="btn gh" onclick="closeModal()">No, seguir</button><button class="btn" onclick="reiniciarJuego()">Sí, empezar de cero</button></div>`);
}
function reiniciarJuego() { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
function menuJuego() {
  const b = (t, f) => `<button class="btn alt" style="width:100%;margin:6px 0" onclick="closeModal();${f}">${t}</button>`;
  modal(`<h2>☰ Menú</h2>${b('🏚 Volver a la Mansión (historia)', 'Mansion.entrar()')}${b('⚔ Arenas', 'arenasMenu()')}${b('🎬 Ver la historia', 'closeModal();Cine.ver()')}${b('📓 Mi cuaderno', 'modal(Historia.cuaderno())')}${b('🛠 Taller de mejoras', 'Guion.tienda()')}${b('🧪 Retos extra', 'retosMenu()')}${b('📁 Expediente del reto', 'expediente()')}${b('👩‍🏫 Para docentes y jurado', "go('datos')")}${b('📝 Mi punto de partida', "evaluar('pre')")}${b('🎮 Pantalla de inicio', "Intro.mostrar(S,save,()=>go('inicio'))")}${b('🔄 Empezar de cero', 'confirmaReinicio()')}
   <label class="ar-chk" style="color:inherit"><input type="checkbox" id="mSon" ${Sfx.activo ? 'checked' : ''} onchange="S.mute=!this.checked;Sfx.set(!S.mute);save()"> Sonido</label>`);
}
function arenasMenu() {
  modal(`<h2>⚔ Arenas</h2><p class="small">Vuelve a jugar para mejorar tus estrellas.</p><div class="grid">${REGIONES.map(r => { const a = S.arena[r.id] || {}, bloq = r.id === 'int' && !cuatro();
    return `<div class="card"><h3>${r.ico} ${r.n}</h3><p>${a.ok ? '★'.repeat(a.estrellas) + ' · ' + a.mejor + ' pts' : 'Sin jugar'}</p><button class="btn" ${bloq ? 'disabled' : ''} onclick="closeModal();Arena.jugar('${r.id}',ok=>{if(ok)render()})">${bloq ? 'Sellada' : 'Jugar'}</button></div>`; }).join('')}</div>`);
}
function expediente() { // todo lo que pide el documento oficial del reto, en un solo lugar
  const m = D.municipio, aj = D.ajusteHogares, c = D.coneval.municipio, ds = DS.filter(d => d.st === 'integrada');
  const ficha = d => `<li><b>${d.n}</b> (${d.inst}; ${d.per}; cobertura: ${d.cob}). <i>Qué tomamos:</i> ${d.tomamos} <i>Para qué:</i> ${d.para} <a href="${d.url}" target="_blank" rel="noopener">Sitio oficial</a></li>`;
  modal(`<div class="exp"><h2>📁 Expediente del reto</h2><p class="small">Reto 04: Educación y Talento · Hackathon Jalisco Internacional 2026</p>
   <h3>1. Problema y delimitación</h3><ul><li><b>Pregunta:</b> ¿qué factores personales, familiares, sociales y educativos se relacionan con las dificultades de aprendizaje y la interrupción de los estudios? Son factores por investigar, no causas demostradas.</li>
   <li><b>Dónde y quién:</b> Acatlán de Juárez, Jalisco · 2.º de secundaria (12 a 14 años). Docentes, orientadores y jurado consultan la zona «Adultos».</li>
   <li><b>Cómo se mediría la mejora:</b> % de 12 a 14 años que no asiste (${pc(m.pctNoAsiste12a14)} en todo Acatlán; ${pc(aj.pctNoAsiste12a14)} en localidades con hogares), rezago educativo (${pc(c.rezagoEducativo['2020'])} en 2020) y el cambio entre la evaluación inicial y la final. El impacto es esperado, no medido.</li></ul>
   <h3>2. Datasets oficiales usados</h3><ul>${ds.map(ficha).join('')}</ul><p class="small">Contexto nacional: PISA 2022 (OCDE, catálogo #30): es un dato de todo México, no de Acatlán.</p>
   <h3>3. Tres áreas de conocimiento</h3><ul><li><b>Educación y pedagogía:</b> aprendizaje por indagación, retos y preguntas STEM, evaluación inicial y final sin calificar.</li><li><b>Ciencia de datos y estadística:</b> datos oficiales, proporciones y lectura crítica del promedio.</li><li><b>Ciencias sociales y diseño inclusivo:</b> brecha digital, equidad de género, accesibilidad y pertinencia cultural.</li></ul>
   <h3>4. Criterios de éxito del reto 04</h3><ul>
    <li><span class="ok">✔</span> Brecha educativa con datos de Jalisco: Acatlán ${pc(m.pctNoAsiste12a14)} vs Jalisco ${pc(D.estado.pctNoAsiste12a14)} (12 a 14 años fuera de la escuela) y brecha digital.</li>
    <li><span class="ok">✔</span> Solución funcional o prototipada: este juego web, que abre sin internet tras la primera visita.</li>
    <li><span class="ok">✔</span> Al menos dos datasets oficiales: ${ds.length} integrados (arriba). <span class="pend">Por confirmar</span> con la organización si el Censo 2020 cuenta como del catálogo.</li>
    <li><span class="ok">✔</span> Tres áreas de conocimiento (arriba).</li>
    <li><span class="ok">✔</span> Accesibilidad, equidad de género y pertinencia cultural: letra ajustable, alto contraste, voz, teclado, Modo calmado y objetivos táctiles grandes; personaje sin género; 3 de 4 mentores son mujeres; un mentor jalisciense (G. González Camarena); datos locales (en las localidades con hogares de Acatlán no asiste ${pc(aj.pctNoAsisteMujeres)} de las chicas y ${pc(aj.pctNoAsisteHombres)} de los chicos de 12 a 14 años, Censo 2020).</li>
    <li><span class="pend">⏳</span> Evidencia de utilidad con estudiantes reales (prueba con usuarios o encuesta corta): pendiente.</li></ul>
   <h3>5. Real, simulado y límites</h3><ul><li>Real: datos de INEGI, CONEVAL y OCDE. Propio: el cálculo «Acatlán en hogares».</li><li>Simulado: no hay servidor (lo que respondes se guarda solo en tu navegador) y las gráficas marcadas como «datos de prueba».</li><li>La historia de Don Promedio y el combate son ficción educativa; los mentores se basan en biografías públicas, sin citas inventadas.</li><li>No afirmamos reducir la deserción: eso requiere estudios con seguimiento en el tiempo. Sin diagnósticos ni etiquetas: no sustituye a docentes ni psicólogos.</li></ul>
   <h3>6. Uso de inteligencia artificial</h3><p>Parte del código, los textos y el arte (islas, personajes y fondos, generados en una computadora local con Z-Image Turbo) se hizo con IA y el equipo lo revisó. Los datos oficiales no los genera una IA y el juego no usa IA al funcionar.</p>
   <div class="cta3"><button class="btn" onclick="closeModal();go('datos')">Ver datos completos (Adultos)</button></div></div>`);
}
function entrar(id) { if (!S.hist.intro[id]) { S.hist.intro[id] = true; save(); Historia.mostrar(Historia.INTRO[id], () => abrirRegion(id)); } else abrirRegion(id); }
function prologo() { S.hist.prologo = true; save(); Historia.mostrar(Historia.PROLOGO, () => { if (!S.pre && !S.skipPre) evaluar('pre', true); else mision(); }); }
function tras(reg) { // al terminar un reto: si la isla quedó completa, sigue la historia
  if (typeof Mansion !== 'undefined' && Mansion.activo()) return Mansion.tras(reg);
  closeModal();
  if (regionCompleta(reg) && !S.hist.cierre[reg]) { S.hist.cierre[reg] = true; save(); go('inicio'); Historia.mostrar(reg === 'int' ? Historia.FINAL : Historia.CIERRE[reg], () => { render(); }); }
  else abrirRegion(reg);
}
function construirMundo() {
  const btn = REGIONES.map(r => { const d = Mundo.ISLAS[r.id]; return `<button class="isla-btn" data-id="${r.id}" style="left:${d.x / Mundo.W * 100}%;top:${(d.y + 20) / Mundo.H * 100}%" aria-label="${r.n}"><span class="fb">${r.n}</span></button>`; }).join('');
  const b = Mundo.BOTELLA;
  $('#inicio').innerHTML = `<div class="hola"><h1 id="saludo"></h1><span class="nivel" id="nivel"></span></div>
   <div class="mundo${Mundo.horizontal ? ' horiz' : ''}" id="mundo"><div id="juego" aria-hidden="true"></div><div class="hud-mundo"><div class="hud-izq"><b id="hGt"></b><span id="hNv"></span></div><button class="hud-b" id="hMenu" aria-label="Menú del juego" onclick="menuJuego()">☰</button></div><button class="hud-hist" id="hHist" onclick="mision()"></button>${btn}<button class="isla-btn botella-btn" style="left:${b.x / Mundo.W * 100}%;top:${b.y / Mundo.H * 100}%" aria-label="Cuéntame cómo aprendes"><span class="fb">Cuéntame</span></button></div>
   <div class="cta cta2"><button class="big" id="mansionBtn" onclick="Mansion.entrar()">🏚 Entrar a la Mansión</button><button class="btn alt" id="mision" onclick="mision()"></button></div>
   <div class="cta3"><button class="btn alt" onclick="arenasMenu()">⚔ Arenas</button><button class="btn alt" onclick="expediente()">📁 Expediente</button><button class="btn alt" onclick="Intro.mostrar(S,save,()=>go('inicio'))">🎮 Pantalla de inicio</button></div>`;
  document.querySelectorAll('.isla-btn[data-id]').forEach(el => {
    const id = el.dataset.id;
    el.addEventListener('pointerdown', () => Mundo.presionar(id, true));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, () => Mundo.presionar(id, false)));
    el.addEventListener('click', () => irIsla(id));
  });
  document.querySelector('.botella-btn').addEventListener('click', () => go('espacio'));
}
function actualizarMundo() {
  const e = estadoMundo(), pendientes = ACTS.filter(a => !S.acts.includes(a.id));
  $('#saludo').textContent = `¡Hola${S.nick ? ', ' + S.nick : ''}!`;
  $('#nivel').textContent = `⭐ Nivel ${level()}`;
  const sig = Historia.ORDEN.find(i => !S.hist.cierre[i]); $('#hGt').textContent = S.nick || 'Explorador'; $('#hNv').textContent = 'NIVEL ' + level(); $('#hHist').textContent = Historia.ORDEN.every(i => S.hist.cierre[i]) ? '★ CASO CERRADO' : (S.hist.prologo ? '▶ ' + REGIONES.find(r => r.id === sig).n.toUpperCase() : '▶ EMPEZAR'); Mundo.guia(null); $('#hHist').textContent = '🏚 LA MANSIÓN'; $('#hHist').onclick = () => Mansion.entrar();
  $('#mision').textContent = Historia.ORDEN.every(i => S.hist.cierre[i]) ? '🏆 Caso cerrado' : (S.hist.prologo ? '▶ Siguiente misión' : '▶ Empezar la historia');
  document.querySelectorAll('.isla-btn[data-id]').forEach(el => { const r = REGIONES.find(x => x.id === el.dataset.id); el.setAttribute('aria-label', `${r.n}: ${e.hechas[r.id]} de ${e.total[r.id]} retos`); });
  Mundo.actualizar(e);
}
function render() {
  if (!document.getElementById('mundo')) construirMundo();
  actualizarMundo();
  stemView(); mapView(); mentoresView(); espacioView(); progresoView(); datosView();
}
function mision() {
  if (!S.hist.prologo) return prologo();
  const id = Historia.ORDEN.find(i => !S.hist.cierre[i]);
  if (!id) { Historia.informe(true); return; }
  irIsla(id);
}
function go(v) {
  if (typeof Mansion !== 'undefined' && Mansion.activo()) Mansion.salir();
  view = v; document.body.classList.toggle('en-mundo', v === 'inicio'); if (v === 'inicio' && typeof rearmarMundo === 'function') setTimeout(rearmarMundo, 0);
  document.querySelectorAll('.view').forEach(e => e.classList.toggle('on', e.id === v));
  const marca = { stem: 'inicio' }[v] || v;
  document.querySelectorAll('#nav button').forEach(b => { const on = b.dataset.view === marca; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  if (typeof Mundo !== 'undefined') Mundo.pausa(v !== 'inicio');
  window.scrollTo(0, 0); $('#contenido').focus({ preventScroll: true });
}
const modal = h => { if (document.pointerLockElement) document.exitPointerLock(); $('#mbody').innerHTML = h; $('#modal').hidden = false; $('#mx').focus(); };
const closeModal = () => $('#modal').hidden = true;
const volver = (a = 'inicio') => `<button class="back" onclick="go('${a}')" aria-label="Volver"><span aria-hidden="true">‹</span> Volver</button>`;

/* ===== 4) REGIÓN Y ACTIVIDADES: situación → idea → experimento → pregunta → resultado ===== */
const ACTS = [
  { id: 'inercia', reg: 'ciencia', ico: '🚌', n: 'Frenón', sit: '¡El autobús frena de golpe!', q0: '¿Qué le pasa a tu cuerpo?', h: ['Sigue adelante', 'Se va hacia atrás', 'Se queda quieto'],
    ui: `<p class="frase">Pulsa y observa</p><div class="road"><div class="car" id="car">🚌</div><div class="pax" id="pax">🧍</div></div><div class="row"><button class="btn" id="go" onclick="runInercia()">▶ Acelerar y frenar</button></div>`,
    q: 'Sin cinturón, ¿qué pasa?', o: ['Sales hacia atrás', 'Sigues avanzando', 'Te quedas quieto'], ok: 1,
    why: 'Un cuerpo en movimiento sigue moviéndose. Se llama inercia.', concl: 'Por eso existe el cinturón.', concept: 'Inercia' },
  { id: 'estados', reg: 'ciencia', ico: '🧊', n: 'Hielo y vapor', sit: 'Un hielo sobre la estufa.', q0: '¿Qué le pasa al agua?', h: ['Cambia de estado', 'Se vuelve otra cosa', 'Desaparece'],
    ui: `<p class="frase">Mueve la temperatura</p><input class="sl" type="range" min="-10" max="120" value="-10" oninput="estUpd(this.value)" aria-label="Temperatura"><div class="read" id="eout">-10 °C · 🧊 Sólido</div>`,
    q: 'A 50 °C el agua es…', o: ['Sólida', 'Líquida', 'Gas'], ok: 1,
    why: 'Entre 0 y 100 °C es líquida. Cambia de forma, no de sustancia.', concl: 'Sigue siendo agua.', concept: 'Estados de la materia' },
  { id: 'luz', reg: 'ciencia', ico: '🌈', n: 'Mezcla de luz', sit: 'Tu pantalla usa solo 3 luces.', q0: '¿Cómo hace tantos colores?', h: ['Mezcla luces', 'Un foco por color', 'Está pintada'],
    ui: `<p class="frase">Sube rojo y verde</p><div class="mix" id="mixv"></div>${['R', 'G', 'B'].map((c, i) => `<label>${['Rojo', 'Verde', 'Azul'][i]} <input class="sl" type="range" min="0" max="255" value="0" id="mx${c}" oninput="mixUpd()" aria-label="${['Rojo', 'Verde', 'Azul'][i]}"></label>`).join('')}<div class="read" id="mixo">rgb(0, 0, 0)</div>`,
    q: 'Rojo + verde =', o: ['Amarillo', 'Morado', 'Blanco'], ok: 0,
    why: 'Las luces se suman. El jalisciense Guillermo González Camarena llevó el color a la tele.', concl: '3 luces, millones de colores.', concept: 'Luz y color', mentor: 'camarena' },
  { id: 'prop', reg: 'mate', ico: '🍋', n: 'Limonada', sit: '4 vasos llevan 3 limones.', q0: '¿Y para más vasos?', h: ['Todo crece igual', 'Solo el agua', 'Nada cambia'],
    ui: `<p class="frase">Mueve los vasos</p><input class="sl" type="range" min="2" max="16" step="2" value="4" oninput="propUpd(this.value)" aria-label="Número de vasos"><div class="read" id="pout">4 vasos · 3 limones · 1 L</div>`,
    q: 'Para 8 vasos, ¿cuántos limones?', o: ['4', '6', '8'], ok: 1,
    why: 'Si duplicas los vasos, duplicas los limones. Katherine Johnson usó mates así con naves.', concl: 'Las proporciones escalan recetas.', concept: 'Proporcionalidad', mentor: 'johnson' },
  { id: 'robot', reg: 'tec', ico: '🤖', n: 'Robot', sit: 'El robot quiere la estrella.', q0: '¿Qué necesita?', h: ['Pasos en orden', 'Un empujón', 'Más energía'],
    ui: `<p class="frase">Arma los pasos y pulsa ▶</p><div class="grid4" id="rgrid"></div><div class="chips" style="justify-content:center"><button class="btn" onclick="robotAdd('↑')" aria-label="Arriba">⬆️</button><button class="btn" onclick="robotAdd('→')" aria-label="Derecha">➡️</button><button class="btn" onclick="robotAdd('←')" aria-label="Izquierda">⬅️</button><button class="btn" onclick="robotAdd('↓')" aria-label="Abajo">⬇️</button></div><p class="center">Pasos: <b id="rpasos">(vacío)</b></p><div class="row" style="justify-content:center"><button class="btn alt" id="rrun" onclick="robotRun()">▶ Ejecutar</button><button class="btn gh" onclick="robotReset()">↺ Reiniciar</button></div><p class="center small" id="rmsg" aria-live="polite">Llega a ⭐ sin tocar 🪨</p>`,
    q: 'Una lista de pasos en orden es un…', o: ['Pantalla', 'Algoritmo', 'Archivo'], ok: 1,
    why: 'Un algoritmo son pasos en orden. Si cambias el orden, cambia el resultado.', concl: 'Programar es pensar paso a paso.', concept: 'Algoritmos' },
  { id: 'palanca', reg: 'ing', ico: '⚖️', n: 'Balancín', sit: 'Un balancín: 2 kg a 3 m.', q0: '¿Dónde pones 3 kg?', h: ['Más cerca', 'Igual de lejos', 'Lo más lejos'],
    ui: `<p class="frase">Equilibra el balancín</p><div class="bal"><div class="beam" id="beam"><span class="wl">2 kg</span><span class="wr" id="wr">3 kg</span></div><div class="pivot"></div></div><input class="sl" type="range" min="1" max="5" step=".5" value="5" oninput="palUpd(this.value)" aria-label="Distancia del peso de 3 kg"><div class="read" id="pal">3 kg a 5 m</div>`,
    q: '¿A qué distancia se equilibra el de 3 kg?', o: ['1 m', '2 m', '3 m'], ok: 1,
    why: 'Peso × distancia debe ser igual: 2 × 3 = 3 × 2.', concl: 'Así funcionan grúas y tijeras. Mae Jemison fue ingeniera y astronauta.', concept: 'Palanca', mentor: 'jemison' },
  { id: 'datos', reg: 'int', ico: '🕵️', n: 'Detective', sit: 'En Acatlán, 6,6 de cada 100 no van a la escuela.', q0: '¿Es toda la historia?', h: ['No, puede esconder cosas', 'Sí', 'Depende'],
    ui: `<p class="frase">Compara las tres</p><div class="chips" style="justify-content:center"><button class="chip" onclick="detUpd(0)">Todo Acatlán</button><button class="chip" onclick="detUpd(1)">Casas de Acatlán</button><button class="chip" onclick="detUpd(2)">Jalisco</button></div><div class="dots" id="g10" aria-hidden="true"></div><div class="read" id="dout">Elige una</div>`,
    q: '¿Por qué 6,6 engaña?', o: ['Cuenta un lugar donde casi todos sí van', 'Se equivocaron', 'No hay escuelas'], ok: 0,
    why: 'Sin Villa de los Niños son 11,9 de cada 100.', concl: 'Pregunta siempre: ¿quién entra en el número?', concept: 'Lectura crítica de datos' },
];
let ST = { reg: 'ciencia' };
function abrirRegion(id) { ST.reg = id; stemView(); go('stem'); }
function stemView() {
  const r = REGIONES.find(x => x.id === ST.reg), as = ACTS.filter(a => a.reg === ST.reg);
  const di = Mundo.ISLAS[ST.reg], hito = { ciencia: 'mundoCiencia', tec: 'mundoTec', ing: 'mundoIng', mate: 'mundoMate', int: 'mundoRetos' }[ST.reg];
  $('#stem').innerHTML = `${volver()}<h1 class="center">${r.n}</h1><p class="small center">${r.d}</p>
   <div class="escenario" aria-hidden="true"><div class="flota"><img class="px isla-img" src="${Px.isla(di.semilla).toDataURL()}" width="264" height="192" alt=""><img class="px hito-img" src="${Px.url(hito, 6)}" width="96" height="96" alt=""></div></div>
   <div class="tiles" style="--c:${r.c}">${as.map(a => `<button class="tile ${S.acts.includes(a.id) ? 'done' : ''}" onclick="startAct('${a.id}')"><span class="e" aria-hidden="true">${a.ico}</span>${a.n}${S.acts.includes(a.id) ? '<span class="ok" aria-label="Completada">✔</span>' : ''}</button>`).join('')}</div>`;
}
let cur = null;
function startAct(id) { cur = ACTS.find(a => a.id === id);
  modal(`<div class="escena" aria-hidden="true">${cur.ico}</div><p class="frase">${cur.sit}</p>${say(cur.q0, 'think')}<div class="opts">${cur.h.map((h, i) => `<button onclick="actDemo(${i})">${h}</button>`).join('')}</div>`); }
function actDemo(i) {
  modal(`<div class="escena" aria-hidden="true">${cur.ico}</div>${cur.ui}<div id="after" hidden><hr><p class="frase">${cur.q}</p><div class="opts" id="qo">${cur.o.map((o, k) => `<button onclick="actAns(${k},this)">${o}</button>`).join('')}</div></div>`);
  if (cur.id === 'robot') robotReset(); if (cur.id === 'palanca') palUpd(5); if (cur.id === 'luz') mixUpd(true);
}
const unlock = () => { const a = $('#after'); if (a) a.hidden = false; };
function runInercia() { const c = $('#car'), p = $('#pax'); $('#go').disabled = true; c.style.left = '70%'; p.style.transition = 'left 1.6s'; p.style.left = '70%';
  setTimeout(() => { c.style.transition = 'left .15s'; c.style.left = '72%'; p.style.transition = 'left .8s'; p.style.left = '84%'; unlock(); }, 1700); }
function propUpd(v) { $('#pout').textContent = `${v} vasos · ${v * .75} limones · ${v / 4} L`; unlock(); }
function estUpd(v) { v = +v; $('#eout').textContent = `${v} °C · ${v <= 0 ? '🧊 Sólido' : v < 100 ? '💧 Líquido' : '☁️ Gas'}`; unlock(); }
function mixUpd(first) { const [r, g, b] = ['R', 'G', 'B'].map(c => +$('#mx' + c).value); $('#mixv').style.background = `rgb(${r},${g},${b})`; $('#mixo').textContent = `rgb(${r}, ${g}, ${b})`; if (!first && (r || g || b)) unlock(); }
/* Robot: cuadrícula 4×4; sale de (0,3); ⭐ en (3,0); 🪨 en (1,2) */
let R = { pasos: [], x: 0, y: 3, run: false };
const ROCA = [1, 2], META = [3, 0];
function robotDraw() { let h = ''; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) h += `<div>${x === R.x && y === R.y ? '🤖' : x === META[0] && y === META[1] ? '⭐' : x === ROCA[0] && y === ROCA[1] ? '🪨' : ''}</div>`; $('#rgrid').innerHTML = h; $('#rpasos').textContent = R.pasos.length ? R.pasos.join(' ') : '(vacío)'; }
function robotAdd(d) { if (R.run || R.pasos.length >= 12) return; R.pasos.push(d); robotDraw(); }
function robotReset() { R = { pasos: [], x: 0, y: 3, run: false }; robotDraw(); const m = $('#rmsg'); if (m) m.textContent = 'Llega a ⭐ sin tocar 🪨'; }
async function robotRun() {
  if (R.run || !R.pasos.length) return; R.run = true; const pasos = [...R.pasos]; R.x = 0; R.y = 3; robotDraw();
  for (const p of pasos) { await new Promise(r => setTimeout(r, 450)); const nx = R.x + (p === '→') - (p === '←'), ny = R.y + (p === '↓') - (p === '↑');
    if (nx < 0 || nx > 3 || ny < 0 || ny > 3) { $('#rmsg').textContent = 'Te saliste. Reinicia.'; R.run = false; return; }
    if (nx === ROCA[0] && ny === ROCA[1]) { R.x = nx; R.y = ny; robotDraw(); $('#rmsg').textContent = '¡Chocó! Cambia el orden y reinicia.'; R.run = false; return; }
    R.x = nx; R.y = ny; robotDraw(); }
  R.run = false;
  if (R.x === META[0] && R.y === META[1]) { $('#rmsg').textContent = `¡Llegó en ${pasos.length} pasos! ⭐`; unlock(); } else $('#rmsg').textContent = 'Aún no llega. Agrega pasos o reinicia.';
}
function palUpd(v) { v = +v; const dif = 3 * v - 6, ang = Math.max(-14, Math.min(14, dif * 2.2)); $('#beam').style.transform = `rotate(${ang}deg)`; $('#wr').style.left = `${50 + v * 8}%`; $('#pal').textContent = `3 kg a ${v} m ${dif === 0 ? '⚖️ ¡Equilibrado!' : dif > 0 ? '⬇️ baja la derecha' : '⬇️ baja la izquierda'}`; if (dif === 0) unlock(); }
const dotsHTML = (v, c, mini) => `<div class="dots ${mini ? 'mini' : ''}" style="--c:${c}" role="img" aria-label="${r0(v)} de cada 100">${Array.from({ length: 100 }, (_, k) => `<i class="${k < r0(v) ? 'on' : ''}"></i>`).join('')}</div>`;
function detUpd(i) { const v = [D.municipio.pctNoAsiste12a14, D.ajusteHogares.pctNoAsiste12a14, D.estado.pctNoAsiste12a14][i], t = ['Todo Acatlán', 'Casas de Acatlán', 'Jalisco'][i];
  const g = $('#g10'); g.innerHTML = Array.from({ length: 100 }, (_, k) => `<i class="${k < r0(v) ? 'on' : ''}"></i>`).join(''); g.style.setProperty('--c', 'var(--ing)'); $('#dout').textContent = `${t}: ${pc(v)}`; unlock(); }
function actAns(k, b) {
  const good = k === cur.ok; b.classList.add(good ? 'ok' : 'no'); b.textContent += good ? '  ✔' : '  ✖ prueba otra';
  if (!good) return;
  document.querySelectorAll('#qo button').forEach(x => x.disabled = true);
  const first = !S.acts.includes(cur.id); if (first) { S.acts.push(cur.id); gain(40, cur.concept); if (typeof Mundo !== 'undefined') Mundo.celebrar(cur.reg); }
  const m = cur.mentor ? MENTORES.find(x => x.id === cur.mentor) : null;
  $('#qo').insertAdjacentHTML('afterend', `<div class="listo pop">${first ? '🎉 +40 puntos<br>' : ''}${cur.why}<br><b>${cur.concl}</b></div>
   <div class="row" style="justify-content:center">${m ? `<button class="btn alt" onclick="mentor('${m.id}')">🌟 Conoce a ${m.n.split(' ')[0]}</button>` : ''}<button class="btn" onclick="tras('${cur.reg}')">Seguir</button></div>`);
}

/* ===== 5) MI ZONA: localidades REALES de Acatlán (INEGI, Censo 2020); una idea a la vez ===== */
const CAPAS = [
  { id: 'esc', ico: '🏫', n: 'Escuela', frase: v => `${r0(v)} de cada 100 chicos de 12 a 14 años no van a la escuela`, val: l => l.pob12a14 >= 30 ? l.pctNoAsiste12a14 : null, mun: D.municipio.pctNoAsiste12a14, malo: true, base: 'pob12a14', min: 30 },
  { id: 'int', ico: '📶', n: 'Internet', frase: v => `${r0(v)} de cada 100 casas tienen internet`, val: l => l.viviendas >= 30 ? l.pctInternet : null, mun: D.municipio.pctInternet, base: 'viviendas', min: 30 },
  { id: 'pc', ico: '💻', n: 'Compu', frase: v => `${r0(v)} de cada 100 casas tienen computadora`, val: l => l.viviendas >= 30 ? l.pctComputadora : null, mun: D.municipio.pctComputadora, base: 'viviendas', min: 30 },
  { id: 'sin', ico: '🚫', n: 'Sin nada', frase: v => `${r0(v)} de cada 100 casas no tienen ni compu ni internet`, val: l => l.viviendas >= 30 ? l.pctSinComputadoraNiInternet : null, mun: D.municipio.pctSinComputadoraNiInternet, malo: true, base: 'viviendas', min: 30 },
];
let M = { capa: 'esc', loc: null, d: 0 };
const color = (v, malo, lo, hi) => { if (v === null) return '#cfd6ea'; const t = hi === lo ? .5 : (v - lo) / (hi - lo); return malo ? `hsl(${32 - t * 32} 90% ${88 - t * 42}%)` : `hsl(${205 + t * 20} 80% ${90 - t * 48}%)`; };
function descubrimientos() {
  const bella = D.localidades.find(l => l.nombre === 'Bellavista'), cab = D.localidades[0];
  return [
    { t: 'El promedio engaña', h: `<div class="cmp"><div>${dotsHTML(D.municipio.pctNoAsiste12a14, 'var(--ing)', true)}Todo Acatlán<small>${pc(D.municipio.pctNoAsiste12a14)}</small></div><div>${dotsHTML(D.ajusteHogares.pctNoAsiste12a14, 'var(--ing)', true)}Solo casas<small>${pc(D.ajusteHogares.pctNoAsiste12a14)}</small></div></div><p class="center">Un lugar donde casi todos sí van a la escuela baja el promedio.</p>` },
    { t: 'Una localidad sobresale', h: `<div class="cmp"><div>${dotsHTML(bella.pctNoAsiste12a14, 'var(--ing)', true)}Bellavista<small>${pc(bella.pctNoAsiste12a14)}</small></div><div>${dotsHTML(cab.pctNoAsiste12a14, 'var(--ing)', true)}Cabecera<small>${pc(cab.pctNoAsiste12a14)}</small></div></div><p class="center">No van a la escuela, de cada 100 chicos de 12 a 14 años.</p>` },
    { t: 'Casi todos tienen celular', h: `<div class="cmp"><div>${dotsHTML(D.municipio.pctInternet, 'var(--tec)', true)}Con internet<small>${pc(D.municipio.pctInternet)}</small></div><div>${dotsHTML(D.municipio.pctCelular, 'var(--int)', true)}Con celular<small>${pc(D.municipio.pctCelular)}</small></div></div><p class="center">Por eso NEUROPLAY es para celular y abre sin internet.</p>` },
  ];
}
function mapView() {
  const C = CAPAS.find(c => c.id === M.capa);
  const locs = D.localidades.filter(l => l.lon !== null);
  const vals = locs.map(C.val).filter(v => v !== null), lo = Math.min(...vals), hi = Math.max(...vals);
  const lonMin = Math.min(...locs.map(l => l.lon)), lonMax = Math.max(...locs.map(l => l.lon)), latMin = Math.min(...locs.map(l => l.lat)), latMax = Math.max(...locs.map(l => l.lat));
  const k = Math.cos(((latMin + latMax) / 2) * Math.PI / 180), W = 600, H = 400, pad = 50;
  const sc = Math.min((W - 2 * pad) / ((lonMax - lonMin) * k), (H - 2 * pad) / (latMax - latMin));
  const X = l => pad + ((l.lon - lonMin) * k) * sc + ((W - 2 * pad) - (lonMax - lonMin) * k * sc) / 2, Y = l => pad + (latMax - l.lat) * sc + ((H - 2 * pad) - (latMax - latMin) * sc) / 2;
  const rad = l => Math.max(6, Math.min(34, Math.sqrt(l.pob || 1) * .55));
  const sel = M.loc === null ? null : locs.find(l => l.clave === M.loc);
  const circulos = [...locs].sort((a, b) => (b.pob || 0) - (a.pob || 0)).map(l => { const v = C.val(l); const etiqueta = (l.pob >= 5000 || sel === l);
    return `<g><circle tabindex="0" role="button" class="${sel === l ? 'sel' : ''}" cx="${X(l).toFixed(1)}" cy="${Y(l).toFixed(1)}" r="${rad(l).toFixed(1)}" fill="${color(v, C.malo, lo, hi)}" onclick="M.loc='${l.clave}';mapView()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();M.loc='${l.clave}';mapView()}" aria-label="${l.nombre}: ${v === null ? 'muy pocos datos' : C.frase(v)}"><title>${l.nombre}</title></circle>${etiqueta ? `<text x="${X(l).toFixed(1)}" y="${(Y(l) - rad(l) - 5).toFixed(1)}" text-anchor="middle">${l.nombre.replace(/ \(.*|\s\[.*/, '')}</text>` : ''}</g>`; }).join('');
  const v = sel ? C.val(sel) : C.mun, nombre = sel ? sel.nombre.replace(/ \(.*/, '') : 'Todo Acatlán';
  const detalle = (sel && v === null) ? `<p><b>${nombre}</b></p><p class="small">Son muy pocas personas: no mostramos el dato para cuidar su privacidad.</p>` : `<p><b>${nombre}</b></p>${dotsHTML(v, C.malo ? 'var(--ing)' : 'var(--tec)')}<p class="center"><b>${C.frase(v)}</b></p>`;
  const ds = descubrimientos(), dd = ds[M.d];
  $('#mapa').innerHTML = `<h1>📍 Mi zona</h1><p class="small">Acatlán de Juárez · datos reales (INEGI y CONEVAL)</p>
   <div class="capas" role="group" aria-label="Capa del mapa">${CAPAS.map(c => `<button aria-pressed="${c.id === M.capa}" onclick="M.capa='${c.id}';M.loc=null;S.layers.includes('${c.id}')||S.layers.push('${c.id}');save();mapView();gain(0)"><b aria-hidden="true">${c.ico}</b>${c.n}</button>`).join('')}</div>
   <svg class="map" viewBox="0 0 ${W} ${H}" role="group" aria-label="Mapa de localidades de Acatlán con la capa ${C.n}">${circulos}</svg>
   <div class="legend">Menos <i class="${C.malo ? 'malo' : ''}"></i> Más · gris: pocos datos</div>
   <div class="detalle">${detalle}</div>
   <h2>🔎 Descubrimientos</h2>
   <div class="detalle"><h3 class="center">${dd.t}</h3>${dd.h}<div class="paso" aria-hidden="true">${ds.map((_, i) => `<i class="${i === M.d ? 'on' : ''}"></i>`).join('')}</div>
    <div class="row" style="justify-content:center"><button class="btn gh" onclick="M.d=(M.d+2)%3;mapView()" aria-label="Anterior">‹</button><button class="btn gh" onclick="M.d=(M.d+1)%3;mapView()" aria-label="Siguiente">›</button></div></div>
   <div class="row" style="justify-content:center"><button class="btn alt" onclick="AD.tab='zona';datosView();go('datos')">👩‍🏫 Ver datos completos</button></div>`;
}

/* ===== 6) MENTORES: biografías verificables; nunca se inventan citas ===== */
const MENTORES = [
  { id: 'camarena', n: 'Guillermo González Camarena', ico: '📺', c: 'var(--ing)', lugar: 'Guadalajara, Jalisco', corta: 'Inventor jalisciense del color en la tele', historia: ['Nació en Guadalajara en 1917.', 'Construyó sus propios aparatos de electrónica.', 'Patentó un sistema de TV a color (México 1940, EE. UU. 1942).'], obst: 'No tenía muchos recursos: construía sus aparatos él mismo.', apor: 'El color en la televisión mexicana.', reto: 'luz', retoN: 'Mezcla de luz',
    fuentes: 'Por verificar y citar por el equipo antes de entregar: Instituto Mexicano de la Propiedad Industrial (patentes) y biografías de instituciones mexicanas.' },
  { id: 'johnson', n: 'Katherine Johnson', ico: '🚀', c: 'var(--mate)', lugar: 'Virginia Occidental, EE. UU.', corta: 'Matemática de la NASA', historia: ['Terminó la universidad a los 18 años.', 'Calculó la ruta del primer vuelo de un astronauta de EE. UU. al espacio (Alan Shepard, 1961).', 'Revisó los cálculos del vuelo de John Glenn (1962), el primero en dar la vuelta a la Tierra.'], obst: 'La excluían por el color de su piel y había barreras por ser mujer. Aun así llegó muy lejos.', apor: 'Vuelos espaciales más seguros.', reto: 'prop', retoN: 'Limonada',
    fuentes: 'NASA, biografía oficial de Katherine Johnson (nasa.gov). El equipo debe agregar el enlace exacto y la fecha de consulta.' },
  { id: 'jemison', n: 'Mae Jemison', ico: '🛰️', c: 'var(--ciencia)', lugar: 'Alabama, EE. UU.', corta: 'Ingeniera, médica y astronauta', historia: ['Estudió ingeniería química y medicina.', 'Trabajó como médica en África occidental.', 'En 1992 viajó al espacio en el Endeavour: fue la primera mujer afroamericana astronauta.'], obst: 'Casi no había mujeres como ella en la ciencia.', apor: 'Unió ingeniería, medicina y exploración.', reto: 'palanca', retoN: 'Balancín',
    fuentes: 'NASA, biografía de astronautas (nasa.gov). El equipo debe agregar el enlace exacto y la fecha de consulta.' },
  { id: 'curie', n: 'Marie Curie', ico: '⚛️', c: 'var(--tec)', lugar: 'Varsovia y París', corta: 'Dos premios Nobel', historia: ['Nació en Polonia, donde las mujeres no podían estudiar en la universidad. Se mudó a París para estudiar.', 'Descubrió el polonio y el radio.', 'Ganó el Nobel de Física (1903) y el de Química (1911).'], obst: 'Por ser mujer, le cerraron las puertas de la universidad en su país.', apor: 'Las bases para estudiar la radiactividad.', reto: 'estados', retoN: 'Hielo y vapor',
    fuentes: 'NobelPrize.org, biografía de Marie Curie. El equipo debe agregar el enlace exacto y la fecha de consulta.' },
];
const mentoresView = () => $('#mentores').innerHTML = `<h1>🌟 Mentores</h1><p class="small">Personas que abrieron camino</p>
  <div class="mgrid">${MENTORES.map(m => `<button class="persona" style="--c:${m.c}" onclick="mentor('${m.id}')"><span class="foto" aria-hidden="true">${m.ico}</span><b>${m.n}</b><small>${m.corta}</small>${S.mentors.includes(m.id) ? '<small>✔ Conocida/o</small>' : ''}</button>`).join('')}</div>`;
function mentor(id) {
  const m = MENTORES.find(x => x.id === id); if (!S.mentors.includes(id)) { S.mentors.push(id); gain(15); }
  modal(`<div class="escena" aria-hidden="true">${m.ico}</div><h2 class="center">${m.n}</h2><p class="center small">${m.corta} · ${m.lugar}</p>
   <ol class="hist">${m.historia.map((h, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span>${h}</li>`).join('')}</ol>
   <div class="duo"><div><b aria-hidden="true">🧗</b>Obstáculo<br>${m.obst}</div><div><b aria-hidden="true">💡</b>Aportó<br>${m.apor}</div></div>
   <div class="row" style="justify-content:center"><button class="btn" onclick="startAct('${m.reto}')">🧪 Reto: ${m.retoN}</button></div>
   <details><summary>Fuentes</summary><p class="small">${m.fuentes}</p></details>`);
}

/* ===== 7) MI ESPACIO y evaluación: privado, voluntario, sin nombre ni domicilio ===== */
let E = { i: -1, ans: {}, int: [] };
function espacioView() { if (typeof Voc !== 'undefined') return Voc.view(); return encuestaView(); }
function encuestaView() {
  let h = `${volver()}<h1>💬 Cuéntame</h1>`;
  if (E.i === -1) h += `${say('Cuéntame cómo aprendes. No es examen.')}<div class="chips"><span class="chip on">🔒 Anónimo</span><span class="chip on">✋ Opcional</span><span class="chip on">🚫 Sin nombre</span></div>
    <div class="row"><button class="big" onclick="E.i=0;espacioView()">Empezar</button></div>
    <details><summary>Privacidad</summary><div class="priv"><ul><li>No pedimos nombre completo ni domicilio y puedes omitir cualquier pregunta.</li><li>Tus respuestas se usan solo para ver patrones de grupos, de forma anónima.</li><li>En este prototipo se guardan en tu navegador (no es almacenamiento seguro) y no se envían a ningún servidor.</li><li>Si se usa en una escuela, se necesita permiso de la escuela y de madres, padres o tutores.</li></ul></div></details>`;
  else if (E.i < QS.length) { const q = QS[E.i], a = E.ans[q.id] || [];
    h += `<div class="paso" aria-label="Pregunta ${E.i + 1} de ${QS.length}">${QS.map((_, i) => `<i class="${i === E.i ? 'on' : ''}"></i>`).join('')}</div><p class="frase">${q.q}</p><div class="chips" style="justify-content:center">${q.o.map(o => `<button class="chip" aria-pressed="${a.includes(o)}" onclick="pick('${q.id}',this.textContent.replace('✓ ',''))">${o}</button>`).join('')}</div>
     <div class="row" style="justify-content:center"><button class="btn gh" onclick="E.i++;espacioView()">Omitir</button><button class="btn" onclick="E.i++;espacioView()">Siguiente</button></div>`; }
  else h += `<p class="frase">¿Qué te gustaría explorar?</p><div class="chips" style="justify-content:center">${INTERESTS.map(o => `<button class="chip" aria-pressed="${E.int.includes(o)}" onclick="toggleInt('${o}')">${o}</button>`).join('')}</div>
    <label class="opt"><input type="checkbox" id="ok"> Acepto enviar mis respuestas de forma anónima.</label>
    <div class="row" style="justify-content:center"><button class="btn gh" onclick="E={i:-1,ans:{},int:[]};espacioView()">Salir</button><button class="btn" onclick="sendResp()">Enviar</button></div>`;
  $('#espacio').innerHTML = h;
}
function pick(id, o) { const a = E.ans[id] = E.ans[id] || []; a.includes(o) ? a.splice(a.indexOf(o), 1) : a.push(o); espacioView(); }
function toggleInt(o) { E.int.includes(o) ? E.int.splice(E.int.indexOf(o), 1) : E.int.push(o); espacioView(); }
function sendResp() {
  if (!$('#ok').checked) { toast('Marca la casilla para enviar'); return; }
  S.resp.push({ ans: E.ans, int: E.int, fecha: new Date().toISOString().slice(0, 7) }); S.interests = E.int;
  E = { i: -1, ans: {}, int: [] }; save(); gain(30, 'Mi experiencia');
  modal(`<div class="escena pop" aria-hidden="true">🎉</div><p class="frase">¡Gracias! Tu voz ayuda al grupo.</p><div class="row" style="justify-content:center"><button class="btn" onclick="closeModal();go('inicio')">Seguir</button></div>`);
}
function evaluar(fase, desdeMision) {
  const cuerpo = PREGUNTAS_EVAL.map((p, i) => `<fieldset class="qz"><legend><small>${p.a}</small><br><b>${p.q}</b></legend>${p.o.map((o, k) => `<label class="opt"><input type="radio" name="e${i}" value="${k}"> ${o}</label>`).join('')}</fieldset>`).join('');
  modal(`<h2 class="center">${fase === 'pre' ? '🎯 Tu punto de partida' : '🏁 Tu avance'}</h2>${say(fase === 'pre' ? 'Son 6 preguntas. No cuentan como calificación.' : 'Las mismas 6 preguntas.')}<form onsubmit="return endEval(event,'${fase}')">${cuerpo}<div class="row" style="justify-content:center"><button class="btn" type="submit">Ver resultado</button>${desdeMision ? '<button class="btn gh" type="button" onclick="S.skipPre=true;save();closeModal();mision()">Ahora no</button>' : ''}</div></form>`);
}
function endEval(ev, fase) {
  ev.preventDefault();
  const resp = PREGUNTAS_EVAL.map((p, i) => { const r = document.querySelector(`input[name=e${i}]:checked`); return r ? +r.value === p.ok : null; });
  S[fase] = { ok: resp.filter(x => x === true).length, total: PREGUNTAS_EVAL.length, det: resp, fecha: new Date().toISOString().slice(0, 10) };
  if (fase === 'post') gain(30, 'Mi avance'); else gain(10);
  save(); const t = S[fase];
  modal(`<div class="escena pop" aria-hidden="true">${fase === 'pre' ? '🎯' : t.ok >= (S.pre ? S.pre.ok : 0) ? '🚀' : '💪'}</div><p class="frase">${t.ok} de ${t.total}</p><p class="center">${fase === 'pre' ? 'Es tu punto de partida. ¡A explorar!' : S.pre ? (t.ok > S.pre.ok ? `Antes: ${S.pre.ok}. ¡Avanzaste!` : t.ok === S.pre.ok ? `Antes: ${S.pre.ok}. Sigues firme.` : `Antes: ${S.pre.ok}. Repasar ayuda.`) : ''}</p><div class="row" style="justify-content:center"><button class="btn" onclick="closeModal();${fase === 'pre' ? 'mision()' : "go('progreso')"}">Seguir</button></div>`);
  return false;
}

/* ===== 8) YO: avance personal, sin rankings ===== */
function progresoView() {
  const pre = S.pre, post = S.post;
  const antes = pre && post ? `<div class="cmp"><div><b style="font-size:1.8rem">${pre.ok}/${pre.total}</b><small>Antes</small></div><div><b style="font-size:1.8rem">${post.ok}/${post.total}</b><small>Después</small></div></div>` : '';
  $('#progreso').innerHTML = `<h1>⭐ Yo</h1>
   <label class="small" for="nm">Tu apodo (opcional)</label><div class="row"><input id="nm" type="text" value="${S.nick}" maxlength="15" placeholder="Un apodo, no tu nombre" aria-label="Apodo opcional" style="flex:1"><button class="btn" onclick="S.nick=$('#nm').value.trim();save();render();toast('Guardado')">Guardar</button></div>
   <div class="stats"><div><b>${S.xp}</b>puntos</div><div><b>${S.acts.length}/${ACTS.length}</b>retos</div><div><b>${S.mentors.length}/${MENTORES.length}</b>mentores</div></div>
   <div class="prog" role="img" aria-label="Progreso al nivel ${level() + 1}"><i style="width:${S.xp % 100}%"></i></div>
   ${Historia.cuaderno()}
   <h2>🏅 Medallas</h2><div class="medallas">${BADGES.map(b => `<span class="medalla ${S.badges.includes(b.id) ? '' : 'off'}" role="img" aria-label="${b.n}${S.badges.includes(b.id) ? '' : ' (por ganar)'}" title="${b.n}">${b.ico}</span>`).join('')}</div>
   <h2>🎯 Antes y después</h2>${antes}<div class="row"><button class="btn gh" onclick="evaluar('pre')">${pre ? 'Rehacer punto de partida' : 'Punto de partida'}</button><button class="btn" onclick="evaluar('post')" ${S.acts.length >= 3 ? '' : 'disabled title="Haz 3 retos primero"'}>Medir avance</button></div>
   ${S.interests.length ? `<h2>🔭 Me interesa</h2><div class="chips">${S.interests.map(i => `<span class="chip on">${i}</span>`).join('')}</div><details><summary>Áreas para explorar</summary><ul>${S.interests.map(i => `<li><b>${i}:</b> ${CAMINOS[i]}</li>`).join('')}</ul><p class="small">Son ejemplos, no una recomendación personal.</p></details>` : ''}
   <div class="row"><button class="btn gh" onclick="if(confirm('¿Borrar todo lo guardado en este navegador?')){localStorage.removeItem(KEY);location.reload()}">🗑️ Borrar mis datos</button></div>`;
}

/* ===== 9) ADULTOS (docentes, orientadores y jurado): fuentes, método, datos completos y análisis de grupo ===== */
let AD = { tab: 'fuentes' }, A = { cat: 'Todas', mode: 'demo' };
const DS = [
  { st: 'integrada', cat: '#32', n: 'Rezago educativo y condición de pobreza (municipal 2010, 2015 y 2020)', inst: 'CONEVAL (hoy INEGI)', per: '2010, 2015 y 2020', cob: 'Municipal: 125 municipios de Jalisco', url: D.fuenteConeval.url, tomamos: 'Porcentaje de población en rezago educativo y en pobreza de Acatlán de Juárez y de Jalisco, y la posición entre los 125 municipios.', para: 'Describir el problema (contexto) y comprobar la tendencia 2010-2020.' },
  { st: 'integrada', cat: '#04 (mismo Censo)', n: 'Censo de Población y Vivienda 2020: principales resultados por localidad', inst: 'INEGI', per: '2020 (marzo)', cob: 'Localidad, municipio y estado', url: D.fuente.url, tomamos: 'Personas de 12 a 14 años que no asisten a la escuela, viviendas con internet, con computadora y con celular, por localidad de Acatlán; posición geográfica de cada localidad.', para: 'Describir el problema y diseñar la solución (mapa; plataforma para celular que abre sin internet).' },
  { st: 'integrada', cat: '#30', n: 'Resultados de aprendizaje PISA 2022 (México)', inst: 'OCDE', per: '2022', cob: 'Nacional (estudiantes de 15 años)', url: PISA.fuente.url, tomamos: 'Puntaje de México en matemáticas (395) y promedio de la OCDE (472). Captura manual desde la nota de país: pendiente de verificar en oecd.org.', para: 'Contexto nacional del reto de matemáticas en la historia (no es un dato de Acatlán).' },
  { st: 'pendiente', cat: '#28', n: 'Estadísticas educativas por municipio (deserción, reprobación, eficiencia terminal)', inst: 'SEJ / SEP', per: 'Por definir', cob: 'Municipal', url: 'https://www.planeacion.sep.gob.mx', tomamos: '—', para: 'Pasar de «no asisten» a deserción escolar real por escuela.' },
  { st: 'pendiente', cat: '#29', n: 'Indicadores educativos por municipio', inst: 'IIEG Jalisco', per: 'Por definir', cob: 'Municipal', url: 'https://iieg.gob.mx', tomamos: '—', para: 'Complementar escolaridad y analfabetismo.' },
  { st: 'pendiente', cat: '#31', n: 'Conectividad escolar (Formato 911)', inst: 'SEP', per: 'Por definir', cob: 'Estatal', url: 'https://www.planeacion.sep.gob.mx', tomamos: '—', para: 'Saber si las escuelas tienen internet.' },
  { st: 'pendiente', cat: '#33', n: 'ENDUTIH', inst: 'INEGI', per: 'Por definir', cob: 'Estatal', url: 'https://www.inegi.org.mx/programas/endutih/', tomamos: '—', para: 'Uso de internet y dispositivos por personas.' },
  { st: 'integrada', cat: '#34', n: 'Matrícula en educación superior (parcial: por área, Jalisco)', inst: 'SICYT Jalisco con formato 911 SEP (PREES 2024)', per: 'Ciclo 2021-2022', cob: 'Estatal (Jalisco)', url: 'https://plan.jalisco.gob.mx/wp-content/uploads/2024/09/PREES-V23_23_08_24.pdf', tomamos: 'Porcentaje de estudiantes de licenciatura y TSU por área (ingeniería/TIC/ciencias 19.6%, salud 16.5%, educación 5.4%, construcción 5.4%, agronomía y veterinaria 3.5%, resto 49.6%)', para: 'Mostrar en Cuéntame cuántos estudian cada área en Jalisco. Falta el detalle por carrera y municipio (ANUIES); el API de Data México estaba caído al intentarlo.' },
];
function fuentesHTML() {
  const fi = d => `<div class="card"><span class="tag ${d.st === 'integrada' ? 't-imp' : 't-fut'}">${d.st === 'integrada' ? '✔ Integrada' : '⏳ Pendiente'}</span> <span class="tag t-demo">Catálogo ${d.cat}</span><h3>${d.n}</h3><p><b>Institución:</b> ${d.inst}<br><b>Periodo:</b> ${d.per}<br><b>Cobertura:</b> ${d.cob}<br><b>Qué tomamos:</b> ${d.tomamos}<br><b>Para qué:</b> ${d.para}<br><a href="${d.url}" target="_blank" rel="noopener">Sitio oficial</a></p></div>`;
  const aj = D.ajusteHogares;
  return `<h2>✔ Fuentes integradas (datos reales)</h2><div class="grid">${DS.filter(d => d.st === 'integrada').map(fi).join('')}</div>
  <div class="card"><h3>🔁 Cómo reproducir los datos</h3><p>El archivo <code>datos/acatlan.js</code> se genera con <code>python herramientas/generar_datos.py</code>, que descarga los archivos oficiales y calcula los porcentajes. No se escribió ningún número a mano. Generado: ${D.fuente.generado}.</p></div>
  <div class="card"><h3>🧮 Cálculo propio: Acatlán «en hogares»</h3><p>El Censo cuenta a Villa de los Niños (institución de residencia, 1,549 habitantes) dentro de Acatlán y reserva sus datos con «*». Sumamos solo las ${aj.localidades} localidades con dato publicado: <b>${fmt(aj.noAsiste12a14)} de ${fmt(aj.pob12a14)}</b> personas de 12 a 14 años no asisten = <b>${pc(aj.pctNoAsiste12a14)}</b> (mujeres ${pc(aj.pctNoAsisteMujeres)}, hombres ${pc(aj.pctNoAsisteHombres)}). Es una estimación nuestra con datos oficiales, no una cifra publicada por el INEGI.</p></div>
  <h2>⏳ Fuentes del catálogo pendientes</h2><div class="grid">${DS.filter(d => d.st === 'pendiente').map(fi).join('')}</div>
  <h2>🧠 Tres áreas de conocimiento</h2><div class="grid"><div class="card"><h3>Educación y pedagogía</h3><p>Aprendizaje por indagación (pregunta, experimento, explicación), evaluación inicial y final sin calificar, y mentores como modelo.</p></div><div class="card"><h3>Ciencia de datos y estadística</h3><p>Datos oficiales, porcentajes, comparación entre localidades, lectura crítica y anonimato mínimo (n ≥ 5).</p></div><div class="card"><h3>Ciencias sociales y diseño inclusivo</h3><p>Brecha digital, equidad de género, pertinencia cultural y accesibilidad.</p></div></div>
  <h2>🧭 Límites</h2><ul><li>Los datos del Censo son de marzo de 2020: describen contexto y no explican por qué una persona deja la escuela.</li><li>Ver una relación entre datos no significa que una cosa cause la otra.</li><li>No afirmamos reducir la deserción: eso requiere estudios con seguimiento en el tiempo.</li><li>Las respuestas de «Cuéntame» se guardan solo en el navegador; el servidor seguro es trabajo futuro.</li><li>Las gráficas de «Análisis de grupo» marcadas como de prueba son inventadas.</li><li>Los mentores se basan en biografías públicas; falta añadir los enlaces exactos y profesionales mexicanos contemporáneos.</li></ul>
  <h2>🤖 Transparencia sobre inteligencia artificial</h2><div class="card"><p>Parte del código y de los textos de este prototipo se elaboró con ayuda de herramientas de inteligencia artificial, y el equipo los revisó y adaptó. Los datos oficiales no los generó una IA: se descargaron de INEGI y CONEVAL con un programa reproducible. La plataforma <b>no usa IA</b> al funcionar: no hay chat ni respuestas generadas.</p></div>`;
}
function zonaHTML() {
  const rz = D.coneval.municipio, re = D.coneval.estado;
  const M2 = { rez: ['Rezago educativo 2020 (CONEVAL)', D.coneval.municipios.map(m => [m.mun, m.rezagoEducativo2020]), rz.rezagoEducativo['2020'], re.rezagoEducativo['2020']], pob: ['Pobreza 2020 (CONEVAL)', D.coneval.municipios.map(m => [m.mun, m.pobreza2020]), rz.pobreza['2020'], re.pobreza['2020']], esc: ['12 a 14 años fuera de la escuela (Censo)', D.municipios.map(m => [m.mun, m.pctNoAsiste12a14]), D.municipio.pctNoAsiste12a14, D.estado.pctNoAsiste12a14], int: ['Viviendas con internet (Censo)', D.municipios.map(m => [m.mun, m.pctInternet]), D.municipio.pctInternet, D.estado.pctInternet] }[AD.met || 'rez'];
  const pts = M2[1].filter(p => p[1] !== null), mx = Math.max(...pts.map(p => p[1]));
  const strip = pts.map((p, i) => `<circle cx="${(30 + p[1] / mx * 540).toFixed(1)}" cy="${(30 + (i * 37 % 7) * 9).toFixed(1)}" r="${p[0] === '002' ? 7 : 3.4}" fill="${p[0] === '002' ? '#ff8a2b' : '#7b4dff'}" opacity="${p[0] === '002' ? 1 : .55}"/>`).join('');
  const prioridad = D.localidades.filter(l => l.pob12a14 >= 30).sort((a, b) => b.pctNoAsiste12a14 - a.pctNoAsiste12a14).map(l => `<tr><th scope="row">${l.nombre.replace(/ \(.*/, '')}</th><td>${fmt(l.pob12a14)}</td><td>${fmt(l.noAsiste12a14)}</td><td><b>${pc(l.pctNoAsiste12a14)}</b></td><td>${pc(l.pctSinComputadoraNiInternet)}</td></tr>`).join('');
  const tend = ['2010', '2015', '2020'].map(y => `<tr><th scope="row">${y}</th><td>${pc(rz.rezagoEducativo[y])}</td><td>${pc(re.rezagoEducativo[y])}</td><td>${pc(rz.pobreza[y])}</td><td>${pc(re.pobreza[y])}</td></tr>`).join('');
  return `<div class="note ok"><span class="tag t-imp">✔ Datos reales</span> INEGI, Censo 2020 (localidad) · CONEVAL, pobreza municipal 2010–2020.</div>
  <h2>🎯 Dónde conviene enfocar apoyo</h2><div class="card"><div class="tabwrap" tabindex="0" role="region" aria-label="Tabla desplazable"><table class="tab"><caption>Localidades con al menos 30 personas de 12 a 14 años (de más a menos fuera de la escuela)</caption><thead><tr><th scope="col">Localidad</th><th scope="col">12 a 14 años</th><th scope="col">No asisten</th><th scope="col">% no asisten</th><th scope="col">Casas sin compu ni internet</th></tr></thead><tbody>${prioridad}</tbody></table></div>
   <p class="small">Sirve para decidir <b>dónde</b> ofrecer apoyo (por ejemplo, tutorías o actividades sin internet), nunca para señalar a una persona. No son causas.</p></div>
  <h2>📊 Acatlán entre los 125 municipios</h2><p class="chips" role="group" aria-label="Indicador">${[['rez', 'Rezago educativo'], ['pob', 'Pobreza'], ['esc', '12–14 fuera de la escuela'], ['int', 'Internet']].map(([id, t]) => `<button class="chip ${(AD.met || 'rez') === id ? 'on' : ''}" onclick="AD.met='${id}';datosView()">${t}</button>`).join('')}</p>
  <div class="card"><h3>${M2[0]}</h3><svg viewBox="0 0 600 110" class="strip" role="img" aria-label="Cada punto es un municipio; el naranja es Acatlán, con ${pc(M2[2])}; Jalisco: ${pc(M2[3])}"><line x1="30" x2="570" y1="98" y2="98" stroke="#b9c5ff" stroke-width="2"/>${strip}<line x1="${30 + M2[3] / mx * 540}" x2="${30 + M2[3] / mx * 540}" y1="14" y2="98" stroke="#14183c" stroke-dasharray="4 4"/><text x="${30 + M2[3] / mx * 540}" y="10" text-anchor="middle" font-size="11" fill="#14183c">Jalisco ${pc(M2[3])}</text></svg>
   <p><span class="dot o"></span> Acatlán: <b>${pc(M2[2])}</b> · <span class="dot p"></span> los otros 124 municipios</p></div>
  <h2>⏳ Cómo ha cambiado (CONEVAL)</h2><div class="card"><div class="tabwrap" tabindex="0" role="region" aria-label="Tabla desplazable"><table class="tab"><caption>Acatlán de Juárez comparado con Jalisco</caption><thead><tr><th scope="col">Año</th><th scope="col">Rezago educativo · Acatlán</th><th scope="col">Rezago educativo · Jalisco</th><th scope="col">Pobreza · Acatlán</th><th scope="col">Pobreza · Jalisco</th></tr></thead><tbody>${tend}</tbody></table></div>
   <p class="small">El rezago educativo baja de ${pc(rz.rezagoEducativo['2010'])} a ${pc(rz.rezagoEducativo['2020'])}. Es una tendencia de grupos: una relación entre datos no es una causa.</p></div>`;
}
function counts(q) { return A.mode === 'demo' ? q.demo : q.o.map(o => S.resp.filter(r => (r.ans[q.id] || []).includes(o)).length); }
function grupoHTML() {
  const cats = ['Todas', ...new Set(QS.map(q => q.cat))], n = A.mode === 'demo' ? 120 : S.resp.length, lowN = A.mode === 'local' && n < 5;
  const bars = QS.filter(q => A.cat === 'Todas' || q.cat === A.cat).map(q => { const c = counts(q), mx = Math.max(...c, 1); return `<div class="card"><h3>${q.q}</h3><small>${q.cat}</small>${q.o.map((o, i) => `<div class="hbar"><span>${o}</span><div class="bar"><i style="width:${c[i] / mx * 100}%"></i></div><b>${c[i]}</b></div>`).join('')}</div>`; }).join('');
  const ic = A.mode === 'demo' ? INT_DEMO : INTERESTS.map(o => S.resp.filter(r => r.int.includes(o)).length), tot = ic.reduce((a, b) => a + b, 0) || 1;
  let acc = 0; const grad = ic.map((v, i) => { const s = acc / tot * 100; acc += v; return `${COLORS[i]} ${s}% ${acc / tot * 100}%`; }).join(',');
  return `<p>Solo patrones de grupos, nunca personas. Los datos oficiales describen el <b>contexto</b>; los de NEUROPLAY, <b>experiencias</b>. Se complementan, no se validan entre sí.</p>
   <p class="chips"><button class="chip ${A.mode === 'demo' ? 'on' : ''}" onclick="A.mode='demo';datosView()">🧪 Datos de prueba (inventados)</button><button class="chip ${A.mode === 'local' ? 'on' : ''}" onclick="A.mode='local';datosView()">💻 Respuestas de este navegador</button></p>
   <div class="note">${A.mode === 'demo' ? '🧪 <b>DATOS DE PRUEBA</b> · muestra inventada n = 120 · solo sirven para ver cómo se vería con un grupo real' : `Muestra: n = ${n} · periodo: ${S.resp.length ? S.resp[0].fecha + ' a ' + S.resp[S.resp.length - 1].fecha : '—'}`}</div>
   <p class="chips">${cats.map(c => `<button class="chip ${A.cat === c ? 'on' : ''}" onclick="A.cat='${c}';datosView()">${c}</button>`).join('')}</p>
   ${lowN ? '<div class="card"><h3>Aún no hay suficientes respuestas</h3><p>Se necesitan al menos 5 para mostrar patrones y proteger el anonimato.</p></div>' : `<div class="grid">${bars}<div class="card"><h3>Temas que quieren explorar</h3><div class="pie" style="background:conic-gradient(${grad})" role="img" aria-label="Gráfica circular de intereses"></div><div class="lg">${INTERESTS.map((o, i) => `<span><i style="background:${COLORS[i]}"></i>${o}: ${ic[i]}</span>`).join('')}</div></div></div>`}
   ${A.mode === 'local' && !lowN ? '<p><button class="btn gh" onclick="bajarResumen()">⬇️ Descargar resumen del grupo (CSV, sin datos personales)</button></p>' : ''}`;
}
function bajarResumen() {
  const f = [['pregunta', 'opcion', 'personas', 'n_total']]; QS.forEach(q => counts(q).forEach((c, i) => f.push([q.q, q.o[i], c, S.resp.length])));
  const blob = new Blob(['﻿' + f.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\r\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resumen-agregado-neuroplay.csv'; a.click(); URL.revokeObjectURL(a.href);
}
function datosView() {
  const tabs = [['fuentes', 'Fuentes y método'], ['zona', 'Datos de la zona'], ['grupo', 'Análisis de grupo']];
  $('#datos').innerHTML = `<div class="adultos"><h1>👩‍🏫 Para docentes y jurado</h1><p class="small">Esta zona es para adultos: aquí están las fuentes, los datos completos y los límites.</p>
   <div class="tabs" role="tablist">${tabs.map(([id, t]) => `<button class="chip ${AD.tab === id ? 'on' : ''}" role="tab" aria-selected="${AD.tab === id}" onclick="AD.tab='${id}';datosView()">${t}</button>`).join('')}</div>
   ${AD.tab === 'fuentes' ? fuentesHTML() : AD.tab === 'zona' ? zonaHTML() : grupoHTML()}</div>`;
}

/* ===== Emojis → pixel art: cada emoji del texto se cambia por su dibujo pixelado (así todo el juego se ve de un solo estilo) ===== */
const EMO = { '🧠': 'cara', '🔬': 'mundoCiencia', '💻': 'mundoTec', '⚙️': 'engrane', '⚙': 'engrane', '📐': 'mundoMate', '🧩': 'mundoRetos', '🚌': 'autobus', '🧍': 'pasajero', '🧊': 'hielo', '💧': 'gotas', '☁️': 'vapor', '🌈': 'arcoiris', '🍋': 'limon', '🤖': 'robot', '⭐': 'estrella', '🪨': 'roca', '⚖️': 'balanza', '🕵️': 'lupa', '🎯': 'estrellaMeta', '🔎': 'lupa', '🔭': 'lupa', '📍': 'pin', '🌟': 'estrella', '🚀': 'cohete', '🏅': 'medalla', '🏆': 'copa', '🗺️': 'pin', '💬': 'burbuja', '🏫': 'libro', '📶': 'globo', '🚫': 'cruz', '📺': 'tele', '🛰️': 'satelite', '⚛️': 'atomo', '🧪': 'gotas', '🔒': 'candado', '✋': 'mano', '🎉': 'estrella', '🏁': 'estrellaMeta', '💪': 'mano', '👩‍🏫': 'libro', '🧗': 'mano', '💡': 'estrella', '🗑️': 'cruz', '⬇️': 'flechaAbajo', '⬆️': 'flechaArriba', '➡️': 'flechaDer', '⬅️': 'flechaIzq', '▶': 'play', '↺': 'reiniciar', '✔': 'marca', '✖': 'cruz', '✕': 'cruz', '🔁': 'reiniciar', '🧮': 'engrane', '🧭': 'pin', '✅': 'marca', '⏳': 'reiniciar', '🌍': 'globo' };
const esc = k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_EMO = new RegExp('(' + Object.keys(EMO).sort((a, b) => b.length - a.length).map(esc).join('|') + ')\uFE0F?', 'gu');
const RE_TEST = new RegExp(RE_EMO.source, 'u');
function pixelizar(raiz) {
  if (!raiz || raiz.nodeType === 8 || !raiz.isConnected) return;
  const nodos = [], w = document.createTreeWalker(raiz.nodeType === 3 ? raiz.parentNode : raiz, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (!/^(SCRIPT|STYLE|TEXTAREA|TITLE)$/.test(n.parentNode.nodeName) && RE_TEST.test(n.nodeValue)) nodos.push(n);
  nodos.forEach(n => {
    const frag = document.createDocumentFragment(), t = n.nodeValue, fs = parseFloat(getComputedStyle(n.parentElement).fontSize) || 16; let ult = 0; RE_EMO.lastIndex = 0;
    for (let m; (m = RE_EMO.exec(t));) { if (m.index > ult) frag.append(t.slice(ult, m.index)); const nom = EMO[m[1]], d = Px.rows(Px.SPR[nom]), k = Math.max(2, Math.round(fs * 1.25 / 12)); const img = new Image(); img.className = 'px e'; img.alt = ''; img.setAttribute('aria-hidden', 'true'); img.draggable = false; img.width = d.w * k; img.height = d.h * k; img.src = Px.url(nom, k); frag.append(img); ult = m.index + m[0].length; }
    if (ult < t.length) frag.append(t.slice(ult)); n.replaceWith(frag);
  });
}
let pend = new Set(), progr = false;
new MutationObserver(ms => { ms.forEach(m => { m.addedNodes.forEach(n => pend.add(n)); if (m.type === 'characterData') pend.add(m.target); }); if (!progr) { progr = true; requestAnimationFrame(() => { progr = false; const l = [...pend]; pend = new Set(); l.forEach(pixelizar); }); } }).observe(document.body, { childList: true, subtree: true, characterData: true });

/* ===== 10) ARRANQUE + accesibilidad ===== */
$('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.view); });
$('#logo').onclick = () => go('inicio');
$('#aAyuda').onclick = () => toast(HELP[view] || 'Toca para explorar.');
$('#mx').onclick = closeModal;
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
let fs = +(localStorage.getItem('np_fs') || 18); const setFs = n => { fs = Math.max(15, Math.min(26, n)); document.body.style.fontSize = fs + 'px'; localStorage.setItem('np_fs', fs); };
$('#aMas').onclick = () => setFs(fs + 2); $('#aMenos').onclick = () => setFs(fs - 2); setFs(fs);
$('#aCon').onclick = () => { const on = document.body.classList.toggle('hc'); $('#aCon').setAttribute('aria-pressed', on); localStorage.setItem('np_hc', on ? '1' : ''); };
if (localStorage.getItem('np_hc')) { document.body.classList.add('hc'); $('#aCon').setAttribute('aria-pressed', 'true'); }
$('#aVoz').onclick = () => { if (!('speechSynthesis' in window)) { toast('Tu navegador no lee en voz alta'); return; } speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(($('#modal').hidden ? document.querySelector('.view.on') : $('#mbody')).innerText.slice(0, 1500)); u.lang = 'es-MX'; speechSynthesis.speak(u); };
// En localhost (desarrollo) NO se usa el service worker: así cada cambio se ve al recargar. En producción sí, para abrir sin internet.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())); if (window.caches) caches.keys().then(ks => ks.forEach(k => caches.delete(k))); }
  else navigator.serviceWorker.register('sw.js').catch(() => {});
}
Px.instalarMarcos();
// Aro de foco solo para quien navega con la tecla Tab (con toque o ratón no se muestra)
addEventListener('keydown', e => { if (e.key === 'Tab') document.body.classList.add('teclado'); }, true);
addEventListener('pointerdown', () => document.body.classList.remove('teclado'), true);
// El mundo se adapta a la pantalla: vertical en celular, ancho en PC o laptop. Si cambia la forma de la ventana, se rearma.
let rearmarT = null;
function rearmarMundo() { if (view !== 'inicio' || !window.Phaser || !Mundo.cambio()) return; Mundo.destruir(); Mundo.calcula(); $('#inicio').innerHTML = ''; render(); pixelizar($('#inicio')); Mundo.iniciar(document.getElementById('juego'), estadoMundo()); }
addEventListener('resize', () => { clearTimeout(rearmarT); rearmarT = setTimeout(rearmarMundo, 250); });
render(); go('inicio'); pixelizar(document.body);
if (window.Phaser) Mundo.iniciar(document.getElementById('juego'), estadoMundo()); else document.getElementById('mundo').classList.add('sin-juego');
// Entrada: animación + gametag; después arranca la historia si es la primera vez
try { Intro.mostrar(S, save, () => { actualizarMundo(); go('inicio'); const sigue = () => { if (typeof Mansion !== 'undefined') Mansion.entrar(); }; if (!S.cineVisto && typeof Cine !== 'undefined') { S.cineVisto = true; save(); Cine.ver(sigue); } else sigue(); }); } // la historia empieza dentro de la Mansión
catch (err) { const i = document.getElementById('intro'); if (i) i.hidden = true; }

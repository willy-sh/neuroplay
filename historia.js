/* NEUROPLAY · historia.js
   La historia del juego: «El caso de Don Promedio».
   Isla Neuron perdió su luz (la Chispa) y los estudiantes empiezan a desaparecer de las aulas. Cada isla guarda una
   pista hecha con DATOS REALES de Acatlán de Juárez y de los datasets del reto. Hay que aprender un poco de ciencia,
   mates, tecnología e ingeniería para abrir cada archivo y, al final, atrapar al culpable: un número que esconde diferencias.
   Reglas de honestidad: los datos son reales y citados; los mentores NO dicen frases inventadas: sus placas
   solo cuentan hechos verificables. Todo el texto es corto a propósito (chicos de 12 a 14 años). */
const Historia = (() => {
  const ORDEN = ['ciencia', 'mate', 'tec', 'ing', 'int'];
  const RETRATOS = {
    narrador: { spr: 'globo', nombre: 'Narrador' }, chispa: { spr: 'chispa', nombre: 'Chispa' }, promedio: { spr: 'promedio', nombre: 'Don Promedio' },
    curie: { spr: 'caraCurie', nombre: 'Marie Curie', placa: true }, johnson: { spr: 'caraJohnson', nombre: 'Katherine Johnson', placa: true },
    jemison: { spr: 'caraJemison', nombre: 'Mae Jemison', placa: true }, camarena: { spr: 'caraCamarena', nombre: 'Guillermo González Camarena', placa: true },
  };
  const reducir = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ch = (t, extra) => ({ q: 'chispa', t, ...extra });

  /* ---------- Guion ---------- */
  const PROLOGO = [
    { q: 'narrador', t: 'Isla Neuron flota sobre Jalisco. Cinco islas y una sola luz: la Chispa.' },
    ch('¡Auxilio! Anoche la Chispa se apagó. Y los chicos de las escuelas empezaron a desaparecer de los salones.'),
    { q: 'narrador', t: 'Sobre la mesa quedó una nota: «Todo está bien. El promedio lo dice. Atte.: Don Promedio».' },
    ch('Algo no cuadra. Necesito a alguien que sepa leer datos. ¿Eres tú?', { op: [{ t: '¡Acepto el caso!', ir: 5 }, { t: '¿Quién es Don Promedio?', ir: 4 }] }),
    ch('Un tipo que mete todo en un solo número. Lo que no cuadra… queda escondido.', { op: [{ t: '¡Acepto el caso!' }] }),
    ch('Cada isla guarda una pista con datos reales de Acatlán de Juárez. Recupera sus chispas y atrapa al culpable.'),
    ch('Toca una isla y salta. ¡Yo te sigo!'),
  ];
  const INTRO = {
    ciencia: [ch('La Isla del Laboratorio está a oscuras: la Niebla de la Duda se la tragó.'), ch('Vence a las Nieblas y rompe el escudo de la Duda con ciencia. ¡Marie te ayuda!')],
    mate: [ch('Isla de Mates: aquí los números dejaron de sumar.'), ch('Katherine te guía. Si algo no cuadra, ¡revisa dos veces!')],
    tec: [ch('Isla de Tecnología: se perdió la señal.'), ch('Guillermo anda por ahí con sus aparatos. ¡Hazle caso!')],
    ing: [ch('Isla de Ingeniería: los puentes se rompieron y nadie llega a nadie.'), ch('Mae te acompaña. Si cae un puente, se construye otro.')],
    int: [ch('La Torre de Don Promedio. Aquí se esconde quien apagó la Chispa.'), ch('Los cuatro mentores te ayudan. ¡Tú puedes!')],
  };
  const CIERRE = { // lo que pasa al salvar una isla: la luz vuelve y el mentor se despide (la nota va al cuaderno, sin interrumpir)
    ciencia: [{ fx: 'encender:ciencia' }, ch('¡La luz del Laboratorio volvió! Se siente distinto, ¿verdad?'),
      { q: 'curie', t: '¡Lo lograste! Te equivocaste, volviste a intentar y funcionó. Eso es ser científico.' }, { q: 'curie', t: 'Toma mi lupa: te ayudará a ver lo que otros no ven. Y la llave de la Biblioteca está en tu bolsillo.' }, { nota: 'ciencia' }],
    mate: [{ fx: 'encender:mate' }, ch('¡La Torre de los Números brilla otra vez!'),
      { q: 'johnson', t: '¡Sumaste, restaste y ganaste! Qué orgullo. Y recuerda: tus números valen igual, vengas de donde vengas.' }, { q: 'johnson', t: 'Te dejo mi lápiz. La tarjeta para los Servidores ya es tuya.' }, { nota: 'mate' }],
    tec: [{ fx: 'encender:tec' }, ch('¡Volvió la señal! Hasta el celular se prendió.'),
      { q: 'camarena', t: '¡Jaló! Qué bárbaro, lo lograste con lo que tenías. El talento no depende de qué tan nuevo sea tu celular.' }, { q: 'camarena', t: 'Llévate mi válvula de la suerte. Y la llave del Taller, claro.' }, { nota: 'tec' }],
    ing: [{ fx: 'encender:ing' }, ch('¡El Taller de Puentes se encendió!'),
      { q: 'jemison', t: '¡Despegue exitoso! Esto fue trabajo en equipo. Si alguien te dice que algo «no es para ti», acuérdate: es una opinión, no una regla.' }, { q: 'jemison', t: 'Quédate con mi casco. Ya casi llegas a la Torre.' }, { nota: 'ing' }, { fx: 'desbloquear' }, ch('¡Las cuatro chispas volvieron! La Torre de Don Promedio se abrió…')],
  };
  const FINAL = [
    ch('La Torre de Don Promedio… ¡allí está!'),
    { q: 'promedio', t: '¡Jo, jo! Me atrapaste. Pero mira: 6 de cada 100 chicos fuera de la escuela. ¡Casi nadie! Todo está parejo.' },
    ch('Eso dice el promedio. Hagámosle tres preguntas.'),
    ch('¿Qué cuenta ese 6,6 % de todo Acatlán?', { op: [{ t: 'Solo a las casas', ok: false, fb: 'Casi. Revisa: también cuenta una institución con 1,549 personas.' }, { t: 'También a Villa de los Niños, donde casi todos sí van a la escuela', ok: true }, { t: 'A nadie: es un invento', ok: false, fb: 'Es dato real del INEGI, pero hay que mirar quién entra.' }] }),
    { q: 'promedio', t: 'Ejem… ¿Y eso qué?' },
    ch('Sin esa institución, ¿cuántos de cada 100 chicos de 12 a 14 años no van a la escuela?', { op: [{ t: 'Unos 7', ok: false, fb: 'Ese es el número que te mostró él.' }, { t: 'Unos 12', ok: true }, { t: 'Unos 30', ok: false, fb: 'Es mucho. Son 152 de 1,273: casi 12.' }] }),
    { q: 'promedio', t: '¡No! Mi número… se está cayendo…' },
    ch('En Bellavista son 17 de cada 100. ¿Qué haces con ese dato?', { op: [{ t: 'Mando más apoyo allí: tutorías y retos sin internet', ok: true }, { t: 'Nada: el promedio dice que todo va bien', ok: false, fb: 'Justo eso quería Don Promedio.' }, { t: 'Culpo a los chicos de ahí', ok: false, fb: 'Un dato no es una culpa. Es una pista para ayudar.' }] }),
    { fx: 'final' },
    { q: 'promedio', t: 'Yo no era malo… solo promediaba. Todo parecía parejo porque nadie preguntaba quién faltaba.' },
    ch('Ahora tú sabes preguntar: ¿quién entra en el número? ¿Quién falta?'),
    { q: 'narrador', t: 'La Chispa volvió a las cinco islas. Los salones se llenaron de luz.' },
    { informe: true },
  ];

  const FINAL_JUEGO = [
    ch('¡Lo lograste! Don Promedio cayó.'),
    { q: 'promedio', t: 'Yo no era malo… solo promediaba. Todo parecía parejo porque nadie preguntaba quién faltaba.' },
    { fx: 'final' },
    ch('Ahora sabes preguntar: ¿quién entra en el número? ¿Quién falta?'),
    { q: 'narrador', t: 'La Chispa volvió a las cinco islas. Los salones se llenaron de luz.' },
    { informe: true },
  ];

  /* ---------- Pistas: datos reales de los datasets del reto ---------- */
  const barras = (filas, max, unidad = '%') => `<div class="barras">${filas.map(([t, v, c]) => `<div class="barra"><span>${t}</span><i style="--w:${Math.max(4, v / max * 100)}%;--c:${c || 'var(--primary)'}"></i><b>${String(v).replace('.', ',')}${unidad}</b></div>`).join('')}</div>`;
  const PISTAS = {
    ciencia: () => { const r = D.coneval.municipio.rezagoEducativo, e = D.coneval.estado.rezagoEducativo['2020'];
      return { n: 'Baúl del Rezago', ds: '#32 · CONEVAL', fuente: 'CONEVAL, Medición de la pobreza municipal 2010-2020 (catálogo del reto #32)', vis: barras([['2010', r['2010']], ['2015', r['2015']], ['2020', r['2020'], 'var(--int)'], ['Jalisco 2020', e, 'var(--ing)']], 25),
        t: 'En Acatlán el rezago educativo bajó: de 22,6 a 14,7 de cada 100 personas. ¡Buena noticia! Pero un número del municipio no dice qué pasa en cada rincón.' }; },
    mate: () => ({ n: 'Examen de la Torre', ds: '#30 · OCDE PISA', fuente: 'OCDE, PISA 2022, nota de país México (catálogo del reto #30). Dato nacional, capturado a mano: pendiente de verificar.', vis: barras([['México', PISA.mexico.matematicas, 'var(--ing)'], ['Promedio OCDE', PISA.ocde.matematicas, 'var(--tec)']], 500, ' pts'),
      t: 'En matemáticas, México saca 395 puntos y el promedio de la OCDE es 472. Es un dato de todo el país: no habla de Acatlán, pero dice que entrenar mates importa.' }),
    tec: () => ({ n: 'Mapa sin señal', ds: 'Censo 2020 · INEGI', fuente: 'INEGI, Censo de Población y Vivienda 2020, por localidad (mismo programa del catálogo #04)', vis: `<div class="cmp"><div>${dotsHTML(D.municipio.pctInternet, 'var(--tec)', true)}Internet<small>${pc(D.municipio.pctInternet)}</small></div><div>${dotsHTML(D.municipio.pctComputadora, 'var(--mate)', true)}Compu<small>${pc(D.municipio.pctComputadora)}</small></div><div>${dotsHTML(D.municipio.pctCelular, 'var(--int)', true)}Celular<small>${pc(D.municipio.pctCelular)}</small></div></div>`,
      t: 'De cada 100 casas, 53 tienen internet y 93 tienen celular. Por eso las lecciones deben correr en celular y sin conexión.' }),
    ing: () => { const b = D.localidades.find(l => l.nombre === 'Bellavista'), c = D.localidades[0];
      return { n: 'Plano de Puentes', ds: 'Censo 2020 · INEGI', fuente: 'INEGI, Censo de Población y Vivienda 2020, por localidad de Acatlán de Juárez', vis: `<div class="cmp"><div>${dotsHTML(b.pctNoAsiste12a14, 'var(--ing)', true)}Bellavista<small>${b.noAsiste12a14} de ${b.pob12a14}</small></div><div>${dotsHTML(c.pctNoAsiste12a14, 'var(--ing)', true)}Cabecera<small>${c.noAsiste12a14} de ${c.pob12a14}</small></div></div>`,
        t: 'De cada 100 chicos de 12 a 14 años, 17 no van a la escuela en Bellavista y 6 en la cabecera. Allí hay que mandar más apoyo.' }; },
  };
  const SELLADAS = [['SEJ/SEP', 'Deserción y reprobación (#28)'], ['IIEG', 'Indicadores educativos (#29)'], ['SEP', 'Conectividad de las escuelas (#31)'], ['INEGI', 'ENDUTIH: internet y dispositivos (#33)'], ['ANUIES', 'Carreras y matrícula superior (#34)'], ['Becas Benito Juárez', 'Padrón de becas (#35)'], ['IMSS/IIEG', 'Empleos y perfiles técnicos (#36)']];

  /* ---------- Ventana de diálogo (estilo videojuego) ---------- */
  let est = null, tm = null;
  const $d = s => document.querySelector('#dlg ' + s);
  function montar() {
    if (document.getElementById('dlg')) return;
    const d = document.createElement('div'); d.id = 'dlg'; d.hidden = true;
    d.innerHTML = '<div class="dlg-fondo"></div><div class="dlg-retrato" aria-hidden="true"><img class="px" alt=""></div><div class="dlg-caja" role="dialog" aria-label="Historia" tabindex="-1"><div class="dlg-nombre"></div><p class="dlg-texto" aria-live="polite"></p><div class="dlg-op"></div><button class="dlg-sig" aria-label="Siguiente">▶</button></div><button class="dlg-saltar">Saltar</button>';
    document.body.append(d);
    d.querySelector('.dlg-caja').addEventListener('click', e => { if (!e.target.closest('.dlg-op button')) avanzar(); });
    d.querySelector('.dlg-sig').addEventListener('click', e => { e.stopPropagation(); avanzar(); });
    d.querySelector('.dlg-saltar').addEventListener('click', saltar);
    document.addEventListener('keydown', e => { if (!est || document.getElementById('dlg').hidden) return; if (e.key === 'Enter' || e.key === ' ') { if (e.target.closest && e.target.closest('.dlg-op button, .dlg-saltar')) return; e.preventDefault(); avanzar(); } if (e.key === 'Escape') saltar(); });
  }
  function efecto(l) {
    if (l.fx) { const [a, b] = l.fx.split(':'); if (a === 'encender') { if (typeof Mundo !== 'undefined') Mundo.encender(b); } if (a === 'desbloquear') { if (typeof Mundo !== 'undefined') Mundo.actualizar(estadoMundo()); } if (a === 'final') { S.hist.final = true; save(); if (typeof Mundo !== 'undefined') Mundo.final(); } }
    if (l.pista && !S.hist.pistas.includes(l.pista)) { S.hist.pistas.push(l.pista); save(); }
    if (l.nota) { if (!S.hist.pistas.includes(l.nota)) { S.hist.pistas.push(l.nota); save(); } if (typeof toast === 'function') toast('Nueva nota en tu cuaderno 📓'); }
  }
  function mostrar(lineas, fin) { if (document.pointerLockElement) document.exitPointerLock(); montar(); est = { l: lineas, i: 0, fin }; document.getElementById('dlg').hidden = false; document.body.classList.add('en-dialogo'); pintar(); }
  function cerrar() { clearInterval(tm); const f = est && est.fin; est = null; const d = document.getElementById('dlg'); if (d) d.hidden = true; document.body.classList.remove('en-dialogo'); if (f) f(); }
  function pintar() {
    if (!est) return;
    const l = est.l[est.i]; if (!l) return cerrar();
    if (l.fx || l.nota) { efecto(l); est.i++; return setTimeout(pintar, l.nota ? 250 : 700); }
    if (l.pista) { efecto(l); document.getElementById('dlg').hidden = true; return pistaModal(l.pista, () => { document.getElementById('dlg').hidden = false; est.i++; pintar(); }); }
    if (l.informe) { document.getElementById('dlg').hidden = true; return informe(); }
    const r = RETRATOS[l.q] || RETRATOS.narrador, img = $d('.dlg-retrato img');
    const k = r.spr === 'promedio' ? 8 : 10, d = Px.rows(Px.SPR[r.spr]); img.onerror = null; img.src = Px.url(r.spr, k); img.width = d.w * k; img.height = d.h * k;
    const arteRet = { promedio: 'arte/villano.png', curie: 'arte/mentor_curie.png', johnson: 'arte/mentor_johnson.png', camarena: 'arte/mentor_camarena.png', jemison: 'arte/mentor_jemison.png' }[l.q];
    if (arteRet) { // arte pintado; si no carga, queda el dibujo de código
      img.onerror = () => { img.onerror = null; img.src = Px.url(r.spr, k); img.width = d.w * k; img.height = d.h * k; };
      img.src = arteRet; img.removeAttribute('width'); img.height = Math.round(d.h * k * (l.q === 'promedio' ? 1 : 1.1));
    }
    $d('.dlg-retrato').className = 'dlg-retrato q-' + l.q; $d('.dlg-nombre').textContent = r.nombre + (r.placa ? ' · historia real' : '');
    const op = $d('.dlg-op'); op.innerHTML = ''; $d('.dlg-sig').style.visibility = 'hidden'; est.listo = false; est.l[est.i].escribiendo = true;
    escribir(l.t, () => { if (!est) return; est.listo = true; if (l.op) { $d('.dlg-sig').style.visibility = 'hidden'; l.op.forEach(o => { const b = document.createElement('button'); b.className = 'btn alt'; b.textContent = o.t; b.addEventListener('click', e => { e.stopPropagation(); elegir(l, o); }); op.append(b); }); op.querySelector('button').focus({ preventScroll: true }); } else { $d('.dlg-sig').style.visibility = 'visible'; } });
  }
  function escribir(t, fin) {
    const p = $d('.dlg-texto'); clearInterval(tm); p.textContent = ''; let n = 0;
    if (reducir()) { p.textContent = t; return fin(); }
    est.fin_texto = () => { clearInterval(tm); if (!est) return; est.fin_texto = null; p.textContent = t; fin(); };
    tm = setInterval(() => { if (!est) { clearInterval(tm); return; } n += 1; p.textContent = t.slice(0, n); if (n >= t.length) { clearInterval(tm); est.fin_texto = null; fin(); } }, 24);
  }
  function elegir(l, o) {
    if (!est) return;
    if (o.ok === false) { est.listo = false; const op = $d('.dlg-op'); op.querySelectorAll('button').forEach(b => b.disabled = true); escribir(o.fb || 'Casi. Prueba otra vez.', () => { if (!est) return; op.querySelectorAll('button').forEach(b => b.disabled = false); est.listo = true; }); return; }
    est.i = o.ir !== undefined ? o.ir : est.i + 1; pintar();
  }
  function avanzar() { if (!est) return; if (est.fin_texto) { est.fin_texto(); return; } const l = est.l[est.i]; if (!est.listo || (l && l.op)) return; est.i++; pintar(); }
  function saltar() { if (!est) return; clearInterval(tm); const l = est.l; for (let i = est.i; i < l.length; i++) { efecto(l[i]); if (l[i].informe) { est.i = i; document.getElementById('dlg').hidden = true; est.fin = est.fin; informe(); return; } } cerrar(); }
  function informeHecho() { const f = est && est.fin; est = null; document.body.classList.remove('en-dialogo'); if (f) f(); }

  /* ---------- Tarjetas de pista y cuaderno ---------- */
  function pistaHTML(id) { const p = PISTAS[id]();
    return `<div class="pista"><p class="pista-etq"><span class="tag t-imp">DATO REAL</span> <span class="tag t-demo">${p.ds}</span></p><h2 class="center">${p.n}</h2>${p.vis}<p class="frase" style="font-size:.75rem">${p.t}</p><details><summary>Fuente</summary><p class="small">${p.fuente}</p></details></div>`; }
  function pistaModal(id, fin) { modal(pistaHTML(id) + '<div class="row" style="justify-content:center"><button class="btn" id="pistaOk">Guardar en mi cuaderno</button></div>'); const b = document.getElementById('pistaOk'); b.focus(); b.onclick = () => { closeModal(); fin && fin(); }; }
  function abrirPista(id) { modal(pistaHTML(id) + '<div class="row" style="justify-content:center"><button class="btn" onclick="closeModal()">Cerrar</button></div>'); }
  function cuaderno() {
    const tienen = S.hist.pistas;
    return `<h2>Mi cuaderno</h2><p class="small">Notas sobre tu zona. Se llenan solas mientras avanzas. Toca una para leerla.</p>
     <div class="pistas">${ORDEN.filter(i => PISTAS[i]).map(i => tienen.includes(i) ? `<button class="pista-btn" onclick="Historia.abrirPista('${i}')"><span class="e" aria-hidden="true">📍</span>${PISTAS[i]().n}</button>` : `<div class="pista-btn bloq"><span class="e" aria-hidden="true">🔒</span>Sin descubrir</div>`).join('')}${S.hist.final ? `<button class="pista-btn" onclick="Historia.informe(true)"><span class="e" aria-hidden="true">🏆</span>Caso cerrado</button>` : ''}</div></div>`; }

  function informe(desdeCuaderno) {
    const a = D.ajusteHogares, b = D.localidades.find(l => l.nombre === 'Bellavista'), claves = INTERESTS;
    modal(`<div class="escena" aria-hidden="true">🏆</div><h2 class="center">¡Caso cerrado!</h2>
     <p class="frase" style="font-size:.7rem">Lo que descubriste con datos reales:</p>
     <ol class="hist"><li><span class="n">1</span>Acatlán mejoró (rezago de ${pc(D.coneval.municipio.rezagoEducativo['2010'])} a ${pc(D.coneval.municipio.rezagoEducativo['2020'])}), pero un promedio esconde diferencias.</li>
      <li><span class="n">2</span>Sin Villa de los Niños, ${r0(a.pctNoAsiste12a14)} de cada 100 chicos de 12 a 14 años no van a la escuela, no 7.</li>
      <li><span class="n">3</span>En Bellavista son ${r0(b.pctNoAsiste12a14)} de cada 100 y ahí hay que mandar más apoyo.</li></ol>
     <p class="frase" style="font-size:.7rem">¿Qué quieres explorar ahora?</p><div class="chips" style="justify-content:center">${claves.map(c => `<button class="chip" onclick="Historia.vocacion('${c}')">${c}</button>`).join('')}</div><div id="vocacion" class="listo" hidden></div>
     <div class="row" style="justify-content:center"><button class="btn" id="informeOk">Seguir jugando</button></div>`);
    document.getElementById('informeOk').onclick = () => { closeModal(); if (!desdeCuaderno) informeHecho(); go('inicio'); };
  }
  function vocacion(c) { const el = document.getElementById('vocacion'); el.hidden = false; el.innerHTML = `<b>${c}</b>: ${CAMINOS[c]}.<br><small>Son ejemplos de áreas de estudio, no una recomendación personal. Habla con tus docentes y orientadores.</small>`; if (!S.interests.includes(c)) { S.interests.push(c); save(); } }

  return { ORDEN, PROLOGO, INTRO, CIERRE, FINAL, FINAL_JUEGO, PISTAS, SELLADAS, mostrar, abrirPista, cuaderno, informe, vocacion, montar };
})();

/* CUÉNTAME: plática con un mentor para descubrir qué te late explorar.
   Reglas de diseño (es una orientación para chicos de 12 a 14 años; recomienda un camino, no un destino):
   - Pregunta por gustos y actividades, nunca por calificaciones, dinero, género ni lugar de origen.
   - Siempre se puede responder «No sé»; esas respuestas no cuentan.
   - Con muy pocas respuestas reales, o con gustos muy parejos, no se recomienda nada.
   - Nunca da un solo resultado: da dos o tres pistas, explica por qué (con TUS respuestas) y propone cosas para probar.
   - 11 áreas que cubren todo tipo de carreras (no solo ciencia y tecnología) y también recuerda que existen bachillerato técnico, TSU y oficios.
   - Datos de Jalisco: matrícula de licenciatura y TSU por área (SICYT Jalisco con formato 911 SEP, ciclo 2021-2022, en el PREES 2024). Son cifras de matrícula, NO de empleo.
   - Todo queda en el navegador; compartir de forma anónima es opcional (casilla apagada). */
const Voc = (() => {
  // Fuente de las cifras de Jalisco (se cita en pantalla y en el Expediente).
  const FUENTE = 'SICYT Jalisco con datos del formato 911 de la SEP, ciclo 2021-2022, en el Plan Estatal de Educación Superior de Jalisco (PREES, 2024).';
  const JAL = {
    stem: 'En Jalisco, 19.6 de cada 100 estudiantes de licenciatura y TSU están en ingeniería y manufactura, tecnologías de la información o ciencias naturales y matemáticas.',
    sal: 'En Jalisco, 16.5 de cada 100 estudiantes de licenciatura y TSU estudian carreras de salud.',
    edu: 'En Jalisco, 5.4 de cada 100 estudiantes de licenciatura y TSU estudian educación.',
    agr: 'En Jalisco, 3.5 de cada 100 estudiantes de licenciatura y TSU estudian agronomía y veterinaria.',
    soc: 'En Jalisco, 49.6 de cada 100 estudiantes de licenciatura y TSU están en administración y negocios, ciencias sociales y derecho, artes y humanidades o servicios.',
  };
  const AREAS = {
    mat: { n: 'Matemáticas y datos', e: '🔢', d: 'Encontrar patrones, resolver problemas y predecir cosas con números.', ej: 'Matemáticas, Actuaría, Estadística, Ciencia de datos', jal: 'stem', prueba: ['Inventa un acertijo de lógica y rétalo a un amigo.', 'Anota algo que pase en tu semana (clima, goles, ventas) y busca el patrón.'], ints: ['Matemáticas'] },
    cie: { n: 'Ciencias', e: '🔬', d: 'Preguntar «¿por qué pasa esto?» y probarlo con experimentos.', ej: 'Física, Química, Biología, Ciencias ambientales', jal: 'stem', prueba: ['Haz un experimento casero con lo que tengas (hielo, sal, agua, un espejo).', 'Pregúntale a alguien mayor cómo se resolvía antes un problema de tu casa o tu campo.'], ints: ['Física', 'Química'] },
    tec: { n: 'Tecnología y computación', e: '💻', d: 'Crear programas, juegos, apps o aparatos que le sirvan a la gente.', ej: 'Computación, Sistemas, Ciberseguridad, Mecatrónica, Robótica', jal: 'stem', extra: 'Jalisco es conocido como el «Silicon Valley de México» y el Plan Estatal de Educación Superior menciona que la industria sigue necesitando ingenieros especialistas.', prueba: ['Prueba una hora de programación gratis (code.org o Scratch).', 'Dibuja en papel la app que le resolvería un problema a tu escuela.'], ints: ['Tecnología'] },
    ing: { n: 'Ingeniería y construir', e: '🛠️', d: 'Armar, arreglar y diseñar cosas que funcionen: puentes, máquinas, sistemas.', ej: 'Ingeniería civil, Mecánica, Electrónica, Industrial', jal: 'stem', extra: 'Aparte, 5.4 de cada 100 estudian carreras de construcción.', prueba: ['Construye un puente con cartón o palitos y mide cuánto peso aguanta.', 'Ayuda a arreglar algo en casa y pregunta por qué funciona así.'], ints: ['Ingeniería'] },
    sal: { n: 'Salud y cuidado de personas', e: '🩺', d: 'Cuidar a las personas y entender cómo funciona el cuerpo.', ej: 'Medicina, Enfermería, Nutrición, Odontología, Fisioterapia', jal: 'sal', prueba: ['Aprende primeros auxilios básicos (pídele a tu escuela o a Cruz Roja información).', 'Habla con alguien que trabaje en una clínica y pregúntale qué es lo que más disfruta.'], ints: [] },
    agr: { n: 'Campo, animales y naturaleza', e: '🌱', d: 'Cuidar la tierra, los cultivos, los animales y el ambiente.', ej: 'Agronomía, Veterinaria, Ingeniería ambiental, Agroindustria', jal: 'agr', prueba: ['Cuida una planta durante un mes y anota cómo cambia.', 'Pregunta a un productor o veterinario de tu zona qué problemas resuelve en un día.'], ints: [] },
    dis: { n: 'Diseño, arte y creatividad', e: '🎨', d: 'Imaginar cosas nuevas y hacer que se vean, se oigan o se sientan bien.', ej: 'Diseño gráfico, Diseño industrial, Arquitectura, Animación, Música, Artes visuales', jal: 'soc', prueba: ['Rediseña algo de tu cuarto o de tu escuela y dibújalo.', 'Haz un cartel o video corto que explique algo que aprendiste.'], ints: [] },
    hum: { n: 'Personas, sociedad y comunicación', e: '🗣️', d: 'Entender a las personas, comunicar ideas y defender lo justo.', ej: 'Psicología, Derecho, Comunicación, Historia, Trabajo social', jal: 'soc', prueba: ['Entrevista a alguien de tu familia sobre cómo cambió tu colonia o pueblo.', 'Escribe una opinión de 5 líneas sobre un problema de tu escuela y defiéndela con razones.'], ints: [] },
    neg: { n: 'Negocios y administración', e: '📊', d: 'Organizar, emprender y hacer que un proyecto o negocio funcione.', ej: 'Administración, Contaduría, Mercadotecnia, Economía, Negocios internacionales', jal: 'soc', prueba: ['Organiza una mini venta o rifa con tu grupo y lleva las cuentas.', 'Pregunta a un negocio de tu zona cómo decide sus precios.'], ints: [] },
    edu: { n: 'Enseñar y educación', e: '📚', d: 'Ayudar a otros a aprender y a crecer.', ej: 'Educación primaria o secundaria, Pedagogía, Educación física, Educación especial', jal: 'edu', prueba: ['Explícale a alguien más chico un tema que ya domines.', 'Prepara una mini clase de 5 minutos para tu grupo.'], ints: [] },
    ser: { n: 'Servicios, turismo y gastronomía', e: '🍽️', d: 'Atender a la gente y crear buenas experiencias: comida, viajes, eventos.', ej: 'Turismo, Gastronomía, Hotelería, Logística', jal: 'soc', prueba: ['Prepara una receta para tu familia y pregunta qué mejorarían.', 'Planea un paseo para tu grupo con horarios y presupuesto.'], ints: [] },
  };

  // Cada opción suma puntos a 1 o 2 áreas. Son gustos y actividades, no habilidades. 5 opciones por pregunta.
  const BANCO = [
    { q: 'Sábado libre y sin tarea. ¿Qué te dan más ganas de hacer?', o: [['Armar o arreglar algo con las manos', { ing: 2, tec: 1 }], ['Un juego de lógica o un acertijo', { mat: 2, tec: 1 }], ['Dibujar, grabar o inventar algo', { dis: 2 }], ['Cuidar plantas o animales', { agr: 2, cie: 1 }], ['Organizar un evento o vender algo con amigos', { neg: 2, ser: 1 }]] },
    { q: 'En un trabajo en equipo, ¿qué papel te sale natural?', o: [['El que organiza y hace las cuentas', { neg: 2, mat: 1 }], ['El que propone ideas locas', { dis: 2, hum: 1 }], ['El que construye el prototipo', { ing: 2, tec: 1 }], ['El que se fija en que todos estén bien', { sal: 2, edu: 1 }], ['El que explica a los demás', { edu: 2, hum: 1 }]] },
    { q: 'Algo te da curiosidad. ¿Qué haces?', o: [['Lo pruebo yo mismo para ver qué pasa', { cie: 2 }], ['Lo desarmo para ver cómo funciona', { ing: 2, tec: 1 }], ['Les pregunto a otras personas qué piensan', { hum: 2, sal: 1 }], ['Busco el patrón o la regla que hay detrás', { mat: 2, cie: 1 }], ['Busco una app o programa que lo resuelva', { tec: 2 }]] },
    { q: '¿Qué problema de tu pueblo te gustaría ayudar a resolver?', o: [['Que no haya buen internet', { tec: 2, ing: 1 }], ['Que se cuiden mal el agua y el campo', { agr: 2, cie: 1 }], ['Que haya personas sin atención de salud', { sal: 2 }], ['Que falten lugares bonitos para convivir', { dis: 2, ser: 1 }], ['Que falten negocios y trabajos', { neg: 2, hum: 1 }]] },
    { q: 'Algo te sale mal una y otra vez. ¿Qué haces?', o: [['Lo divido en pasos pequeños', { mat: 2, ing: 1 }], ['Pruebo cosas distintas hasta que salga', { cie: 2, tec: 1 }], ['Pido ideas a otras personas', { hum: 2, dis: 1 }], ['Busco cómo lo resolvió alguien antes', { tec: 2, mat: 1 }], ['Hago un plan y reparto tareas', { neg: 2, ser: 1 }]] },
    { q: '¿Qué te gustaría tener en tu cuarto?', o: [['Una computadora para crear programas o juegos', { tec: 2 }], ['Herramientas y materiales para construir', { ing: 2 }], ['Un microscopio y cosas para experimentar', { cie: 2, sal: 1 }], ['Pinturas, cámara o instrumentos', { dis: 2 }], ['Un pizarrón y libros para enseñar a otros', { edu: 2, hum: 1 }]] },
    { q: '¿Cuándo te sientes más orgulloso?', o: [['Cuando algo que armé funciona', { ing: 2, tec: 1 }], ['Cuando alguien me dice que le ayudé', { sal: 2, edu: 1 }], ['Cuando descubro cómo funciona algo', { cie: 2, mat: 1 }], ['Cuando algo mío se ve o suena genial', { dis: 2 }], ['Cuando convenzo u organizo a un grupo', { neg: 2, hum: 1 }]] },
    { q: '¿Qué prefieres?', o: [['Problemas con una respuesta exacta', { mat: 2 }], ['Preguntas que nadie ha contestado todavía', { cie: 2, hum: 1 }], ['Aparatos y apps que usa la gente', { tec: 2, ing: 1 }], ['Personas y cómo se sienten', { hum: 2, sal: 1 }], ['Que otros aprendan algo que yo les explico', { edu: 2 }]] },
    { q: 'Hay un video y no puedes dejar de verlo. ¿De qué trata?', o: [['Cómo se construye un puente o un cohete', { ing: 2, mat: 1 }], ['Cómo se hace un videojuego o una app', { tec: 2, dis: 1 }], ['Cómo funciona el cuerpo o un animal', { sal: 2, agr: 1 }], ['Un experimento que sale increíble', { cie: 2 }], ['Cómo funciona un restaurante, un hotel o un viaje', { ser: 2, neg: 1 }]] },
    { q: 'Si pudieras aprender algo hoy mismo, ¿qué sería?', o: [['A programar', { tec: 2, mat: 1 }], ['A calcular y predecir cosas', { mat: 2, cie: 1 }], ['A diseñar y hacer cosas bonitas', { dis: 2, ing: 1 }], ['A cuidar a las personas', { sal: 2, edu: 1 }], ['A cocinar o atender un negocio', { ser: 2, neg: 1 }]] },
    { q: 'Un día al aire libre. ¿Qué te gustaría hacer?', o: [['Cuidar cultivos o animales', { agr: 2, cie: 1 }], ['Medir terrenos y construir algo', { ing: 2, mat: 1 }], ['Explorar y tomar fotos o contar historias', { dis: 1, hum: 2 }], ['Organizar juegos o enseñar un deporte', { edu: 2, ser: 1 }], ['Dar primeros auxilios o ayudar a alguien herido', { sal: 2 }]] },
    { q: 'Una noticia te llama la atención. ¿De cuál?', o: [['Un robot o una inteligencia artificial nueva', { tec: 2, ing: 1 }], ['Una medicina o vacuna nueva', { sal: 2, cie: 1 }], ['Una ley o decisión que afecta a la gente', { hum: 2, neg: 1 }], ['Una empresa que crece y crea empleos', { neg: 2, ser: 1 }], ['Una escuela o forma nueva de enseñar', { edu: 2, hum: 1 }]] },
    { q: 'Si pudieras escoger dónde trabajar, ¿cuál escoges?', o: [['En un taller o una obra', { ing: 2 }], ['En un laboratorio o una clínica', { sal: 2, cie: 1 }], ['En una escuela', { edu: 2, hum: 1 }], ['Al aire libre, en el campo', { agr: 2 }], ['Con mucha gente, atendiéndola', { ser: 2, sal: 1 }]] },
    { q: '¿Cómo te gusta compartir lo que sabes?', o: [['Con un dibujo o un video', { dis: 2, tec: 1 }], ['Con una explicación en vivo', { edu: 2, hum: 1 }], ['Con una gráfica o una tabla', { mat: 2, cie: 1 }], ['Con un prototipo que funciona', { ing: 2, tec: 1 }], ['Con un debate o un argumento convincente', { hum: 2, neg: 1 }]] },
  ];
  const PREGUNTAS_POR_PLATICA = 10, MIN_REAL = 7, ID_AREAS = Object.keys(AREAS);

  // La voz de cada mentor. Son personajes recreados para el juego: lo que dicen aquí no son citas reales.
  const VOZ = {
    curie: { hola: ['Pasa, pasa. Aquí no hay respuestas buenas ni malas.', 'Solo quiero conocerte. Te voy a preguntar por lo que te gusta, no por lo que sabes.'], ack: ['Mmm, interesante.', 'Qué bien que lo digas con honestidad.', 'Eso me dice mucho de ti.', 'Gracias por contármelo.', 'Anotado. Sigamos.', 'Así empiezan muchas curiosidades.'], ya: 'Con lo que me contaste, hay caminos que te podrían gustar. Ojo: son pistas, no una sentencia.' },
    johnson: { hola: ['¡Qué gusto verte! Siéntate.', 'Vamos a platicar sin prisa. Yo pregunto, tú me cuentas cómo eres.'], ack: ['Qué buena respuesta.', 'Eso lo entiendo muy bien.', 'Me gusta cómo piensas.', 'Gracias por ser sincero.', 'Perfecto, otra más.', 'Anotado, sigamos.'], ya: 'Muy bien, ya te conozco un poco más. Mira lo que veo, pero recuerda: tú decides.' },
    camarena: { hola: ['¡Qué onda! Ven, platiquemos.', 'Te hago unas preguntas medio curiosas. No hay trampa.'], ack: ['¡Ándale!', 'Eso me late.', 'Buena esa.', 'Qué bárbaro, sigamos.', 'Ya te voy conociendo.', 'Va, otra.'], ya: 'A ver qué salió. Te dejo unas ideas para que explores. Nada está escrito, eh.' },
    jemison: { hola: ['Hola, qué bueno que viniste.', 'Hoy me interesa saber qué te emociona. No hay respuestas incorrectas.'], ack: ['Gracias por compartirlo.', 'Eso es muy tuyo.', 'Me da gusto escucharlo.', 'Buena elección.', 'Vamos con la siguiente.', 'Entiendo.'], ya: 'Con lo que me dijiste, veo unos caminos que podrías explorar. Sin presión.' },
  };
  const ORDEN = ['curie', 'johnson', 'camarena', 'jemison'], ISLA = { curie: 'ciencia', johnson: 'mate', camarena: 'tec', jemison: 'ing' };

  let V = null; // plática en curso: { id, qs[], i, resp[] }

  const vs = () => (S.voc = S.voc || { vistas: [], hechas: [] });
  const mezcla = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const mentor = id => Guion.MENT[ISLA[id]];
  const pantalla = h => { $('#espacio').innerHTML = `<div class="vc">${h}</div>`; };
  const cara = id => Guion.retrato(mentor(id));
  const lleva = (qi, a) => BANCO[qi].o.some(o => (o[1][a] || 0) >= 2);

  function elige() { // 10 preguntas de 14, cuidando que TODAS las áreas aparezcan al menos 3 veces; prefiere las no vistas
    const v = vs().vistas, todas = BANCO.map((_, i) => i); let mejor = null;
    for (let t = 0; t < 300; t++) {
      const nuevas = mezcla(todas.filter(i => !v.includes(i))), viejas = mezcla(todas.filter(i => v.includes(i)));
      const q = (t < 150 ? [...nuevas, ...viejas] : mezcla(todas)).slice(0, PREGUNTAS_POR_PLATICA);
      if (ID_AREAS.every(a => q.filter(i => lleva(i, a)).length >= 3)) return q; mejor = mejor || q;
    }
    return mejor;
  }

  function inicio() {
    V = null; const h = vs().hechas, u = h[h.length - 1];
    pantalla(`${volver()}<h1>💬 Cuéntame</h1>
      <p class="frase">Platica con un mentor. Te hará preguntas sobre lo que te gusta y, al final, te dará ideas de caminos que podrías explorar.</p>
      <div class="chips"><span class="chip on">🗣️ No es examen</span><span class="chip on">🔒 Solo tú lo ves</span><span class="chip on">↩️ Puedes cambiar de idea</span></div>
      ${u ? `<div class="vc-ult"><b>Tu última plática:</b> ${u.top.map(t => `${AREAS[t].e} ${AREAS[t].n}`).join(' · ')} <button class="btn gh" onclick="Voc.verUltima()">Ver otra vez</button></div>` : ''}
      <h2>¿Con quién quieres platicar?</h2>
      <div class="mgrid">${ORDEN.map(id => { const m = mentor(id); return `<button class="persona vc-m" onclick="Voc.empieza('${id}')"><span class="foto" aria-hidden="true">${cara(id)}</span><b>${m.n}</b></button>`; }).join('')}</div>
      <details><summary>Cómo funciona y privacidad</summary><div class="priv"><ul><li>Son ${PREGUNTAS_POR_PLATICA} preguntas sobre cosas que te gustan. Puedes contestar «No sé».</li><li>No preguntamos tus calificaciones, dinero, nombre ni dónde vives.</li><li>El resultado es una pista para explorar, no dice quién eres ni lo que puedes lograr. Tus gustos van a cambiar, y está bien.</li><li>Hay 11 áreas, no solo ciencia y tecnología. Y recuerda: el bachillerato técnico, una carrera técnica (TSU) o un oficio también son caminos buenos.</li><li>Lo ideal es platicarlo después con tu maestra o maestro, orientadora u orientador y tu familia.</li><li>Todo se queda en tu navegador. Los mentores son personajes del juego; lo que dicen aquí no son citas reales.</li></ul></div></details>`);
  }

  function empieza(id) {
    V = { id, qs: elige(), i: -1, resp: [] };
    const hola = VOZ[id].hola;
    pantalla(`${VOLVER}<div class="ar-mentor vc-bub">${cara(id)}<div><p class="ar-etq">${mentor(id).n}</p>${hola.map(t => `<p>${t}</p>`).join('')}</div></div>
      <div class="row" style="justify-content:center"><button class="btn" onclick="Voc.sigue()">Empezar a platicar</button></div>`);
  }
  const VOLVER = '<button class="back" onclick="Voc.view()" aria-label="Volver"><span aria-hidden="true">‹</span> Volver</button>';

  function sigue(ack) {
    V.i++; if (V.i >= V.qs.length) return fin();
    const q = BANCO[V.qs[V.i]], id = V.id, orden = mezcla(q.o.map((o, k) => k));
    pantalla(`<div class="paso" aria-label="Pregunta ${V.i + 1} de ${V.qs.length}">${V.qs.map((_, i) => `<i class="${i === V.i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="ar-mentor vc-bub">${cara(id)}<div><p class="ar-etq">${mentor(id).n}</p>${ack ? `<p class="vc-ack">${ack}</p>` : ''}<p><b>${q.q}</b></p></div></div>
      <div class="ar-opt">${orden.map(k => `<button class="j-btn alt" onclick="Voc.responde(${k})">${q.o[k][0]}</button>`).join('')}<button class="vc-nosé" onclick="Voc.responde(-1)">No sé / Ninguna</button></div>
      <div class="row" style="justify-content:center"><button class="btn gh" onclick="Voc.salir()">Dejarlo para otro día</button></div>`);
  }
  function responde(k) {
    const qi = V.qs[V.i]; V.resp.push({ qi, k }); const v = vs(); if (!v.vistas.includes(qi)) v.vistas.push(qi);
    const a = VOZ[V.id].ack; sigue(a[V.i % a.length]);
  }
  function salir() { save(); inicio(); }

  function puntaje(resp) {
    const p = {}, why = {}; ID_AREAS.forEach(a => { p[a] = 0; why[a] = []; }); let reales = 0;
    resp.forEach(r => { if (r.k < 0) return; reales++; const [txt, w] = BANCO[r.qi].o[r.k]; for (const a in w) { p[a] += w[a]; if (w[a] >= 2) why[a].push(txt); } });
    return { p, why, reales };
  }

  function fin() {
    const { p, why, reales } = puntaje(V.resp), id = V.id;
    const orden = ID_AREAS.slice().sort((a, b) => p[b] - p[a]), mediana = p[orden[5]];
    let cuerpo, top = [];
    if (reales < MIN_REAL) {
      cuerpo = `<p>Contestaste «No sé» a varias, y está muy bien: todavía estás descubriendo qué te gusta.</p><p>Con tan pocas respuestas no sería justo decirte un camino. Prueba alguna actividad de las de abajo y platicamos otra vez.</p>${pruebaGeneral()}`;
    } else if (p[orden[0]] - mediana < 3) {
      cuerpo = `<p>Tus gustos son muy variados y parejos. <b>Eso es una ventaja:</b> puedes explorar varias cosas antes de decidir.</p><p>No hace falta escoger ahora.</p>${pruebaGeneral()}`;
    } else {
      top = orden.slice(0, 3).filter((a, i) => i < 2 || p[a] === p[orden[1]]).filter(a => p[a] >= 2);
      cuerpo = `<p>${VOZ[id].ya}</p>${top.map(a => bloque(a, why[a])).join('')}
        <p class="vc-aviso"><b>Esto no es una sentencia.</b> Tienes 12 a 14 años y vas a cambiar mucho. Es una pista para empezar a probar cosas. Platícalo con tu maestra o maestro, tu orientadora u orientador y tu familia.</p>
        <p class="vc-aviso"><b>Dónde mirar:</b> en Jalisco hay universidades públicas, como la Universidad de Guadalajara y el Instituto Tecnológico José Mario Molina Pasquel y Henríquez, además de bachillerato técnico y carreras técnicas (TSU). Pregunta en tu escuela por la oferta que hay hoy y por las becas.</p>
        <details class="vc-fuente"><summary>De dónde salen las cifras de Jalisco</summary><p class="small">${FUENTE} Son cifras de cuántos estudiantes hay en cada área; no dicen cuánto trabajo hay ni cuánto se gana. Las carreras de cada área son ejemplos, no una lista completa.</p></details>`;
      S.voc = vs(); S.voc.hechas.push({ id, top, fecha: new Date().toISOString().slice(0, 10) }); S.interests = [...new Set(top.flatMap(a => AREAS[a].ints))]; save(); gain(25, 'Cuéntame');
    }
    Voc.top = top;
    pantalla(`<div class="ar-mentor vc-bub">${cara(id)}<div><p class="ar-etq">${mentor(id).n}</p>${cuerpo}</div></div>
      ${top.length ? '<label class="opt small"><input type="checkbox" id="vcAnon"> Con permiso de mi escuela, cuento mis áreas de forma anónima (sin nombre).</label>' : ''}
      <div class="row" style="justify-content:center"><button class="btn alt" onclick="Voc.otra()">Platicar con otro mentor</button><button class="btn" onclick="Voc.termina()">Listo</button></div>`);
  }
  const bloque = (a, why) => { const A = AREAS[a];
    return `<div class="vc-res"><h3>${A.e} ${A.n}</h3><p>${A.d}</p>
    ${why.length ? `<p class="small"><b>Por qué:</b> ${why.slice(0, 2).map(w => `elegiste «${w.toLowerCase()}»`).join(' y ')}.</p>` : ''}
    <p class="small"><b>Estudios relacionados:</b> ${A.ej}.</p>
    <p class="small"><b>Dato:</b> ${JAL[A.jal]}${A.extra ? ' ' + A.extra : ''}</p>
    <p class="small"><b>Para probar esta semana:</b></p><ul class="small">${A.prueba.map(t => `<li>${t}</li>`).join('')}</ul></div>`; };
  const pruebaGeneral = () => `<ul class="small"><li>Construye algo con cartón o palitos.</li><li>Haz un experimento casero.</li><li>Prueba una hora de programación gratis.</li><li>Dibuja un invento para tu escuela.</li><li>Prepara una receta o una mini clase para alguien.</li></ul>`;

  function otra() { comparte(); V = null; inicio(); }
  function termina() { comparte(); V = null; toast('Guardado'); go('inicio'); }
  function comparte() { const c = document.getElementById('vcAnon'); if (!c || !c.checked || !Voc.top.length) return; S.resp.push({ ans: {}, int: S.interests.slice(), fecha: new Date().toISOString().slice(0, 7) }); save(); }
  function verUltima() {
    const u = vs().hechas.slice(-1)[0]; if (!u) return;
    pantalla(`${VOLVER}<h1>Tu última plática</h1>${u.top.map(a => bloque(a, [])).join('')}<p class="vc-aviso"><b>Es una pista, no una sentencia.</b> Platícalo con alguien de confianza.</p><div class="row" style="justify-content:center"><button class="btn" onclick="Voc.view()">Volver</button></div>`);
  }
  return { view: inicio, empieza, sigue, responde, salir, otra, termina, verUltima, AREAS, BANCO, FUENTE, top: [] };
})();

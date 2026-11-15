/* NEUROPLAY · guion.js
   Lo que hace que el combate cuente una historia y enseñe:
   · MENT: el mentor de cada isla, que entra a ayudar en medio de la pelea y se relaciona con una duda concreta.
   · EJ: ejercicios STEM; resolverlos rompe el escudo de los jefes (la «Duda» de cada isla y Don Promedio).
   · reflexion / carta: «tú no eres el problema»: tu duda, la historia del mentor y el dato real de Acatlán.
   · MEJ / tienda: las chispas que ganas se gastan en mejoras del personaje.
   Honestidad: los hechos de los mentores son verificables; los consejos son del juego, inspirados en su historia, y NUNCA
   se presentan como frases suyas. Los datos describen grupos y lugares: no explican causas ni culpan a nadie. */
const Guion = (() => {
  const r0 = n => Math.round(n);
  /* ---------- Mentores: personajes con voz propia ----------
     Los hechos (país, fechas, logros) son reales; las conversaciones son una dramatización inspirada en su historia
     y nunca se presentan como frases suyas. */
  const MENT = {
    ciencia: { id: 'curie', n: 'Marie Curie', spr: 'caraCurie', duda: 'cuesta', logro: 'Ganó dos premios Nobel.', obst: 'Por ser mujer, le cerraron las puertas de la universidad en su país.',
      hola: ['¡Ah, una visita! Perdona el desorden: mi laboratorio siempre ha sido un poquito caótico.', 'Soy Marie. Nací en Polonia y allá no dejaban a las mujeres entrar a la universidad. Así que me fui a París con muy poco dinero.', 'De esos años recuerdo un cuarto frío… y unas ganas enormes de entender cómo funciona todo.', 'Si algo no te sale, no pasa nada. Voy contigo a la isla: los experimentos son más divertidos de a dos.'],
      entra: ['Respira. Un experimento falla muchas veces antes de salir. ¡Otra vez!', 'Fíjate cómo se mueven: siempre repiten el mismo patrón. Anótalo y esquívalo.', 'Yo llevaba muestras brillantes en los bolsillos sin saber que eran peligrosas. Tú solo esquiva la niebla. ¡Cuidado!', 'Con calma. Un paso a la vez y todo se resuelve.'],
      ayuda: ['Ey, te veo cansado. Toma aire… ¡te presto un poco de mi energía!', 'Descansar también es parte del método. Recupérate.'],
      escudo: ['Esa coraza no se abre con fuerza, sino con la cabeza. A ver…', '¿Qué diría la ciencia de esto? Piénsalo con calma.', 'Observa, piensa y responde. Así empieza todo descubrimiento.'],
      bien: ['¡Eso! Lo tuyo es pensar.', 'Exacto. Ya ves que sí puedes.', '¡Bravo! Eso es ser científico.'],
      mal: ['No pasa nada, así se aprende. Mira la pista.', 'Equivocarse es parte de investigar. Casi.', 'Tranquilo: hasta yo repetía los experimentos mil veces.'],
      cierre: ['¡Lo lograste! Te equivocaste, volviste a intentar y funcionó. Eso es ser científico.', 'Cuando quieras vuelves a visitarme. Habrá té… bueno, imaginario: aquí todo es de pixeles.'],
      pregunta: '¿Te ha pasado que algo te cuesta tanto que dan ganas de dejarlo?',
      si: 'A mí también me pasó: el idioma, el dinero, el frío… Casi me rindo. Pero cada vez que seguí, algo salió. Que te cueste no significa que no puedas: significa que estás aprendiendo.',
      no: 'Qué bueno. Y si algún día pasa, acuérdate de mí: se puede seguir.',
      dato: () => { const c = D.coneval.municipio.rezagoEducativo; return { t: `Y en tu pueblo se ha podido mejorar: en 2010, ${r0(c['2010'])} de cada 100 personas tenían la escuela básica sin terminar. En 2020 eran ${r0(c['2020'])}.`, f: 'CONEVAL, medición de la pobreza municipal 2010–2020.' }; },
      regalo: { mej: 'vida', n: 'Lupa de Marie', d: 'Ahora tienes +1 corazón.' } },
    mate: { id: 'johnson', n: 'Katherine Johnson', spr: 'caraJohnson', duda: 'apoyo', logro: 'Calculó rutas de vuelos espaciales.', obst: 'La excluían por el color de su piel y, además, había barreras por ser mujer.',
      hola: ['¡Qué gusto verte, estrella! Soy Katherine. Me encantan los números desde chiquita: contaba todo, hasta los escalones.', 'A los 18 ya había terminado la universidad. Pero hubo lugares donde me trataban distinto por mi color de piel y por ser mujer. Me dolía… y aun así seguí.', 'Un día, antes de un vuelo al espacio, un astronauta pidió que yo revisara los cálculos de la computadora. ¡Confió en mis cuentas!', 'Hoy te toca sumar a ti. ¿Me acompañas a la isla de Mates?'],
      entra: ['Cuenta conmigo: tres pasos a la izquierda, uno al frente… ¡y dispara!', 'Cada enemigo tiene su ritmo. Cuéntalo y lo adivinas antes de que ataque.', '¡Vas muy bien! Un error chiquito no arruina nada: se corrige y listo.', 'Ojo con la esquina. ¿Ya contaste cuántos enemigos quedan?'],
      ayuda: ['Ven, descansa un segundito. Yo reviso por ti.', 'Hasta los mejores cálculos necesitan una pausa. ¡Toma!'],
      escudo: ['Un escudo es solo un problema con disfraz. ¿Lo resolvemos juntos?', 'Saca tu lápiz imaginario: vamos a calcular.', 'Despacio y revisando dos veces. Así se hace.'],
      bien: ['¡Cuenta perfecta! Sabía que podías.', '¡Eso! Y lo hiciste tú solito.', '¡Bien hecho, estrella!'],
      mal: ['Casi. Revisa otra vez: yo siempre reviso dos veces.', 'Un error no te define. Mira la pista y seguimos.', 'No pasa nada. Hasta a mí me salían mal algunas cuentas.'],
      cierre: ['¡Sumaste, restaste y ganaste! Qué orgullo.', 'Y recuerda: no importa de dónde vengas ni cómo te vean los demás. Tus números valen igual.'],
      pregunta: '¿A veces sientes que no te apoyan o que te tratan distinto?',
      si: 'Lo sé, y duele. A mí también me trataron distinto. Pero lo que te pase no dice nada de lo que vales. Tú sigue contando.',
      no: 'Qué bueno. Y si alguien cerca de ti lo siente, sé tú quien le diga: «yo te apoyo».',
      dato: () => { const b = D.localidades.find(l => l.nombre === 'Bellavista'), c = D.localidades[0]; return { t: `En tu zona se nota: en Bellavista, ${r0(b.pctNoAsiste12a14)} de cada 100 chicos de tu edad no van a la escuela; en la cabecera, ${r0(c.pctNoAsiste12a14)}. Donde falta más apoyo, hay que dar más apoyo.`, f: 'INEGI, Censo de Población y Vivienda 2020, por localidad.' }; },
      regalo: { mej: 'ataque', n: 'Lápiz de Katherine', d: 'Ahora disparas más rápido.' } },
    tec: { id: 'camarena', n: 'Guillermo González Camarena', spr: 'caraCamarena', duda: 'recursos', logro: 'Patentó la televisión a color.', obst: 'Armaba sus propios aparatos con lo que tenía a la mano.',
      hola: ['¡Órale, qué onda! Soy Guillermo, de Guadalajara, como medio Jalisco. ¿Ya viste este tubo? Está medio chueco, ¡pero funciona!', 'De chavo armaba mis propios aparatos de radio con lo que encontraba. Nada de laboratorios lujosos.', 'Un día se me ocurrió cómo ver la tele a color. ¡Y la patenté en México en 1940!', '¿Que no tienes la mejor compu o ni internet? Se empieza con lo que hay. ¡Vamos a la isla!'],
      entra: ['¡Órale, mira ese! Apunta con calma, que no se te vaya el tiro.', 'Todo se arregla probando. Si no jala, se ajusta y otra vez.', 'Un truco: usa los bordes. Con poco también se construye una defensa.', '¡Eso! Ya vas agarrando la onda.'],
      ayuda: ['¡Aguas! Ven, te echo un cable… ¡cargado!', 'Descansa tantito. Hasta las baterías necesitan cargarse.'],
      escudo: ['Este escudo es como un circuito: si cierras bien, ¡se prende! Pero hay que pensarlo.', 'A ver, una de lógica. Tú puedes.', 'Piensa como inventor: ¿qué pasa si…?'],
      bien: ['¡Jaló! Ya ves que sí sabes.', '¡Eso! Cableado perfecto.', '¡Se prendió el foco!'],
      mal: ['Uy, se cruzó un cable. Revisa la pista y le damos otra vez.', 'No pasa nada: así se descubren las cosas.', 'Casi. Hasta a mí me explotaban cosas al principio.'],
      cierre: ['¡Volvió la señal! Qué bárbaro, lo lograste.', 'Ya sabes: el talento no depende de qué tan nuevo sea tu celular.'],
      pregunta: '¿A veces sientes que te faltan cosas, como internet, una compu o tiempo?',
      si: 'Es de lo más común. A mí me tocó armar mis cosas con lo que encontraba, y aprendí algo: lo que te falta es de la casa, no de ti. Tus ideas valen igual.',
      no: '¡Qué bien! Si algún día falta algo, acuérdate: con ingenio se arregla.',
      dato: () => { const m = D.municipio; return { t: `En tu pueblo pasa: solo ${r0(m.pctInternet)} de cada 100 casas tienen internet, pero ${r0(m.pctCelular)} de cada 100 tienen celular. Por eso este juego funciona en el celular y sin conexión.`, f: 'INEGI, Censo de Población y Vivienda 2020.' }; },
      regalo: { mej: 'esquiva', n: 'Válvula de Guillermo', d: 'Ahora esquivas más seguido.' } },
    ing: { id: 'jemison', n: 'Mae Jemison', spr: 'caraJemison', duda: 'noPara', logro: 'Llegó al espacio en 1992.', obst: 'Casi no había mujeres como ella en la ciencia.',
      hola: ['¡Hola, explorador! Soy Mae. Antes de ir al espacio quería ser bailarina… y todavía bailo, aunque con menos gravedad.', 'Entré a la universidad a los 16 años. Estudié ingeniería y medicina, porque no quería elegir una sola cosa. ¿Quién dijo que hay que elegir?', 'Había muy pocas mujeres como yo en la ciencia. Algunos me decían que no era para mí. Yo decidí que no tenían la última palabra.', 'En 1992 subí al transbordador Endeavour. ¡La Tierra se veía increíble desde allá! Ven, vamos al Taller.'],
      entra: ['Cabeza fría, como en misión: cada cosa a su tiempo.', 'Mira el patrón de sus pasos: es casi un baile. ¡Esquiva y contraataca!', 'Une lo que sabes: ciencia, mates, tecnología. Todo ayuda a todo.', '¡Más fuerte! Despegamos en tres, dos, uno…'],
      ayuda: ['¡Reporte de daños! Tranquilo, te transfiero energía.', 'Respira. En el espacio también se aprende a mantener la calma.'],
      escudo: ['Cada escudo es un problema de ingeniería. ¿Lo diseñamos juntos?', 'Piensa como en una misión: ¿qué pasa si…?', 'Cálculo de lanzamiento: ¡tu turno!'],
      bien: ['¡Misión cumplida!', '¡Brillante! Lo sabía.', '¡Eso es ingeniería!'],
      mal: ['No es una falla, es un dato. Mira la pista y reintenta.', 'Los ingenieros se equivocan, ajustan y vuelven a lanzar.', 'Casi. Ajusta y otra vez.'],
      cierre: ['¡Despegue exitoso! Esto fue trabajo en equipo.', 'Si algún día alguien te dice que algo «no es para ti», acuérdate: es una opinión, no una regla.'],
      pregunta: '¿Alguna vez pensaste «esto no es para mí»?',
      si: 'A mucha gente se lo dijeron… y a mí también. Pero «no es para ti» es una opinión, no una regla. Tú decides.',
      no: '¡Qué bien! Guarda esa seguridad: es tu combustible.',
      dato: () => { const a = D.ajusteHogares; return { t: `En tu zona hay una pista: de cada 100 chicas de 12 a 14 años, ${r0(a.pctNoAsisteMujeres)} no van a la escuela; de cada 100 chicos, ${r0(a.pctNoAsisteHombres)}. Es poca diferencia, pero ahí está, y se puede cambiar.`, f: 'Cálculo propio con INEGI, Censo 2020 (localidades con hogares, sin Villa de los Niños).' }; },
      regalo: { mej: 'especial', n: 'Casco de Mae', d: 'Ahora empiezas con más especial.' } },
  };
  const porId = id => Object.values(MENT).find(m => m.id === id);

  /* ---------- Rotación: nunca repite una línea hasta agotar todas ---------- */
  const rot = {};
  function linea(isla, tipo) {
    const m = MENT[isla === 'int' ? ['ciencia', 'mate', 'tec', 'ing'][Math.floor(Math.random() * 4)] : isla]; if (!m || !m[tipo]) return '';
    const k = m.id + tipo; if (!rot[k] || !rot[k].length) { const prev = rot[k + 'u']; rot[k] = m[tipo].map((t, i) => i).sort(() => Math.random() - .5); if (rot[k][rot[k].length - 1] === prev && rot[k].length > 1) rot[k].reverse(); }
    const i = rot[k].pop(); rot[k + 'u'] = i; return m[tipo][i];
  }

  /* ---------- Ejercicios por isla (cada uno sale una vez antes de repetirse): q pregunta, o opciones, ok índice correcto, p pista ---------- */
  const EJ = {
    ciencia: [
      { q: 'El autobús frena de golpe. Tu cuerpo tiende a…', o: ['Ir hacia atrás', 'Seguir avanzando', 'Quedarse quieto'], ok: 1, p: 'Un cuerpo en movimiento tiende a seguir moviéndose (inercia).' },
      { q: 'Un hielo se derrite. ¿Sigue siendo agua?', o: ['No, es otra sustancia', 'Sí, solo cambió de estado', 'Se vuelve aire'], ok: 1, p: 'Cambiar de estado no cambia la sustancia.' },
      { q: '¿A cuántos grados Celsius hierve el agua a nivel del mar?', o: ['50', '100', '150'], ok: 1, p: 'Es una referencia clave de la escala Celsius.' },
      { q: '¿Qué necesita una planta para hacer fotosíntesis?', o: ['Luz, agua y dióxido de carbono', 'Solo tierra', 'Solo oscuridad'], ok: 0, p: 'Las plantas fabrican su alimento con luz.' },
      { q: '¿Cuál es un cambio químico?', o: ['Quemar papel', 'Romper papel', 'Doblar papel'], ok: 0, p: 'Al quemarlo se forma algo nuevo.' },
      { q: '¿Qué órgano bombea la sangre?', o: ['El pulmón', 'El corazón', 'El estómago'], ok: 1, p: 'Late todo el día sin parar.' },
      { q: 'Un imán atrae más fácil a…', o: ['Un clavo de hierro', 'Una hoja de papel', 'Un vaso de plástico'], ok: 0, p: 'Los imanes atraen metales como el hierro.' },
      { q: 'La Tierra da una vuelta completa al Sol en…', o: ['Un día', 'Un mes', 'Un año'], ok: 2, p: 'Por eso existen los años.' },
    ],
    mate: [
      { q: '3 limones rinden 4 vasos. ¿Cuántos limones para 8 vasos?', o: ['4', '6', '8'], ok: 1, p: 'Si los vasos se duplican, los limones también: el doble de 3.' },
      { q: '¿Cuánto es el 10 % de 250?', o: ['2,5', '25', '50'], ok: 1, p: 'El 10 % es dividir entre 10.' },
      { q: 'Un rectángulo mide 6 cm por 4 cm. ¿Cuál es su área?', o: ['10 cm²', '20 cm²', '24 cm²'], ok: 2, p: 'Área = base por altura.' },
      { q: '12 de cada 100 chicos faltan a clase. ¿Qué porcentaje es?', o: ['1,2 %', '12 %', '88 %'], ok: 1, p: '«Por cada 100» es un porcentaje.' },
      { q: '¿Cuánto es 3/4 de 20?', o: ['5', '15', '12'], ok: 1, p: 'Divide entre 4 y multiplica por 3.' },
      { q: 'Compras 3 cuadernos de $18 cada uno. ¿Cuánto pagas?', o: ['$21', '$54', '$36'], ok: 1, p: '3 veces 18.' },
      { q: '¿Qué número sigue? 2, 4, 8, 16, …', o: ['24', '32', '20'], ok: 1, p: 'Cada número es el doble del anterior.' },
      { q: 'El perímetro de un cuadrado de lado 5 cm es…', o: ['10 cm', '20 cm', '25 cm'], ok: 1, p: 'Suma los cuatro lados.' },
    ],
    tec: [
      { q: 'Una lista ordenada de pasos para resolver algo es un…', o: ['Pantalla', 'Algoritmo', 'Archivo'], ok: 1, p: 'Los programas siguen pasos en orden.' },
      { q: 'El robot repite 3 veces «avanza 2 pasos». ¿Cuántos pasos avanza?', o: ['5', '6', '9'], ok: 1, p: 'Repetir es multiplicar: 3 veces 2.' },
      { q: 'El número 5 en binario es…', o: ['101', '110', '11'], ok: 0, p: 'Binario usa 4, 2 y 1: 4 + 1 = 5.' },
      { q: 'Si no hay internet, ¿qué conviene que haga una app educativa?', o: ['Dejar de funcionar', 'Funcionar sin conexión', 'Pedir una contraseña'], ok: 1, p: 'En muchas casas hay celular pero no internet.' },
      { q: '¿Qué hace una variable en un programa?', o: ['Guarda un valor', 'Apaga la pantalla', 'Borra todo'], ok: 0, p: 'Es como una cajita con nombre.' },
      { q: '¿Cuál es una contraseña más segura?', o: ['1234', 'Mi_perro_Max_2015!', 'contraseña'], ok: 1, p: 'Larga, con letras, números y símbolos.' },
      { q: 'Un bucle sirve para…', o: ['Repetir pasos', 'Cambiar el color', 'Apagar el programa'], ok: 0, p: 'Repetir sin escribir lo mismo mil veces.' },
      { q: 'En «si llueve, llevo paraguas», la palabra «si» marca una…', o: ['Condición', 'Repetición', 'Imagen'], ok: 0, p: 'Solo pasa algo si se cumple lo que sigue.' },
    ],
    ing: [
      { q: '4 kg a 3 m se equilibran con 6 kg a…', o: ['1 m', '2 m', '3 m'], ok: 1, p: 'Peso por distancia debe ser igual: 4 × 3 = 12.' },
      { q: '¿Qué figura es más rígida en un puente?', o: ['Cuadrado', 'Triángulo', 'Círculo'], ok: 1, p: 'Los triángulos no se deforman fácil.' },
      { q: 'Para mover una roca con una palanca, el apoyo debe estar…', o: ['Más cerca de la roca', 'Más lejos de la roca', 'Da lo mismo'], ok: 0, p: 'Un brazo largo de fuerza multiplica tu esfuerzo.' },
      { q: 'Una rampa larga y suave para subir una carga pide…', o: ['Menos fuerza', 'Más fuerza', 'La misma fuerza'], ok: 0, p: 'A cambio, recorres más distancia.' },
      { q: 'Para que una torre no se caiga, la base debe ser…', o: ['Más ancha', 'Más angosta', 'Da igual'], ok: 0, p: 'Una base ancha da estabilidad.' },
      { q: 'Una rueda con eje sirve para…', o: ['Mover cosas con menos esfuerzo', 'Hacer ruido', 'Pesar más'], ok: 0, p: 'Rodar cuesta menos que arrastrar.' },
      { q: 'Un puente de arco reparte el peso…', o: ['Hacia los extremos', 'Solo al centro', 'A ningún lado'], ok: 0, p: 'El arco empuja el peso hacia los apoyos.' },
      { q: 'Si mides mal 1 cm una pieza de 10 cm, ¿qué puede pasar?', o: ['Que no encaje', 'Nada', 'Que encaje mejor'], ok: 0, p: 'En ingeniería, medir bien importa.' },
    ],
    int: [
      { q: '12 de cada 100 chicos no van a la escuela. ¿Qué porcentaje es?', o: ['1,2 %', '12 %', '88 %'], ok: 1, p: '«Por cada 100» es un porcentaje.' },
      { q: 'Un promedio mezcla lugares muy distintos. ¿Qué puede esconder?', o: ['Diferencias entre lugares', 'Nada: es exacto para todos', 'Que no hay datos'], ok: 0, p: 'El promedio no dice quién se queda atrás.' },
      { q: 'En un lugar faltan 17 de cada 100 chicos y en otro 6. ¿Dónde mandas más apoyo?', o: ['Donde faltan 17', 'Donde faltan 6', 'Igual a los dos'], ok: 0, p: 'Un dato es una pista para ayudar, no una culpa.' },
      { q: 'Un dato nos dice…', o: ['Cómo está un grupo, sin culpar a nadie', 'Quién tiene la culpa', 'El futuro exacto'], ok: 0, p: 'Los datos describen grupos, no juzgan personas.' },
      { q: 'Si no ves los datos de un lugar, el promedio puede…', o: ['Engañarte', 'Ser perfecto', 'Desaparecer'], ok: 0, p: 'Si no los ves, no sabes quién falta.' },
      { q: '¿Qué ayuda más?', o: ['Mirar a quién le falta más', 'Dar lo mismo sin mirar', 'No hacer nada'], ok: 0, p: 'Equidad: dar más donde falta más.' },
      { q: '17 de cada 100 son más o menos…', o: ['Casi 1 de cada 6', 'Casi 1 de cada 2', 'Casi 1 de cada 20'], ok: 0, p: '100 entre 17 es un poco menos de 6.' },
    ],
  };
  const vistos = () => { const p = pj(); p.vistos = p.vistos || {}; return p.vistos; };
  function pregunta(isla, ns = '') { // una pregunta que no hayas visto; al agotarlas, se reinicia
    const lista = EJ[isla] || EJ.int, k = ns + (EJ[isla] ? isla : 'int'), v = vistos(); let usadas = v[k] = v[k] || [];
    let libres = lista.map((q, i) => i).filter(i => !usadas.includes(i)); if (!libres.length) { usadas = v[k] = []; libres = lista.map((q, i) => i); }
    const i = libres[Math.floor(Math.random() * libres.length)]; usadas.push(i); save(); return lista[i];
  }
  const banco = id => (EJ[id] || EJ.int).slice();

  const retrato = (m, k = 6) => `<img class="px mentor-img" src="arte/mentor_${m.id}.png" onerror="this.onerror=null;this.src='${Px.url(m.spr, k)}'" alt="" aria-hidden="true">`;
  function mentorHTML(isla, ayuda) { // tarjeta corta de presentación
    const m = MENT[isla]; if (!m) return '';
    return `<div class="ar-mentor">${retrato(m)}<div><h2>${m.n}</h2><p class="ar-etq">Enfrentó</p><p>${m.obst}</p><p class="ar-etq">Aun así</p><p>${m.logro}</p></div></div>${ayuda ? `<p><b>Ayuda:</b> ${ayuda}</p>` : ''}`;
  }
  function conocer(isla) { const m = MENT[isla]; if (m && !S.mentors.includes(m.id)) { S.mentors.push(m.id); save(); } }

  /* ---------- Mejoras del personaje (se pagan con chispas) ---------- */
  const MEJ = [
    { id: 'vida', n: 'Más vida', d: '+1 corazón por nivel', costo: [20, 40, 70] },
    { id: 'ataque', n: 'Ataque veloz', d: 'Disparas más rápido', costo: [20, 40, 70] },
    { id: 'esquiva', n: 'Esquiva ágil', d: 'Esquivas más seguido', costo: [20, 40, 70] },
    { id: 'especial', n: 'Carga inicial', d: 'Empiezas con más especial', costo: [30, 60, 90] },
  ];
  const pj = () => (S.pj = S.pj || { chispas: 0, mej: {} });
  const nivelMej = id => (pj().mej[id] || 0);
  const chispas = n => { pj().chispas = Math.max(0, pj().chispas + n); save(); };

  /* ---------- tarjeta de pantalla completa (reflexión, carta, taller) ---------- */
  function panel(html) {
    let c = document.getElementById('gcard'); if (!c) { c = document.createElement('div'); c.id = 'gcard'; c.className = 'ar-card g-card'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-modal', 'true'); document.body.append(c); }
    if (document.pointerLockElement) document.exitPointerLock();
    c.innerHTML = `<div class="in-panel">${html}</div>`; c.hidden = false; const b = c.querySelector('button'); if (b) b.focus({ preventScroll: true }); return c;
  }
  const cierra = () => { const c = document.getElementById('gcard'); if (c) c.hidden = true; };

  function tienda(fin) {
    const fila = m => { const n = nivelMej(m.id), c = m.costo[n]; return `<div class="ar-mej"><div><b>${m.n}</b> ${'●'.repeat(n)}${'○'.repeat(3 - n)}<br><small>${m.d}</small></div>${c === undefined ? '<span class="ar-etq">MÁXIMO</span>' : `<button class="j-btn ${pj().chispas >= c ? 'oro' : 'alt'}" data-m="${m.id}" ${pj().chispas >= c ? '' : 'disabled'}>${c} ✦</button>`}</div>`; };
    const c = panel(`<h2>Taller de mejoras</h2><p>Tus chispas: <b>${pj().chispas} ✦</b>. Ganas chispas al vencer arenas, absorber y acertar ejercicios.</p>${MEJ.map(fila).join('')}<button class="j-btn alt" id="gTx">Cerrar</button>`);
    c.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const m = MEJ.find(x => x.id === b.dataset.m), n = nivelMej(m.id); if (pj().chispas < m.costo[n]) return; chispas(-m.costo[n]); pj().mej[m.id] = n + 1; save(); Sfx.bien(); tienda(fin); });
    document.getElementById('gTx').onclick = () => { cierra(); fin && fin(); };
  }

  /* ---------- Recuerdo de cada isla: un regalo que mejora a tu personaje (no un dato) ---------- */
  function regalo(isla) { // devuelve {n, d} la primera vez; en repeticiones, null
    const m = MENT[isla], g = m && m.regalo; if (!g) return null; pj().regalos = pj().regalos || {}; if (pj().regalos[isla]) return null;
    pj().regalos[isla] = 1; pj().mej[g.mej] = Math.min(3, nivelMej(g.mej) + 1); save(); return g;
  }

  /* ---------- «Tú no eres el problema»: una charla con el mentor, no un examen ---------- */
  function reflexion(isla, fin) {
    const m = MENT[isla]; if (!m) return fin && fin();
    const sigue = () => { cierra(); fin && fin(); };
    const c = panel(`<div class="ar-mentor">${retrato(m)}<div><p class="ar-etq">${m.n}</p><p>${m.pregunta}</p></div></div>
      <div class="ar-opt"><button class="j-btn alt" data-r="si">Sí, me ha pasado</button><button class="j-btn alt" data-r="no">No, por ahora no</button></div>`);
    c.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
      const si = b.dataset.r === 'si'; S.hist.dudas = S.hist.dudas || {}; S.hist.dudas[isla] = si ? m.duda : 'ninguna'; save();
      if (!si) { panel(`<div class="ar-mentor">${retrato(m)}<div><p class="ar-etq">${m.n}</p><p>${m.no}</p></div></div><button class="j-btn oro" id="gSig">Seguir</button>`); document.getElementById('gSig').onclick = sigue; return; }
      const dt = m.dato();
      panel(`<div class="ar-mentor">${retrato(m)}<div><p class="ar-etq">${m.n}</p><p>${m.si}</p></div></div>
        <div class="ar-dato">${dt.t}<small>${dt.f}</small></div><p class="ar-nota"><b>Tú no eres el problema.</b></p><button class="j-btn oro" id="gSig">Seguir</button>`);
      document.getElementById('gSig').onclick = sigue;
    });
  }

  function carta(fin) {
    const lista = Object.values(MENT).map(m => `<li><b>${m.n}:</b> ${m.obst}</li>`).join('');
    const mias = [];
    const camino = S.interests.length ? CAMINOS[S.interests[S.interests.length - 1]] : null;
    const c = panel(`<h2>Una carta para ti, ${S.nick || 'explorador'}</h2>
      ${mias.length ? `<p><b>Tus dudas:</b> ${mias.map(d => d.t).join(' · ')}.</p>` : ''}
      <p>Ellos también se toparon con obstáculos:</p><ul class="ar-lista">${lista}</ul>
      <p><b>Tú no eres el problema.</b> Los datos muestran dónde falta ayuda, no quién no puede.</p>
      ${camino ? `<p class="ar-nota">Un camino de ejemplo: ${camino}.</p>` : ''}
      <p class="ar-nota">Si algo te preocupa, habla con alguien de confianza en tu escuela.</p>
      <button class="j-btn oro" id="gSigo">Sigo estudiando</button><button class="j-btn alt" id="gPienso">Quiero pensarlo</button>`);
    document.getElementById('gSigo').onclick = () => { S.hist.compromiso = { eligio: true, interes: S.interests[S.interests.length - 1] || null }; save(); Sfx.gana(); panel(`<h2>¡Gran decisión!</h2><p>Tu historia apenas empieza.</p><button class="j-btn oro" id="gFin">Seguir explorando</button>`); document.getElementById('gFin').onclick = () => { cierra(); fin && fin(); }; };
    document.getElementById('gPienso').onclick = () => { cierra(); fin && fin(); };
  }

  return { MENT, EJ, MEJ, banco, pregunta, linea, regalo, retrato, mentorHTML, conocer, reflexion, carta, tienda, panel, cierra, porId, nivelMej, chispas, pj };
})();

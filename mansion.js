/* NEUROPLAY · mansion.js
   La Mansión Neuron: aventura en primera persona con estética retro de los 90 (baja resolución, niebla, linterna).
   Se explora con linterna, se abren puertas con llaves, se habla con los mentores (genios que guían), se resuelven puzzles STEM
   en las terminales y se enfrentan las «Dudas», fantasmas que persiguen hasta que las respondes (con ayuda del mentor).
   Todo el contenido (datos reales, retos, historia) es el mismo del resto del juego; aquí solo cambia la forma de jugarlo.
   Es una primera versión jugable (un vertical slice): 5 salas, 4 mentores, 8 dudas y la sala final con Don Promedio. */
const Mansion = (() => {
  const CELDA = 3, ALTO = 3.3, W = 21, H = 27, RES = 3;
  const ROOMS = { // sala, caja en celdas y qué región STEM le toca
    hall: { x0: 7, y0: 13, x1: 13, y1: 19, suelo: 'madera', pared: 'papel', nombre: 'Vestíbulo' },
    lab: { x0: 1, y0: 14, x1: 5, y1: 18, suelo: 'azulejo', pared: 'azulejo', nombre: 'Laboratorio', reg: 'ciencia', mentor: 'curie' },
    bib: { x0: 8, y0: 7, x1: 12, y1: 11, suelo: 'alfombra', pared: 'libros', nombre: 'Biblioteca de Números', reg: 'mate', mentor: 'johnson' },
    serv: { x0: 15, y0: 14, x1: 19, y1: 18, suelo: 'metal', pared: 'metal', nombre: 'Sala de Servidores', reg: 'tec', mentor: 'camarena' },
    taller: { x0: 8, y0: 21, x1: 12, y1: 25, suelo: 'concreto', pared: 'concreto', nombre: 'Taller de Puentes', reg: 'ing', mentor: 'jemison' },
    torre: { x0: 8, y0: 1, x1: 12, y1: 5, suelo: 'alfombra', pared: 'papel', nombre: 'Torre de Don Promedio' },
  };
  const REG2SALA = { ciencia: 'lab', mate: 'bib', tec: 'serv', ing: 'taller' };
  const PUERTAS = [ // celda, orientación y qué hace falta para abrirla
    { id: 'lab', x: 6, y: 16, req: 'llaveLab' }, { id: 'bib', x: 10, y: 12, req: 'llaveBib' }, { id: 'serv', x: 14, y: 16, req: 'tarjetaServ' },
    { id: 'taller', x: 10, y: 20, req: 'llaveTaller' }, { id: 'torre', x: 10, y: 6, req: 'emblemas' },
  ];
  const OBJ = { // objetos que se pueden llevar
    llaveLab: { n: 'Llave del Laboratorio', spr: 'llave' }, llaveBib: { n: 'Llave de la Biblioteca', spr: 'llave' }, tarjetaServ: { n: 'Tarjeta de Servidores', spr: 'nota' }, llaveTaller: { n: 'Llave del Taller', spr: 'llave' },
    emCiencia: { n: 'Emblema de Ciencia', spr: 'emblema' }, emMate: { n: 'Emblema de Mates', spr: 'emblema' }, emTec: { n: 'Emblema de Tecnología', spr: 'emblema' }, emIng: { n: 'Emblema de Ingeniería', spr: 'emblema' },
    notaHall: { n: 'Nota del vestíbulo', spr: 'nota' },
  };
  const PREMIO = { ciencia: ['llaveBib', 'emCiencia'], mate: ['tarjetaServ', 'emMate'], tec: ['llaveTaller', 'emTec'], ing: ['emIng'] };
  const MENTORES = { // placas con hechos reales y en lenguaje directo (nunca frases inventadas); el consejo es del juego
    curie: { cara: 'caraCurie', traje: '#333c57', nombre: 'Marie Curie', lineas: ['Por ser mujer, le cerraron las puertas de la universidad en su país. Se fue a París y estudió allá.', 'Ganó dos premios Nobel (1903 y 1911).'], consejo: 'Mide con cuidado y separa cada paso: así se abren puertas.' },
    johnson: { cara: 'caraJohnson', traje: '#3b5dc9', nombre: 'Katherine Johnson', lineas: ['La excluían por el color de su piel y por ser mujer. Aun así terminó la universidad a los 18 años.', 'Calculó la ruta del primer vuelo de un astronauta de EE. UU. al espacio (1961).'], consejo: 'Revisa tus cuentas dos veces: un error pequeño cambia todo.' },
    camarena: { cara: 'caraCamarena', traje: '#b13e53', nombre: 'Guillermo González Camarena', lineas: ['Nació en Guadalajara en 1917 y tenía pocos recursos: armaba sus propios aparatos.', 'Patentó un sistema de televisión a color (1940 y 1942).'], consejo: 'Usa lo que sí tienes: con poco también se construye.' },
    jemison: { cara: 'caraJemison', traje: '#257179', nombre: 'Mae Jemison', lineas: ['Casi no había mujeres como ella en la ciencia. Estudió ingeniería y medicina.', 'En 1992 viajó al espacio en el transbordador Endeavour.'], consejo: 'Da más ayuda donde más falta, no lo mismo a todos.' },
  };
  const DUDAS = { // «Dudas» de cada sala: pregunta, opciones (la primera es la correcta) y de qué mentor viene el consejo
    lab: [{ p: 'El rezago educativo de Acatlán bajó de 22,6 a 14,7 de cada 100. ¿Qué significa?', o: ['Mejoró en promedio, pero hay que mirar rincón por rincón', 'Ya no hay ningún problema', 'Empeoró'] }, { p: '¿Cuál es una buena pregunta científica?', o: ['¿Cómo cambia el agua al subir la temperatura?', '¿Quién tiene la razón?', '¿Cuál experimento me cae mejor?'] }],
    bib: [{ p: '6 de cada 100 es lo mismo que…', o: ['6 %', '60 %', '0,6 %'] }, { p: 'Si 4 vasos llevan 3 limones, ¿cuántos limones para 12 vasos?', o: ['9', '7', '12'] }],
    serv: [{ p: 'De cada 100 casas de Acatlán, 53 tienen internet y 93 tienen celular. ¿Qué conviene?', o: ['Apps que funcionen sin internet en el celular', 'Apps solo para computadora', 'Pedir internet de fibra a todos'] }, { p: 'Un algoritmo es…', o: ['Una lista de pasos en orden', 'Un tipo de pantalla', 'Un archivo borrado'] }],
    taller: [{ p: 'En Bellavista 17 de cada 100 chicos de 12 a 14 años no van a la escuela; en la cabecera, 6. ¿Dónde mandas más apoyo?', o: ['A Bellavista', 'Igual a todos', 'A ningún lado'] }, { p: 'Un peso de 2 kg a 3 m se equilibra con 3 kg a…', o: ['2 m', '1 m', '3 m'] }],
  };

  let renderer, scene, camera, linterna, chispaLuz, contenedor, activo = false, listo = false, raf = 0, reloj = null;
  const jug = { x: 0, z: 0, ry: Math.PI, rx: 0, paso: 0 };
  const tec = {}; let joy = { x: 0, y: 0 }, mira = null, mochila = () => {}, ayuda = () => {};
  let celdas = [], puertas = [], obstaculos = [], interact = [], dudas = [], luces = {}, anim = [], chispaSpr, hud = {};
  const estado = () => { S.m = S.m || { vidas: 3, items: [], mentores: {}, dudasOk: [], intro: false, x: null, z: null, ry: null, abiertas: {} }; return S.m; };
  const reducir = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bloqueado = () => { const d = document.getElementById('dlg'), m = document.getElementById('modal'); return (d && !d.hidden) || (m && !m.hidden); };
  const P = (cx, cy) => ({ x: (cx + .5) * CELDA, z: (cy + .5) * CELDA });
  const tiene = id => estado().items.includes(id);
  const IMGS = {}; ['curie', 'johnson', 'camarena', 'jemison'].forEach(id => { const i = new Image(); i.src = 'arte/mentor_' + id + '.png'; IMGS[id] = i; }); // retratos pintados de los mentores
  const lienzoDe = im => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); return c; };
  const emblemas = () => ['emCiencia', 'emMate', 'emTec', 'emIng'].filter(tiene).length;

  /* ---------- Texturas hechas con código (pixeladas, estilo consola de los 90) ---------- */
  function textura(dibuja, n = 32, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); dibuja(x, n); const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
  const rect = (x, c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const TEX = {
    madera: n => textura((x) => { rect(x, '#5e3a1e', 0, 0, n, n); for (let i = 0; i < n; i += 8) { rect(x, '#8b5a2b', 0, i, n, 7); rect(x, '#3d2412', 0, i + 7, n, 1); for (let k = 0; k < 4; k++) rect(x, '#6f4522', (i * 7 + k * 11) % n, i + 2, 5, 1); } }, n),
    papel: n => textura((x) => { rect(x, '#4a2236', 0, 0, n, n); for (let i = 0; i < n; i += 8) { rect(x, '#6b3350', i, 0, 3, n); rect(x, '#3b1a2b', i + 5, 0, 1, n); } rect(x, '#2b1620', 0, n - 4, n, 4); rect(x, '#8b5a2b', 0, n - 5, n, 1); }, n),
    azulejo: n => textura((x) => { for (let i = 0; i < n; i += 8) for (let j = 0; j < n; j += 8) { rect(x, (i + j) % 16 ? '#cfeff0' : '#9ed8dc', i, j, 8, 8); rect(x, '#5aa9ae', i, j, 8, 1); rect(x, '#5aa9ae', i, j, 1, 8); } }, n),
    alfombra: n => textura((x) => { rect(x, '#6b1f2e', 0, 0, n, n); for (let i = 0; i < n; i += 4) { rect(x, '#8a2c3f', i, 0, 2, n); } rect(x, '#d9a441', 0, 0, n, 2); rect(x, '#d9a441', 0, n - 2, n, 2); }, n),
    libros: n => textura((x) => { rect(x, '#2e1b10', 0, 0, n, n); const cols = ['#b13e53', '#3b5dc9', '#38b764', '#ef7d57', '#ffcd75', '#73eff7', '#5d275d']; for (let f = 0; f < 4; f++) { let px = 0; while (px < n) { const w = 2 + ((px * 7 + f * 3) % 3); rect(x, cols[(px + f * 5) % cols.length], px, f * 8 + 1, w, 6); px += w + 1; } rect(x, '#5e3a1e', 0, f * 8 + 7, n, 1); } }, n),
    metal: n => textura((x) => { rect(x, '#2b3548', 0, 0, n, n); for (let i = 0; i < n; i += 16) { rect(x, '#3a455c', 0, i, n, 15); rect(x, '#1a2030', 0, i + 15, n, 1); } for (let k = 0; k < 8; k++) rect(x, k % 3 ? '#38b764' : '#ef7d57', 2 + k * 4, 5, 2, 2); rect(x, '#73eff7', 4, 21, 8, 1); }, n),
    concreto: n => textura((x) => { rect(x, '#566c86', 0, 0, n, n); for (let k = 0; k < 40; k++) rect(x, k % 2 ? '#4a5d75' : '#6a809b', (k * 13) % n, (k * 7) % n, 2, 1); rect(x, '#ef7d57', 0, 0, n, 3); rect(x, '#1a1c2c', 0, 3, n, 2); }, n),
    techo: n => textura((x) => { rect(x, '#14101c', 0, 0, n, n); rect(x, '#1e1830', 0, 0, n, 1); rect(x, '#1e1830', 0, 0, 1, n); }, n),
    puerta: n => textura((x) => { rect(x, '#5e3a1e', 0, 0, n, n); rect(x, '#8b5a2b', 3, 3, n - 6, n - 6); rect(x, '#5e3a1e', 6, 6, n - 12, 8); rect(x, '#5e3a1e', 6, 18, n - 12, n - 24); rect(x, '#ffcd75', n - 8, n / 2, 3, 3); }, n),
    mesa: n => textura((x) => { rect(x, '#8b5a2b', 0, 0, n, n); rect(x, '#5e3a1e', 0, 0, n, 2); for (let i = 3; i < n; i += 6) rect(x, '#6f4522', 0, i, n, 1); }, n),
  };
  const cacheTex = {}; const tx = (k, rep) => { const id = k + rep; if (!cacheTex[id]) { const t = TEX[k](32); t.repeat.set(rep[0], rep[1]); cacheTex[id] = t; } return cacheTex[id]; };
  const mat = (k, rep = [1, 1]) => new THREE.MeshLambertMaterial({ map: tx(k, rep) });

  function sprite(lienzo, alto, ancla = .5) { const t = new THREE.CanvasTexture(lienzo); t.magFilter = t.minFilter = THREE.NearestFilter; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, fog: true })); const r = lienzo.width / lienzo.height; s.scale.set(alto * r, alto, 1); s.center.set(.5, ancla); return s; }
  function figura(cara, traje) { // mentor de cuerpo entero: la cara del dibujo + cuerpo con el color de su ropa
    const c = document.createElement('canvas'); c.width = 14; c.height = 28; const x = c.getContext('2d'); x.drawImage(Px.lienzo(cara, 1), 1, 0);
    rect(x, '#1a1c2c', 2, 12, 10, 12); rect(x, traje, 3, 12, 8, 11); rect(x, '#1a1c2c', 3, 23, 3, 4); rect(x, '#1a1c2c', 8, 23, 3, 4); rect(x, '#333c57', 4, 23, 1, 3); rect(x, '#333c57', 9, 23, 1, 3); rect(x, '#f4f4f4', 6, 12, 2, 3); return c;
  }

  /* ---------- Construcción del nivel ---------- */
  function construir() {
    celdas = Array.from({ length: H }, () => Array(W).fill('#'));
    Object.entries(ROOMS).forEach(([k, r]) => { for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) celdas[y][x] = k; });
    PUERTAS.forEach(d => { celdas[d.y][d.x] = 'puerta'; });
    const sala = (cx, cy) => (cx < 0 || cy < 0 || cx >= W || cy >= H) ? '#' : celdas[cy][cx];
    const vecinoSala = (cx, cy) => { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const s = sala(cx + dx, cy + dy); if (s !== '#' && s !== 'puerta') return s; } return null; };
    const grupoMuros = new THREE.Group(); scene.add(grupoMuros);
    for (let cy = 0; cy < H; cy++) for (let cx = 0; cx < W; cx++) if (celdas[cy][cx] === '#') { const s = vecinoSala(cx, cy); if (!s) continue; const m = new THREE.Mesh(new THREE.BoxGeometry(CELDA, ALTO, CELDA), mat(ROOMS[s].pared, [1, 1])); m.position.set((cx + .5) * CELDA, ALTO / 2, (cy + .5) * CELDA); grupoMuros.add(m); }
    Object.entries(ROOMS).forEach(([k, r]) => { const w = (r.x1 - r.x0 + 1) * CELDA, d = (r.y1 - r.y0 + 1) * CELDA, cx = (r.x0 + (r.x1 - r.x0 + 1) / 2) * CELDA, cz = (r.y0 + (r.y1 - r.y0 + 1) / 2) * CELDA;
      const suelo = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(r.suelo, [w / CELDA * 1.5, d / CELDA * 1.5])); suelo.rotation.x = -Math.PI / 2; suelo.position.set(cx, 0, cz); scene.add(suelo);
      const techo = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat('techo', [w / CELDA, d / CELDA])); techo.rotation.x = Math.PI / 2; techo.position.set(cx, ALTO, cz); scene.add(techo);
      const l = new THREE.PointLight(k === 'hall' ? 0xffd9a0 : 0xbcd8ff, k === 'hall' ? .9 : 0, 13, 1.6); l.position.set(cx, ALTO - .5, cz); scene.add(l); luces[k] = l; });
    PUERTAS.forEach(d => { const ns = sala(d.x - 1, d.y) !== '#'; // si hay sala a izquierda y derecha, la hoja es delgada en x
      const m = new THREE.Mesh(new THREE.BoxGeometry(ns ? .3 : CELDA * .96, ALTO, ns ? CELDA * .96 : .3), mat('puerta', [1, 1])); m.position.set((d.x + .5) * CELDA, ALTO / 2, (d.y + .5) * CELDA); scene.add(m);
      const sue = new THREE.Mesh(new THREE.PlaneGeometry(CELDA, CELDA), mat('madera', [1.5, 1.5])); sue.rotation.x = -Math.PI / 2; sue.position.set((d.x + .5) * CELDA, 0, (d.y + .5) * CELDA); scene.add(sue);
      const hecho = { ...d, mesh: m, abierta: !!estado().abiertas[d.id] }; if (hecho.abierta) m.position.y = ALTO * 1.5; puertas.push(hecho);
      const dx = (d.x + .5) * CELDA, dz = (d.y + .5) * CELDA; interact.push({ tipo: 'puerta', x: dx, z: dz, r: 2.6, puerta: hecho, texto: () => hecho.abierta ? null : 'Abrir la puerta' }); });
  }
  const caja = (x, z, w, d, h, material, y0 = 0, solido = true) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y0 + h / 2, z); scene.add(m); if (solido) obstaculos.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }); return m; };
  const plano = (l, a) => new THREE.MeshBasicMaterial({ map: l });
  function pantalla(texto, color = '#73eff7') { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); rect(x, '#0b1420', 0, 0, 32, 32); x.fillStyle = color; x.font = '20px "Press Start 2P", monospace'; x.textAlign = 'center'; x.fillText(texto, 16, 24); const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; return new THREE.MeshBasicMaterial({ map: t }); }

  function amueblar() {
    const mesa = mat('mesa', [1, 1]);
    // Vestíbulo: mesa con la llave y la nota, máquina de escribir (guardar y curarse)
    let p = P(10, 16); caja(p.x, p.z, 3.2, 1.6, 1, mesa);
    objeto('llaveLab', p.x - .8, 1.5, p.z); objeto('notaHall', p.x + .8, 1.5, p.z);
    p = P(8, 18); caja(p.x, p.z, 1.6, 1.2, .9, mat('metal', [1, 1])); const mq = sprite(Px.lienzo('maquina', 1), 1.4, 0); mq.position.set(p.x, .9, p.z); scene.add(mq);
    interact.push({ tipo: 'maquina', x: p.x, z: p.z, r: 2.6, texto: () => 'Máquina de escribir (guardar y ver tu cuaderno)' });
    for (const [cx, cy] of [[7, 13], [13, 13], [7, 19], [13, 19]]) { const q = P(cx, cy); caja(q.x, q.z, 1.1, 1.1, ALTO, mat('madera', [1, 2])); }
    // Laboratorio
    p = P(3, 16); caja(p.x, p.z, 3.6, 1.6, 1, mat('metal', [1, 1])); for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.3, .5, .3), new THREE.MeshBasicMaterial({ color: [0x73eff7, 0xa7f070, 0xef7d57, 0xffcd75][k] })); f.position.set(p.x - 1.2 + k * .8, 1.25, p.z); scene.add(f); }
    terminal('lab', P(1, 14), 'ciencia'); mentor('lab', P(4.4, 17.2));
    // Biblioteca
    for (const cx of [8, 12]) for (const cy of [8, 9, 10]) { const q = P(cx, cy); caja(q.x + (cx === 8 ? -.7 : .7), q.z, 1.2, 2.2, 2.6, mat('libros', [1, 1])); }
    p = P(10, 9); caja(p.x, p.z, 2.4, 1.4, 1, mesa); terminal('bib', P(10, 7.6), 'mate'); mentor('bib', P(11.1, 10.4));
    // Sala de servidores
    for (const cy of [14, 15, 17, 18]) { const q = P(19, cy); caja(q.x, q.z, 1.2, 1.4, 2.4, mat('metal', [1, 2])); }
    terminal('serv', P(16.2, 14.2), 'tec'); mentor('serv', P(17.6, 17.4));
    // Taller
    p = P(10, 23); caja(p.x, p.z, 3.4, 1.6, .9, mat('concreto', [1, 1])); terminal('taller', P(8.3, 21.2), 'ing'); mentor('taller', P(11.5, 24.2));
    // Torre: Don Promedio
    const dp = sprite(Px.lienzo('promedio', 1), 3.4, 0); const q = P(10, 3); dp.position.set(q.x, 0, q.z); scene.add(dp);
    interact.push({ tipo: 'promedio', x: q.x, z: q.z, r: 3.2, texto: () => 'Enfrentar a Don Promedio' });
    luces.torre.color.set(0x8a2c3f);
  }
  function objeto(id, x, y, z) { if (tiene(id)) return; const o = OBJ[id], s = sprite(Px.lienzo(o.spr, 1), .6, .5); s.position.set(x, y, z); scene.add(s); const it = { tipo: 'objeto', id, x, z, r: 2.4, s, texto: () => 'Tomar: ' + o.n, y0: y }; interact.push(it); anim.push(t => { s.position.y = y + Math.sin(t * 2.4) * .08; }); }
  function terminal(sala, c, reg) { const m = caja(c.x, c.z, 1.1, .8, 1.1, mat('metal', [1, 1])); const pan = new THREE.Mesh(new THREE.PlaneGeometry(.8, .5), pantalla('?')); pan.position.set(c.x, 1.45, c.z + (sala === 'serv' ? 0 : .42)); pan.rotation.x = -.3; scene.add(pan); pan.position.y = 1.35;
    interact.push({ tipo: 'terminal', sala, reg, x: c.x, z: c.z, r: 2.6, texto: () => S.hist.cierre[reg] ? 'Portal (isla a salvo)' : 'Portal a la isla de ' + ({ ciencia: 'Ciencia', mate: 'Mates', tec: 'Tecnología', ing: 'Ingeniería' })[reg] }); }
  function mentor(sala, c) { const mid = ROOMS[sala].mentor, m = MENTORES[mid], im = IMGS[mid], s = sprite(im && im.complete && im.naturalWidth ? lienzoDe(im) : figura(m.cara, m.traje), 2.3, 0); s.position.set(c.x, 0, c.z); scene.add(s); const aura = new THREE.PointLight(0xffe9a8, .7, 5, 1.6); aura.position.set(c.x, 1.6, c.z); scene.add(aura);
    interact.push({ tipo: 'mentor', sala, x: c.x, z: c.z, r: 2.8, texto: () => 'Hablar con ' + m.nombre }); anim.push(t => { s.scale.y = 2.3 * (1 + Math.sin(t * 1.6) * .012); }); }
  const regionHecha = reg => ACTS.filter(a => a.reg === reg).every(a => S.acts.includes(a.id));

  /* ---------- Dudas (fantasmas que persiguen) ---------- */
  function sembrarDudas() {
    Object.keys(DUDAS).forEach(sala => DUDAS[sala].forEach((d, i) => { const id = sala + i; if (estado().dudasOk.includes(id)) return;
      const r = ROOMS[sala], s = sprite(Px.lienzo('duda', 1), 1.5, 0); const px = (r.x0 + 1 + (i ? 3 : 0)) * CELDA, pz = (r.y0 + 1 + (i ? 3 : 0)) * CELDA; s.position.set(px, .2, pz); scene.add(s); s.material.opacity = .92;
      dudas.push({ id, sala, d, s, x: px, z: pz, base: { x: px, z: pz }, fase: Math.random() * 6, cd: 0 }); }));
  }
  function actualizarDudas(dt, t) {
    const sa = salaDe(jug.x, jug.z);
    dudas.forEach(u => {
      if (!u.s.visible) return; const enSala = sa === u.sala && !luzOn(u.sala); u.s.position.y = .2 + Math.sin(t * 2 + u.fase) * .15;
      const dx = jug.x - u.x, dz = jug.z - u.z, dist = Math.hypot(dx, dz);
      if (enSala && dist < 8) { const v = 1.05 * dt; u.x += dx / dist * v; u.z += dz / dist * v; } else { u.x += Math.sin(t * .6 + u.fase) * .004; u.z += Math.cos(t * .5 + u.fase) * .004; }
      u.s.position.x = u.x; u.s.position.z = u.z; u.cd -= dt;
      if (enSala && dist < 1.25 && u.cd <= 0 && !bloqueado()) { u.cd = 3; preguntar(u); }
    });
  }
  const luzOn = sala => !!(ROOMS[sala].reg && S.hist.cierre[ROOMS[sala].reg]);
  const FRASES_DUDA = ['«Esto es muy difícil para ti.»', '«Mejor déjalo, no es lo tuyo.»', '«Los demás ya lo saben. ¿Y tú?»', '«¿Y si te equivocas?»', '«Seguro no te sale.»', '«Para qué lo intentas…»'];
  let fraseI = Math.floor(Math.random() * FRASES_DUDA.length);
  function preguntar(u) {
    const reg = ROOMS[u.sala].reg, q = Guion.pregunta(reg, 'm'), orden = q.o.map((t, i) => ({ t, ok: i === q.ok })).sort(() => Math.random() - .5);
    const m = MENTORES[ROOMS[u.sala].mentor], conoce = !!estado().mentores[u.sala], frase = FRASES_DUDA[fraseI++ % FRASES_DUDA.length];
    modal(`<div class="duda-ui"><div class="escena" aria-hidden="true"><img class="px" src="${Px.url('duda', 6)}" width="84" height="84" alt=""></div><p class="frase" style="font-size:.7rem">${frase}</p><p class="frase" style="font-size:.62rem;color:var(--cian,#73eff7)">Demuéstrale que sí puedes:</p><p class="frase" style="font-size:1.05rem!important">${q.q}</p>
      <div class="opts" id="dudaOps">${orden.map(o => `<button data-ok="${o.ok ? 1 : 0}">${o.t}</button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn gh" id="dudaAyuda">${conoce ? 'Pedir ánimo a ' + m.nombre.split(' ')[0] : 'Aún no conoces al mentor de esta sala'}</button></div><div id="dudaPista" class="listo" hidden></div></div>`);
    const ops = document.querySelectorAll('#dudaOps button');
    ops.forEach(b => b.onclick = () => {
      ops.forEach(x => x.disabled = true);
      if (b.dataset.ok === '1') { b.classList.add('ok'); estado().dudasOk.push(u.id); save(); setTimeout(() => { closeModal(); disolver(u); }, 650); }
      else { b.classList.add('no'); ops.forEach(x => { if (x.dataset.ok === '1') x.classList.add('ok'); }); const el = document.getElementById('dudaPista'); el.hidden = false; el.innerHTML = `Casi. ${q.p} <button class="btn" id="dudaSigue" style="margin-top:8px">Seguir</button>`; perder(); u.cd = 30; u.x = u.base.x; u.z = u.base.z;
        const sg = document.getElementById('dudaSigue'); if (sg) sg.onclick = () => closeModal(); }
    });
    const ay = document.getElementById('dudaAyuda'); ay.onclick = () => { if (!conoce) { toast('Habla primero con el mentor de la sala'); return; } const el = document.getElementById('dudaPista'); el.hidden = false; el.textContent = Guion.linea(reg, 'entra'); };
  }
  function disolver(u) { u.s.visible = false; dudas = dudas.filter(x => x !== u); scene.remove(u.s); toast('¡Duda resuelta!'); hudActualiza(); }
  function perder() { const e = estado(); e.vidas = Math.max(0, e.vidas - 1); save(); hudActualiza(); if (!reducir()) { contenedor.classList.add('golpe'); setTimeout(() => contenedor.classList.remove('golpe'), 350); }
    if (e.vidas <= 0) setTimeout(() => { closeModal(); desmayo(); }, 700); }
  function desmayo() { const e = estado(); e.vidas = 3; save(); const p = P(10, 16); jug.x = p.x; jug.z = p.z + 2; jug.ry = Math.PI; dudas.forEach(u => { u.x = u.base.x; u.z = u.base.z; }); hudActualiza();
    Historia.mostrar([{ q: 'chispa', t: 'Te desmayaste… ¡pero estás bien! Te traje al vestíbulo. Las Dudas no se vencen con miedo: se vencen preguntando.' }, { q: 'chispa', t: 'Habla con el mentor de la sala. Sus historias reales te dan la pista.' }]); }

  /* ---------- Interacciones ---------- */
  function cercano() { let mejor = null, md = 99; const fx = -Math.sin(jug.ry), fz = -Math.cos(jug.ry);
    interact.forEach(it => { if (it.tipo === 'objeto' && !it.s.visible) return; const dx = it.x - jug.x, dz = it.z - jug.z, d = Math.hypot(dx, dz); if (d > it.r) return; const dot = (dx * fx + dz * fz) / (d || 1); if (d > 1.4 && dot < .35) return; if (d < md && (!it.texto || it.texto())) { md = d; mejor = it; } }); return mejor; }
  function actuar() {
    if (bloqueado() || !activo) return; const it = cercano(); if (!it) return;
    if (it.tipo === 'objeto') { estado().items.push(it.id); save(); it.s.visible = false; scene.remove(it.s); interact.splice(interact.indexOf(it), 1); toast('Tomaste: ' + OBJ[it.id].n); hudActualiza();
      if (it.id === 'notaHall') Historia.mostrar([{ q: 'narrador', t: 'La nota dice: «Cada sala guarda una isla. Cada isla, una Duda. No les temas: pregunta».' }, { q: 'chispa', t: 'Tienes la llave del Laboratorio: a la izquierda del vestíbulo.' }]); return; }
    if (it.tipo === 'puerta') { const p = it.puerta; if (p.abierta) return; if (p.req === 'emblemas' ? emblemas() >= 4 : tiene(p.req)) { abrir(p); } else Historia.mostrar([{ q: 'chispa', t: p.req === 'emblemas' ? 'Sellada. Necesita los 4 emblemas: uno por cada sala.' : 'Cerrada con llave. ' + ({ llaveLab: 'Busca la Llave del Laboratorio en la mesa del vestíbulo.', llaveBib: 'Resuelve la terminal del Laboratorio y te darán la llave.', tarjetaServ: 'Resuelve la terminal de la Biblioteca para conseguir la tarjeta.', llaveTaller: 'Resuelve la terminal de la Sala de Servidores para tener la llave.' })[p.req] }]); return; }
    if (it.tipo === 'mentor') { const sala = ROOMS[it.sala], m = MENTORES[sala.mentor], primera = !estado().mentores[it.sala]; estado().mentores[it.sala] = true; save();
      if (primera) Historia.mostrar([...Guion.MENT[sala.reg].hola.map(t => ({ q: sala.mentor, t })), { q: 'chispa', t: 'Usa la terminal de esta sala: es el portal a su isla. ¡Y ' + m.nombre.split(' ')[0] + ' irá contigo!' }]);
      else Historia.mostrar([{ q: sala.mentor, t: Guion.linea(sala.reg, 'entra') }]);
      hudActualiza(); return; }
    if (it.tipo === 'terminal') { portal(it); return; }
    if (it.tipo === 'maquina') { const e = estado(); e.vidas = 3; e.x = jug.x; e.z = jug.z; e.ry = jug.ry; save(); hudActualiza(); modal(`<h2 class="center">Máquina de escribir</h2><p class="frase" style="font-size:.7rem">Progreso guardado y ánimo recuperado.</p>${Historia.cuaderno()}<div class="row" style="justify-content:center"><button class="btn" onclick="closeModal()">Seguir</button></div>`); return; }
    if (it.tipo === 'promedio') {
      if (emblemas() < 4) { Historia.mostrar([{ q: 'promedio', t: 'Jo, jo… Aún no tienes los cuatro emblemas. Vuelve cuando sepas preguntar.' }]); return; }
      const pelear = () => Arena.jugar('int', ok => { if (ok) finalMansion(); });
      if (!S.hist.intro.int) { S.hist.intro.int = true; save(); Historia.mostrar(Historia.INTRO.int, pelear); } else pelear();
    }
  }
  const NOMBRE_SALA = { ciencia: 'Laboratorio', mate: 'Biblioteca', tec: 'Sala de Servidores', ing: 'Taller' };
  function portal(it) { // la terminal de cada sala es un portal a su isla: allí está el combate y el jefe
    const reg = it.reg, nombre = MENTORES[ROOMS[it.sala].mentor].nombre.split(' ')[0];
    if (S.hist.cierre[reg]) { toast('Esta isla ya está a salvo'); return; }
    if (!estado().mentores[it.sala]) { Historia.mostrar([{ q: 'chispa', t: 'La terminal es un portal a la isla. Antes habla con ' + nombre + ': te ayudará allá.' }]); return; }
    const ir = () => Arena.jugar(reg, ok => { if (ok) cerrarSala(reg); });
    if (!S.hist.intro[reg]) { S.hist.intro[reg] = true; save(); Historia.mostrar(Historia.INTRO[reg], ir); } else ir();
  }
  function cerrarSala(reg) { // isla salvada: dato real, tu duda y el premio (llave y emblema) para seguir avanzando
    S.hist.cierre[reg] = true; save();
    Historia.mostrar(Historia.CIERRE[reg], () => Guion.reflexion(reg, () => {
      (PREMIO[reg] || []).forEach(id => { if (!tiene(id)) { estado().items.push(id); toast('Conseguiste: ' + OBJ[id].n); } }); save(); hudActualiza();
      Historia.mostrar([{ q: 'chispa', t: reg === 'ing' ? '¡Las cuatro islas están a salvo! La Torre se abrió.' : 'Tienes una llave nueva. Busca la siguiente puerta.' }]);
    }));
  }
  function finalMansion() {
    S.hist.cierre.int = true; save();
    Historia.mostrar(Historia.FINAL_JUEGO, () => Guion.carta(() => { salir(); render(); go('inicio'); }));
  }
  function abrir(p) { p.abierta = true; estado().abiertas[p.id] = true; save(); toast('Puerta abierta'); if (reducir()) p.mesh.position.y = ALTO * 1.5; else anim.push(function mover(t, dt) { p.mesh.position.y += dt * 3.2; if (p.mesh.position.y > ALTO * 1.5) { const i = anim.indexOf(mover); if (i >= 0) anim.splice(i, 1); } }); }
  function tras(reg) { // un reto de la terminal terminó
    closeModal(); const sala = REG2SALA[reg];
    if (regionCompleta(reg) && !S.hist.cierre[reg]) { S.hist.cierre[reg] = true; save(); Historia.mostrar(Historia.CIERRE[reg], () => { (PREMIO[reg] || []).forEach(id => { if (!tiene(id)) { estado().items.push(id); toast('Conseguiste: ' + OBJ[id].n); } }); save(); hudActualiza(); }); }
    else toast('¡Bien! Sigue con la terminal'); hudActualiza();
  }
  function luz(reg) { const sala = REG2SALA[reg]; const l = luces[sala]; if (!l) return; if (reducir()) { l.intensity = 1.2; return; } let t0 = 0; anim.push(function f(t, dt) { t0 += dt; l.intensity = Math.min(1.2, t0 * 1.4); if (l.intensity >= 1.2) { const i = anim.indexOf(f); if (i >= 0) anim.splice(i, 1); } }); }

  /* ---------- Movimiento y colisiones ---------- */
  const salaDe = (x, z) => { const cx = Math.floor(x / CELDA), cy = Math.floor(z / CELDA); return (celdas[cy] && celdas[cy][cx]) || '#'; };
  function libre(x, z) { const r = .42; for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r], [r * .7, r * .7], [-r * .7, -r * .7], [r * .7, -r * .7], [-r * .7, r * .7]]) { const cx = Math.floor((x + dx) / CELDA), cy = Math.floor((z + dz) / CELDA), c = celdas[cy] && celdas[cy][cx]; if (!c || c === '#') return false; if (c === 'puerta') { const p = puertas.find(q => q.x === cx && q.y === cy); if (p && !p.abierta) return false; } }
    for (const o of obstaculos) if (x + r > o.x0 && x - r < o.x1 && z + r > o.z0 && z - r < o.z1) return false; return true; }
  function mover(dt) {
    if (bloqueado()) return; const f = (tec.w || tec.ArrowUp ? 1 : 0) - (tec.s || tec.ArrowDown ? 1 : 0) + joy.y, l = (tec.d ? 1 : 0) - (tec.a ? 1 : 0) + joy.x;
    if (tec.ArrowLeft) jug.ry += 1.9 * dt; if (tec.ArrowRight) jug.ry -= 1.9 * dt;
    const m = Math.hypot(f, l); if (!m) return; const k = Math.min(1, m) * 3.1 * dt / m, fx = -Math.sin(jug.ry), fz = -Math.cos(jug.ry), rx = Math.cos(jug.ry), rz = -Math.sin(jug.ry);
    const nx = jug.x + (fx * f + rx * l) * k, nz = jug.z + (fz * f + rz * l) * k; if (libre(nx, jug.z)) jug.x = nx; if (libre(jug.x, nz)) jug.z = nz; jug.paso += dt * 8;
  }

  /* ---------- Interfaz (HUD) y controles ---------- */
  function montarHud() {
    contenedor = document.createElement('div'); contenedor.id = 'mansion'; contenedor.hidden = true;
    contenedor.innerHTML = `<canvas id="m-lienzo" aria-label="Mansión Neuron en primera persona"></canvas><div class="m-vineta" aria-hidden="true"></div>
      <div class="m-sup"><div class="m-vidas" id="mVidas" aria-label="Ánimo"></div><div class="m-btns"><button class="tool" id="mMenu" aria-label="Menú del juego">☰</button><button class="tool" id="mSalir" aria-label="Salir de la mansión">✕</button></div></div>
      <div class="m-obj" id="mObj" aria-live="polite"></div><div class="m-mira" aria-hidden="true">+</div><div class="m-aviso" id="mAviso" aria-live="polite"></div><div class="m-items" id="mItems" aria-label="Objetos"></div>
      <div class="m-joy" id="mJoy" aria-label="Palanca para moverte"><i></i></div><button class="m-actuar" id="mActuar" aria-label="Actuar">A</button>`;
    document.body.append(contenedor);
    hud = { vidas: contenedor.querySelector('#mVidas'), obj: contenedor.querySelector('#mObj'), aviso: contenedor.querySelector('#mAviso'), items: contenedor.querySelector('#mItems'), lienzo: contenedor.querySelector('#m-lienzo'), joy: contenedor.querySelector('#mJoy') };
    contenedor.querySelector('#mSalir').onclick = salir; contenedor.querySelector('#mMenu').onclick = () => { if (!bloqueado()) menuJuego(); }; contenedor.querySelector('#mActuar').onclick = actuar;
    mochila = () => { if (bloqueado()) return; modal(`<h2 class="center">Mochila</h2><div class="inv">${estado().items.map(id => `<div class="inv-it">${Px.ico(OBJ[id].spr, 36)}<span>${OBJ[id].n}</span></div>`).join('') || '<p class="small center">Aún no tienes objetos.</p>'}</div>${Historia.cuaderno()}<div class="row" style="justify-content:center"><button class="btn" onclick="closeModal()">Seguir</button></div>`); };
    ayuda = () => { if (bloqueado()) return; modal('<h2 class="center">Cómo jugar</h2><ol class="hist"><li><span class="n">1</span>Mueve la palanca (o W A S D) para caminar.</li><li><span class="n">2</span>Arrastra el dedo (o el mouse) para mirar.</li><li><span class="n">3</span>Toca A (o la tecla E) para actuar: tomar, abrir, hablar, usar terminales.</li><li><span class="n">4</span>Las Dudas te persiguen. Habla con los mentores para saber cómo responderlas.</li></ol><div class="row" style="justify-content:center"><button class="btn" onclick="closeModal()">Entendido</button></div>'); };
    // palanca táctil
    const j = hud.joy, knob = j.firstElementChild; let id = null;
    const mueve = e => { const r = j.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } joy = { x: dx, y: -dy }; knob.style.transform = `translate(${dx * 34}px,${dy * 34}px)`; };
    j.addEventListener('pointerdown', e => { id = e.pointerId; j.setPointerCapture(id); mueve(e); }); j.addEventListener('pointermove', e => { if (e.pointerId === id) mueve(e); });
    const fin = e => { if (e.pointerId === id) { id = null; joy = { x: 0, y: 0 }; knob.style.transform = ''; } }; j.addEventListener('pointerup', fin); j.addEventListener('pointercancel', fin);
    // mirar arrastrando (toque o mouse)
    hud.lienzo.addEventListener('pointerdown', e => { mira = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { hud.lienzo.setPointerCapture(e.pointerId); } catch { /* sin captura */ } });
    hud.lienzo.addEventListener('pointermove', e => { if (document.pointerLockElement === hud.lienzo) { jug.ry -= e.movementX * .0024; jug.rx = Math.max(-.9, Math.min(.9, jug.rx - e.movementY * .0024)); return; } if (!mira || e.pointerId !== mira.id || bloqueado()) return; jug.ry -= (e.clientX - mira.x) * .006; jug.rx = Math.max(-.9, Math.min(.9, jug.rx - (e.clientY - mira.y) * .004)); mira.x = e.clientX; mira.y = e.clientY; });
    ['pointerup', 'pointercancel'].forEach(ev => hud.lienzo.addEventListener(ev, () => { mira = null; }));
    hud.lienzo.addEventListener('click', () => { if (!('ontouchstart' in window) && !bloqueado() && !document.pointerLockElement && hud.lienzo.requestPointerLock) hud.lienzo.requestPointerLock(); });
    document.addEventListener('keydown', e => { if (!activo) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; tec[k] = true; if ((k === 'e' || k === ' ') && !e.repeat) { e.preventDefault(); actuar(); } });
    document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; tec[k] = false; });
  }
  const iconoCorazon = (lleno) => `<img class="px" src="${Px.url('corazon', 2)}" width="24" height="22" alt="" style="${lleno ? '' : 'filter:grayscale(1) brightness(.5)'}">`;
  function hudActualiza() {
    if (!hud.vidas) return; const e = estado(); hud.vidas.innerHTML = [0, 1, 2].map(i => iconoCorazon(i < e.vidas)).join('');
    hud.items.innerHTML = e.items.map(id => `<span title="${OBJ[id].n}">${Px.ico(OBJ[id].spr, 24, OBJ[id].n)}</span>`).join('');
    const sig = ['ciencia', 'mate', 'tec', 'ing'].find(r => !S.hist.cierre[r]);
    const sala = sig && REG2SALA[sig], mnt = sala && ROOMS[sala].mentor;
    hud.obj.textContent = !tiene('llaveLab') ? 'Toma la llave de la mesa.' : sig ? (estado().mentores[sala] ? 'Usa el portal de la sala: ' + NOMBRE_SALA[sig] + '.' : 'Habla con ' + MENTORES[mnt].nombre.split(' ')[0] + ' en la sala: ' + NOMBRE_SALA[sig] + '.') : S.hist.final ? '¡Caso cerrado!' : 'Ve a la Torre de Don Promedio.';
  }

  /* ---------- Ciclo del juego ---------- */
  function ajustar() { if (!renderer) return; const w = contenedor.clientWidth || innerWidth, h = contenedor.clientHeight || innerHeight; renderer.setSize(Math.max(160, Math.floor(w / RES)), Math.max(120, Math.floor(h / RES)), false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function iniciar3D() {
    renderer = new THREE.WebGLRenderer({ canvas: hud.lienzo, antialias: false, powerPreference: 'high-performance' }); renderer.setPixelRatio(1);
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060f); scene.fog = new THREE.Fog(0x05060f, 2, 17);
    camera = new THREE.PerspectiveCamera(72, 1, .1, 40); camera.rotation.order = 'YXZ'; scene.add(camera);
    scene.add(new THREE.AmbientLight(0x4a5070, .55));
    linterna = new THREE.SpotLight(0xfff1c8, 1.6, 16, .62, .55, 1.2); linterna.position.set(0, 0, 0); camera.add(linterna); const tg = new THREE.Object3D(); tg.position.set(0, 0, -5); camera.add(tg); linterna.target = tg;
    chispaLuz = new THREE.PointLight(0xffd070, .6, 6, 1.8); chispaLuz.position.set(.55, -.2, -1.1); camera.add(chispaLuz);
    chispaSpr = sprite(Px.lienzo('chispa', 1), .34, .5); chispaSpr.position.set(.55, -.2, -1.1); chispaSpr.material.fog = false; chispaSpr.material.depthTest = false; chispaSpr.renderOrder = 10; camera.add(chispaSpr);
    construir(); amueblar(); sembrarDudas();
    const e = estado(), p = P(10, 17); jug.x = e.x ?? p.x; jug.z = e.z ?? p.z; jug.ry = e.ry ?? Math.PI;
    Object.keys(S.hist.cierre).forEach(r => { if (S.hist.cierre[r] && REG2SALA[r]) luces[REG2SALA[r]].intensity = 1.2; });
    addEventListener('resize', ajustar); listo = true;
  }
  function bucle(ms) {
    if (!activo) return; raf = requestAnimationFrame(bucle); const t = ms / 1000, dt = Math.min(.05, reloj ? t - reloj : .016); reloj = t;
    mover(dt); anim.slice().forEach(f => f(t, dt)); actualizarDudas(dt, t);
    camera.position.set(jug.x, 1.6 + Math.sin(jug.paso) * (reducir() ? 0 : .03), jug.z); camera.rotation.set(jug.rx, jug.ry, 0);
    if (chispaSpr) { chispaSpr.position.y = -.2 + Math.sin(t * 2.6) * .03; }
    const c = bloqueado() ? null : cercano(); hud.aviso.textContent = c ? c.texto() : ''; hud.aviso.classList.toggle('on', !!c);
    renderer.render(scene, camera);
  }
  function entrar() {
    if (!window.THREE) { toast('Tu navegador no pudo cargar el 3D'); return; }
    if (!contenedor) montarHud(); contenedor.hidden = false; document.body.classList.add('en-mansion'); activo = true; reloj = null; if (!('ontouchstart' in window)) toast('Haz clic para mirar con el mouse. ESC suelta el cursor.');
    if (!listo) iniciar3D(); ajustar(); hudActualiza(); cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
    if (!estado().intro) { estado().intro = true; save(); Historia.mostrar([{ q: 'chispa', t: '¡Me encontraste! Soy Chispa: lo último que queda de la luz de Isla Neuron.' }, { q: 'chispa', t: 'Cada sala de esta Mansión guarda una isla. Y en cada una hay alguien que también dudó de sí mismo… y siguió.' }, { q: 'chispa', t: 'Yo te alumbro. Muévete con WASD o la palanca y actúa con E. Toma la llave de la mesa.' }]); }
  }
  function salir() { activo = false; cancelAnimationFrame(raf); if (document.pointerLockElement) document.exitPointerLock(); if (contenedor) contenedor.hidden = true; document.body.classList.remove('en-mansion'); const e = estado(); e.x = jug.x; e.z = jug.z; e.ry = jug.ry; save(); }
  // Cuando la historia enciende una isla, la sala correspondiente también se ilumina
  if (typeof Mundo !== 'undefined') { const enc = Mundo.encender; Mundo.encender = (id, sil) => { enc(id, sil); luz(id); }; const fin = Mundo.final; Mundo.final = () => { fin(); Object.keys(luces).forEach(k => { luces[k].intensity = 1.2; }); }; }
  return { entrar, salir, tras, luz, activo: () => activo, mochila: () => mochila(), ayuda: () => ayuda(), _tp: (x, z, ry) => { jug.x = x; jug.z = z; if (ry !== undefined) jug.ry = ry; }, _estado: () => ({ x: jug.x, z: jug.z, sala: salaDe(jug.x, jug.z), dudas: dudas.length }) };
})();

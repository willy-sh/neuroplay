/* NEUROPLAY · arena.js
   Combate de acción en tiempo real visto desde arriba, inspirado en Mageseeker: te mueves, atacas con tu báculo-linterna,
   esquivas, debilitas a las Nieblas del promedio y ABSORBES su magia (cadena de luz) para cargar un poder especial propio
   de cada isla. Entre oleadas aparece un cristal de pregunta STEM (ciencia, tecnología, ingeniería, mates y datos).
   Al ganar se desbloquea un archivo con un dato REAL (INEGI, CONEVAL, OCDE) y se abre la isla con sus retos.
   Todo corre en el navegador (Phaser 3), sin servidor; se juega con teclado o con joystick y botones táctiles. */
const Arena = (() => {
  const W = 360, H = 560, X0 = 22, X1 = W - 22, Y0 = 72, Y1 = H - 36;
  const CFG = {
    ciencia: { n: 'Laboratorio', olas: [[3, 0], [3, 1]], esp: ['Rayo de luz', 'rayo'], tip: 'Los experimentos encienden la luz.', jefe: { n: 'La Duda del Laboratorio', hp: 22, tinte: 0x14c9c1, habla: ['¿Y si esto es muy difícil?', '¿Seguro que sabes?', 'Quizá sí puedo aprender…'] } },
    mate: { n: 'Biblioteca de Números', olas: [[3, 1], [4, 2]], esp: ['Cristales', 'cristales'], tip: 'Los patrones abren camino.', jefe: { n: 'La Duda de los Números', hp: 22, tinte: 0xb48cff, habla: ['Las mates no son para ti…', '¿Y si me equivoco?', 'Equivocarse también enseña…'] } },
    tec: { n: 'Sala de Servidores', olas: [[3, 2], [4, 2]], esp: ['Pulso hackeo', 'pulso'], tip: 'Un buen algoritmo ordena el caos.', jefe: { n: 'La Duda de la Señal', hp: 22, tinte: 0x5b8cff, habla: ['No tienes lo necesario…', '¿Sin internet? Imposible…', 'Con poco también se puede…'] } },
    ing: { n: 'Taller de Puentes', olas: [[4, 2], [4, 3]], esp: ['Martillazo', 'martillo'], tip: 'Construir es resolver problemas.', jefe: { n: 'La Duda del Taller', hp: 24, tinte: 0xffa24a, habla: ['Eso no es para ti…', 'Nadie te va a ayudar…', 'Juntos se construye más…'] } },
    int: { n: 'Torre de Don Promedio', olas: [[3, 2], [4, 3]], esp: ['Luz de datos', 'datos'], tip: 'Un promedio esconde diferencias.', jefe: { n: 'Don Promedio', hp: 36, villano: true, habla: ['Todo está parejo…', '¿Y eso qué?', 'Mi número… se está cayendo…'] } },
  };

  const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $a = () => document.getElementById('arena');
  const el = id => document.getElementById(id);
  let E = null, ARTE = {}, escucha = null, alFin = null;

  /* ---------- datos reales que se desbloquean al ganar ---------- */
  function dato(id) {
    const m = D.municipio, e = D.estado, c = D.coneval.municipio, ce = D.coneval.estado, aj = D.ajusteHogares, P = window.PISA, censo = 'INEGI, Censo de Población y Vivienda 2020 (cobertura municipal).';
    return {
      ciencia: { t: `El rezago educativo de Acatlán bajó de ${pc(c.rezagoEducativo['2010'])} a ${pc(c.rezagoEducativo['2020'])}. Jalisco: ${pc(ce.rezagoEducativo['2020'])}.`, f: 'CONEVAL, pobreza municipal 2010–2020 (cobertura municipal).' },
      tec: { t: `Solo ${pc(m.pctInternet)} de las viviendas tiene internet (Jalisco: ${pc(e.pctInternet)}), pero el celular llega a ${pc(m.pctCelular)}.`, f: censo },
      ing: { t: `${pc(m.pctSinComputadoraNiInternet)} de las viviendas no tiene computadora ni internet.`, f: censo },
      mate: P ? { t: `En PISA 2022 México sacó ${P.mexico.matematicas} puntos en matemáticas; el promedio de la OCDE es ${P.ocde.matematicas}.`, f: 'OCDE, PISA 2022. Es un dato nacional, no de Acatlán.' } : { t: 'Entrenar matemáticas abre muchas carreras.', f: 'Mensaje del juego.' },
      int: { t: `En las localidades con hogares, ${pc(aj.pctNoAsiste12a14)} de las personas de 12 a 14 años no asiste a la escuela. En todo Acatlán el promedio parece ${pc(m.pctNoAsiste12a14)}.`, f: 'Cálculo propio con INEGI, Censo 2020 (por localidad).' },
    }[id];
  }

  /* ---------- carga de arte (con respaldo si falta una imagen) ---------- */
  const cargaImg = ruta => new Promise(ok => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = ruta; });
  async function cargar(id) {
    const [fondo, heroe, niebla, barra, villano] = await Promise.all([`arte/fondo_${id}.jpg`, 'arte/heroe.png', 'arte/niebla.png', 'arte/barra.png', 'arte/villano.png'].map(cargaImg));
    ARTE = { fondo, heroe, niebla, barra, villano };
  }
  function lienzo(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; }
  function texturas(s) {
    const add = (k, im, fb) => s.textures.addImage(k, im || fb());
    add('fondo', ARTE.fondo, () => lienzo(W, H, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a1c5e'); g.addColorStop(1, '#05071f'); x.fillStyle = g; x.fillRect(0, 0, w, h); }));
    add('heroe', ARTE.heroe, () => lienzo(40, 50, (x) => { x.fillStyle = '#73eff7'; x.fillRect(8, 6, 24, 38); x.fillStyle = '#fff'; x.fillRect(12, 14, 6, 6); x.fillRect(22, 14, 6, 6); }));
    add('niebla', ARTE.niebla, () => lienzo(40, 34, (x) => { x.fillStyle = '#8c93a8'; x.beginPath(); x.arc(20, 18, 15, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillRect(12, 14, 5, 5); x.fillRect(23, 14, 5, 5); }));
    add('barra', ARTE.barra, () => lienzo(40, 44, (x) => { x.fillStyle = '#8c93a8'; x.fillRect(6, 14, 10, 28); x.fillRect(18, 6, 10, 36); x.fillStyle = '#ef476f'; x.fillRect(20, 14, 6, 6); }));
    add('villano', ARTE.villano, () => lienzo(60, 80, (x) => { x.fillStyle = '#6f7f9f'; x.fillRect(12, 12, 36, 60); x.fillStyle = '#fff'; x.fillRect(20, 26, 6, 6); }));
    s.textures.addCanvas('bala', lienzo(20, 20, (x) => { const g = x.createRadialGradient(10, 10, 0, 10, 10, 10); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#73eff7'); g.addColorStop(1, 'rgba(115,239,247,0)'); x.fillStyle = g; x.fillRect(0, 0, 20, 20); }));
    s.textures.addCanvas('mala', lienzo(16, 16, (x) => { x.fillStyle = '#2b2f45'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#b0b8d4'; x.fillRect(4, 4, 8, 8); x.fillStyle = '#ef476f'; x.fillRect(7, 7, 2, 2); }));
    s.textures.addCanvas('luz', lienzo(220, 220, (x) => { const g = x.createRadialGradient(110, 110, 0, 110, 110, 110); g.addColorStop(0, 'rgba(255,240,190,.55)'); g.addColorStop(.5, 'rgba(115,239,247,.18)'); g.addColorStop(1, 'rgba(115,239,247,0)'); x.fillStyle = g; x.fillRect(0, 0, 220, 220); }));
    s.textures.addCanvas('vineta', lienzo(W, H, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, h * .28, w / 2, h / 2, h * .66); g.addColorStop(0, 'rgba(3,5,26,0)'); g.addColorStop(1, 'rgba(3,5,26,.75)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }));
  }

  /* ---------- HUD y tarjetas (HTML: accesible y nítido) ---------- */
  function hud() {
    const hp = E.hp, mx = E.hpMax;
    el('arHp').innerHTML = '♥'.repeat(Math.max(0, hp)) + '<span class="v">' + '♥'.repeat(Math.max(0, mx - hp)) + '</span>';
    el('arHp').setAttribute('aria-label', `Vida: ${hp} de ${mx}`);
    el('arEsp').textContent = '◆'.repeat(E.carga) + '◇'.repeat(3 - E.carga) + ' ' + E.cfg.esp[0] + (E.combo > 1 ? '  COMBO x' + E.combo : '');
    el('arPts').textContent = E.puntos + ' pts';
    el('arTag').textContent = S.nick || 'Explorador';
    el('bEsp').disabled = E.carga < 1;
  }
  function aviso(t) { const a = el('arAviso'); a.textContent = t; a.classList.remove('on'); void a.offsetWidth; a.classList.add('on'); }
  function tarjeta(html) { const c = el('arCard'); c.innerHTML = `<div class="in-panel">${html}</div>`; c.hidden = false; E.tarjeta = true; const b = c.querySelector('button'); if (b) b.focus({ preventScroll: true }); }
  function cierraTarjeta() { el('arCard').hidden = true; E.tarjeta = false; }

  /* ---------- efectos ---------- */
  function popup(x, y, txt, col = '#ffffff') {
    const t = E.s.add.text(x, y, txt, { fontFamily: '"Press Start 2P"', fontSize: '8px', color: col, stroke: '#000', strokeThickness: 3 }).setOrigin(.5).setDepth(40);
    E.s.tweens.add({ targets: t, y: y - 22, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }
  function onda(x, y, r, col) {
    const c = E.s.add.circle(x, y, 10, col, .22).setStrokeStyle(3, col, 1).setDepth(15);
    E.s.tweens.add({ targets: c, scale: r / 10, alpha: 0, duration: 420, ease: 'Cubic.easeOut', onComplete: () => c.destroy() });
  }
  const sacude = (ms = 120, f = .006) => { if (!quieto()) E.s.cameras.main.shake(ms, f); };
  const fit = (im, h) => im.setScale(h / im.height);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const vivos = () => E.en.getChildren().filter(e => e.active && e.estado === 'vivo');
  function cercano(fn, max) { let mejor = null, md = max; E.en.getChildren().forEach(e => { if (!e.active || !fn(e)) return; const d = dist(e, E.pj); if (d < md) { md = d; mejor = e; } }); return mejor; }

  /* ---------- escena ---------- */
  function crear() {
    const s = E.s = this; texturas(s);
    s.physics.world.setBounds(X0, Y0, X1 - X0, Y1 - Y0);
    s.add.image(W / 2, H / 2, 'fondo').setDisplaySize(W, H).setDepth(0);
    s.add.rectangle(0, 0, W, H, 0x050824, .3).setOrigin(0).setDepth(1);
    E.sombra = s.add.ellipse(W / 2, Y1 - 60, 26, 8, 0x000000, .4).setDepth(9);
    const pj = E.pj = s.physics.add.image(W / 2, Y1 - 70, 'heroe').setDepth(11); fit(pj, 46); pj.body.setSize(pj.width * .5, pj.height * .45); pj.body.setOffset(pj.width * .25, pj.height * .5); pj.setCollideWorldBounds(true);
    E.luz = s.add.image(pj.x, pj.y, 'luz').setBlendMode(Phaser.BlendModes.ADD).setDepth(12).setAlpha(.8);
    s.add.image(W / 2, H / 2, 'vineta').setDepth(50);
    E.en = s.physics.add.group(); E.balas = s.physics.add.group(); E.malas = s.physics.add.group();
    s.physics.add.collider(E.en, E.en);
    s.physics.add.overlap(E.balas, E.en, (b, e) => {
      if (!b.active || !e.active || e.estado !== 'vivo') return; if (b.hits) { if (b.hits.has(e)) return; b.hits.add(e); }
      golpear(e, b.dmg); if (!b.pierce) b.destroy();
    });
    s.physics.add.overlap(pj, E.malas, (p, m) => { if (!m.active) return; m.destroy(); danar(1); });
    s.physics.add.overlap(pj, E.en, (p, e) => { if (e.active && e.estado === 'vivo') danar(1); });
    iniciarOla(); hud();
  }

  function iniciarOla() {
    const cfg = E.cfg, par = cfg.olas[E.ola]; const [nn, nb] = par; E.pendientes = nn + nb;
    aviso(`OLEADA ${E.ola + 1} DE ${cfg.olas.length}`); el('arOla').textContent = `OLEADA ${E.ola + 1}/${cfg.olas.length}`;
    const tipos = [...Array(nn).fill('niebla'), ...Array(nb).fill('barra')].sort(() => Math.random() - .5);
    tipos.forEach((t, i) => E.s.time.delayedCall(500 + i * 380, () => {
      if (E.fin) return; let x, y, n = 0; do { x = Phaser.Math.Between(X0 + 10, X1 - 10); y = Phaser.Math.Between(Y0 + 10, Y0 + 150); } while (dist({ x, y }, E.pj) < 130 && n++ < 12);
      spawn(t, x, y); E.pendientes--;
    }));
  }
  function spawn(tipo, x, y) {
    const s = E.s, e = s.physics.add.image(x, y, tipo === 'niebla' ? 'niebla' : 'barra').setDepth(10).setAlpha(0);
    fit(e, tipo === 'niebla' ? 34 : 40); e.body.setSize(e.width * .6, e.height * .6); e.tipo = tipo; e.hp = tipo === 'niebla' ? 3 : 4; e.estado = 'nace'; e.cd = 900 + Math.random() * 1200; e.lento = 0;
    E.en.add(e); e.setCollideWorldBounds(true);
    const aro = s.add.circle(x, y, 20).setStrokeStyle(2, 0xffffff, .9).setDepth(2);
    s.tweens.add({ targets: aro, scale: { from: 1.8, to: .4 }, alpha: { from: .9, to: 0 }, duration: 520, onComplete: () => aro.destroy() });
    s.time.delayedCall(520, () => { if (e.active) { e.estado = 'vivo'; e.setAlpha(1); } });
    return e;
  }
  function empezarJefe() {
    const s = E.s, cj = E.cfg.jefe; E.jefeIniciado = true; el('arOla').textContent = 'JEFE'; aviso(cj.n.toUpperCase()); Sfx.especial();
    const j = s.physics.add.image(W / 2, Y0 + 24, cj.villano ? 'villano' : 'niebla').setDepth(10); fit(j, cj.villano ? 96 : 92); if (!cj.villano) j.setTint(cj.tinte);
    j.body.setSize(j.width * .7, j.height * .8); j.tipo = 'jefe'; j.estado = 'vivo'; j.hpMax = j.hp = Math.round(cj.hp * (E.calm ? .75 : 1)); j.cd = 1800; j.n = 0; j.fase = 1; j.tramo = 0; j.reintento = 1500;
    E.jefe = j; E.en.add(j); j.setImmovable(true); j.setCollideWorldBounds(true);
    el('arJefe').style.display = 'block'; el('arJefe').setAttribute('aria-label', cj.n); habla(j, cj.habla[0]); subeEscudo(j, true);
  }
  function subeEscudo(j, primero) { // el escudo se rompe resolviendo un ejercicio; reaparece en cada tramo de vida del jefe
    j.escudo = true; j.reintento = primero ? 1500 : 1200;
    if (!j.escudoGfx) j.escudoGfx = E.s.add.circle(j.x, j.y, j.displayHeight * .62, 0x73eff7, .14).setStrokeStyle(3, 0x73eff7, 1).setDepth(12);
    j.escudoGfx.setAlpha(1).setVisible(true); if (!primero) { onda(j.x, j.y, 150, 0x73eff7); Sfx.especial(); aviso('¡ESCUDO!'); habla(j, E.cfg.jefe.habla[Math.min(2, j.tramo)]); }
  }
  function pedirEscudo() {
    const j = E.jefe; if (!j || !j.active || E.fin || !j.escudo) return; if (E.tarjeta) { j.reintento = 700; return; } j.reintento = 0;
    ejercicio('Escudo de ' + E.cfg.jefe.n + ': ¡rómpelo!', ok => { if (ok) rompeEscudo(); else { j.reintento = 5000; popup(j.x, j.y - 70, 'El escudo sigue', '#ffcd75'); } });
  }
  function rompeEscudo() {
    const j = E.jefe; if (!j) return; j.escudo = false; E.xp += 15; E.puntos += 100; Sfx.especial(); onda(j.x, j.y, 190, 0xffffff); sacude(200, .012); aviso('¡ESCUDO ROTO!');
    if (j.escudoGfx) E.s.tweens.add({ targets: j.escudoGfx, alpha: 0, scale: 1.6, duration: 300, onComplete: () => j.escudoGfx && j.escudoGfx.setVisible(false).setScale(1) });
  }
  function habla(e, txt) { const t = E.s.add.text(e.x, e.y - 62, txt, { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#fff', backgroundColor: '#2b2f45', padding: { x: 5, y: 4 } }).setOrigin(.5).setDepth(45); E.s.tweens.add({ targets: t, alpha: 0, delay: 1500, duration: 500, onComplete: () => t.destroy() }); }

  /* ---------- combate ---------- */
  function danar(n) {
    if (E.inv > 0 || E.fin) return; E.hp -= n; E.inv = 1100; Sfx.dano(); sacude(160, .01); E.s.cameras.main.flash(120, 255, 60, 90, false); hud();
    popup(E.pj.x, E.pj.y - 24, '-' + n, '#ff9db5'); if (E.hp <= 0) { derrota(); return; }
    if (!E.ayudaUsada && E.hp <= Math.ceil(E.hpMax * .4)) { E.ayudaUsada = true; E.s.time.delayedCall(350, () => { if (!E.fin && !E.tarjeta) mentorDice('ayuda'); }); }
  }
  function golpear(e, n) {
    if (e.estado === 'nace' || !e.active) return;
    if (e.tipo === 'jefe' && e.escudo) { popup(e.x, e.y - 30, 'ESCUDO', '#73eff7'); if (!E.avisoEscudo) { E.avisoEscudo = true; aviso('RESUELVE EL EJERCICIO'); } return; }
    e.hp -= n; e.setTintFill(0xffffff); E.s.time.delayedCall(70, () => { if (!e.active) return; if (e.estado === 'debil') e.setTint(0x9fe8ff); else e.clearTint(); });
    popup(e.x, e.y - 22, '-' + n); Sfx.golpe();
    if (e.tipo === 'jefe') {
      const lim = e.tramo === 0 ? e.hpMax * .66 : e.tramo === 1 ? e.hpMax * .33 : 0;
      if (e.tramo < 2 && e.hp <= lim) { e.hp = lim; e.tramo++; subeEscudo(e); } else if (e.hp <= 0) { el('arJefe').firstElementChild.style.width = '0%'; derrotaJefe(); return; }
      el('arJefe').firstElementChild.style.width = Math.max(0, e.hp / e.hpMax * 100) + '%';
      e.fase = e.tramo + 1; return;
    }
    if (e.hp <= 0 && e.estado === 'vivo') debilitar(e);
  }
  function debilitar(e) {
    e.estado = 'debil'; e.fuse = 4200; e.setVelocity(0, 0); e.setTint(0x9fe8ff); E.puntos += 10; E.derrotados++; E.chispas += 1;
    E.combo = E.comboT > 0 ? E.combo + 1 : 1; E.comboT = 2600; if (E.combo >= 2) { E.puntos += 5 * E.combo; popup(e.x, e.y - 44, 'COMBO x' + E.combo, '#ffcd75'); }
    if (Math.random() < .2) soltarCorazon(e.x, e.y);
    e.anillo = E.s.add.circle(e.x, e.y, 24).setStrokeStyle(2, 0xa7f070, 1).setDepth(11);
    E.s.tweens.add({ targets: e.anillo, scale: { from: 1, to: 1.25 }, yoyo: true, repeat: -1, duration: 300 });
    if (!E.pistaAbs) { E.pistaAbs = true; popup(e.x, e.y - 30, 'ABSORBE', '#a7f070'); }
    hud();
  }
  function soltarCorazon(x, y) { // a veces un enemigo deja un corazón: recógelo para recuperar vida
    const t = E.s.add.text(x, y, '♥', { fontFamily: 'sans-serif', fontSize: '16px', color: '#ef476f', stroke: '#000', strokeThickness: 3 }).setOrigin(.5).setDepth(14);
    E.s.tweens.add({ targets: t, y: y - 6, yoyo: true, repeat: -1, duration: 420 }); E.drops.push({ o: t, v: 7000 });
  }
  function disolver(e) { if (!e.active) return; if (e.anillo) e.anillo.destroy(); e.estado = 'fin'; E.s.tweens.add({ targets: e, alpha: 0, scale: e.scale * .5, duration: 250, onComplete: () => e.destroy() }); }
  function absorber() {
    if (E.fin || E.tarjeta) return; const e = cercano(x => x.estado === 'debil', 62); if (!e) return;
    const s = E.s, g = s.add.graphics().setDepth(16); g.lineStyle(3, 0xa7f070, 1); g.beginPath(); g.moveTo(E.pj.x, E.pj.y - 10); g.lineTo(e.x, e.y); g.strokePath();
    s.tweens.add({ targets: g, alpha: 0, duration: 320, onComplete: () => g.destroy() });
    if (e.anillo) e.anillo.destroy(); e.estado = 'fin'; s.tweens.add({ targets: e, x: E.pj.x, y: E.pj.y, scale: 0, duration: 280, onComplete: () => e.destroy() });
    E.carga = Math.min(3, E.carga + 1); E.puntos += 25; E.absorbidos++; E.chispas += 2; Sfx.absorbe(); popup(E.pj.x, E.pj.y - 28, '+ESPECIAL', '#a7f070'); hud();
  }
  function disparar() {
    const s = E.s, pj = E.pj; let dx = E.cara.x, dy = E.cara.y; const t = cercano(e => e.estado === 'vivo', 9999);
    if (t) { dx = t.x - pj.x; dy = t.y - pj.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; E.cara = { x: dx, y: dy }; }
    const b = s.physics.add.image(pj.x + dx * 16, pj.y - 6 + dy * 16, 'bala').setDepth(13).setBlendMode(Phaser.BlendModes.ADD); E.balas.add(b); b.setVelocity(dx * 320, dy * 320); b.dmg = 1; b.vida = 1300; Sfx.tiro();
  }
  function disparaEnemigo(e, dx, dy, vel = 95, spread = 0) {
    const a = Math.atan2(dy, dx) + spread, m = E.s.physics.add.image(e.x, e.y, 'mala').setDepth(13); E.malas.add(m); m.setVelocity(Math.cos(a) * vel, Math.sin(a) * vel); m.vida = 4500;
  }
  function patron(j) {
    const dx = E.pj.x - j.x, dy = E.pj.y - j.y, d = Math.hypot(dx, dy) || 1, f = j.fase; j.n++;
    const abanico = k => { for (let i = -(k - 1) / 2; i <= (k - 1) / 2; i++) disparaEnemigo(j, dx / d, dy / d, 100 + f * 12, i * .28); };
    const anillo = k => { for (let i = 0; i < k; i++) disparaEnemigo(j, Math.cos(i / k * 6.283), Math.sin(i / k * 6.283), 70 + f * 10); };
    if (f === 1) abanico(5); else if (f === 2) (j.n % 2 ? abanico(5) : anillo(10)); else (j.n % 2 ? abanico(7) : anillo(12));
    if (f >= 2 && j.n % 3 === 0 && vivos().length < 5) { spawn('niebla', Phaser.Math.Between(X0 + 20, X1 - 20), Y0 + 70); }
    onda(j.x, j.y, 60, 0xb0b8d4);
  }

  /* ---------- poderes ---------- */
  function especial() {
    if (E.fin || E.tarjeta || E.carga < 1) return; E.carga--; Sfx.especial(); const s = E.s, pj = E.pj, tipo = E.cfg.esp[1], objs = E.en.getChildren().filter(e => e.active && (e.estado === 'vivo' || e.tipo === 'jefe'));
    if (tipo === 'rayo') {
      let dx = E.cara.x, dy = E.cara.y; const t = cercano(e => e.estado === 'vivo' || e.tipo === 'jefe', 9999); if (t) { dx = t.x - pj.x; dy = t.y - pj.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; }
      const ang = Math.atan2(dy, dx), r = s.add.rectangle(pj.x + dx * 300, pj.y + dy * 300, 600, 16, 0xfff7c0, .95).setRotation(ang).setDepth(15); s.tweens.add({ targets: r, alpha: 0, scaleY: .2, duration: 380, onComplete: () => r.destroy() });
      objs.forEach(e => { const vx = e.x - pj.x, vy = e.y - pj.y; if (vx * dx + vy * dy > 0 && Math.abs(vx * dy - vy * dx) < 26) golpear(e, 4); });
    } else if (tipo === 'cristales') {
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, b = s.physics.add.image(pj.x, pj.y, 'bala').setTint(0xd9a7ff).setDepth(13).setBlendMode(Phaser.BlendModes.ADD); b.setScale(1.4); E.balas.add(b); b.setVelocity(Math.cos(a) * 170, Math.sin(a) * 170); b.setBounce(1); b.setCollideWorldBounds(true); b.dmg = 2; b.pierce = true; b.hits = new Set(); b.vida = 3200; }
    } else if (tipo === 'pulso') {
      onda(pj.x, pj.y, 260, 0x73eff7); E.malas.clear(true, true); objs.filter(e => dist(e, pj) < 130).forEach(e => { golpear(e, 2); e.lento = 2600; });
    } else if (tipo === 'martillo') {
      onda(pj.x, pj.y, 210, 0xffa24a); sacude(200, .012); objs.filter(e => dist(e, pj) < 105).forEach(e => { golpear(e, 3); const d = dist(e, pj) || 1; if (e.tipo !== 'jefe') s.tweens.add({ targets: e, x: e.x + (e.x - pj.x) / d * 46, y: e.y + (e.y - pj.y) / d * 46, duration: 160 }); });
    } else {
      onda(pj.x, pj.y, 300, 0xa7f070); E.malas.clear(true, true); objs.filter(e => dist(e, pj) < 150).forEach(e => golpear(e, 3)); E.hp = Math.min(E.hpMax, E.hp + 1);
    }
    hud();
  }
  function esquivar() {
    if (E.fin || E.tarjeta || E.cdDash > 0) return; let dx = E.mx, dy = E.my; if (!dx && !dy) { dx = E.cara.x; dy = E.cara.y; }
    const d = Math.hypot(dx, dy) || 1; E.dashV = { x: dx / d, y: dy / d }; E.dash = 170; E.cdDash = E.cdDashT; E.inv = Math.max(E.inv, 320); Sfx.esquiva();
    const f = E.s.add.image(E.pj.x, E.pj.y, 'heroe').setScale(E.pj.scaleX).setAlpha(.5).setTint(0x73eff7).setDepth(10); E.s.tweens.add({ targets: f, alpha: 0, duration: 260, onComplete: () => f.destroy() });
  }

  /* ---------- mentores y ejercicios ---------- */
  const mid = () => E.id === 'int' ? ['ciencia', 'mate', 'tec', 'ing'][E.mentorN % 4] : E.id; // en la Torre acuden los cuatro mentores
  function mentorDice(motivo, cb) { // el mentor aparece unos segundos con un consejo; no detiene la pelea
    const isla = mid(), m = Guion.MENT[isla]; E.mentorN++; Guion.conocer(isla);
    const ayuda = motivo === 'ayuda'; if (ayuda) E.hp = Math.min(E.hpMax, E.hp + 2); else { E.hp = Math.min(E.hpMax, E.hp + 1); E.carga = Math.min(3, E.carga + 1); }
    let b = el('arBn'); if (!b) { b = document.createElement('div'); b.id = 'arBn'; b.className = 'ar-bn'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); $a().append(b); }
    b.innerHTML = `${Guion.retrato(m)}<div><b>${m.n}</b><p>${Guion.linea(isla, ayuda ? 'ayuda' : 'entra')}</p><small>${ayuda ? '+2 ♥' : '+1 ♥ · +1 especial'}</small></div>`;
    b.classList.remove('sale'); b.hidden = false; void b.offsetWidth; Sfx.bien(); hud();
    clearTimeout(E.bnT); E.bnT = setTimeout(() => { b.classList.add('sale'); setTimeout(() => { b.hidden = true; }, 400); }, 4600);
    if (cb) setTimeout(cb, 900);
  }
  function ejercicio(titulo, fin) { // fin(acierto): el mentor te lo plantea y reacciona a tu respuesta
    const isla = mid(), m = Guion.MENT[isla], q = Guion.pregunta(E.id); E.mentorN++; E.s.scene.pause(); E.tarjeta = true; const ord = q.o.map((t, i) => [t, i]).sort(() => Math.random() - .5);
    tarjeta(`<p class="ar-t">${titulo}</p><div class="ar-mentor">${Guion.retrato(m)}<div><p class="ar-etq">${m.n}</p><p>${Guion.linea(isla, 'escudo')}</p></div></div><h2>${q.q}</h2><div class="ar-opt">${ord.map(([t, i]) => `<button class="j-btn alt" data-i="${i}">${t}</button>`).join('')}</div><div id="arFb" role="status" aria-live="polite"></div>`);
    el('arCard').querySelectorAll('.ar-opt button').forEach(b => b.onclick = () => {
      const ok = +b.dataset.i === q.ok; el('arCard').querySelectorAll('.ar-opt button').forEach(x => { x.disabled = true; if (+x.dataset.i === q.ok) x.classList.add('bien'); }); if (!ok) b.classList.add('mal');
      if (ok) { E.puntos += 50; E.xp += 10; E.aciertos++; E.chispas += 3; Sfx.bien(); } else { Sfx.mal(); E.fallos++; }
      el('arFb').innerHTML = (ok ? `<p><b>${Guion.linea(isla, 'bien')}</b></p>` : `<p>${Guion.linea(isla, 'mal')}</p><p>La respuesta era «${q.o[q.ok]}».</p><div class="ar-dato"><b>Pista</b><br>${q.p}</div>`) + '<button class="j-btn oro" id="arSig">Seguir</button>';
      el('arSig').focus(); el('arSig').onclick = () => { cierraTarjeta(); hud(); E.s.scene.resume(); fin(ok); };
    });
  }

  /* ---------- fin de oleadas, derrota y victoria ---------- */
  function finOla() {
    E.s.time.delayedCall(300, () => {
      if (E.fin) return; const mas = E.ola < E.cfg.olas.length - 1;
      if (mas) mentorDice('ola', () => { E.ola++; iniciarOla(); });
      else if (E.cfg.jefe && !E.jefeIniciado) { aviso('¡JEFE!'); empezarJefe(); }
      else if (!E.cfg.jefe) victoria();
    });
  }
  function derrotaJefe() {
    if (E.fin) return; const j = E.jefe; E.fin = true; E.malas.clear(true, true); E.pj.setVelocity(0, 0); E.en.getChildren().forEach(e => e !== j && e.destroy()); Sfx.especial();
    habla(j, E.cfg.jefe.villano ? 'Yo no era malo… solo promediaba.' : 'Una duda no es el final…'); if (j.escudoGfx) j.escudoGfx.destroy(); E.s.tweens.add({ targets: j, alpha: 0, y: j.y - 20, duration: 1800 }); onda(j.x, j.y, 260, 0xffffff);
    setTimeout(() => victoria(true), 2000);
  }
  function derrota() {
    if (E.fin) return; E.fin = true; Sfx.pierde(); E.derrotas++; E.pj.setVelocity(0, 0); E.s.tweens.add({ targets: E.pj, alpha: 0, angle: 90, duration: 500 });
    const consuelo = Math.floor(E.chispas / 2); if (consuelo) Guion.chispas(consuelo);
    setTimeout(() => {
      tarjeta(`<h2>Las Nieblas ganaron esta vez</h2><p>Hiciste ${E.puntos} puntos${consuelo ? ' y ganaste ' + consuelo + ' ✦ chispas' : ''}. Perder no significa que no puedas: cada intento te enseña algo.</p>${E.derrotas >= 2 && !E.calm ? '<p><b>Idea:</b> prueba el Modo calmado en la pausa.</p>' : ''}
        <button class="j-btn oro" id="arRe">Reintentar</button><button class="j-btn alt" id="arSal">Salir</button>`);
      el('arRe').onclick = () => { cierraTarjeta(); arrancar(E.id, E.derrotas); }; el('arSal').onclick = () => salir(false);
    }, 700);
  }
  function victoria(jefe) {
    E.fin = true; Sfx.gana(); const p = E.hp / E.hpMax, est = p >= .7 ? 3 : p >= .4 ? 2 : 1, id = E.id, g = Guion.regalo(id);
    const prev = (S.arena && S.arena[id]) || {}; S.arena = S.arena || {}; S.arena[id] = { ok: true, estrellas: Math.max(prev.estrellas || 0, est), mejor: Math.max(prev.mejor || 0, E.puntos) };
    const primera = !prev.ok; gain(primera ? 60 + E.xp : 10, null); const ch = (primera ? 20 + est * 10 : 8 + est * 5) + E.chispas; Guion.chispas(ch);
    tarjeta(`<h2>${jefe ? '¡' + E.cfg.jefe.n + ' cayó!' : '¡Chispa recuperada!'}</h2><div class="ar-estrellas" aria-label="${est} de 3 estrellas">${'★'.repeat(est)}<span class="v">${'★'.repeat(3 - est)}</span></div>
      <p>${E.puntos} puntos · ${E.absorbidos} absorbidos${primera ? ` · +${60 + E.xp} XP` : ''} · +${ch} ✦ chispas</p>
      ${g ? `<div class="ar-regalo"><span class="ar-etq">RECUERDO GANADO</span><b>${g.n}</b><br>${g.d}</div>` : ''}
      <button class="j-btn oro" id="arOk">Continuar</button><button class="j-btn alt" id="arTa">Taller de mejoras</button>`);
    el('arOk').onclick = () => salir(true); el('arTa').onclick = () => Guion.tienda();
  }

  /* ---------- bucle ---------- */
  function actualiza(t, dt) { // un error en un cuadro no debe congelar el juego: se registra y se sigue
    try { paso(t, dt); } catch (err) { window.__arErr = err; console.error('arena:', err); }
  }
  function paso(t, dt) {
    if (!E || E.fin || E.tarjeta) return; const pj = E.pj, s = E.s;
    E.inv = Math.max(0, E.inv - dt); E.cdDash = Math.max(0, E.cdDash - dt); E.dash = Math.max(0, E.dash - dt);
    E.comboT = Math.max(0, E.comboT - dt); if (E.combo && E.comboT <= 0) { E.combo = 0; hud(); }
    for (let i = E.drops.length - 1; i >= 0; i--) {
      const d = E.drops[i]; d.v -= dt; if (!d.o.active) { E.drops.splice(i, 1); continue; } if (d.v < 1800) d.o.setAlpha(Math.floor(t / 120) % 2 ? .3 : 1);
      if (dist(d.o, pj) < 26) { E.hp = Math.min(E.hpMax, E.hp + 1); popup(d.o.x, d.o.y - 14, '+1 VIDA', '#a7f070'); Sfx.bien(); d.o.destroy(); E.drops.splice(i, 1); hud(); } else if (d.v <= 0) { d.o.destroy(); E.drops.splice(i, 1); }
    }
    el('bEsq').classList.toggle('enf', E.cdDash > 0);
    let mx = (E.k.d || E.k.ArrowRight ? 1 : 0) - (E.k.a || E.k.ArrowLeft ? 1 : 0) + E.jx, my = (E.k.s || E.k.ArrowDown ? 1 : 0) - (E.k.w || E.k.ArrowUp ? 1 : 0) + E.jy;
    const m = Math.hypot(mx, my); if (m > 1) { mx /= m; my /= m; } E.mx = mx; E.my = my;
    if (E.dash > 0) pj.setVelocity(E.dashV.x * 380, E.dashV.y * 380); else pj.setVelocity(mx * 125, my * 125);
    if (mx || my) { E.cara = { x: mx / (m || 1), y: my / (m || 1) }; if (Math.abs(mx) > .1) pj.setFlipX(mx < 0); }
    pj.setAlpha(E.inv > 0 && Math.floor(t / 80) % 2 ? .4 : 1); E.sombra.setPosition(pj.x, pj.y + 22); E.luz.setPosition(pj.x, pj.y);
    if ((E.k[' '] || E.btn.atq) && t > E.cdAtq) { disparar(); E.cdAtq = t + E.cdAtqT; }
    // enemigos
    E.en.getChildren().forEach(e => {
      if (!e.active) return;
      if (e.estado === 'debil') { e.fuse -= dt; e.setVelocity(0, 0); if (e.anillo) e.anillo.setPosition(e.x, e.y); e.setAlpha(.65 + .3 * Math.sin(t / 90)); if (e.fuse <= 0) disolver(e); return; }
      if (e.estado !== 'vivo') return;
      const dx = pj.x - e.x, dy = pj.y - e.y, d = Math.hypot(dx, dy) || 1; e.lento = Math.max(0, e.lento - dt);
      if (e.tipo === 'jefe') { if (e.escudoGfx) e.escudoGfx.setPosition(e.x, e.y); if (e.escudo && e.reintento > 0 && !E.tarjeta) { e.reintento -= dt; if (e.reintento <= 0) pedirEscudo(); } e.setVelocityX(Math.sin(t / 900) * 45 * e.fase); e.setVelocityY((Y0 + 34 - e.y) * 2); e.cd -= dt; if (e.cd <= 0) { e.cd = 2300 - e.fase * 380; patron(e); } return; }
      const v = (e.tipo === 'niebla' ? 46 + E.ola * 6 : 38) * (E.calm ? .75 : 1) * (e.lento > 0 ? .35 : 1);
      if (e.tipo === 'niebla') e.setVelocity(dx / d * v, dy / d * v);
      else { const k = d > 150 ? 1 : d < 105 ? -1 : 0; e.setVelocity((dx / d * k - dy / d * .7) * v, (dy / d * k + dx / d * .7) * v); e.cd -= dt; if (e.cd <= 0 && e.lento <= 0) { e.cd = (E.calm ? 2800 : 2100) + Math.random() * 600; disparaEnemigo(e, dx / d, dy / d, E.calm ? 70 : 90); } }
      e.setFlipX(dx < 0);
    });
    [E.balas, E.malas].forEach(g => g.getChildren().forEach(b => { if (!b.active) return; b.vida -= dt; if (b.vida <= 0 || b.x < 0 || b.x > W || b.y < 0 || b.y > H) b.destroy(); }));
    // ¿terminó la oleada?
    if (!E.cfg.jefe || !E.jefeIniciado) { if (E.pendientes <= 0 && !E.aviso && E.en.getChildren().every(e => !e.active || e.estado === 'fin')) { E.aviso = true; finOla(); } else if (E.en.getChildren().some(e => e.active && e.estado !== 'fin')) E.aviso = false; }
  }

  /* ---------- controles (teclado, joystick y botones táctiles) ---------- */
  function conectar() {
    const w = el('arWrap'), joy = el('arJoy'), base = el('arBase'), palo = el('arPalo'); let id = null, ox = 0, oy = 0;
    const tecla = (e, v) => {
      if (!E || !$a() || $a().hidden) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!v) { E.k[k] = false; return; } // al soltar siempre se limpia, aunque haya una tarjeta abierta
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k.toLowerCase()) && !E.tarjeta) e.preventDefault();
      if (E.tarjeta) return; E.k[k] = true;
      if (v) { if (k === 'Shift' || k === 'l') esquivar(); else if (k === 'e') absorber(); else if (k === 'q') especial(); else if (k === 'Escape' || k === 'p') pausar(); }
    };
    const kd = e => tecla(e, true), ku = e => tecla(e, false);
    document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
    joy.onpointerdown = e => { id = e.pointerId; joy.setPointerCapture(id); const r = joy.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top; base.style.cssText = `display:block;left:${ox}px;top:${oy}px`; palo.style.cssText = `display:block;left:${ox}px;top:${oy}px`; };
    joy.onpointermove = e => { if (e.pointerId !== id) return; const r = joy.getBoundingClientRect(), dx = e.clientX - r.left - ox, dy = e.clientY - r.top - oy, d = Math.hypot(dx, dy), k = Math.min(1, d / 46); E.jx = d > 6 ? dx / d * k : 0; E.jy = d > 6 ? dy / d * k : 0; const c = Math.min(d, 46) / (d || 1); palo.style.left = ox + dx * c + 'px'; palo.style.top = oy + dy * c + 'px'; };
    const suelta = e => { if (e.pointerId !== id) return; id = null; E.jx = E.jy = 0; base.style.display = palo.style.display = 'none'; };
    joy.onpointerup = joy.onpointercancel = suelta;
    const boton = (idb, ini, fin) => { const b = el(idb); b.onpointerdown = e => { e.preventDefault(); b.classList.add('on'); ini(); }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => { b.classList.remove('on'); fin && fin(); }; b.onkeydown = e => { if (e.key === 'Enter') ini(); }; };
    boton('bAtq', () => { E.btn.atq = true; }, () => { E.btn.atq = false; }); boton('bEsq', esquivar); boton('bAbs', absorber); boton('bEsp', especial);
    const oculta = () => { if (document.hidden) pausar(); }; document.addEventListener('visibilitychange', oculta);
    el('arPausa').onclick = pausar; escucha = () => { document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); document.removeEventListener('visibilitychange', oculta); };
  }
  function pausar() {
    if (!E || E.fin || E.tarjeta || !E.s) return; E.s.scene.pause();
    tarjeta(`<h2>Pausa</h2><label class="ar-chk"><input type="checkbox" id="pCalm" ${E.calm ? 'checked' : ''}> Modo calmado (más vida, enemigos más lentos)</label>
      <label class="ar-chk"><input type="checkbox" id="pSon" ${Sfx.activo ? 'checked' : ''}> Sonido</label>
      <p class="ar-ctl">TECLADO: WASD mover · ESPACIO atacar · SHIFT esquivar · E absorber · Q especial · ESC pausa</p>
      <button class="j-btn oro" id="pSig">Seguir</button><button class="j-btn alt" id="pSal">Salir de la arena</button>`);
    el('pCalm').onchange = e => { S.calm = e.target.checked; save(); toast(S.calm ? 'Modo calmado: se aplica al reintentar' : 'Modo calmado apagado'); };
    el('pSon').onchange = e => { S.mute = !e.target.checked; Sfx.set(!S.mute); save(); };
    el('pSig').onclick = () => { cierraTarjeta(); E.s.scene.resume(); }; el('pSal').onclick = () => salir(false);
  }

  /* ---------- ciclo de vida ---------- */
  function arrancar(id, derrotas = 0) {
    if (E && E.game) { E.game.destroy(true); }
    const cfg = CFG[id], calm = !!S.calm, nv = Guion.nivelMej, mx = (calm ? 8 : 5) + nv('vida');
    E = { id, cfg, calm, hp: mx, hpMax: mx, carga: Math.min(3, nv('especial')), cdAtqT: Math.round(250 * Math.pow(.88, nv('ataque'))), cdDashT: 750 - 150 * nv('esquiva'), combo: 0, comboT: 0, chispas: 0, drops: [], puntos: 0, xp: 0, ola: 0, qi: 0, k: {}, btn: {}, jx: 0, jy: 0, mx: 0, my: 0, inv: 0, dash: 0, cdDash: 0, cdAtq: 0, cara: { x: 0, y: -1 }, fin: false, tarjeta: false, derrotas, banco: Guion.banco(id), mentorN: 0, ayudaUsada: false, fallos: 0, absorbidos: 0, derrotados: 0, aciertos: 0, pendientes: 0, aviso: false };
    el('arJefe').style.display = 'none'; el('arJefe').firstElementChild.style.width = '100%'; cierraTarjeta();
    E.game = new Phaser.Game({ type: Phaser.AUTO, parent: 'arenaCv', width: W, height: H, pixelArt: true, antialias: false, roundPixels: true, backgroundColor: '#0b1030', banner: false, audio: { noAudio: true },
      disableVisibilityChange: true, // la pausa la manejamos nosotros (menú de pausa al ocultar la pestaña), así el juego nunca se queda congelado
      physics: { default: 'arcade', arcade: { debug: false } }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: { create: crear, update: actualiza } });
    E.pausaInicial = false; hud();
  }
  function montar() {
    $a().innerHTML = `<div class="ar-wrap" id="arWrap"><div id="arenaCv" aria-hidden="true"></div>
      <div class="ar-hud"><div><div class="ar-hp" id="arHp" role="img"></div><div class="ar-esp" id="arEsp"></div></div><div class="ar-der"><div id="arTag"></div><div id="arOla"></div><div id="arPts"></div></div></div>
      <button class="ar-pausa" id="arPausa" aria-label="Pausa">II</button><div class="ar-jefe" id="arJefe" aria-hidden="true"><i></i></div>
      <div class="ar-aviso" id="arAviso" role="status" aria-live="polite"></div>
      <div class="ar-joy" id="arJoy" aria-label="Joystick: arrastra para moverte"><div class="base" id="arBase"></div><div class="palo" id="arPalo"></div></div>
      <div class="ar-btns"><button class="ar-b esp" id="bEsp" aria-label="Poder especial">ESPECIAL</button><button class="ar-b esq" id="bEsq" aria-label="Esquivar">ESQUIVA</button><button class="ar-b abs" id="bAbs" aria-label="Absorber enemigo debilitado">ABSORBER</button><button class="ar-b atq" id="bAtq" aria-label="Atacar">ATAQUE</button></div>
      <div class="ar-card" id="arCard" hidden></div></div>`;
  }
  async function jugar(id, terminar) {
    if (!CFG[id] || !window.Phaser) return terminar && terminar(true);
    if (!$a().hidden) return; // ya hay una arena abierta (evita abrirla dos veces)
    alFin = terminar; if (document.pointerLockElement) document.exitPointerLock(); const a = $a(); a.hidden = false; montar(); E = { id, cfg: CFG[id], k: {}, btn: {}, jx: 0, jy: 0, hp: 5, hpMax: 5, carga: 0, puntos: 0, tarjeta: true, fin: true, esp: 0 };
    await document.fonts.load('10px "Press Start 2P"').catch(() => {}); await cargar(id); conectar();
    const c = CFG[id], prev = S.arena && S.arena[id];
    tarjeta(`<h2>${c.n}</h2><p>${c.tip}</p>
      <p class="ar-ctl">MOVER · ATACAR · ESQUIVAR · ABSORBER · ESPECIAL</p><p class="ar-dato"><b>El jefe tiene escudo:</b> rómpelo con un ejercicio.</p>
      ${prev && prev.ok ? `<p>Tu mejor marca: ${'★'.repeat(prev.estrellas)} · ${prev.mejor} pts</p>` : ''}
      <label class="ar-chk"><input type="checkbox" id="bCalm" ${S.calm ? 'checked' : ''}> Modo calmado</label>
      <button class="j-btn oro" id="bGo">¡Comenzar!</button><button class="j-btn alt" id="bNo">Ahora no</button>`);
    el('bCalm').onchange = e => { S.calm = e.target.checked; save(); };
    el('bGo').onclick = () => { Sfx.ui(); cierraTarjetaIni(); arrancar(id); }; el('bNo').onclick = () => salir(false);
  }
  function cierraTarjetaIni() { el('arCard').hidden = true; }
  function salir(ok) {
    if (escucha) { escucha(); escucha = null; } if (E && E.game) { E.game.destroy(true); E.game = null; }
    const a = $a(); a.hidden = true; a.innerHTML = ''; const f = alFin; alFin = null; E = null; f && f(!!ok);
  }
  return { jugar, CFG, dato, estado: () => E };
})();

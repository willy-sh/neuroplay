/* NEUROPLAY · mundo.js
   El mundo del juego, hecho con Phaser 3 y pixel art: mar que brilla, nubes que pasan, islas que flotan,
   un personaje que salta de isla en isla y destellos al ganar. Todo se dibuja con código (ver pixel.js).
   Los botones de las islas son HTML real encima del juego (teclado, lector de pantalla y toque fiable);
   Phaser solo se encarga de lo visual y de las animaciones. */
const Mundo = (() => {
  let W = 360, H = 560, HORIZ = false; // tamaño lógico del mundo: se calcula según la pantalla (ver calcula)
  const ISLAS = { // posición en el mundo (pixeles lógicos) y dibujo del hito de cada isla
    ciencia: { x: 100, y: 130, hito: 'mundoCiencia', semilla: 11, nombre: 'Ciencia' },
    tec: { x: 262, y: 116, hito: 'mundoTec', semilla: 29, nombre: 'Tecnología' },
    mate: { x: 78, y: 318, hito: 'mundoMate', semilla: 47, nombre: 'Mates' },
    ing: { x: 262, y: 300, hito: 'mundoIng', semilla: 83, nombre: 'Ingeniería' },
    int: { x: 168, y: 452, hito: 'mundoRetos', semilla: 61, nombre: 'Retos' },
  };
  const BOTELLA = { x: 304, y: 506 };
  const JUG0 = { x: 70, y: 508 }; // dónde empieza el personaje
  // Posiciones en pantalla vertical (celular) y como fracciones del ancho/alto en pantalla horizontal (PC)
  const VERT = { ciencia: [100, 130], tec: [262, 116], mate: [78, 318], ing: [262, 300], int: [168, 452], botella: [304, 506] };
  const HOR = { ciencia: [.14, .30], tec: [.40, .22], mate: [.33, .72], ing: [.64, .32], int: [.86, .66], botella: [.94, .90] };
  const horizontal = () => innerWidth / innerHeight > 1.15;
  function calcula() { // fija W, H y coloca las islas; se vuelve a llamar si cambia la forma de la ventana
    HORIZ = horizontal(); H = 560; W = HORIZ ? Math.max(640, Math.min(1240, Math.round(H * innerWidth / innerHeight))) : 360;
    Object.keys(ISLAS).forEach(id => { const p = HORIZ ? [Math.round(HOR[id][0] * W), Math.round(HOR[id][1] * H)] : VERT[id]; ISLAS[id].x = p[0]; ISLAS[id].y = p[1]; });
    const pb = HORIZ ? [Math.round(HOR.botella[0] * W), Math.round(HOR.botella[1] * H)] : VERT.botella; BOTELLA.x = pb[0]; BOTELLA.y = pb[1];
    JUG0.x = HORIZ ? 70 : 70; JUG0.y = 508;
    document.documentElement.style.setProperty('--mw', W); document.documentElement.style.setProperty('--mh', H);
  }
  calcula();
  const GRIS = 0x6f7f9f;
  const reducir = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARTE = {}; // imágenes pintadas ya cargadas, por clave de textura
  let KJ = 3; // escala del personaje: 3 con el dibujo de código (16 px), 0.5 con el arte pintado (96 px)
  const cargarArte = () => Promise.all([...Object.keys(ISLAS).map(id => ['isla_' + id, 'arte/isla_' + id + '.png']), ['heroe', 'arte/heroe.png'], ['villano', 'arte/villano.png']].map(([clave, ruta]) => new Promise(ok => {
    const im = new Image(); im.onload = () => { ARTE[clave] = im; ok(); }; im.onerror = () => ok(); im.src = ruta;
  })));
  let game = null, escena = null, estado = { hechas: {}, total: {} }, pos = 'puerto', cola = [];
  Px.SPR.nube = ['.......aaaa.........', '....aaammmmaa.......', '..aammmmmmmmmaa..aa.', '.ammmmmmmmmmmmaammaa', 'ammmmmmmmmmmmmmmmmma', 'annnnnnnnnnnnnnnnnna', '.aaaaaaaaaaaaaaaaaa.'];

  function agua() { // baldosa de 16x16 con olas; se repite y se desliza para dar sensación de mar
    const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
    x.fillStyle = Px.PAL.k; x.fillRect(0, 0, 16, 16);
    x.fillStyle = Px.PAL.l; [[2, 3, 4], [10, 9, 4], [5, 13, 3], [12, 1, 3]].forEach(([a, b, w]) => x.fillRect(a, b, w, 1));
    x.fillStyle = Px.PAL.u; [[7, 6, 2], [1, 10, 2], [13, 14, 2]].forEach(([a, b, w]) => x.fillRect(a, b, w, 1));
    return c;
  }
  function chispa(escena, x, y, col, n = 10) { // destello de pixeles que salen disparados
    for (let i = 0; i < n; i++) {
      const p = escena.add.rectangle(x, y, 6, 6, col).setDepth(50), a = (i / n) * Math.PI * 2 + Math.random() * .5, d = 36 + Math.random() * 34;
      escena.tweens.add({ targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - 14, alpha: 0, scale: .3, duration: 650 + Math.random() * 250, ease: 'Cubic.easeOut', onComplete: () => p.destroy() });
    }
  }

  function crear() {
    const s = escena = this, quieto = reducir();
    s.cameras.main.setBackgroundColor(Px.PAL.k);
    s.textures.addCanvas('agua', agua());
    s.textures.addCanvas('nube', Px.lienzo('nube', 1));
    const guarda = (clave, c) => s.textures.addCanvas(clave, c);
    if (ARTE.heroe) { // personaje pintado; la versión que mira a la izquierda es el mismo dibujo volteado
      KJ = 0.5; s.textures.addImage('guia', ARTE.heroe);
      const v = document.createElement('canvas'); v.width = ARTE.heroe.width; v.height = ARTE.heroe.height; const vx = v.getContext('2d'); vx.translate(v.width, 0); vx.scale(-1, 1); vx.drawImage(ARTE.heroe, 0, 0); guarda('guiaV', v);
    } else { KJ = 3; guarda('guia', Px.lienzo('guia', 1)); guarda('guiaV', Px.lienzo('guia', 1, true)); }
    if (ARTE.villano) s.textures.addImage('villano', ARTE.villano);
    guarda('estrella', Px.lienzo('estrellaMeta', 1)); guarda('botella', Px.lienzo('botella', 1)); guarda('compa', Px.lienzo('chispa', 1)); guarda('tormenta', Px.lienzo('tormenta', 1)); guarda('candado', Px.lienzo('candado', 1));
    // Si existe el arte pintado (arte/isla_<id>.png) se usa; si no carga, vuelve a la isla dibujada con código.
    Object.entries(ISLAS).forEach(([id, d]) => {
      d.arte = !!ARTE['isla_' + id];
      if (d.arte) s.textures.addImage('isla_' + id, ARTE['isla_' + id]); else guarda('isla_' + id, Px.isla(d.semilla));
      guarda('hito_' + id, Px.lienzo(d.hito, 1));
    });

    // Mar con dos capas que se deslizan en direcciones distintas
    const m1 = s.add.tileSprite(0, 0, W, H, 'agua').setOrigin(0).setTileScale(3);
    const m2 = s.add.tileSprite(0, 0, W, H, 'agua').setOrigin(0).setTileScale(3).setAlpha(.35).setTilePosition(24, 12);
    // Brillos que titilan
    for (let i = 0; i < 16; i++) {
      const b = s.add.rectangle(Math.random() * W, Math.random() * H, 6, 6, 0xffffff).setAlpha(0);
      if (!quieto) s.tweens.add({ targets: b, alpha: { from: 0, to: .9 }, duration: 600 + Math.random() * 700, yoyo: true, repeat: -1, delay: Math.random() * 3000, hold: 200 });
      else b.setAlpha(.5);
    }
    // Camino punteado entre islas
    const g = s.add.graphics().setDepth(1);
    const orden = ['ciencia', 'tec', 'ing', 'int', 'mate', 'ciencia'];
    for (let i = 0; i < orden.length - 1; i++) {
      const a = ISLAS[orden[i]], b = ISLAS[orden[i + 1]], pasos = Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 18);
      for (let k = 1; k < pasos; k++) { const t = k / pasos; g.fillStyle(0xffffff, .75).fillRect(Math.round(a.x + (b.x - a.x) * t) - 3, Math.round(a.y + (b.y - a.y) * t) + 6, 6, 6); }
    }
    // Islas
    s.islas = {};
    Object.entries(ISLAS).forEach(([id, d], n) => {
      const sombra = s.add.ellipse(d.x, d.y + 44, 128, 30, 0x1a1c2c, .2).setDepth(2);
      const espuma = [0, 1].map(k => s.add.ellipse(d.x, d.y + 22, 140, 80).setStrokeStyle(4, 0xffffff, .9).setDepth(3).setAlpha(0));
      if (!quieto) espuma.forEach((e, k) => s.tweens.add({ targets: e, scaleX: { from: .9, to: 1.18 }, scaleY: { from: .9, to: 1.18 }, alpha: { from: .8, to: 0 }, duration: 2600, repeat: -1, delay: k * 1300 + n * 300, ease: 'Sine.easeOut' }));
      const cont = s.add.container(d.x, d.y).setDepth(5);
      const isla = s.add.image(0, d.arte ? 6 : 0, 'isla_' + id).setScale(d.arte ? 1 : 3);
      cont.add(d.arte ? [isla] : [isla, s.add.image(0, -22, 'hito_' + id).setScale(3)]); // el arte pintado ya trae sus propios objetos
      const etiqueta = s.add.text(d.x, d.y + 66, d.nombre, { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffffff', stroke: '#1a1c2c', strokeThickness: 5 }).setOrigin(.5).setDepth(6);
      const estrellas = [0, 1, 2].map(k => s.add.image(d.x + (k - 1) * 24, d.y + 86, 'estrella').setScale(2).setDepth(6).setVisible(false));
      s.islas[id] = { cont, sombra, etiqueta, estrellas, espuma, d };
      if (!quieto) s.tweens.add({ targets: cont, y: d.y - 4, duration: 1500 + n * 130, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: n * 250 });
    });
    // Nubes que pasan
    [[30, 60, 3, 26000], [Math.round(W * .7), 220, 2, 38000], [Math.round(W * .33), 420, 3, 31000], [Math.round(W * .84), 520, 2, 42000]].forEach(([x, y, e, t], n) => {
      const nu = s.add.image(x, y, 'nube').setScale(e).setAlpha(.92).setDepth(8);
      if (!quieto) s.tweens.add({ targets: nu, x: W + 80, duration: t * (1 - x / (W + 80)), onComplete: () => { nu.x = -80; s.tweens.add({ targets: nu, x: W + 80, duration: t, repeat: -1 }); } });
    });
    // Botella con mensaje (lleva a «Cuéntame»)
    s.botella = s.add.image(BOTELLA.x, BOTELLA.y, 'botella').setScale(3).setDepth(7).setAngle(-12);
    s.add.text(BOTELLA.x, BOTELLA.y + 34, 'Cuéntame', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffffff', stroke: '#1a1c2c', strokeThickness: 4 }).setOrigin(.5).setDepth(7);
    if (!quieto) s.tweens.add({ targets: s.botella, y: BOTELLA.y - 6, angle: 12, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Personaje
    s.jug = s.add.image(JUG0.x, JUG0.y, 'guia').setScale(KJ).setDepth(20);
    s.sombraJug = s.add.ellipse(JUG0.x, JUG0.y + 28, 30, 8, 0x1a1c2c, .3).setDepth(19);
    if (!quieto) s.tweens.add({ targets: s.jug, scaleY: { from: KJ, to: KJ * .933 }, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Tormenta de Don Promedio sobre cada isla apagada, capa oscura sobre el mundo y candado en la Torre final
    s.oscuro = s.add.rectangle(0, 0, W, H, 0x0b1030, 0).setOrigin(0).setDepth(9);
    Object.entries(s.islas).forEach(([id, o], n) => {
      o.apagada = true;
      o.cont.list.forEach(im => im.setTint(GRIS));
      o.tormenta = s.add.image(o.d.x, o.d.y - 58, 'tormenta').setScale(3).setDepth(10);
      if (!quieto) { s.tweens.add({ targets: o.tormenta, y: o.d.y - 64, duration: 1700 + n * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        s.time.addEvent({ delay: 2400 + n * 700, loop: true, callback: () => { if (!o.tormenta || !o.tormenta.active) return; s.tweens.add({ targets: o.tormenta, alpha: .55, duration: 70, yoyo: true, repeat: 1 }); } }); }
    });
    s.candado = s.add.image(ISLAS.int.x, ISLAS.int.y - 44, 'candado').setScale(3).setDepth(11).setVisible(false);
    if (ARTE.villano) { // Don Promedio vigila la Torre hasta que se recupera la última chispa
      s.promedio = s.add.image(ISLAS.int.x + 46, ISLAS.int.y - 18, 'villano').setScale(.5).setDepth(11);
      if (!quieto) s.tweens.add({ targets: s.promedio, y: s.promedio.y - 5, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    s.compa = s.add.image(JUG0.x + 34, JUG0.y - 22, 'compa').setScale(3).setDepth(21);
    if (!quieto) { s.tweens.add({ targets: s.compa, y: '-=8', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); s.tweens.add({ targets: s.compa, scaleX: { from: 3, to: 3.25 }, scaleY: { from: 3, to: 3.25 }, duration: 520, yoyo: true, repeat: -1 }); }
    s.agua = [m1, m2];
    s.listo = true; actualizar(estado);
    cola.splice(0).forEach(f => f());
  }
  function frame(t, dt) { if (!escena || reducir()) return; escena.agua[0].tilePositionX += dt * .012; escena.agua[0].tilePositionY += dt * .006; escena.agua[1].tilePositionX -= dt * .008; escena.agua[1].tilePositionY += dt * .01; }

  function oscuridad(n, animado = true) { // más luz mientras más chispas se recuperan
    const alfa = .4 * (1 - n / 5); if (!escena || !escena.oscuro) return;
    if (animado && !reducir()) escena.tweens.add({ targets: escena.oscuro, alpha: alfa, duration: 900 }); else escena.oscuro.setAlpha(alfa);
  }
  function actualizar(e) {
    estado = e || estado; if (!escena || !escena.listo) return;
    const rec = estado.recuperadas || {}, bloq = estado.bloqueada || {};
    Object.entries(escena.islas).forEach(([id, o]) => { const total = estado.total[id] || 0, hechas = estado.hechas[id] || 0;
      o.estrellas.forEach((st, k) => { st.setVisible(k < total); st.setTint(k < hechas ? 0xffffff : 0x94b0c2).setAlpha(k < hechas ? 1 : .6); });
      if (rec[id] && o.apagada) encender(id, true); });
    oscuridad(Object.values(rec).filter(Boolean).length, false);
    if (escena.promedio) escena.promedio.setVisible(!rec.int);
    const c = escena.candado; if (c) { if (bloq.int && !c.visible) c.setVisible(true); if (!bloq.int && c.visible) { c.setVisible(false); chispa(escena, ISLAS.int.x, ISLAS.int.y - 44, 0xffcd75, 10); } }
  }
  function encender(id, silencioso) { // la isla recupera su chispa: la tormenta se va y los colores vuelven
    const f = () => { const o = escena.islas[id]; if (!o || !o.apagada) return; o.apagada = false;
      const aplica = c => o.cont.list.forEach(im => im.setTint(c));
      if (silencioso || reducir()) { o.cont.list.forEach(im => im.clearTint()); if (o.tormenta) { o.tormenta.destroy(); o.tormenta = null; } oscuridad(Object.values(escena.islas).filter(x => !x.apagada).length, false); return; }
      const A = Phaser.Display.Color.ValueToColor(GRIS), B = Phaser.Display.Color.ValueToColor(0xffffff);
      escena.tweens.addCounter({ from: 0, to: 100, duration: 900, onUpdate: t => { const c = Phaser.Display.Color.Interpolate.ColorWithColor(A, B, 100, t.getValue()); aplica(Phaser.Display.Color.GetColor(c.r, c.g, c.b)); }, onComplete: () => o.cont.list.forEach(im => im.clearTint()) });
      const ola = escena.add.ellipse(o.d.x, o.d.y + 10, 40, 24, 0xffffff, .85).setDepth(30);
      escena.tweens.add({ targets: ola, scaleX: 9, scaleY: 7, alpha: 0, duration: 700, ease: 'Cubic.easeOut', onComplete: () => ola.destroy() });
      chispa(escena, o.d.x, o.d.y - 20, 0xffcd75, 16); chispa(escena, o.d.x, o.d.y - 20, 0xffffff, 10);
      escena.tweens.add({ targets: o.cont, scaleY: 1.1, scaleX: .94, duration: 140, yoyo: true, repeat: 1 });
      if (o.tormenta) { const t = o.tormenta; o.tormenta = null; escena.tweens.killTweensOf(t); escena.tweens.add({ targets: t, y: t.y - 90, alpha: 0, duration: 800, ease: 'Cubic.easeIn', onComplete: () => t.destroy() }); }
      oscuridad(Object.values(escena.islas).filter(x => !x.apagada).length);
    };
    if (escena && escena.listo) f(); else cola.push(f);
  }
  function final() { // todas las islas brillan y llueven pixeles de colores
    const f = () => { Object.keys(escena.islas).forEach(id => encender(id)); oscuridad(5);
      if (reducir()) return; const cols = [0xffcd75, 0xef7d57, 0xa7f070, 0x73eff7, 0xffffff, 0xb13e53];
      for (let i = 0; i < 70; i++) { const r = escena.add.rectangle(Math.random() * W, -10 - Math.random() * 200, 8, 8, cols[i % cols.length]).setDepth(60); escena.tweens.add({ targets: r, y: H + 20, x: r.x + (Math.random() - .5) * 60, angle: 360, duration: 1800 + Math.random() * 1600, delay: Math.random() * 900, ease: 'Sine.easeIn', onComplete: () => r.destroy() }); } };
    if (escena && escena.listo) f(); else cola.push(f);
  }
  function sacudir(id) { const f = () => { const t = id === 'int' ? escena.candado : null; if (!t || reducir()) return; escena.tweens.add({ targets: t, x: t.x + 6, duration: 60, yoyo: true, repeat: 3 }); }; if (escena && escena.listo) f(); else cola.push(f); }
  function ir(id, listo) { // el personaje salta a la isla y luego se abre la región
    const run = () => {
      const s = escena, o = s.islas[id], j = s.jug; if (!o) return listo && listo();
      const ox = o.d.x, oy = o.d.y - 40, x0 = j.x, y0 = j.y, dir = ox >= x0 ? 'guia' : 'guiaV'; j.setTexture(dir);
      if (reducir()) { j.setPosition(ox, oy); s.sombraJug.setPosition(ox, oy + 74); if (s.compa) s.compa.setPosition(ox + 34, oy - 26); pos = id; return listo && listo(); }
      s.tweens.killTweensOf(j); j.setScale(KJ);
      s.tweens.add({ targets: j, scaleY: KJ * .8, scaleX: KJ * 1.133, duration: 90, yoyo: true, onComplete: () => {
        s.tweens.addCounter({ from: 0, to: 1, duration: 620, ease: 'Sine.easeInOut', onUpdate: t => { const v = t.getValue(); j.setPosition(x0 + (ox - x0) * v, y0 + (oy - y0) * v - Math.sin(Math.PI * v) * 70); s.sombraJug.setPosition(j.x, y0 + (oy - y0) * v + 28); j.setAngle((dir === 'guia' ? 1 : -1) * Math.sin(Math.PI * v) * 8); },
          onComplete: () => { pos = id; j.setAngle(0); if (s.compa) s.tweens.add({ targets: s.compa, x: ox + 34, y: oy - 26, duration: 380, ease: 'Back.easeOut' }); chispa(s, ox, oy + 30, 0xffcd75, 8);
            s.tweens.add({ targets: j, scaleY: { from: KJ * .767, to: KJ }, scaleX: { from: KJ * 1.167, to: KJ }, duration: 220, ease: 'Back.easeOut' });
            s.tweens.add({ targets: o.cont, scaleY: .94, scaleX: 1.04, duration: 90, yoyo: true });
            s.time.delayedCall(260, () => listo && listo()); } });
      } });
    };
    if (escena && escena.listo) run(); else cola.push(run);
  }
  function celebrar(id) { const f = () => { const o = escena.islas[id]; if (!o) return; chispa(escena, o.d.x, o.d.y - 10, 0xffcd75, 14); chispa(escena, o.d.x, o.d.y - 10, 0xffffff, 8); escena.tweens.add({ targets: o.cont, scaleY: 1.08, scaleX: .96, duration: 120, yoyo: true, repeat: 1 }); }; if (escena && escena.listo) f(); else cola.push(f); }
  function presionar(id, abajo) { if (!escena || !escena.listo) return; const o = escena.islas[id]; if (o) escena.tweens.add({ targets: o.cont, scaleX: abajo ? .96 : 1, scaleY: abajo ? .96 : 1, duration: 100, ease: 'Cubic.easeOut' }); }
  function guia(id) { // flecha que rebota sobre la siguiente isla de la historia
    const f = () => {
      if (escena.flecha) { escena.tweens.killTweensOf(escena.flecha); escena.flecha.destroy(); escena.flecha = null; }
      const d = ISLAS[id]; if (!d) return;
      const t = escena.add.text(d.x, d.y - 84, '▼', { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#ffcd75', stroke: '#1a1c2c', strokeThickness: 5 }).setOrigin(.5).setDepth(40);
      escena.flecha = t; if (!reducir()) escena.tweens.add({ targets: t, y: d.y - 72, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    };
    if (escena && escena.listo) f(); else cola.push(f);
  }
  function pausa(si) { if (!game || !game.loop) return; if (si) game.loop.sleep(); else game.loop.wake(); }

  async function iniciar(contenedor, e) {
    estado = e || estado;
    try { await document.fonts.load('10px "Press Start 2P"'); } catch { /* sin fuente: usa la de respaldo */ }
    await cargarArte();
    game = new Phaser.Game({ type: Phaser.AUTO, parent: contenedor, width: W, height: H, pixelArt: true, antialias: false, roundPixels: true, backgroundColor: Px.PAL.k, banner: false,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, fps: { target: 60 }, audio: { noAudio: true }, scene: { create: crear, update: frame } });
    return game;
  }
  function destruir() { try { if (game) game.destroy(true); } catch (e) { /* nada */ } game = null; escena = null; cola = []; pos = 'puerto'; }
  const forma = () => ({ horiz: horizontal(), w: HORIZ ? Math.max(640, Math.min(1240, Math.round(560 * innerWidth / innerHeight))) : 360 });
  const cambio = () => { const f = forma(); return f.horiz !== HORIZ || Math.abs(f.w - W) / W > .12; };
  const hasta = () => { const c = game && game.canvas; return c; };
  return { get W() { return W; }, get H() { return H; }, get horizontal() { return HORIZ; }, ISLAS, BOTELLA, calcula, destruir, cambio, iniciar, actualizar, ir, celebrar, presionar, pausa, hasta, encender, final, sacudir, guia};
})();

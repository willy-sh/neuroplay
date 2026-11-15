/* NEUROPLAY · intro.js
   Animación de entrada (estrellas, mar, título, personaje y Don Promedio) y creación del gametag.
   Privacidad: el gametag es un apodo que se queda solo en este dispositivo; se pide NO usar el nombre real.
   Además define Sfx: sonidos sintetizados con WebAudio (sin archivos). */
const Sfx = (() => {
  let ctx = null, on = true;
  const ac = () => { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  function tono(f0, f1, dur, tipo = 'square', vol = .05) {
    if (!on) return; const c = ac(); if (!c) return;
    const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .02);
  }
  const seq = (fs, paso, tipo) => fs.forEach((f, i) => setTimeout(() => tono(f, f, .16, tipo || 'square', .05), i * paso));
  return {
    set(v) { on = !!v; }, get activo() { return on; },
    ui: () => tono(520, 780, .08), tiro: () => tono(700, 320, .07, 'square', .03), golpe: () => tono(240, 90, .1, 'sawtooth', .04),
    dano: () => tono(170, 50, .25, 'sawtooth', .07), esquiva: () => tono(300, 900, .1, 'triangle', .05),
    absorbe: () => { tono(400, 1200, .18, 'sine', .06); setTimeout(() => tono(800, 1600, .12, 'sine', .05), 90); },
    especial: () => tono(200, 1400, .4, 'sawtooth', .06), bien: () => seq([660, 880], 110), mal: () => tono(200, 120, .25, 'triangle', .05),
    gana: () => seq([523, 659, 784, 1047], 130), pierde: () => tono(300, 60, .7, 'sawtooth', .06), inicio: () => seq([392, 523, 659, 784, 1047], 140, 'triangle'),
  };
})();

const Intro = (() => {
  const $i = s => document.querySelector(s);
  const A = ['Nova', 'Chispa', 'Lumen', 'Quark', 'Pixel', 'Cometa', 'Atomo', 'Faro', 'Eco', 'Rayo', 'Neurona', 'Brujula'];
  const B = ['Alfa', 'Delta', 'Sigma', 'Omega', 'Zeta', 'Beta', 'Orion', 'Vega'];
  const OK = /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ_\- ]{2,14}$/; // solo caracteres seguros (el apodo se usa dentro de HTML)
  const sorpresa = () => A[Math.floor(Math.random() * A.length)] + B[Math.floor(Math.random() * B.length)] + Math.floor(Math.random() * 90 + 10);
  const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0, cierre = null;

  function fondo(cv, portada) { // estrellas que titilan, mar con olas y la portada de fondo
    const x = cv.getContext('2d'), est = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * .62, f: Math.random() * 6 }));
    let t0 = performance.now(), W = 0, H = 0;
    const ajusta = () => { W = cv.width = Math.ceil(innerWidth / 3); H = cv.height = Math.ceil(innerHeight / 3); };
    ajusta(); addEventListener('resize', ajusta);
    const dib = now => {
      const t = (now - t0) / 1000; x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, W, H);
      est.forEach(s => { const a = .4 + .6 * Math.abs(Math.sin(t * 1.4 + s.f)); x.fillStyle = `rgba(255,255,255,${a})`; x.fillRect(Math.floor(s.x * W), Math.floor(s.y * H), 1, 1); });
      const mar = Math.floor(H * .72); x.fillStyle = 'rgba(8,12,48,.78)'; x.fillRect(0, mar, W, H - mar);
      for (let i = 0; i < 14; i++) { const yy = mar + 4 + i * ((H - mar) / 14), off = (Math.sin(t * .8 + i) * 6) | 0; x.fillStyle = `rgba(115,239,247,${.08 + i * .012})`; for (let k = 0; k < W; k += 22) x.fillRect(k + off + (i % 2) * 11, yy | 0, 8, 1); }
      raf = requestAnimationFrame(dib);
    };
    raf = requestAnimationFrame(dib);
  }

  function titulo() { return 'NEUROPLAY'.split('').map((c, i) => `<span style="animation-delay:${(.5 + i * .14).toFixed(2)}s">${c}</span>`).join(''); }

  function panelNombre(S, guardar, fin) {
    const sc = $i('.in-escena'); const tiene = S.nick && OK.test(S.nick);
    sc.innerHTML = `<form class="in-panel" id="inForm" autocomplete="off" aria-labelledby="inT">
      <h2 id="inT">${tiene ? 'Bienvenido de vuelta' : 'Elige tu gametag'}</h2>
      ${tiene ? `<p>Última vez jugaste como <b id="inUlt"></b>.</p><div class="in-fila"><button type="button" class="j-btn oro" id="inSigue" style="flex:1">Continuar</button><button type="button" class="j-btn alt" id="inCambia">Cambiar</button></div>`
        : `<p>Es tu nombre en el juego. Usa un apodo, <b>no tu nombre real</b>. Se queda solo en tu dispositivo.</p>`}
      <div id="inNuevo" ${tiene ? 'hidden' : ''}>
        <label for="inNom" class="ar-ctl">GAMETAG (2 a 14 letras o números)</label>
        <div class="in-fila"><input id="inNom" maxlength="14" inputmode="text" aria-describedby="inErr" placeholder="Ej: NovaDelta27"><button type="button" class="j-btn alt" id="inRand" aria-label="Sugerir un gametag al azar">Azar</button></div>
        <p class="in-error" id="inErr" role="alert"></p>
        <button type="submit" class="j-btn oro" style="width:100%">¡Entrar al juego!</button>
      </div></form>`;
    if (tiene) $i('#inUlt').textContent = S.nick;
    const ent = nom => { S.nick = nom.trim(); guardar(); Sfx.inicio(); fin(); };
    if (tiene) { $i('#inSigue').onclick = () => ent(S.nick); $i('#inCambia').onclick = () => { $i('#inNuevo').hidden = false; $i('#inNom').focus(); }; $i('#inSigue').focus(); }
    else setTimeout(() => $i('#inNom') && $i('#inNom').focus(), 50);
    $i('#inRand').onclick = () => { $i('#inNom').value = sorpresa(); $i('#inErr').textContent = ''; Sfx.ui(); };
    $i('#inForm').onsubmit = e => { e.preventDefault(); const v = $i('#inNom').value.trim(); if (!OK.test(v)) { $i('#inErr').textContent = 'Usa de 2 a 14 letras, números, guion o espacio.'; Sfx.mal(); return; } ent(v); };
  }

  function mostrar(S, guardar, listo) {
    const el = $i('#intro'); if (!el) return listo();
    cierre = listo; el.hidden = false; el.classList.remove('in-salida');
    const portada = { complete: false };
    el.innerHTML = `<div class="in-cielo" aria-hidden="true"></div><div class="in-islas" aria-hidden="true"><img class="in-isla in-isla-ciencia" src="arte/isla_ciencia.png" alt=""><img class="in-isla in-isla-tec" src="arte/isla_tec.png" alt=""><img class="in-isla in-isla-mate" src="arte/isla_mate.png" alt=""><img class="in-isla in-isla-ing" src="arte/isla_ing.png" alt=""><img class="in-isla in-isla-int" src="arte/isla_int.png" alt=""></div><canvas id="introCv" aria-hidden="true"></canvas>
      <div class="in-escena">
        <img class="in-heroe" src="arte/heroe.png" alt="" aria-hidden="true"><img class="in-villano" src="arte/villano.png" alt="" aria-hidden="true">
        <h1 class="in-titulo" aria-label="NEUROPLAY">${titulo()}</h1>
        <p class="in-sub">Comprende tu historia. Descubre tus posibilidades. Construye tu futuro.</p>
        <button class="in-cta" id="inGo">TOCA PARA EMPEZAR</button>
      </div>
      <p class="in-pie">Reto 04 Educación y Talento · Hackathon Jalisco Internacional 2026</p>`;
    fondo($i('#introCv'), portada);
    const avanzar = () => { Sfx.ui(); $i('#inGo').onclick = null; panelNombre(S, guardar, salir); };
    $i('#inGo').onclick = avanzar; $i('#inGo').focus();
    if (quieto()) el.querySelectorAll('.in-cta').forEach(b => b.style.opacity = 1);
  }

  function salir() {
    const el = $i('#intro'); el.classList.add('in-salida');
    setTimeout(() => { cancelAnimationFrame(raf); el.hidden = true; el.innerHTML = ''; const f = cierre; cierre = null; f && f(); }, quieto() ? 0 : 600);
  }

  return { mostrar, valido: t => OK.test(t) };
})();

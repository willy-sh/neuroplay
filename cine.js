/* NEUROPLAY · cine.js
   Cinemática de apertura: por qué se apagó la Chispa y por qué se cerraron las aulas.
   Texto corto, una idea por escena. Se puede saltar (Esc o «Saltar») y volver a ver desde el menú. */
const Cine = (() => {
  const ESCENAS = [
    { img: 'cine_1', mov: 'a', t: ['Isla Neuron flotaba sobre Jalisco. Y tenía un corazón: la Chispa.', 'La Chispa son las ganas de aprender. Mientras brillaba, todo funcionaba.'] },
    { img: 'cine_2', mov: 'b', t: ['Los salones estaban llenos. Había preguntas, risas y proyectos por todos lados.'] },
    { img: 'cine_3', mov: 'a', t: ['Entonces llegó Don Promedio. Con un solo número lo resumía todo: «Va todo bien».', 'Pero ese número no decía quién se estaba quedando atrás.'] },
    { img: 'cine_4', mov: 'b', t: ['Nadie miró a los que faltaban, y la ayuda dejó de llegar. Muchos chicos empezaron a pensar: «Yo soy el problema».', 'La Chispa se fue apagando… y las aulas se cerraron, una por una.'] },
    { img: 'cine_5', mov: 'a', t: ['Pero la Chispa no murió: se escondió en una vieja Mansión.', 'Alguien tiene que ir por ella. Alguien como tú.'], fin: true },
  ];
  let est = null, tm = null;
  const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $c = () => document.getElementById('cine');

  function ver(listo) {
    let el = $c(); if (!el) { el = document.createElement('div'); el.id = 'cine'; document.body.append(el); }
    if (document.pointerLockElement) document.exitPointerLock();
    est = { i: 0, j: 0, listo, escribiendo: false }; el.hidden = false; el.className = '';
    el.innerHTML = `<div class="cn-fondo"><img class="cn-img" alt="" aria-hidden="true"></div><div class="cn-bandas" aria-hidden="true"></div>
      <div class="cn-caja" role="dialog" aria-label="Historia" aria-live="polite"><p class="cn-texto"></p><button class="cn-sig" aria-label="Siguiente">▶</button></div>
      <button class="cn-saltar">Saltar ⏭</button><p class="cn-fin" hidden><span>Tú no eres el problema.</span></p>`;
    el.querySelector('.cn-caja').onclick = avanzar; el.querySelector('.cn-saltar').onclick = cerrar;
    document.addEventListener('keydown', teclas); escena(0);
  }
  function teclas(e) {
    if (!est) return; if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avanzar(); }
  }
  function escena(i) {
    const el = $c(); if (!el || !est) return; est.i = i; est.j = 0; const e = ESCENAS[i], im = el.querySelector('.cn-img');
    el.classList.remove('cn-cambio'); void el.offsetWidth; el.classList.add('cn-cambio');
    im.onerror = () => { im.style.visibility = 'hidden'; }; im.style.visibility = ''; im.src = `arte/${e.img}.jpg`;
    im.className = 'cn-img mov-' + e.mov; if (typeof Sfx !== 'undefined' && i) Sfx.ui();
    linea();
  }
  function linea() {
    const el = $c(), e = ESCENAS[est.i], t = e.t[est.j], p = el.querySelector('.cn-texto'), sig = el.querySelector('.cn-sig');
    sig.style.visibility = 'hidden'; clearInterval(tm); p.textContent = ''; let n = 0; est.escribiendo = true;
    const fin = () => { clearInterval(tm); est.escribiendo = false; p.textContent = t; sig.style.visibility = 'visible'; };
    est.pintaTodo = fin; if (quieto()) return fin();
    tm = setInterval(() => { n++; p.textContent = t.slice(0, n); if (n >= t.length) fin(); }, 26);
  }
  function avanzar() {
    if (!est) return; if (est.escribiendo) { est.pintaTodo(); return; }
    const e = ESCENAS[est.i];
    if (est.j < e.t.length - 1) { est.j++; return linea(); }
    if (est.i < ESCENAS.length - 1) return escena(est.i + 1);
    const el = $c(); el.querySelector('.cn-caja').hidden = true; el.querySelector('.cn-saltar').hidden = true; el.querySelector('.cn-fin').hidden = false; est.listoFin = true;
    if (typeof Sfx !== 'undefined' && Sfx.inicio) Sfx.inicio(); setTimeout(cerrar, quieto() ? 800 : 2600);
  }
  function cerrar() {
    if (!est) return; clearInterval(tm); document.removeEventListener('keydown', teclas); const f = est.listo; est = null; const el = $c();
    el.classList.add('cn-salida'); setTimeout(() => { el.hidden = true; el.innerHTML = ''; f && f(); }, quieto() ? 0 : 500);
  }
  return { ver };
})();

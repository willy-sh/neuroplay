/* NEUROPLAY · pixel.js
   Pixel art hecho con código: paleta, iconos, personajes e islas. No hay imágenes externas ni derechos de autor.
   Cada dibujo es un mapa de letras (una letra = un pixel). Para cambiar un dibujo basta con editar su mapa.
   Si el equipo prefiere arte a mano (Aseprite, LibreSprite, Piskel), basta con exportar PNG y cambiar `Px.url(nombre)`.
   Paleta: Sweetie 16 (libre) + 4 tonos extra. */
const Px = (() => {
  const PAL = {
    a: '#1a1c2c', b: '#5d275d', c: '#b13e53', d: '#ef7d57', e: '#ffcd75', f: '#a7f070', g: '#38b764', h: '#257179',
    i: '#29366f', j: '#3b5dc9', k: '#41a6f6', l: '#73eff7', m: '#f4f4f4', n: '#94b0c2', o: '#566c86', p: '#333c57',
    q: '#8b5a2b', r: '#5e3a1e', t: '#f2c9a0', u: '#2b6fd6',
  };
  const SPR = {
    /* ---------- navegación ---------- */
    globo: ['....aaaa....', '..aakkkkaa..', '.akkgggkkka.', '.akgggkkgka.', 'akkggkkkggka', 'akkkkkggkkka', 'akkkkgggkkka', 'akkkkkggkkka', '.akkgkkkkka.', '.akkkkkkkka.', '..aakkkkaa..', '....aaaa....'],
    pin: ['....aaaa....', '...acccca...', '..accccccaa.', '..acmmcccca.', '..acmmcccca.', '..accccccca.', '...acccca...', '....accca...', '.....aca....', '.....aca....', '......a.....', '............'],
    estrella: ['.....aa.....', '....aeea....', '....aeea....', 'aaaaaeeeaaaa', 'aeeeeeeeeeea', '.aeeeeeeeea.', '..aeeeeeea..', '..aeeeeeea..', '.aeeeaaeeea.', '.aeeaa.aeea.', '.aaa....aaa.', '............'],
    cara: ['...aaaaaa...', '..abbbbbba..', '.abbbbbbbba.', '.atttttttta.', '.atatttatta.', '.atttttttta.', '.atttccttta.', '..atttttta..', '...aaaaaa...', '..ajjjjjja..', '.ajjjjjjjja.', '.aaaaaaaaaa.'],
    libro: ['............', '..aaaaaaaa..', '.ajjjjjjjja.', '.ajmmmmmmja.', '.ajjjjjjjja.', '.ajmmmmjjja.', '.ajjjjjjjja.', '.ajmmmmmmja.', '.ajjjjjjjja.', '.aaaaaaaaaa.', '.ammmmmmmma.', '..aaaaaaaa..'],
    /* ---------- retos ---------- */
    autobus: ['............', '............', '.aaaaaaaaaa.', '.aeeeeeeeeea', '.aellaellaea', '.aellaellaea', '.aeeeeeeeeea', '.addddddddda', '.aaaaaaaaaaa', '..aooa.aooa.', '..aaaa.aaaa.', '............'],
    hielo: ['............', '..aaaaaaaa..', '.alllllllla.', '.almmllklla.', '.almllllkla.', '.alllllklla.', '.alllklllla.', '.aklllllkka.', '.akkklkkkka.', '..aaaaaaaa..', '............', '............'],
    arcoiris: ['....aaaa....', '..aacccaa...', '.acddcccca..', '.aeedddcca..', 'aeggeeddcca.', 'aggkkggeddca', 'akkaakkgeeda', 'aa.aaakkgeea', '....aaaakkga', '.......aaaka', '..........aa', '............'],
    limon: ['.......aa...', '....aaaagga.', '..aaeeeaaga.', '.aeeeemeeea.', '.aeemeeeeea.', 'aeeeeeeeeeea', 'aeeeeeeeeeea', '.aeeeeeeeea.', '.aeeeeeeeea.', '..aaeeeeaa..', '....aaaa....', '............'],
    robot: ['.....aa.....', '.....cc.....', '..aaaaaaaa..', '.aooooooooa.', '.aolloolloa.', '.aolaoolaoa.', '.aooooooooa.', '.aoaaaaaaoa.', '..aaaaaaaa..', '.aoooaaoooa.', '.aoooaaoooa.', '.aaa....aaa.'],
    balanza: ['.....aa.....', '.....aa.....', 'aaaaaaaaaaaa', 'ac.aaaaaa.ca', 'ac..aaaa..ca', 'acc..aa..cca', 'aee..aa..eea', 'aaa..aa..aaa', '.....aa.....', '....aaaa....', '...aaaaaa...', '............'],
    lupa: ['...aaaaa....', '..aklllka...', '.aklmmllka..', '.alml.llla..', '.alll.llla..', '.aklllllka..', '..aklllka...', '...aaaaaaa..', '.......aqqa.', '........aqqa', '.........aqa', '..........aa'],
    /* ---------- mentores ---------- */
    tele: ['..a......a..', '...a....a...', '....a..a....', '.aaaaaaaaaa.', '.apppppppaa.', '.aplllllpea.', '.aplllllpea.', '.aplllllpda.', '.apppppppaa.', '.aaaaaaaaaa.', '..aa....aa..', '............'],
    cohete: ['.....aa.....', '....amma....', '...ammmma...', '...ammlmma..', '...ammlmma..', '...ammmmma..', '..acammmaca.', '..acammmaca.', '..aaaammaaa.', '.....addd...', '.....aed....', '......a.....'],
    satelite: ['............', '............', 'jjjj.aa.jjjj', 'jmmjaooajmmj', 'jjjjaooajjjj', 'jmmjaooajmmj', 'jjjj.aa.jjjj', '......a.....', '.....aea....', '............', '............', '............'],
    atomo: ['....aaaa....', '..aa.ll.aa..', '.a..alla..a.', 'a..aaccaa..a', 'a.aa.cc.aa.a', 'aaalcmmclaaa', 'a.aa.cc.aa.a', 'a..aaccaa..a', '.a..alla..a.', '..aa.ll.aa..', '....aaaa....', '............'],
    /* ---------- medallas y detalles ---------- */
    medalla: ['..cc....cc..', '..cc....cc..', '...cc..cc...', '....cccc....', '...aaaaaa...', '..aeeeeeea..', '.aeeemmeeea.', '.aeemeeeeea.', '.aeeeeeeeea.', '..aeeeeeea..', '...aaaaaa...', '............'],
    copa: ['.aaaaaaaaaa.', 'aeeeeeeeeeea', 'aeemeeeeeeea', 'aeemeeeeeeea', '.aeeeeeeeea.', '..aeeeeeea..', '...aeeeea...', '....aeea....', '....aeea....', '...aaaaaa...', '..aoooooooa.', '..aaaaaaaaa.'],
    burbuja: ['............', '.aaaaaaaaaa.', 'ammmmmmmmmma', 'ammmmmmmmmma', 'ammaammaamma', 'ammmmmmmmmma', 'ammmmmmmmmma', '.aammmmmmaa.', '...aammaa...', '....aama....', '.....aa.....', '............'],
    engrane: ['....aaaa....', '.aa.aoaa.aa.', '.aoaaooaaoa.', '..aooooooa..', '.aoooaaoooa.', 'aooooaaooooa', 'aooooaaooooa', '.aoooaaoooa.', '..aooooooa..', '.aoaaooaaoa.', '.aa.aoaa.aa.', '....aaaa....'],
    candado: ['....aaaa....', '...aoooao...', '...ao..ao...', '...ao..ao...', '.aaaaaaaaaa.', '.aeeeeeeeea.', '.aeeeaaeeea.', '.aeeeaaeeea.', '.aeeeeaeeea.', '.aeeeeeeeea.', '.aaaaaaaaaa.', '............'],
    marca: ['.........aa.', '........aggaa', '.......aggga.', '..a...aggga..', '..aa.aggga...', '...aaggga....', '....agga.....', '.....aa......', '............', '............', '............', '............'],
    cruz: ['............', '.aa......aa.', '.aca....acaa', '..aca..aca..', '...acaaca...', '....acca....', '....acca....', '...acaaca...', '..aca..aca..', '.aca....aca.', '.aa......aa.', '............'],
    flechaArriba: ['............', '.....aa.....', '....aeea....', '...aeeeea...', '..aeeeeeea..', '.aaaaeeaaaa.', '....aeea....', '....aeea....', '....aeea....', '....aaaa....', '............', '............'],
    flechaAbajo: ['............', '....aaaa....', '....aeea....', '....aeea....', '....aeea....', '.aaaaeeaaaa.', '..aeeeeeea..', '...aeeeea...', '....aeea....', '.....aa.....', '............', '............'],
    flechaIzq: ['............', '.....a......', '....aa......', '...aea......', '..aeeaaaaaa.', '.aeeeeeeeea.', '.aeeeeeeeea.', '..aeeaaaaaa.', '...aea......', '....aa......', '.....a......', '............'],
    flechaDer: ['............', '......a.....', '......aa....', '......aea...', '.aaaaaaeea..', '.aeeeeeeeea.', '.aeeeeeeeea.', '.aaaaaaeea..', '......aea...', '......aa....', '......a.....', '............'],
    play: ['............', '.aa.........', '.aeaa.......', '.aeeeaa.....', '.aeeeeeaa...', '.aeeeeeeeaa.', '.aeeeeeeeaa.', '.aeeeeeaa...', '.aeeeaa.....', '.aeaa.......', '.aa.........', '............'],
    reiniciar: ['....aaaa....', '..aajjjjaa..', '.ajjaaaajja.', '.ajaa..aajaa', 'ajja....ajja', 'ajja...aaaja', '.ajja.aaja..', '.ajjaaaja...', '..aajjaa....', '....aa......', '............', '............'],
    mano: ['....aa......', '...atta.aa..', '...atta.ata.', '.aa.atatata.', 'atta.attata.', 'atatatttta..', '.attttttta..', '.attttttta..', '..atttttta..', '...attta....', '....aaa.....', '............'],
    anonimo: ['............', '...aaaaaa...', '..aoooooaa..', '.aoo.oo.ooa.', '.aoooooooaa.', '.aoo.aa.ooa.', '..aoooooaa..', '...aaaaaa...', '.aaaaaaaaaa.', '.a.a.aa.a.a.', '..a.aaaa.a..', '............'],
    corazon: ['............', '..aaa..aaa..', '.acccaacccaa', '.acmccccccca', '.accccccccca', '..acccccca..', '...acccca...', '....acca....', '.....aa.....', '............', '............', '............'],
    /* ---------- cosas de los retos ---------- */
    pasajero: ['....aaaa....', '...atttta...', '...attatta..', '...atttta...', '....aaaa....', '...ajjjja...', '..ajjjjjja..', '..ajjjjjja..', '...aaaaaa...', '...apa.apa..', '...aaa.aaa..', '............'],
    roca: ['............', '............', '....aaaa....', '..aaoooonaa.', '.aoooonnnooa', '.aooooonnooa', 'aooooooooooa', 'aoopppoooooa', 'aoppppppooaa', '.aaaaaaaaaa.', '............', '............'],
    estrellaMeta: ['.....aa.....', '....aeea....', '....aeea....', 'aaaaaeeeaaaa', 'aeeemeeeeeea', '.aeemeeeeea.', '..aeeeeeea..', '..aeeeeeea..', '.aeeeaaeeea.', '.aeeaa.aeea.', '.aaa....aaa.', '............'],
    gotas: ['............', '.....a......', '....ala.....', '...allla....', '...alllla...', '..alllllla..', '..allmllla..', '..allllkka..', '...aakkaa...', '....aaaa....', '............', '............'],
    vapor: ['............', '............', '...aaa.aa...', '.aammmammaa.', 'ammmmmmmmmma', 'ammmmmmmmmma', '.aammmmmmaa.', '...aaaaaa...', '............', '............', '............', '............'],
    cubo: ['............', '..aaaaaaaa..', '.alllllllla.', '.almmllklla.', '.alllllklla.', '.alllklllla.', '.aklllllkka.', '.akkklkkkka.', '..aaaaaaaa..', '............', '............', '............'],
    /* ---------- botella con mensaje ---------- */
    botella: ['....aaaa....', '....aqqa....', '...aammaa...', '..aammmmaa..', '.amlmmmmlma.', '.amlmeemlma.', '.amlmemmlma.', '.amlmmmmlma.', '.amllllllma.', '..aammmmaa..', '...aaaaaa...', '............'],
    /* ---------- hitos de las islas (16x16) ---------- */
    mundoCiencia: ['................', '.......aa.......', '......ammaa.....', '......amma......', '......amma......', '......amma......', '.....alllla.....', '....allllllla...', '...allmlllllla..', '...allmlllllla..', '..alllllllllla..', '..allllgglllla..', '..alllggggllla..', '...allggggllaa..', '....aaaaaaaa....', '................'],
    mundoTec: ['................', '..aaaaaaaaaaaa..', '.apppppppppppa..', '.aplllllllllpa..', '.aplmlllllllpa..', '.aplllggglllpa..', '.aplllllllllpa..', '.aplllllllllpa..', '.apppppppppppa..', '..aaaaaaaaaaa...', '.......aa.......', '....aaaaaaaa....', '...aoooooooooa..', '...aaaaaaaaaaa..', '................', '................'],
    mundoIng: ['......aaaa......', '...aa.aooa.aa...', '..aooaaooaaooa..', '...aooooooooa...', '..aoooaaaaoooa..', '.aooooaddaooooa.', '.aooooadddaoooa.', '.aooooaddaooooa.', '..aoooaaaaoooa..', '...aooooooooa...', '..aooaaooaaooa..', '...aa.aooa.aa...', '......aaaa......', '................', '................', '................'],
    mundoMate: ['................', '..aaaaaaaaaaaa..', '.ajjjjjjjjjjjja.', '.ajmmmmmmmmmmja.', '.ajjjjjjjjjjjja.', '.ajjjmmjjmmjjja.', '.ajjjmmjjmmjjja.', '.ajjjmmjjmmjjja.', '.ajjjmmjjmmmjja.', '.ajjjjjjjjjjjja.', '.aaaaaaaaaaaaaa.', '....aaaaaaaa....', '...aooooooooa...', '...aaaaaaaaaa...', '................', '................'],
    mundoRetos: ['................', '................', '...aaaaaaaaaa...', '..aqqqqqqqqqqa..', '.aqqqqqqqqqqqqa.', '.aqrrrrrrrrrrqa.', '.aaaaaeeaaaaaaa.', '.aqqqaeeaqqqqqa.', '.aqqqqaaqqqqqqa.', '.aqqqqqqqqqqqqa.', '.aqqqqqqqqqqqqa.', '.aaaaaaaaaaaaaa.', '................', '................', '................', '................'],
    /* ---------- objetos y fantasmas de la mansión ---------- */
    llave: ['............', '...aaaa.....', '..aeeeea....', '..aea.ea....', '..aeeeea....', '...aeea.....', '...aeea.....', '...aeeaa....', '...aeea.....', '...aeeaa....', '...aaaa.....', '............'],
    nota: ['............', '..aaaaaaaa..', '..ammmmmma..', '..amaaaama..', '..ammmmmma..', '..amaaaama..', '..ammmmmma..', '..amaaammma.'.slice(0, 12), '..ammmmmma..', '..aaaaaaaa..', '............', '............'],
    emblema: ['..aaaaaaaa..', '.aeeeeeeeea.', '.aeaaaaaaea.', '.aeaeeeeaea.', '.aeaeaaeaea.', '.aeaeaaeaea.', '.aeaeeeeaea.', '.aeaaaaaaea.', '..aeeeeeea..', '...aeeeea...', '....aeea....', '.....aa.....'],
    duda: ['....aaaaaa....', '..aabbbbbbaa..', '.abbbbbbbbbba.', '.abbmmmmmmbba.', 'abbmmbbbbmmbba', 'abbbbbbbmmbbba', 'abbbbbbmmbbbba', 'abbbbbmmbbbbba', 'abbbbbmmbbbbba', 'abbbbbbbbbbbba', 'abbbbbmmbbbbba', 'abb.abbbbba.ba', 'ab...abbba...a', '.a....aaa....a'],
    maquina: ['............', '...aaaaaa...', '..ammmmmma..', '..amaaaama..', '.aaaaaaaaaa.', '.aoooooooooa', '.aomomomomoa'.slice(0, 12), '.aoooooooooa', '.aooaaaaooa.', '.aoooooooooa', '.aaaaaaaaaa.', '............'],
    /* ---------- personajes de la historia ---------- */
    chispa: ['..a.aaaa.a..', '...aeeeea...', '..aeeeeeea..', '.aeaaeeaaea.', '.aeaaeeaaea.', '.aeeeeeeeea.', '.aeecccceea.', '..aeeeeeea..', '...aeeeea...', '....aaaa....', '............', '............'],
    promedio: ['....aaaaaa....', '....appppa....', '....appppa....', '.aaaaaaaaaaaa.', '..annnnnnnna..', '.annnnnnnnnna.', '.anaannnaanna.', '.anaennnaanna.', '.annnnnnnnnna.', '.annaaaaaanna.', '.annnnaannnna.', '..annnnnnnna..', '...annnnnna...', '....aaaaaa....'],
    caraJohnson: ['...aaaaaa...', '..aaaaaaaa..', '.aaqqqqqqaa.', '.aqqqqqqqqa.', '.aqlaqqalqa.', '.aqqqqqqqqa.', '.aqqqccqqqa.', '..aqqqqqqa..', '...aaaaaa...', '..aammmmaa..', '.aammmmmmaa.', '.aaaaaaaaaa.'],
    caraJemison: ['...mmmmmm...', '..mmmmmmmm..', '.amaaaaaama.', '.aqqqqqqqqa.', '.aqaqqqqaqa.', '.aqqqqqqqqa.', '.aqqqccqqqa.', '..aqqqqqqa..', '...aaaaaa...', '..ajjjjjja..', '.ajjjjjjjja.', '.aaaaaaaaaa.'],
    caraCurie: ['....oooo....', '...oooooo...', '..oottttoo..', '.aottttttoa.', '.atattttata.', '.atttttttta.', '.atttccttta.', '..atttttta..', '...aaaaaa...', '..appppppa..', '.appppppppa.', '.aaaaaaaaaa.'],
    caraCamarena: ['..aaaaaaaa..', '.aaaaaaaaaa.', '.aattttttaa.', '.atatttatta.', '.atttttttta.', '.atatttatta.', '.atttttttta.', '.attaaaatta.', '..atttttta..', '..ammmcmma..', '.ammmmcmmma.', '.aaaaaaaaaa.'],
    tormenta: ['.......aaaa.........', '....aaappppaa.......', '..aappppppppppaa.aa.', '.appppppppppppppapa.', 'appppppppppppppppppa', 'aooooooooooooooooooa', '.aaaaaaaaaaaaaaaaaa.', '......aeea..........', '.....aeea...........', '......aea...........'],
    cajaSellada: ['............', '..aaaaaaaa..', '.aqqqqqqqqa.', '.aqrrrrrrqa.', '.aaaaaaaaaa.', '.aqqqeeqqqa.', '.aqqaeeaqqa.', '.aqqqeeqqqa.', '.aqqqqqqqqa.', '.aaaaaaaaaa.', '............', '............'],
    /* ---------- personaje guía (12x16) ---------- */
    guia: ['...aaaaaaa...', '..acccccccaa.', '.accccccccccaa', '.aeeeeeeeeeea.', '.aetaeeaetea..', '..attttttta...', '..atttccttta..', '...attttta....', '..ajjjjjjja...', '.aejjjjjjjea..', '.attjjjjjjtta.', '..ajjjjjjja...', '..ajjaajjja...', '..aoo..ooa....', '.aooa..aooa...', '.aaa....aaa...'],
  };
  const cache = {};
  const rows = m => { const w = Math.max(...m.map(r => r.length)); return { w, h: m.length, rows: m.map(r => r.padEnd(w, '.')) }; };
  function lienzo(nombre, k = 1, flip = false) {
    const { w, h, rows: R } = rows(SPR[nombre]);
    const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    R.forEach((r, y) => [...r].forEach((ch, xx) => { if (ch !== '.' && PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect((flip ? w - 1 - xx : xx) * k, y * k, k, k); } }));
    return c;
  }
  const url = (nombre, k = 4) => { const key = nombre + '@' + k; if (!cache[key]) { if (!SPR[nombre]) return ''; cache[key] = lienzo(nombre, k).toDataURL(); } return cache[key]; };
  /* <img> pixelado listo para usar dentro del HTML */
  const ico = (nombre, px = 36, alt = '') => { const { w, h } = rows(SPR[nombre] || ['.']); const k = Math.max(1, Math.round(px / Math.max(w, h))); return `<img class="px" src="${url(nombre, 4)}" width="${w * k}" height="${h * k}" alt="${alt}" ${alt ? '' : 'aria-hidden="true"'} draggable="false">`; };

  /* Isla procedural: forma, arena, pasto con flores y acantilado. Cada semilla da una isla distinta. */
  function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function isla(seed, W = 44, H = 32, acento = 'e') {
    const R = rnd(seed), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const cx = W / 2, cy = H / 2 - 3, rx = W / 2 - 3, ry = H / 2 - 7, fase = [R() * 6, R() * 6, R() * 6];
    const dentro = (px, py) => { const dx = (px - cx) / rx, dy = (py - cy) / ry, ang = Math.atan2(dy, dx); const r = Math.hypot(dx, dy); return r < 1 + 0.13 * Math.sin(ang * 3 + fase[0]) + 0.08 * Math.sin(ang * 5 + fase[1]); };
    const pon = (px, py, col) => { x.fillStyle = col; x.fillRect(px, py, 1, 1); };
    for (let off = 5; off >= 1; off--) for (let py = 0; py < H - off; py++) for (let px = 0; px < W; px++) if (dentro(px, py)) pon(px, py + off, off > 2 ? PAL.r : PAL.q);
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) if (dentro(px, py)) {
      const borde = !dentro(px - 1, py) || !dentro(px + 1, py) || !dentro(px, py - 1) || !dentro(px, py + 1);
      const casi = !dentro(px - 2, py) || !dentro(px + 2, py) || !dentro(px, py - 2) || !dentro(px, py + 2);
      pon(px, py, borde ? PAL.a : casi ? PAL.e : (R() < .1 ? PAL.f : PAL.g));
    }
    for (let i = 0; i < 9; i++) { const px = 4 + Math.floor(R() * (W - 8)), py = 3 + Math.floor(R() * (H - 12)); if (dentro(px, py) && dentro(px - 2, py) && dentro(px + 2, py) && dentro(px, py - 2) && dentro(px, py + 2)) pon(px, py, [PAL.m, PAL.c, PAL.e][i % 3]); }
    return c;
  }
  /* Marco con esquinas de pixel para botones y tarjetas (border-image de 5x5 pixeles) */
  function marco(relleno, borde) {
    const c = document.createElement('canvas'); c.width = 5; c.height = 5; const x = c.getContext('2d');
    const m = ['.bbb.', 'brrrb', 'brrrb', 'brrrb', '.bbb.'];
    m.forEach((f, y) => [...f].forEach((ch, xx) => { if (ch === '.') return; x.fillStyle = ch === 'b' ? borde : relleno; x.fillRect(xx, y, 1, 1); }));
    return `url("${c.toDataURL()}")`;
  }
  function instalarMarcos() {
    const r = document.documentElement.style;
    [['card', '#ffffff', PAL.a], ['btn', PAL.j, PAL.a], ['btnalt', '#ffffff', PAL.j], ['gh', '#dbe4ff', PAL.a], ['ok', '#d8f7c8', PAL.g], ['no', '#ffe3c0', PAL.d], ['sel', '#fff4c9', PAL.a], ['dark', PAL.p, PAL.a], ['sky', '#d4ecff', PAL.a], ['big', PAL.d, PAL.a]]
      .forEach(([n, f, b]) => r.setProperty('--m-' + n, marco(f, b)));
    // Fondo de mar claro (se repite cada 48 px = 16 px del dibujo x3)
    const t = document.createElement('canvas'); t.width = t.height = 16; const x = t.getContext('2d');
    x.fillStyle = '#9ad8ff'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#c9f1ff'; [[2, 3, 4], [10, 9, 4], [5, 13, 3], [12, 1, 3]].forEach(([a, b, w]) => x.fillRect(a, b, w, 1));
    x.fillStyle = '#7cc6f2'; [[7, 6, 2], [1, 10, 2], [13, 14, 2]].forEach(([a, b, w]) => x.fillRect(a, b, w, 1));
    const g = document.createElement('canvas'); g.width = g.height = 48; const y = g.getContext('2d'); y.imageSmoothingEnabled = false; y.drawImage(t, 0, 0, 48, 48);
    document.body.style.backgroundImage = `url("${g.toDataURL()}")`; document.body.style.backgroundSize = '48px 48px';
  }
  return { PAL, SPR, lienzo, url, ico, isla, marco, instalarMarcos, rnd, rows };
})();

# NEUROPLAY · Explora. Comprende. Descubre.

Plataforma web interactiva de acompañamiento, inspiración y exploración educativa STEM. Reto 04: Educación y Talento, Hackathon Jalisco Internacional 2026. Territorio del prototipo: Acatlán de Juárez, Jalisco; estudiantes de secundaria (12 a 14 años).

## Cómo probarla
Juega en línea: https://willy-sh.github.io/neuroplay/

Abre `index.html` en cualquier navegador moderno (no necesita instalación ni internet). También funciona publicada como sitio estático.

## La historia: «El caso de Don Promedio»
Isla Neuron perdió su luz (la Chispa) y los chicos empiezan a desaparecer de las aulas. Cada isla guarda una pista hecha con datos reales de los datasets del reto; para abrirla hay que resolver retos de ciencia, mates, tecnología e ingeniería. Cuatro islas aliadas (con placas de mentores reales, sin frases inventadas) llevan a la Torre final, donde se atrapa al culpable: un promedio que esconde diferencias. Guion en `historia.js`; pistas con datos de INEGI, CONEVAL y PISA; una «Temporada 2» con las cajas selladas (datasets del catálogo por integrar).

## Qué incluye
Diseñada para chicos de 12 a 14 años: menú de 5 iconos, una idea por pantalla, muy poco texto y pictogramas «de cada 100».
- **Mundo:** mapa con 5 islas (Ciencia, Tecnología, Ingeniería, Mates, Retos) y 7 retos (frenón del autobús, hielo y vapor, mezcla de luz, limonada, robot, balancín, detective de datos).
- **Mi zona:** las 32 localidades reales de Acatlán de Juárez con 4 capas (escuela, internet, computadora, sin nada) y tres descubrimientos.
- **Mentores:** Guillermo González Camarena, Katherine Johnson, Mae Jemison y Marie Curie (hechos verificables, sin citas inventadas).
- **Cuéntame:** cuestionario anónimo y opcional, sin texto libre; punto de partida y avance de 6 preguntas.
- **Yo:** puntos, medallas y antes y después.
- **Adultos:** fuentes y método, datos completos (tabla de dónde enfocar apoyo, posición entre los 125 municipios, tendencia 2010–2020), análisis de grupo y declaración de uso de IA.
- **Sin internet:** después de la primera visita abre sin conexión (service worker) y se puede instalar en el celular.
- **Accesibilidad:** tamaño de letra, alto contraste, lectura en voz alta, teclado y movimiento reducido.

## Datos (reales y reproducibles)
`datos/acatlan.js` lo genera `herramientas/generar_datos.py` a partir de:
- INEGI, Censo de Población y Vivienda 2020 (ITER Jalisco, por localidad).
- CONEVAL, medición de pobreza municipal 2010–2020 (anexo estadístico).

```
pip install openpyxl
python herramientas/generar_datos.py
python herramientas/generar_entregables.py   # reporte, manual, pitch y guion
```
La plataforma en sí no necesita nada instalado: es HTML, CSS y JavaScript sin dependencias.

## Estructura
```
index.html  script.js  styles.css
datos/acatlan.js                 datos oficiales (generado)
herramientas/generar_datos.py    descarga y calcula los indicadores
herramientas/generar_entregables.py
entregables/                     reporte, manual, pitch, infografía, guion de video
```

## Lo que es real y lo que es simulado
- Real: todos los datos de «Explora tu entorno» y «Ciencia y datos» (INEGI y CONEVAL).
- Real: el cálculo «Acatlán en hogares» (estimación propia con datos oficiales; explicada en la plataforma).
- De prueba (inventado, marcado así en pantalla): las gráficas de «Análisis» con «datos de prueba».
- Simulado: no hay servidor; las respuestas se guardan solo en el navegador de cada persona.

## Declaración de uso de IA
Parte del código y de los textos se elaboró con ayuda de herramientas de inteligencia artificial y fue revisado por el equipo. Los datos oficiales no los genera una IA. La plataforma no usa IA al funcionar.

**Arte generado con IA:** todo el arte ilustrado del juego se generó con IA: las cinco islas del mundo (`arte/isla_*.png`), el personaje (`arte/heroe.png`), Don Promedio (`arte/villano.png`), los retratos de los mentores (`arte/mentor_*.png`), las cinco escenas de la cinemática (`arte/cine_*.jpg`) y los fondos de las arenas (`arte/fondo_*.jpg`). Se generaron en una computadora local con el modelo Z-Image Turbo (Tongyi-MAI) mediante stable-diffusion.cpp y la app Open Generative AI (MIT), sin servicios en la nube. Los retratos de los mentores son ilustraciones inspiradas en su historia, no fotografías. Si una imagen no carga, el juego usa dibujos hechos con código. Conviene revisar la licencia del modelo antes de un uso comercial.

## Arte y animación (pixel art)
- **Motor:** Phaser 3 (MIT), incluido en `vendor/phaser.min.js` para que funcione sin internet. El mundo de las islas está en `mundo.js` (mar que brilla, nubes, islas que flotan, personaje que salta, destellos).
- **Dibujos:** todos los dibujos (iconos, personaje, hitos, islas, marcos de botones) se generan con código en `pixel.js`, a partir de mapas de letras con la paleta libre Sweetie 16. Para ver todos juntos abre `herramientas/vista-sprites.html`. Si el equipo prefiere arte hecho a mano (Aseprite, LibreSprite, Piskel), basta con exportar PNG y cargarlos en lugar de `Px.url(nombre)`.
- **Experiencia de videojuego (nuevo):** `intro.js` muestra la animación de entrada (estrellas, mar, título, personaje y Don Promedio) y pide el **gametag** (apodo de 2 a 14 caracteres seguros; se pide no usar el nombre real y se guarda solo en el dispositivo). `arena.js` es un combate de acción visto desde arriba, inspirado en Mageseeker: mueves al personaje (joystick táctil o WASD), atacas con auto-apuntado, esquivas con invulnerabilidad breve, **absorbes** la magia de las Nieblas debilitadas para cargar el poder especial de cada isla (Rayo de luz, Cristales, Pulso hackeo, Martillazo, Luz de datos) y entre oleadas respondes un cristal de pregunta STEM. La Torre termina con un jefe, Don Promedio. Al ganar se desbloquea un archivo con un dato real (INEGI, CONEVAL, OCDE) y se abre la isla con sus retos. Incluye Modo calmado, pausa automática al ocultar la pestaña, sonidos sintetizados (WebAudio, sin archivos) y marcador local por isla. Se rejuega desde «⚔ Arenas».
- **Historia por capítulos (nuevo):** cada isla es un capítulo: diálogo de Chispa → arena (2 oleadas con un cristal de pregunta entre ellas) → **jefe con escudo**, la «Duda» de esa isla, que solo se rompe resolviendo ejercicios STEM → cierre con un **dato real** de los datasets y la placa del mentor → «¿Y tú?», donde la persona elige qué duda ha sentido y ve que a un mentor le pasó algo parecido. En medio de la pelea **entra el mentor** de la isla (Curie, Johnson, Camarena, Jemison) con un hecho real, el obstáculo que enfrentó y un consejo; si la vida baja, vuelve a ayudar. Los consejos son del juego, inspirados en su historia, y se marcan como tales (nunca son citas inventadas). La Torre enfrenta a Don Promedio con ejercicios de lectura de datos y termina con «Una carta para ti»: tus dudas, lo que enfrentaron los mentores y la decisión de seguir estudiando. Los textos y ejercicios están en `guion.js`.
- **Cómo correrlo mientras se desarrolla:** desde la carpeta del proyecto ejecuta `npm run dev` y abre `http://localhost:5173`. El servidor (`servidor.js`) no usa caché, así que cada cambio se ve al recargar (Ctrl+Shift+R); en localhost el service worker se desactiva. Otro puerto en PowerShell: `$env:PORT=8080; npm run dev`.
- **Historia lineal dentro de la Mansión (estilo survival-horror):** al entrar y elegir tu gametag empiezas en el vestíbulo: tomas la llave, abres el Laboratorio, **hablas con el mentor de la sala** y usas el **portal** (la terminal) que lleva a la isla de esa sala. En la isla peleas, rompes el escudo del jefe con ejercicios y regresas con un dato real, tu duda frente a la del mentor, una llave y un emblema para abrir la siguiente sala. Con los cuatro emblemas se abre la Torre y el combate final con Don Promedio. Las islas solo se abren desde su sala; después se pueden rejugar desde el mapa (☰).
- **Mentores ilustrados:** retratos generados con Z-Image Turbo (`arte/mentor_*.png`), inspirados en su historia; no son retratos fotográficos.
- **Mecánicas del juego:** vida y corazones que sueltan los enemigos, combos, absorción de magia, poder especial por isla, esquiva con enfriamiento, escudo del jefe que se rompe con ejercicios, estrellas y puntos por arena, **chispas** (moneda) que se gastan en el **Taller de mejoras** (más vida, ataque veloz, esquiva ágil, carga inicial; 3 niveles cada una), Modo calmado y las chispas no se pierden al perder una pelea. El cursor del mouse se oculta mientras juegas (arena y primera persona de la Mansión) y reaparece en menús, tarjetas, cuaderno y diálogos.
- **Lenguaje directo:** las explicaciones de los mentores y de los datos usan frases simples (por ejemplo, «la excluían por el color de su piel y había barreras por ser mujer; aun así llegó muy lejos»). Cada mentor se liga con una duda concreta y con un dato real de Acatlán; el mensaje central es «tú no eres el problema»: los datos describen lugares y grupos, no culpan a nadie y no explican causas.
- **Modo juego:** al entrar, el mundo ocupa toda la pantalla con HUD (gametag, nivel, historia y menú ☰); las pantallas de página (Mi zona, Mentores, Adultos) quedan dentro del menú.
- **Expediente del reto (nuevo):** el botón «📁 Expediente» resume lo que pide el documento oficial (delimitación, datasets citados con institución, periodo y cobertura, tres áreas de conocimiento, los 5 criterios de éxito con su estado, qué es real o simulado y declaración de IA).
- **Letra pixelada:** Press Start 2P (licencia SIL OFL, en `fonts/`), solo para títulos y botones; el texto corrido usa una letra redonda legible.
- **Accesibilidad del juego:** los botones de las islas son HTML real sobre el juego (teclado y lectores de pantalla); con «reducir movimiento» el mar, las nubes y los saltos se quedan quietos; el juego se pausa fuera de la pantalla del Mundo.
- **Instalar de nuevo las dependencias** (solo si se quiere actualizar Phaser o la letra): `npm install` y copiar `node_modules/phaser/dist/phaser.min.js` a `vendor/`.

## Historia, mentores y recompensas (versión de juego)
- **Cinemática de apertura** (`cine.js`, 5 escenas ilustradas, se puede saltar): explica por qué se apagó la Chispa y se cerraron las aulas (un promedio que escondía a quién se quedaba atrás). Se vuelve a ver desde ☰ → «Ver la historia».
- **Mentores con personalidad** (`guion.js`): cada uno habla con su propia voz (Marie, calmada y con humor; Katherine, cálida y de números; Guillermo, bromista tapatío; Mae, segura y aventurera). Los hechos de su vida son reales; las conversaciones son una dramatización inspirada en su historia y no se presentan como frases suyas. Entran a la pelea con un aviso corto que no detiene el juego y reaccionan a tus respuestas.
- **Recompensas**: cada isla da un «recuerdo» que mejora al personaje (+1 corazón, ataque más rápido, esquiva, especial inicial). Los datos de Acatlán ya no son el premio: aparecen en una charla breve con el mentor («¿te ha pasado…?») y quedan como notas en Mi cuaderno.
- **Sin repeticiones**: cada pregunta sale una vez antes de volver a aparecer (8 por isla); las Dudas de la Mansión ya no repiten la misma pregunta y, si fallas, se alejan.
- Arte nuevo generado localmente con Z-Image Turbo (cinemática y retratos de mentores).


## Código abierto
NeuroPlay es un proyecto abierto: cualquier persona con ganas de ayudar puede mejorar el juego (preguntas, historias, accesibilidad, traducciones, datos de otras regiones). Abre un *issue* para proponer algo o un *pull request* con tu mejora. Licencia MIT (ver `LICENSE`); el arte generado con IA se comparte bajo la misma licencia.

Para correrlo en tu computadora: `npm install` y `npm run dev`, y abre http://localhost:5173.

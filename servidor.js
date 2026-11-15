/* Servidor local de desarrollo de NEUROPLAY: sirve la carpeta del proyecto SIN caché, para ver cada cambio al recargar.
   Uso:  npm run dev   (abre http://localhost:5173)   ·   otro puerto:  PORT=8080 npm run dev  (en PowerShell: $env:PORT=8080; npm run dev) */
const http = require('http'), fs = require('fs'), path = require('path');
const RAIZ = __dirname, PUERTO = +process.env.PORT || 5173;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json' };
http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.normalize(path.join(RAIZ, ruta));
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end('No permitido'); }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado: ' + ruta); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' });
    res.end(datos);
  });
}).listen(PUERTO, '127.0.0.1', () => console.log(`NEUROPLAY listo en http://localhost:${PUERTO}  (sin caché; Ctrl+C para detener)`));

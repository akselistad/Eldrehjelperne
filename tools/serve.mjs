import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../nettside');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const port = Number(process.env.PORT || 4173);
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root, '.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root && !file.startsWith(root+path.sep)) {res.writeHead(403);res.end('Ingen tilgang');return;}
    const data = await fs.readFile(file);
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'}); res.end(data);
  } catch {res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html lang="nb"><meta charset="utf-8"><title>Siden finnes ikke</title><h1>Siden finnes ikke</h1><a href="/">Til Eldrehjelperne</a></html>');}
}).listen(port,'127.0.0.1',() => console.log(`Eldrehjelperne: http://127.0.0.1:${port}`));

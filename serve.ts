// Badak Bowohasim — tiny local server for game/ (Node 22, standard library only).
//
// A development convenience, nothing more: it lets the game be played from
// game/ without a build step. Start it with `node serve.ts` (or
// `node serve.ts --port 9000` for another port) and open http://localhost:8080.
// It only listens on 127.0.0.1, only serves files inside game/, sends the MIME
// type a browser game needs for each extension, and answers 400/403/404 for
// anything it cannot or will not serve.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// The folder served is game/ beside this file, resolved once at startup.
const gameDir = resolve(fileURLToPath(new URL('./game', import.meta.url)));

function pickPort(argv: string[]): number {
  const at = argv.indexOf('--port');
  const wanted = at === -1 ? 8080 : Number(argv[at + 1]);
  if (!Number.isInteger(wanted) || wanted <= 0 || wanted >= 65536) return 8080;
  return wanted;
}

const port = pickPort(process.argv.slice(2));

// MIME type by file extension; anything unknown goes out as a generic stream.
const mimeByExtension: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.wasm': 'application/wasm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
};

// Turn a request path into a file inside game/, or null when it escapes game/.
function fileInsideGame(requestPath: string): string | null {
  let cleaned = requestPath;
  if (cleaned.endsWith('/')) cleaned += 'index.html';
  const target = resolve(join(gameDir, normalize(cleaned)));
  if (target !== gameDir && !target.startsWith(gameDir + sep)) return null;
  return target;
}

createServer((request, response) => {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  const file = fileInsideGame(pathname);
  if (file === null) {
    response.writeHead(403).end('forbidden');
    return;
  }
  let size: number;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    size = info.size;
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': mimeByExtension[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`game/ is on http://localhost:${port}`);
});

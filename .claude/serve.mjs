// 静的ファイル配信用の軽量サーバー（依存パッケージ不要）
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd();
const PORT = process.env.PORT || 8199;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, `http://localhost`).pathname);
    if (path === '/') path = '/index.html';
    // ディレクトリアクセスは index.html にフォールバック
    if (path.endsWith('/')) path += 'index.html';

    let filePath = normalize(join(ROOT, path));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    let data;
    try {
      data = await readFile(filePath);
    } catch {
      // 拡張子なしのパスは .html を試す
      try {
        data = await readFile(filePath + '.html');
        filePath += '.html';
      } catch {
        const notFound = await readFile(join(ROOT, '404.html')).catch(() => 'Not Found');
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(notFound);
        return;
      }
    }

    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    res.writeHead(500);
    res.end('Server Error: ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});

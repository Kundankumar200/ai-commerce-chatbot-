const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5174; // Run on port 5174 so it doesn't conflict with 5173
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // Normalize path and remove query strings
  let safeUrl = req.url.split('?')[0];
  if (safeUrl === '/') {
    safeUrl = '/index.html';
  }
  
  let filePath = path.join(DIST_DIR, safeUrl);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA fallback to index.html
      filePath = path.join(DIST_DIR, 'index.html');
    }
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    
    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error(streamErr);
      res.writeHead(500);
      res.end('Internal Server Error');
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 AI E-Commerce Preview is running!`);
  console.log(`➜  Local:   http://localhost:${PORT}/`);
  console.log(`➜  Press Ctrl+C to close the server\n`);
});

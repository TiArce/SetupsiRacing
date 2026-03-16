const http = require('http');
const fs = require('fs');
const path = require('path');
const MIME = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'};
const BASE = '/home/user/webapp';
const server = http.createServer((req,res) => {
  let p = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.join(BASE, p);
  try {
    const d = fs.readFileSync(file);
    const ext = path.extname(file);
    res.writeHead(200,{'Content-Type':MIME[ext]||'text/plain','Cache-Control':'no-cache'});
    res.end(d);
  } catch(e) { res.writeHead(404); res.end('Not found: ' + p); }
});
server.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));

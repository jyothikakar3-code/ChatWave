const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const port = Number(process.env.PORT || 8787);
const clients = new Set();
const messages = [];
const groups = [{ id: 'general', name: 'Family Group', members: [] }];

function contentType(file) {
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/html; charset=utf-8';
}

function frame(text) {
  const payload = Buffer.from(text);
  if (payload.length < 126) return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  if (payload.length < 65536) { const head = Buffer.alloc(4); head[0] = 0x81; head[1] = 126; head.writeUInt16BE(payload.length, 2); return Buffer.concat([head, payload]); }
  const head = Buffer.alloc(10); head[0] = 0x81; head[1] = 127; head.writeBigUInt64BE(BigInt(payload.length), 2); return Buffer.concat([head, payload]);
}

function broadcast(data) {
  const packet = frame(JSON.stringify(data));
  for (const client of clients) client.socket.write(packet);
}

function send(client, data) { client.socket.write(frame(JSON.stringify(data))); }

function handleMessage(client, payload) {
  let data;
  try { data = JSON.parse(payload); } catch { return; }
  if (data.type === 'hello') {
    client.user = { id: data.userId || crypto.randomUUID(), name: data.name || 'Guest' };
    send(client, { type: 'ready', user: client.user, groups });
    broadcast({ type: 'presence', user: client.user, online: true });
  }
  if (data.type === 'message' && client.user && data.text?.trim()) {
    const message = { id: crypto.randomUUID(), conversationId: data.conversationId || 'direct', text: data.text.trim(), sender: client.user, sentAt: new Date().toISOString() };
    messages.push(message);
    broadcast({ type: 'message', message });
  }
  if (data.type === 'history') send(client, { type: 'history', messages: messages.filter(item => item.conversationId === data.conversationId) });
  if (data.type === 'create-group' && client.user && data.name?.trim()) {
    const group = { id: crypto.randomUUID(), name: data.name.trim(), members: [client.user.id] };
    groups.push(group);
    broadcast({ type: 'group-created', group });
  }
}

function parseFrames(client, buffer) {
  while (buffer.length >= 2) {
    const second = buffer[1]; let length = second & 127; let offset = 2;
    if (length === 126) { if (buffer.length < 4) return buffer; length = buffer.readUInt16BE(2); offset = 4; }
    if (length === 127) { if (buffer.length < 10) return buffer; length = Number(buffer.readBigUInt64BE(2)); offset = 10; }
    const masked = Boolean(second & 128); if (masked) offset += 4;
    if (buffer.length < offset + length) return buffer;
    let body = buffer.subarray(offset, offset + length);
    if (masked) { const key = buffer.subarray(offset - 4, offset); body = Buffer.from(body); for (let i = 0; i < body.length; i++) body[i] ^= key[i % 4]; }
    if ((buffer[0] & 15) === 1) handleMessage(client, body.toString());
    buffer = buffer.subarray(offset + length);
  }
  return buffer;
}

const server = http.createServer((request, response) => {
  const file = path.join(__dirname, request.url === '/' ? 'index.html' : request.url);
  if (!file.startsWith(__dirname) || !fs.existsSync(file)) { response.writeHead(404); return response.end('Not found'); }
  let html = fs.readFileSync(file);
  if (file.endsWith('index.html')) html = Buffer.from(html.toString().replace('</body>', `<script src="/realtime-client.js"></script></body>`));
  response.writeHead(200, { 'Content-Type': contentType(file) }); response.end(html);
});

server.on('upgrade', (request, socket) => {
  if (request.headers.upgrade?.toLowerCase() !== 'websocket') return socket.destroy();
  const key = request.headers['sec-websocket-key'];
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  const client = { socket, user: null }; clients.add(client); let buffer = Buffer.alloc(0);
  socket.on('data', chunk => { buffer = parseFrames(client, Buffer.concat([buffer, chunk])); });
  socket.on('close', () => { clients.delete(client); if (client.user) broadcast({ type: 'presence', user: client.user, online: false }); });
  socket.on('error', () => clients.delete(client));
});

server.listen(port, () => console.log(`ChatWave AVN running at http://localhost:${port}`));

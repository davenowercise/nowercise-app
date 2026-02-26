import { WebSocketServer } from 'ws';
import net from 'net';

const WS_PORT = parseInt(process.env.WS_PROXY_PORT || '5488', 10);
const PG_HOST = process.env.PG_HOST || '127.0.0.1';
const PG_PORT = parseInt(process.env.PG_PORT || '5432', 10);

const wss = new WebSocketServer({ port: WS_PORT, path: '/v2' });

wss.on('connection', (ws) => {
  const pg = net.createConnection({ host: PG_HOST, port: PG_PORT });

  ws.on('message', (data) => {
    if (pg.writable) pg.write(Buffer.from(data));
  });

  pg.on('data', (data) => {
    if (ws.readyState === ws.OPEN) ws.send(data);
  });

  ws.on('close', () => pg.destroy());
  ws.on('error', () => pg.destroy());
  pg.on('close', () => ws.close());
  pg.on('error', () => ws.close());
});

wss.on('listening', () => {
  console.log(`[ws-proxy] WebSocket→PostgreSQL proxy on ws://127.0.0.1:${WS_PORT}/v2 → ${PG_HOST}:${PG_PORT}`);
});

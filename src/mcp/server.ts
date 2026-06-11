import { resolve } from 'node:path';
import { handleToolCall, TOOL_DEFINITIONS } from './tools.js';

// MCP JSON-RPC 2.0 stdio server — content-length framed (LSP-style).
// Zero runtime dependencies — implements the wire protocol directly.

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_VERSION   = '0.1.1';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string | null;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ── Wire framing ──────────────────────────────────────────────────────────

export function encodeMessage(msg: object): Buffer {
  const body = JSON.stringify(msg);
  const len  = Buffer.byteLength(body, 'utf-8');
  return Buffer.from(`Content-Length: ${len}\r\n\r\n${body}`, 'utf-8');
}

export async function* decodeMessages(
  input: NodeJS.ReadableStream,
): AsyncGenerator<JsonRpcRequest> {
  let buf = Buffer.alloc(0);

  for await (const chunk of input) {
    buf = Buffer.concat([
      buf,
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, 'utf-8'),
    ]);

    // Drain all complete frames from the buffer
    while (true) {
      const sep = buf.indexOf('\r\n\r\n');
      if (sep === -1) break;

      const header = buf.slice(0, sep).toString('utf-8');
      const match  = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) { buf = buf.slice(sep + 4); continue; }

      const bodyLen   = parseInt(match[1], 10);
      const bodyStart = sep + 4;
      if (buf.length < bodyStart + bodyLen) break;  // need more data

      const body = buf.slice(bodyStart, bodyStart + bodyLen).toString('utf-8');
      buf = buf.slice(bodyStart + bodyLen);

      try { yield JSON.parse(body) as JsonRpcRequest; }
      catch { /* skip malformed */ }
    }
  }
}

// ── Response helpers ──────────────────────────────────────────────────────

function send(out: NodeJS.WritableStream, msg: JsonRpcResponse): void {
  out.write(encodeMessage(msg));
}

function reply(out: NodeJS.WritableStream, id: JsonRpcRequest['id'], result: unknown): void {
  send(out, { jsonrpc: '2.0', id, result });
}

function replyError(out: NodeJS.WritableStream, id: JsonRpcRequest['id'], code: number, message: string): void {
  send(out, { jsonrpc: '2.0', id, error: { code, message } });
}

// ── Server loop ───────────────────────────────────────────────────────────

export async function runMcpServer(
  input: NodeJS.ReadableStream  = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
  cwd: string                   = resolve(process.cwd()),
): Promise<void> {
  const log = (msg: string) => process.stderr.write(`[half-mcp] ${msg}\n`);

  log(`started cwd=${cwd}`);
  input.resume();

  for await (const req of decodeMessages(input)) {
    // Notifications have no id — fire and forget
    const isNotification = req.id === undefined || req.id === null;

    log(`recv method=${req.method} id=${String(req.id)}`);

    switch (req.method) {
      case 'initialize':
        reply(output, req.id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: 'half', version: SERVER_VERSION },
        });
        break;

      case 'notifications/initialized':
        break; // no response

      case 'tools/list':
        reply(output, req.id, { tools: TOOL_DEFINITIONS });
        break;

      case 'tools/call': {
        const p = req.params as { name: string; arguments?: Record<string, unknown> };
        try {
          const result = await handleToolCall(cwd, p.name, p.arguments ?? {});
          reply(output, req.id, result);
        } catch (err) {
          reply(output, req.id, {
            content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
            isError: true,
          });
        }
        break;
      }

      default:
        if (!isNotification) {
          replyError(output, req.id, -32601, `Method not found: ${req.method}`);
        }
    }
  }
}

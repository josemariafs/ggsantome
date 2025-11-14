import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { KickWebSocket } from 'kick-wss';
import https from 'https';
// @ts-ignore - ws does not have bundled types in this project; treat as any
import WebSocketClient from 'ws';
import zlib from 'zlib';
import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { initializeDatabase, saveDailyStats, getDailyStatsForDate } from './database.js';

try{ 
// Helper to fetch channel info with proper headers
async function fetchChannelInfo(channelName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'kick.com',
      path: `/api/v2/channels/${channelName}`,
      method: 'GET',
      headers: {
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
         'Accept': '*/*',
         'Accept-Encoding': 'gzip, deflate, br',
         'Accept-Language': 'en-US,en;q=0.9',
         'Cache-Control': 'no-cache',
         'Connection': 'keep-alive',
         'DNT': '1',
         'Pragma': 'no-cache',
         'Referer': 'https://kick.com/',
         'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120"',
         'Sec-CH-UA-Mobile': '?0',
         'Sec-CH-UA-Platform': '"Windows"',
         'Sec-Fetch-Dest': 'empty',
         'Sec-Fetch-Mode': 'cors',
         'Sec-Fetch-Site': 'same-origin',
      },
    };

    https
      .get(options, (res) => {
        const status = res.statusCode || 0;
        const encoding = (res.headers['content-encoding'] || '').toString();
        console.log(`[fetchChannelInfo] ${channelName} status=${status} encoding=${encoding}`);

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));

        res.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);

            // If HTTP error, try to decode and extract Kick's error message
            if (status >= 400) {
              try {
                let errDecoded: Buffer | null = null;
                if (encoding.includes('br')) errDecoded = zlib.brotliDecompressSync(buffer);
                else if (encoding.includes('gzip')) errDecoded = zlib.gunzipSync(buffer);
                else if (encoding.includes('deflate')) errDecoded = zlib.inflateSync(buffer);
                else errDecoded = buffer;

                const errText = errDecoded.toString('utf8');
                let userMsg = `HTTP ${status}: ${res.statusMessage || ''}`;
                try {
                  const parsedErr = JSON.parse(errText);
                  if (parsedErr && parsedErr.error) {
                    userMsg = `Kick API: ${parsedErr.error} (ref: ${parsedErr.reference || 'n/a'})`;
                  }
                } catch (e) {
                  // ignore JSON parse errors for error payload
                }
                return reject(new Error(userMsg));
              } catch (e) {
                const sample = buffer.slice(0, 200).toString('hex');
                const msg = `HTTP ${status}: ${res.statusMessage || ''} (sample:${sample})`;
                return reject(new Error(msg));
              }
            }

            let decoded: Buffer | null = null;
            if (encoding.includes('br')) {
              decoded = zlib.brotliDecompressSync(buffer);
            } else if (encoding.includes('gzip')) {
              decoded = zlib.gunzipSync(buffer);
            } else if (encoding.includes('deflate')) {
              decoded = zlib.inflateSync(buffer);
            } else {
              decoded = buffer;
            }

            const text = decoded.toString('utf8');
            // log a small sample to help debugging (not the whole payload)
            console.log(`[fetchChannelInfo] ${channelName} sample=${text.slice(0,200).replace(/\n/g,' ')}...`);
            const parsed = JSON.parse(text);
            resolve(parsed);
          } catch (err:any) {
            const sampleHex = Buffer.concat(chunks).slice(0,100).toString('hex');
            console.error(`[fetchChannelInfo] Failed to decode/parse for ${channelName}: ${err.message} sampleHex=${sampleHex}`);
            reject(new Error(`Failed to parse JSON: ${err.message}`));
          }
        });
      })
      .on('error', (e) => {
        reject(e);
      });
  });
}

// Fallback using Puppeteer to scrape the channel page when API is blocked
async function getChannelInfoWithPuppeteer(channelName: string): Promise<any> {
  // Use puppeteer-extra with stealth plugin to reduce bot detection
  try {
    puppeteerExtra.use(StealthPlugin());
  } catch (e) {
    console.warn('[getChannelInfoWithPuppeteer] Could not register stealth plugin:', (e as any).message || e);
  }

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const browser = await puppeteerExtra.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`https://kick.com/${channelName}`, { waitUntil: 'networkidle2', timeout: 45000 });

    // First, try to call the Kick API from the page context (this uses browser headers/cookies)
    const info = await page.evaluate(async (ch) => {
      try {
        // Attempt an in-page fetch to the same API used by the site
        const resp = await fetch(`/api/v2/channels/${ch}`, { credentials: 'same-origin' });
        const status = resp.status;
        const text = await resp.text();
        if (!resp.ok) {
          return { __error: `status:${status}`, __text: text.slice(0, 1000) };
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          return { __error: 'json_parse', __text: text.slice(0, 1000) };
        }
      } catch (e: any) {
        return { __error: (e && e.message) ? e.message : String(e) };
      }
    }, channelName as any);

    // If the in-page fetch returned a wrapped error object, propagate as failure so caller can fallback/notify
    if (info && typeof info === 'object' && (info.__error || info.error)) {
      console.log(`[getChannelInfoWithPuppeteer] in-page fetch returned error for ${channelName}:`, info.__error || info.error);
      // Try to extract structured data from embedded scripts (Next.js or ld+json)
      try {
        // Use an any-cast to avoid TypeScript DOM lib issues when compiling server-side
  const embedded: any = await page.evaluate(`(() => {
          const result = {};
          try {
            const next = document.getElementById('__NEXT_DATA__');
            if (next && next.textContent) result['__NEXT_DATA__'] = next.textContent;

            const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
              .map(s => s.textContent)
              .filter(Boolean);
            if (ld.length) result['ldjson'] = ld;

            const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
            if (ogTitle) result['og:title'] = ogTitle;
            const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
            if (ogDesc) result['og:description'] = ogDesc;
          } catch (e) {
            // ignore in-page extraction errors
          }
          return result;
        })()`);

        // Attempt to parse __NEXT_DATA__ if present
          if (embedded && embedded['__NEXT_DATA__']) {
          try {
            const parsed = JSON.parse(embedded['__NEXT_DATA__']);
            // Heuristics: look for props -> pageProps -> channel or initialState
            const maybe = parsed?.props?.pageProps || parsed?.props || parsed?.initialState || parsed;
            if (maybe) {
              // If we find something that resembles channel info, return it
              // Return the whole parsed object so callers can inspect
              console.log(`[getChannelInfoWithPuppeteer] extracted __NEXT_DATA__ for ${channelName}`);
              return maybe;
            }
          } catch (e) {
            console.warn('[getChannelInfoWithPuppeteer] failed to parse __NEXT_DATA__ JSON:', (e as any).message || e);
          }
        }

        // Try ld+json entries
  if (embedded && embedded['ldjson'] && embedded['ldjson'].length) {
          for (const txt of embedded['ldjson']) {
            try {
              const parsed = JSON.parse(txt as string);
              // If parsed object refers to a BroadcastChannel or similar, return
              if (parsed && (parsed['@type'] || parsed['name'] || parsed['publisher'])) {
                console.log(`[getChannelInfoWithPuppeteer] extracted ld+json for ${channelName}`);
                return parsed;
              }
            } catch (e) {
              // ignore
            }
          }
        }

      } catch (e:any) {
        console.warn('[getChannelInfoWithPuppeteer] extraction attempt failed:', e.message || e);
      }

      return null;
    }

    return info;
  } finally {
    await browser.close();
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Interfaces for statistics
interface ChannelStats {
  channelName: string;
  messageCount: number;
  uniqueUsers: Set<number>;
  totalMessages: number;
  subscriptions: number;
  giftedSubscriptions: number;
  kicks: number;
  usersBanned: number;
  hostChannels: number;
  polls: number;
  pinnedMessages: number;
  topUsers: Map<string, number>;
  messageHistory: Array<{
    username: string;
    message: string;
    timestamp: Date;
  }>;
  subscriptionHistory: Array<{
    username: string;
    type: string;
    timestamp: Date;
  }>;
  banHistory: Array<{
    username: string;
    timestamp: Date;
  }>;
  kicksGiftedHistory: Array<{
    from: string;
    amount: number;
    timestamp: Date;
  }>;
  startTime: Date;
  uptime: number;
  messagesPerMinute: number;
  averageMessageLength: number;
}

const channelStats = new Map<string, ChannelStats>();
const kickWSInstances = new Map<string, KickWebSocket>();
let updateInterval: NodeJS.Timeout | null = null;
let dailySaveInterval: NodeJS.Timeout | null = null;

function initializeStats(channelName: string): ChannelStats {
  return {
    channelName,
    messageCount: 0,
    uniqueUsers: new Set(),
    totalMessages: 0,
    subscriptions: 0,
    giftedSubscriptions: 0,
    kicks: 0,
    usersBanned: 0,
    hostChannels: 0,
    polls: 0,
    pinnedMessages: 0,
    topUsers: new Map(),
    messageHistory: [],
    subscriptionHistory: [],
    banHistory: [],
    kicksGiftedHistory: [],
    startTime: new Date(),
    uptime: 0,
    messagesPerMinute: 0,
    averageMessageLength: 0
  };
}

function calculateStats(stats: ChannelStats): void {
  const now = new Date();
  stats.uptime = Math.floor((now.getTime() - stats.startTime.getTime()) / 1000);
  
  // Calculate messages per minute
  const minutesElapsed = Math.max(1, stats.uptime / 60);
  stats.messagesPerMinute = Math.round(stats.totalMessages / minutesElapsed);
  
  // Calculate average message length
  const totalLength = stats.messageHistory.reduce((acc, msg) => acc + msg.message.length, 0);
  stats.averageMessageLength = stats.messageHistory.length > 0 
    ? Math.round(totalLength / stats.messageHistory.length) 
    : 0;
}

function connectToChannel(channelName: string): void {
  if (channelStats.has(channelName)) {
    return; // Already connected
  }

  const stats = initializeStats(channelName);
  channelStats.set(channelName, stats);

  const kickWS = new KickWebSocket({
    debug: false,
    autoReconnect: true,
    reconnectInterval: 5000
  });

  kickWSInstances.set(channelName, kickWS);

  // Chat Message Handler
  kickWS.on('ChatMessage', (message: any) => {
    stats.totalMessages++;
    stats.messageCount++;
    if (message.sender?.id) {
      stats.uniqueUsers.add(message.sender.id);
    }
    
    // Track top users
    const username = message.sender?.username || 'Unknown';
    stats.topUsers.set(username, (stats.topUsers.get(username) || 0) + 1);
    
    // Add to message history (keep last 100)
    stats.messageHistory.push({
      username,
      message: message.content || '',
      timestamp: new Date()
    });
    if (stats.messageHistory.length > 100) {
      stats.messageHistory.shift();
    }

    console.log(`[${channelName}] 💬 Mensaje: ${username}`);
  });

  // Subscription Handler
  kickWS.on('Subscription', (sub: any) => {
    stats.subscriptions++;
    const username = sub.username || 'Unknown';
    stats.subscriptionHistory.push({
      username,
      type: 'subscription',
      timestamp: new Date()
    });
    console.log(`[${channelName}] ❤️  Nueva suscripción: ${username}`);
  });

  // Gifted Subscriptions Handler
  kickWS.on('GiftedSubscriptions', (gift: any) => {
    stats.giftedSubscriptions++;
    const username = gift.sender?.username || 'Unknown';
    stats.subscriptionHistory.push({
      username,
      type: 'gifted_subscription',
      timestamp: new Date()
    });
    console.log(`[${channelName}] 🎁 Suscripción regalada: ${username}`);
  });

  // Kicks Gifted Handler
  kickWS.on('kicks_gifted' as any, (kick: any) => {
    stats.kicks++;
    const from = kick.sender?.username || 'Unknown';
    const amount = kick.gift?.amount || 0;
    stats.kicksGiftedHistory.push({
      from,
      amount,
      timestamp: new Date()
    });
    console.log(`[${channelName}] 💰 Regalos: ${from}`);
  });

  // User Banned Handler
  kickWS.on('UserBanned', (ban: any) => {
    stats.usersBanned++;
    const username = ban.username || 'Unknown';
    stats.banHistory.push({
      username,
      timestamp: new Date()
    });
    console.log(`[${channelName}] 🚫 Usuario baneado: ${username}`);
  });

  // Stream Host Handler
  kickWS.on('StreamHost', (host: any) => {
    stats.hostChannels++;
    console.log(`[${channelName}] 📡 Host channel`);
  });

  // Poll Updates
  kickWS.on('PollUpdate', (poll: any) => {
    stats.polls++;
  });

  // Pinned Messages
  kickWS.on('PinnedMessageCreated', (msg: any) => {
    stats.pinnedMessages++;
  });

  // Error Handler
  kickWS.on('error', (error: any) => {
    console.error(`Error en canal ${channelName}:`, error);
  });

  // Connection Handler
  kickWS.on('ready', () => {
    console.log(`✅ Conectado al canal: ${channelName}`);
    io.emit('channel_connected', { channel: channelName });
  });

  // Safely connect with error handling
  // First verify channel exists with our custom function
  fetchChannelInfo(channelName)
    .then((channelInfo) => {
      console.log(`✅ Canal verificado: ${channelName}`);
      // Now try to connect with kick-wss
      return kickWS.connect(channelName);
    })
    .catch(async (err: any) => {
      console.error(`❌ Error conectando a ${channelName}:`, err.message);

      // If blocked by Kick's security policy, try Puppeteer fallback
      const blocked = /403|Request blocked|security policy|Kick API/i.test(err.message);
      if (blocked) {
        console.log(`[connectToChannel] Attempting Puppeteer fallback for ${channelName}`);
        try {
          const info = await getChannelInfoWithPuppeteer(channelName);
          if (info) {
            console.log(`[connectToChannel] Puppeteer verified channel ${channelName}`);
            // Monkey-patch the kick-wss instance to return the Puppeteer-extracted info
            try {
              // Try to override instance method first
              try { (kickWS as any).getChannelInfo = async () => info; } catch (e) {}
              // If the library uses the prototype or binds internally, override the prototype as a fallback
              try { (KickWebSocket as any).prototype.getChannelInfo = async function() { return info; }; } catch (e) {}
              console.log(`[connectToChannel] Overrode kick-wss getChannelInfo (instance/prototype) for ${channelName}`);
            } catch (mpErr:any) {
              console.warn(`[connectToChannel] Could not monkey-patch getChannelInfo: ${mpErr.message || mpErr}`);
            }

            // Try to let kick-wss perform its normal connect (it may still call getChannelInfo)
            try {
              await kickWS.connect(channelName);
              return;
            } catch (innerErr: any) {
              console.warn(`kick-wss connect failed after Puppeteer for ${channelName}, attempting manual WebSocket wiring:`, innerErr.message || innerErr);
            }

            // As a fallback, manually wire the WebSocket using the extracted channel info
            try {
              const channelId = info?.chatroom?.id || info?.chatroomId || info?.id || (info?.channel && info.channel.id);
              if (!channelId) throw new Error('Could not determine chatroom id from Puppeteer info');

              // Set the internal fields expected by the library and build the WS URL
              (kickWS as any).channelName = channelName;
              (kickWS as any).channelId = channelId;
              const wsUrl = (kickWS as any).buildWebSocketUrl();

              // Create a raw WebSocket client and attach it to the kickWS instance
              const wsClient = new WebSocketClient(wsUrl);
              (kickWS as any).ws = wsClient;

              // Hook up the library's WS handlers which will subscribe when open
              (kickWS as any).setupWebSocketHandlers();

              console.log(`[connectToChannel] Manually wired WebSocket for ${channelName} (chatroom:${channelId})`);
              return;
            } catch (manualErr:any) {
              console.error(`❌ Manual WebSocket wiring failed for ${channelName}:`, manualErr.message || manualErr);
              io.emit('channel_error', { channel: channelName, error: 'No se pudo conectar al canal incluso después de verificación.' });
              channelStats.delete(channelName);
              kickWSInstances.delete(channelName);
              return;
            }
          } else {
            console.log(`[connectToChannel] Puppeteer couldn't extract info for ${channelName}`);
            io.emit('channel_error', { channel: channelName, error: 'No se pudo verificar el canal (protección anti-bot). Intenta otro canal.' });
            channelStats.delete(channelName);
            kickWSInstances.delete(channelName);
            return;
          }
        } catch (puppErr: any) {
          console.error(`❌ Puppeteer fallback failed for ${channelName}:`, puppErr.message || puppErr);
          io.emit('channel_error', { channel: channelName, error: 'Error al verificar el canal automáticamente. Intenta de nuevo más tarde.' });
          channelStats.delete(channelName);
          kickWSInstances.delete(channelName);
          return;
        }
      }

      // Provide user-friendly error messages for other cases
      let userMessage = err.message;
      if (err.message.includes('403')) {
        userMessage = 'El canal no está disponible. Podría estar offline, ser privado, o bloqueado. Intenta con otro canal.';
      } else if (err.message.includes('404')) {
        userMessage = 'Canal no encontrado. Verifica el nombre del canal.';
      } else if (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED')) {
        userMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      // Notify frontend of connection error
      io.emit('channel_error', { channel: channelName, error: userMessage });
      // Remove the stats entry so it can be retried
      channelStats.delete(channelName);
      kickWSInstances.delete(channelName);
    });
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('connect_channel', (data: { channel: string }) => {
    const channel = data.channel.toLowerCase();

    // Si ya está conectado, notificar al cliente inmediatamente y enviarle las últimas estadísticas.
    if (kickWSInstances.has(channel)) {
      console.log(`[${channel}] El cliente se ha reconectado al canal. Enviando confirmación y estado actual.`);
      socket.emit('channel_connected', { channel });
      const stats = channelStats.get(channel);
      if (stats) {
        calculateStats(stats);
        socket.emit('stats_update', formatStats(stats));
      }
      socket.join(`channel_${channel}`);
      return;
    }

    // Si no, iniciar el proceso de conexión normal.
    connectToChannel(channel);
    socket.join(`channel_${channel}`);
  });

  socket.on('get_stats', (data: { channel: string }) => {
    const channel = data.channel.toLowerCase();
    const stats = channelStats.get(channel);
    if (stats) {
      calculateStats(stats);
      socket.emit('stats_update', formatStats(stats));
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Format stats for transmission
function formatStats(stats: ChannelStats): any {
  return {
    channelName: stats.channelName,
    totalMessages: stats.totalMessages,
    uniqueUsers: stats.uniqueUsers.size,
    subscriptions: stats.subscriptions,
    giftedSubscriptions: stats.giftedSubscriptions,
    kicks: stats.kicks,
    usersBanned: stats.usersBanned,
    hostChannels: stats.hostChannels,
    polls: stats.polls,
    pinnedMessages: stats.pinnedMessages,
    topUsers: Array.from(stats.topUsers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([username, count]) => ({ username, count })),
    uptime: stats.uptime,
    messagesPerMinute: stats.messagesPerMinute,
    averageMessageLength: stats.averageMessageLength,
    messageHistory: stats.messageHistory.slice(-20),
    subscriptionHistory: stats.subscriptionHistory.slice(-10),
    banHistory: stats.banHistory.slice(-10),
    kicksGiftedHistory: stats.kicksGiftedHistory.slice(-10)
  };
}

// Broadcast stats every second
if (!updateInterval) {
  updateInterval = setInterval(() => {
    channelStats.forEach((stats, channel) => {
      calculateStats(stats);
      io.to(`channel_${channel}`).emit('stats_update', formatStats(stats));
      // Reset per-minute counters
      stats.messageCount = 0;
    });
  }, 1000);
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', channels: channelStats.size });
});

app.get('/channels', (req, res) => {
  const channels = Array.from(channelStats.keys());
  res.json({ channels });
});

// HTTP helper to request the server to connect to a channel (useful for testing)
app.post('/connect/:channel', (req, res) => {
  const channel = (req.params.channel || '').toLowerCase();
  if (!channel) return res.status(400).json({ error: 'channel required' });
  try {
    connectToChannel(channel);
    return res.json({ ok: true, channel });
  } catch (e:any) {
    return res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/stats/:channel', (req, res) => {
  const channel = req.params.channel.toLowerCase();
  const stats = channelStats.get(channel);
  if (!stats) {
    return res.status(404).json({ error: 'Canal no encontrado' });
  }
  calculateStats(stats);
  res.json(formatStats(stats));
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
// Initialize database and start daily save interval
(async () => {
  await initializeDatabase();

  // Save daily stats every 5 minutes (adjust as needed)
  dailySaveInterval = setInterval(() => {
    const today = new Date().toISOString().split('T')[0];
    channelStats.forEach(async (stats) => {
      calculateStats(stats);
      await saveDailyStats(stats);
    });
  }, 5 * 60 * 1000); // Every 5 minutes

  // Add a route to get historical data
  app.get('/history/:channel/:date', async (req, res) => {
    const { channel, date } = req.params;
    try {
      const stats = await getDailyStatsForDate(date, channel.toLowerCase());
      if (stats) {
        res.json(stats);
      } else {
        res.status(404).json({ error: 'No hay datos para esta fecha y canal.' });
      }
    } catch (error: any) {
      console.error('Error fetching historical data:', error);
      res.status(500).json({ error: error.message || 'Error al obtener datos históricos.' });
    }
  });
})();
} catch (error) {
  console.error('Error no capturado:', error);
  // Mantén la consola abierta para ver el error
  setTimeout(() => {}, 1000 * 60 * 5); // 5 minutos
}
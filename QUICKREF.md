# 📚 Referencia Rápida - Kick Dashboard

## 🔗 URLs Principales

| Descripción | URL |
|-------------|-----|
| **Dashboard Frontend** | http://localhost:5173 |
| **API Backend** | http://localhost:3000 |
| **Health Check** | http://localhost:3000/health |

## 📊 Endpoints API

### GET /health
```bash
curl http://localhost:3000/health
```
Respuesta: `{"status":"ok","channels":1}`

### GET /channels
```bash
curl http://localhost:3000/channels
```
Respuesta: `{"channels":["xqc","ggsantome"]}`

### GET /stats/:channel
```bash
curl http://localhost:3000/stats/xqc
```
Respuesta: Objeto completo de estadísticas

## 💻 Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instalar dependencias backend |
| `cd client && npm install && cd ..` | Instalar dependencias frontend |
| `npm run dev` | Iniciar servidor backend |
| `cd client && npm run dev` | Iniciar servidor frontend |
| `npm run build` | Compilar TypeScript |
| `start.bat` | Script automático (Windows) |

## 🎯 Estadísticas Disponibles (12 tipos)

```javascript
{
  totalMessages: number,          // Mensajes totales
  uniqueUsers: number,            // Usuarios únicos
  subscriptions: number,          // Suscriptores
  giftedSubscriptions: number,    // Suscripciones regaladas
  kicks: number,                  // Regalos
  usersBanned: number,            // Usuarios baneados
  hostChannels: number,           // Canales hosteando
  polls: number,                  // Encuestas
  pinnedMessages: number,         // Mensajes fijados
  messagesPerMinute: number,      // Velocidad de chat
  averageMessageLength: number,   // Longitud promedio
  topUsers: Array<{username, count}> // Top 10 usuarios
}
```

## 🔌 Eventos Socket.IO

### Cliente → Servidor

**Conectar a canal:**
```javascript
socket.emit('connect_channel', { channel: 'xqc' });
```

**Obtener estadísticas:**
```javascript
socket.emit('get_stats', { channel: 'xqc' });
```

### Servidor → Cliente

**Actualización de estadísticas:**
```javascript
socket.on('stats_update', (stats) => {
  console.log(stats);
});
```

**Canal conectado:**
```javascript
socket.on('channel_connected', (data) => {
  console.log(data.channel);
});
```

## 📁 Estructura Rápida

```
proyecto/
├── src/server.ts          ← Backend
├── client/src/
│   ├── App.tsx           ← Main App
│   └── components/
│       ├── StatCard.tsx
│       ├── TopUsers.tsx
│       ├── RecentActivity.tsx
│       ├── ChannelSelector.tsx
│       └── Chart.tsx
├── README.md             ← Docs principales
├── USAGE_GUIDE.md        ← Guía de uso
├── QUICKSTART.md         ← Este archivo
└── start.bat            ← Script de inicio
```

## 🎨 Colores y Estilos

| Elemento | Color |
|----------|-------|
| Primary | `#A78BFA` (Purple) |
| Secondary | `#EC4899` (Pink) |
| Background | `#030712` (Dark) |
| Card | `#111827` (Gray-900) |

## 🔍 Debug

**Frontend (Consola del navegador):**
```javascript
// Ver eventos Socket.IO
localStorage.debug = 'socket.io-client:socket';

// Ver stats recibidas
socket.on('stats_update', (s) => console.log(s));
```

**Backend (Terminal):**
```
Busca logs que digan:
✅ Conectado al canal: xqc
```

## 📈 Cálculos Principales

```javascript
// Uptime en minutos
uptime_minutes = uptime_seconds / 60

// Mensajes por minuto
msgs_per_min = totalMessages / (uptime / 60)

// Tasa de suscripción
sub_rate = (subscriptions / totalMessages) * 100

// Tasa de bans
ban_rate = (usersBanned / uniqueUsers) * 100

// Promedio de chars
avg_length = total_chars / totalMessages
```

## 🚨 Codes de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'react'` | Falta npm install en client | `cd client && npm install` |
| `EADDRINUSE :::3000` | Puerto 3000 ocupado | `taskkill /PID [PID] /F` |
| `ECONNREFUSED 127.0.0.1:3000` | Backend no corre | Ejecuta `npm run dev` |
| `WebSocket error` | No hay internet | Verifica conexión |

## 📱 Compatibilidad

| Navegador | Soportado |
|-----------|-----------|
| Chrome 80+ | ✅ |
| Firefox 72+ | ✅ |
| Safari 13.1+ | ✅ |
| Edge 80+ | ✅ |
| Mobile Chrome | ✅ |

## 🎯 Flujo de Uso Típico

```
1. Ejecutar start.bat
   ↓
2. Abrir http://localhost:5173
   ↓
3. Ingresar nombre del canal
   ↓
4. Esperar conexión
   ↓
5. Ver estadísticas en tiempo real
   ↓
6. Cambiar canal (opcional)
```

## 📊 Ejemplo de Respuesta JSON

```json
{
  "channelName": "xqc",
  "totalMessages": 5234,
  "uniqueUsers": 1823,
  "subscriptions": 45,
  "giftedSubscriptions": 12,
  "kicks": 89,
  "usersBanned": 3,
  "hostChannels": 2,
  "polls": 1,
  "pinnedMessages": 2,
  "uptime": 1800,
  "messagesPerMinute": 175,
  "averageMessageLength": 42,
  "topUsers": [
    {"username": "user1", "count": 234},
    {"username": "user2", "count": 156}
  ]
}
```

## 🔐 Puertos

| Servicio | Puerto | Status |
|----------|--------|--------|
| Backend | 3000 | WebSocket + REST |
| Frontend | 5173 | Vite Dev Server |

## 📚 Archivos de Documentación

1. **README.md** - Información general
2. **QUICKSTART.md** - Inicio rápido (este)
3. **USAGE_GUIDE.md** - Guía de uso detallada
4. **DEVELOPMENT.md** - Cómo extender
5. **EXAMPLES.md** - Ejemplos de código
6. **VERIFICATION.md** - Checklist de archivos

## 💡 Tips Pro

✅ Abre múltiples canales en tabs diferentes

✅ Mantén el dashboard minimizado mientras streameas

✅ Usa pantalla dual: Stream en una, Dashboard en otra

✅ Toma screenshots de picos de estadísticas

✅ Exporta datos para análisis posterior

## ⏱️ Tiempos Típicos

| Acción | Tiempo |
|--------|--------|
| Instalar dependencias | 2-3 min |
| Iniciar servidor | 2-3 seg |
| Conectar a canal | 3-5 seg |
| Primera actualización | 1 seg |
| Actualización cada X | 1 seg |

## 🆘 Contacto Rápido

Si tienes problemas:
1. Lee QUICKSTART.md
2. Lee USAGE_GUIDE.md
3. Revisa la consola (F12)
4. Verifica logs del backend
5. Intenta reiniciar

---

**Última actualización:** 14 de Noviembre, 2024

**Versión:** 1.0.0

**Estado:** ✅ Producción lista

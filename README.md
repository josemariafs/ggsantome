# 🎬 Kick Channel Statistics Dashboard

Un cuadro de mando en tiempo real para monitorear y analizar estadísticas detalladas de canales en Kick.com. Construido con Node.js, Express, React y Socket.IO.

## ✨ Características

### Estadísticas en Tiempo Real
- **Mensajes de Chat**: Total de mensajes y velocidad por minuto
- **Usuarios Activos**: Número de usuarios únicos que chatean
- **Suscriptores**: Nuevas suscripciones y suscripciones regaladas
- **Regalos (Kicks)**: Monitoreo de regalos enviados
- **Bans**: Número de usuarios baneados
- **Hosts**: Canales que hostean el canal monitoreado
- **Encuestas**: Número de encuestas realizadas
- **Mensajes Fijados**: Mensajes destacados del streamer

### Análisis Avanzado
- **Top 10 Usuarios**: Visualización de usuarios más activos con gráficos
- **Longitud Promedio de Mensajes**: Análisis de calidad de conversación
- **Historial Reciente**: Últimos mensajes, suscripciones, bans y regalos
- **Tiempo en Línea**: Uptime del monitoreo del canal
- **Velocidad de Actividad**: Mensajes por minuto

### Interfaz Intuitiva
- Dashboard responsive con Tailwind CSS
- Gráficos interactivos con Recharts
- Actualizaciones en tiempo real con Socket.IO
- Selector de canales fácil de usar
- Indicador de conexión en vivo

## 🛠️ Requisitos Previos

- Node.js 16 o superior
- npm o yarn
- Acceso a internet (para conectarse a Kick.com)

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd "c:\Users\rames\Documents\Dev\ggsantome - kick"
```

### 2. Instalar dependencias del servidor

```bash
npm install
```

### 3. Instalar dependencias del cliente

```bash
cd client
npm install
cd ..
```

## 🚀 Ejecución

### Terminal 1 - Servidor Backend

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

### Terminal 2 - Cliente Frontend

```bash
cd client
npm run dev
```

El cliente se ejecutará en `http://localhost:5173`

### Acceso

Abre tu navegador y ve a `http://localhost:5173`

## 📊 Estadísticas Disponibles

| Métrica | Descripción |
|---------|-------------|
| **Mensajes Totales** | Número total de mensajes enviados en el canal |
| **Usuarios Únicos** | Cantidad de usuarios diferentes que han enviado mensajes |
| **Suscriptores** | Nuevas suscripciones directas |
| **Suscripciones Regaladas** | Suscripciones regaladas por otros usuarios |
| **Regalos (Kicks)** | Número total de regalos enviados |
| **Usuarios Baneados** | Usuarios que han sido baneados del canal |
| **Host Channels** | Canales que hostean al canal monitoreado |
| **Encuestas** | Número de encuestas activas o completadas |
| **Mensajes Fijados** | Mensajes destacados por el streamer |
| **Mensajes/Minuto** | Velocidad de actividad del chat |
| **Longitud Promedio** | Promedio de caracteres por mensaje |
| **Top 10 Usuarios** | Usuarios más activos en el chat |

## 🏗️ Estructura del Proyecto

```
kick-dashboard/
├── src/
│   └── server.ts           # Servidor Express y Socket.IO
├── client/
│   ├── src/
│   │   ├── App.tsx         # Componente principal
│   │   ├── main.tsx        # Punto de entrada
│   │   ├── index.css       # Estilos globales
│   │   └── components/
│   │       ├── StatCard.tsx           # Tarjeta de estadística
│   │       ├── Chart.tsx              # Componente de gráfico
│   │       ├── TopUsers.tsx           # Gráfico de usuarios más activos
│   │       ├── RecentActivity.tsx     # Historial de actividad
│   │       └── ChannelSelector.tsx    # Selector de canales
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (opcional):

```env
PORT=3000
NODE_ENV=development
```

### Personalización

#### Cambiar puerto del servidor
En `src/server.ts`, modifica la línea:
```typescript
const PORT = process.env.PORT || 3000;
```

#### Agregar más eventos de Kick
En `src/server.ts`, modifica el array `filteredEvents` en la configuración de `KickWebSocket`.

## 📚 API REST

### Endpoints Disponibles

- `GET /health` - Verifica el estado del servidor
- `GET /channels` - Lista todos los canales monitoreados
- `GET /stats/:channel` - Obtiene estadísticas de un canal específico

### Ejemplo de Uso

```bash
# Obtener estadísticas de un canal
curl http://localhost:3000/stats/xqc
```

## 🔌 Eventos WebSocket

### Cliente → Servidor

- `connect_channel` - Conectar a un canal
  ```javascript
  socket.emit('connect_channel', { channel: 'xqc' });
  ```

- `get_stats` - Obtener estadísticas actuales
  ```javascript
  socket.emit('get_stats', { channel: 'xqc' });
  ```

### Servidor → Cliente

- `stats_update` - Actualización de estadísticas
- `channel_connected` - Confirmación de conexión a canal
- `connected_to_channel` - Confirmación en el cliente

## 🎨 Personalización de Tema

Los colores están definidos en `client/src/index.css` y `client/tailwind.config.js`. Para cambiar los colores:

1. Edita los gradientes en `client/src/index.css`
2. Modifica los colores en los componentes React

## 📈 Ejemplo de Datos

```json
{
  "channelName": "xqc",
  "totalMessages": 15234,
  "uniqueUsers": 3456,
  "subscriptions": 234,
  "giftedSubscriptions": 45,
  "kicks": 123,
  "usersBanned": 12,
  "hostChannels": 5,
  "polls": 8,
  "pinnedMessages": 3,
  "uptime": 3600,
  "messagesPerMinute": 254,
  "averageMessageLength": 45,
  "topUsers": [
    { "username": "user1", "count": 456 },
    { "username": "user2", "count": 234 }
  ]
}
```

## 🚨 Limitaciones

- Solo monitorea canales públicos
- No envía mensajes al chat (solo lectura)
- Requiere conexión activa a Internet
- Los datos se pierden al reiniciar el servidor

## 🤝 Dependencias

### Backend
- `express` - Framework web
- `socket.io` - WebSocket en tiempo real
- `kick-wss` - Conexión a WebSocket de Kick
- `cors` - Manejo de CORS

### Frontend
- `react` - UI framework
- `react-dom` - Renderizado de React
- `socket.io-client` - Cliente WebSocket
- `recharts` - Gráficos
- `lucide-react` - Iconos
- `tailwindcss` - Estilos CSS
- `vite` - Build tool

## 🔒 Seguridad

- El servidor no almacena datos persistentemente (en memoria)
- No requiere autenticación (usar solo en red local o con protección)
- Para producción, implementa autenticación y HTTPS

## 🐛 Solución de Problemas

### Puerto 3000 ya está en uso
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error de conexión a Kick
- Verifica tu conexión a Internet
- Verifica que el nombre del canal sea correcto
- Espera unos segundos para que se conecte

### No hay datos en el dashboard
- Espera a que se conecte al canal (verifica el indicador)
- Intenta enviar un mensaje en el canal para generar datos
- Revisa la consola del navegador para errores

## 📞 Soporte

Para reportar issues o sugerencias, por favor contacta al desarrollador.

## 📄 Licencia

MIT License - Ver LICENSE para más detalles

## 🙏 Agradecimientos

- [nglmercer](https://github.com/nglmercer) por la librería `kick-wss`
- La comunidad de Kick.com

---

**Desarrollado con ❤️ para la comunidad de Kick**

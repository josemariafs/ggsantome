# Configuración de Desarrollo - Kick Dashboard

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Backend
PORT=3000
NODE_ENV=development
DEBUG=true

# Frontend
VITE_API_URL=http://localhost:3000
```

## 📝 Scripts Disponibles

### Backend

```bash
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Ejecutar versión compilada
npm start
```

### Frontend

```bash
# Servidor de desarrollo con hot reload
cd client && npm run dev

# Build para producción
cd client && npm run build

# Vista previa del build
cd client && npm run preview
```

## 🐛 Debugging

### Backend

Habilita debug mode en `src/server.ts`:

```typescript
const kickWS = new KickWebSocket({
  debug: true,  // Esto mostrará logs detallados
  autoReconnect: true,
  reconnectInterval: 5000,
  filteredEvents: [...]
});
```

### Frontend

Abre la consola del navegador (F12):

```javascript
// Habilitar logs de Socket.IO
localStorage.debug = 'socket.io-client:socket';
```

## 🧪 Testing

### Probar API REST

```bash
# Test de salud
curl http://localhost:3000/health

# Obtener canales conectados
curl http://localhost:3000/channels

# Obtener estadísticas de un canal
curl http://localhost:3000/stats/xqc
```

### Probar WebSocket

Abre la consola del navegador:

```javascript
// Conectar a un canal
socket.emit('connect_channel', { channel: 'xqc' });

// Solicitar estadísticas
socket.emit('get_stats', { channel: 'xqc' });

// Escuchar actualizaciones
socket.on('stats_update', (stats) => {
  console.log('Estadísticas actualizadas:', stats);
});
```

## 📦 Agregar Nuevas Dependencias

### Backend

```bash
npm install <paquete>
npm install --save-dev <paquete>
```

### Frontend

```bash
cd client
npm install <paquete>
npm install --save-dev <paquete>
cd ..
```

## 🎯 Casos de Extensión

### Agregar un nuevo evento de Kick

1. Importa el evento en `src/server.ts`:
```typescript
import { KickEvent } from 'kick-wss';
```

2. Agrega el evento al array filteredEvents:
```typescript
filteredEvents: [
  // ... otros eventos
  KickEvent.TuNuevoEvento
]
```

3. Crea un handler para el evento:
```typescript
kickWS.on(KickEvent.TuNuevoEvento, (data: any) => {
  stats.tuNuevaEstadistica++;
  // Procesa los datos
});
```

4. Actualiza la interfaz `ChannelStats`:
```typescript
interface ChannelStats {
  // ... otras propiedades
  tuNuevaEstadistica: number;
}
```

5. Incluye en la función `formatStats()`:
```typescript
return {
  // ... otras propiedades
  tuNuevaEstadistica: stats.tuNuevaEstadistica
};
```

### Agregar un nuevo componente al Dashboard

1. Crea el archivo en `client/src/components/MiComponente.tsx`:
```typescript
interface MiComponenteProps {
  data: any;
}

const MiComponente = ({ data }: MiComponenteProps) => {
  return (
    <div className="stat-card">
      {/* Tu contenido */}
    </div>
  );
};

export default MiComponente;
```

2. Importa en `client/src/App.tsx`:
```typescript
import MiComponente from './components/MiComponente';
```

3. Usa en el JSX:
```typescript
<MiComponente data={stats.tuDato} />
```

### Agregar persistencia en base de datos

Para guardar datos, modifica `src/server.ts`:

```typescript
// Agregar al inicio
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('stats.db');

// Crear tabla al inicio
db.run(`
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY,
    channel TEXT,
    messageCount INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Guardar datos
kickWS.on(KickEvent.ChatMessage, (message: any) => {
  stats.totalMessages++;
  // Guardar en BD
  db.run(
    'INSERT INTO stats (channel, messageCount) VALUES (?, ?)',
    [channelName, stats.totalMessages]
  );
});
```

## 🚀 Deployment

### Heroku

1. Crea `Procfile`:
```
web: npm start
```

2. Deploy:
```bash
git push heroku main
```

### Vercel (Frontend)

```bash
cd client
vercel
```

### Railway o Similar

1. Conecta tu repositorio Git
2. Deploy automático

## 📊 Monitoreo en Producción

### Logs

```bash
# Ver logs en tiempo real
npm run dev 2>&1 | tee app.log

# Usando PM2
npm install -g pm2
pm2 start npm --name kick-dashboard -- start
pm2 logs kick-dashboard
```

### Métricas

Considera agregar:
- Prometheus para métricas
- Grafana para visualización
- Winston para logging estructurado

---

Para más información, consulta el README.md principal.

# Ejemplo de Datos - Kick Dashboard

## Estructura de Respuesta de Estadísticas

Cuando el servidor envía datos al cliente, usa la siguiente estructura:

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
  "topUsers": [
    {
      "username": "moderator1",
      "count": 456
    },
    {
      "username": "user2",
      "count": 234
    },
    {
      "username": "active_viewer",
      "count": 198
    }
  ],
  "uptime": 3600,
  "messagesPerMinute": 254,
  "averageMessageLength": 45,
  "messageHistory": [
    {
      "username": "user1",
      "message": "Este es un ejemplo de mensaje en el chat",
      "timestamp": "2024-01-15T10:30:45Z"
    },
    {
      "username": "user2",
      "message": "Otro mensaje de ejemplo",
      "timestamp": "2024-01-15T10:30:46Z"
    }
  ],
  "subscriptionHistory": [
    {
      "username": "newsubscriber",
      "type": "subscription",
      "timestamp": "2024-01-15T10:30:30Z"
    },
    {
      "username": "gifter",
      "type": "gifted_subscription",
      "timestamp": "2024-01-15T10:30:20Z"
    }
  ],
  "banHistory": [
    {
      "username": "banneduser",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ],
  "kicksGiftedHistory": [
    {
      "from": "donor1",
      "amount": 100,
      "timestamp": "2024-01-15T10:20:00Z"
    },
    {
      "from": "donor2",
      "amount": 50,
      "timestamp": "2024-01-15T10:15:00Z"
    }
  ]
}
```

## Eventos WebSocket

### Cliente Envía

#### Conectar a un Canal

```javascript
socket.emit('connect_channel', {
  channel: 'xqc'
});
```

#### Solicitar Estadísticas

```javascript
socket.emit('get_stats', {
  channel: 'xqc'
});
```

### Servidor Envía

#### Actualización de Estadísticas

```javascript
socket.on('stats_update', (stats) => {
  console.log('Nuevas estadísticas:', stats);
  // Actualizar UI
});
```

#### Confirmación de Conexión

```javascript
socket.on('channel_connected', (data) => {
  console.log('Canal conectado:', data.channel);
});
```

#### Confirmación en Cliente

```javascript
socket.on('connected_to_channel', (data) => {
  console.log('Conectado al canal:', data.channel);
});
```

## Eventos de Kick Monitoreados

### ChatMessage
```typescript
{
  id: string;
  content: string;
  type: 'message';
  created_at: string;
  sender: {
    id: number;
    username: string;
    slug: string;
    identity: {
      color: string;
      badges: string[];
    };
  };
  chatroom: {
    id: number;
  };
}
```

### Subscription
```typescript
{
  username: string;
  user_id: number;
  months: number;
  subscribed_on: string;
}
```

### KicksGifted
```typescript
{
  gift_transaction_id: string;
  message: string;
  sender: {
    id: number;
    username: string;
    username_color: string;
  };
  gift: {
    gift_id: string;
    name: string;
    amount: number;
    type: string;
    tier: string;
    character_limit: number;
    pinned_time: number;
  };
  type: "kicks_gifted";
}
```

### UserBanned
```typescript
{
  username: string;
  user_id: number;
  banned_at: string;
  permanent: boolean;
}
```

## Ejemplo de Integración en Frontend

```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    // Conectar a un canal
    socket.emit('connect_channel', { channel: 'xqc' });

    // Escuchar actualizaciones
    socket.on('stats_update', (newStats) => {
      setStats(newStats);
      
      // Hacer algo con las estadísticas
      console.log('Total de mensajes:', newStats.totalMessages);
      console.log('Usuarios únicos:', newStats.uniqueUsers);
      console.log('Mensajes por minuto:', newStats.messagesPerMinute);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      {stats && (
        <>
          <h1>Canal: {stats.channelName}</h1>
          <p>Mensajes: {stats.totalMessages}</p>
          <p>Usuarios: {stats.uniqueUsers}</p>
          <p>Velocidad: {stats.messagesPerMinute} msg/min</p>
        </>
      )}
    </div>
  );
};
```

## Cálculos de Estadísticas

### Uptime
```
uptime (segundos) = (fecha actual - hora inicio) / 1000
```

### Mensajes por Minuto
```
messagesPerMinute = totalMessages / (uptime / 60)
```

### Longitud Promedio de Mensaje
```
averageMessageLength = suma de caracteres de todos los mensajes / cantidad de mensajes
```

### Usuarios Únicos
```
uniqueUsers = Set de IDs de usuario únicos
```

### Tasa de Suscripción
```
subscriptionRate = (subscriptions + giftedSubscriptions) / totalMessages * 100 (%)
```

### Tasa de Bans
```
banRate = usersBanned / uniqueUsers * 100 (%)
```

---

Para más detalles, consulta README.md y USAGE_GUIDE.md

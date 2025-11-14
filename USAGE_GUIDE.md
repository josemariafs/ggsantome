# 📋 Guía de Uso - Kick Dashboard

## Inicio Rápido

### Opción 1: Usando el script de inicio (Recomendado)

**Windows (Batch):**
```bash
start.bat
```

**Windows (PowerShell):**
```powershell
.\start.ps1
```

Esto abrirá dos ventanas automáticamente:
- Una con el servidor backend
- Una con el cliente frontend

### Opción 2: Inicio Manual

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

## Uso del Dashboard

### 1. Conectar a un Canal

1. Abre el navegador en `http://localhost:5173`
2. Verás la pantalla de selección de canal
3. Ingresa el nombre del canal (ej: `xqc`, `valkyrae`, `pokimane`)
4. O haz clic en uno de los canales populares sugeridos
5. Haz clic en "Conectar al Canal"

### 2. Interpretar las Estadísticas

**Primera Fila:**
- **Mensajes Totales**: Cantidad total de mensajes desde que se conectó
- **Usuarios Únicos**: Cuántas personas diferentes han enviado al menos un mensaje
- **Suscriptores**: Nuevas suscriptores directas al canal
- **Regalos (Kicks)**: Número de regalos/donaciones enviadas

**Segunda Fila:**
- **Suscripciones Regaladas**: Suscripciones compartidas/regaladas
- **Usuarios Baneados**: Cantidad de usuarios removidos del canal
- **Host Channels**: Otros canales que están hosteando este canal
- **Encuestas**: Número de encuestas completadas
- **Mensajes Fijados**: Mensajes destacados por el streamer

### 3. Analizar Tendencias

- **Gráfico de Top 10**: Muestra los usuarios más activos
- **Longitud Promedio**: Calidad de conversación (más alto = más conversación)
- **Mensajes por Minuto**: Velocidad actual de actividad del chat

### 4. Ver Historial de Actividad

- **Últimos Mensajes**: Los 20 mensajes más recientes
- **Últimas Suscripciones**: Nuevos suscriptores/gifts
- **Actividad de Regalos**: Regalos enviados

### 5. Cambiar de Canal

Haz clic en el botón "Cambiar canal" en la esquina superior derecha para:
- Seleccionar un canal diferente
- Detener el monitoreo actual
- Iniciar un nuevo monitoreo

## Casos de Uso

### 📊 Análisis de Engagement

1. Abre el dashboard del canal
2. Observa **Mensajes/Minuto** para ver la actividad
3. Revisa el **Top 10 Usuarios** para identificar moderadores potenciales
4. Monitored el **Número de Usuarios Únicos** para crecimiento

### 💰 Monitoreo de Monetización

1. Observa **Suscriptores** para nuevas suscripciones
2. Revisa **Suscripciones Regaladas** para actividad de gifting
3. Verifica **Regalos (Kicks)** para donaciones
4. Analiza tendencias en el historial de regalos

### 🔒 Moderación y Seguridad

1. Revisa **Usuarios Baneados** para monitoreo de violaciones
2. Observa el **Historial de Bans** para patrones
3. Nota usuarios problemáticos en el **Top 10**

### 📈 Análisis de Crecimiento

1. Mantén el dashboard abierto durante streams
2. Observa cómo crece **Usuarios Únicos**
3. Revisa **Mensajes por Minuto** para picos de actividad
4. Compara datos entre diferentes streams

## Consejos y Trucos

✅ **Mantén el dashboard abierto** durante los streams para capturar toda la actividad

✅ **Usa múltiples canales** - Abre varias instancias del dashboard (solo cambiar canal)

✅ **Monitorea en segundo plano** - El dashboard no consume muchos recursos

✅ **Exporta datos** - Toma screenshots de las estadísticas para análisis

⚠️ **Nota**: Los datos se pierden al reiniciar el servidor

## Solución de Problemas Comunes

### "Canal no encontrado" o "No hay conexión"

**Solución:**
1. Verifica que escribiste el nombre del canal correctamente (sin espacios)
2. Verifica tu conexión a Internet
3. Intenta conectar de nuevo después de unos segundos
4. Comprueba que el servidor está ejecutándose (mira la ventana del backend)

### No aparecen datos

**Solución:**
1. Espera a que se conecte completamente (10-15 segundos)
2. Haz que alguien envíe un mensaje en el canal para generar datos
3. Recarga la página (F5)
4. Revisa la consola del navegador (F12) para errores

### El gráfico no se carga

**Solución:**
1. Recarga la página
2. Espera a que haya más datos (necesita al menos 1 usuario)
3. Verifica que Recharts esté instalado: `npm list recharts`

### Puerto 3000 o 5173 ocupado

**Solución:**
1. Cierra otras aplicaciones usando esos puertos
2. O modifica el puerto en `package.json` y `vite.config.ts`

## Preguntas Frecuentes

**P: ¿Puedo usar esto en producción?**
R: No sin modificaciones. Se recomienda agregar autenticación y base de datos para producción.

**P: ¿Pueden otros usuarios ver mi dashboard?**
R: No, es local en tu máquina. Para compartir, necesitarías desplegar en un servidor.

**P: ¿Cuántos canales puedo monitorear?**
R: Teóricamente ilimitados, pero dependiendo de tu máquina, 5-10 es recomendado.

**P: ¿Los datos se guardan?**
R: No, todo está en memoria. Al reiniciar se pierden todos los datos.

**P: ¿Puedo enviar mensajes desde el dashboard?**
R: No, es solo lectura. Para enviar mensajes necesitarías integración adicional.

**P: ¿Qué pasa si la conexión se cae?**
R: El backend reconecta automáticamente cada 5 segundos.

## Próximas Mejoras Sugeridas

- [ ] Persistencia de datos en base de datos
- [ ] Exportación de estadísticas a CSV/Excel
- [ ] Gráficos históricos de tendencias
- [ ] Alertas personalizables
- [ ] Autenticación de usuarios
- [ ] Monitoreo de múltiples canales simultáneamente
- [ ] Análisis de sentimiento de mensajes
- [ ] Comparación entre canales
- [ ] Dark mode / Light mode

---

¿Preguntas? Consulta la documentación principal en `README.md`

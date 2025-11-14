# 🚀 QUICK START - Kick Dashboard

## ⚡ Inicio en 3 Pasos

### Paso 1️⃣: Ubicarse en el proyecto
```bash
cd "c:\Users\rames\Documents\Dev\ggsantome - kick"
```

### Paso 2️⃣: Ejecutar (elige una opción)

#### ✅ Opción A - Windows (MÁS FÁCIL)
```bash
start.bat
```
Se abrirán automáticamente dos ventanas de terminal.

#### ✅ Opción B - PowerShell
```powershell
.\start.ps1
```

#### ✅ Opción C - Manual
```bash
# Terminal 1
npm run dev

# Terminal 2 (abre otra terminal en la misma carpeta)
cd client && npm run dev
```

### Paso 3️⃣: Abrir en navegador
```
http://localhost:5173
```

---

## 🎯 Usar el Dashboard

1. **Ingresa nombre del canal**: `xqc`, `ggsantome`, `pokimane`, etc.
2. **Haz clic en "Conectar al Canal"**
3. **¡Espera 2-3 segundos** a que se conecte
4. **¡Disfruta las estadísticas en tiempo real!** 📊

---

## 📊 Qué Verás

```
┌─────────────────────────────────────────┐
│      KICK DASHBOARD - ESTADÍSTICAS      │
├─────────────────────────────────────────┤
│                                         │
│  📊 Mensajes Totales:    15,234        │
│  👥 Usuarios Únicos:     3,456         │
│  ❤️  Suscriptores:        234          │
│  🎁 Regalos:             123          │
│                                         │
│  🏆 TOP 10 USUARIOS (Gráfico)          │
│  ├─ moderator1:   456 mensajes        │
│  ├─ user2:        234 mensajes        │
│  └─ active_viewer: 198 mensajes       │
│                                         │
│  💬 ÚLTIMOS MENSAJES                    │
│  ├─ user1: "Mensaje de ejemplo..."     │
│  └─ user2: "Otro mensaje..."           │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚠️ Solución Rápida de Problemas

### ❌ "Puerto 3000 ya está en uso"
```bash
# Encuentra el proceso
netstat -ano | findstr :3000

# Termina el proceso (reemplaza 1234 con el PID)
taskkill /PID 1234 /F
```

### ❌ "No hay datos"
1. Espera 3-5 segundos
2. Verifica que el nombre del canal sea correcto
3. Recarga la página (F5)
4. Abre F12 para ver errores en la consola

### ❌ "Error de conexión"
1. Verifica que el backend esté corriendo (Terminal 1)
2. Verifica que tienes internet
3. Reinicia npm: Presiona Ctrl+C y ejecuta nuevamente

---

## 📁 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `src/server.ts` | Backend (Node.js + Express + Socket.IO) |
| `client/src/App.tsx` | Frontend principal |
| `client/src/components/` | Componentes React |
| `README.md` | Documentación completa |
| `USAGE_GUIDE.md` | Guía detallada de uso |

---

## 💡 Consejos Útiles

✅ **Para múltiples canales**: Abre varias pestañas y elige diferentes canales

✅ **Para ver logs**: Mira la ventana del Terminal 1 para ver eventos en tiempo real

✅ **Para debug**: Abre F12 en el navegador y ve la consola

✅ **Para datos precisos**: Déjalo corriendo durante todo el stream

---

## 🎬 Ejemplo de Uso

```
1. Ejecutas: start.bat
   ↓
2. Se abren 2 ventanas automáticamente
   ↓
3. Abres: http://localhost:5173
   ↓
4. Escribes: "xqc"
   ↓
5. Haces clic: "Conectar al Canal"
   ↓
6. Esperas: 3 segundos
   ↓
7. ¡VES EL DASHBOARD EN TIEMPO REAL! 🎉
```

---

## 📞 Ayuda

Para más detalles:
- 📖 Lee `README.md`
- 📖 Lee `USAGE_GUIDE.md`
- 📖 Lee `DEVELOPMENT.md`

---

## ✨ ¡Lo Hiciste!

Tu dashboard Kick está listo. 

**Disfruta analizando estadísticas en tiempo real.** 🚀

---

*¿Primera vez? Sigue la Opción A (start.bat) para la experiencia más fácil.*

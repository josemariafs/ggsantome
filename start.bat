@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Kick Dashboard - Script de Inicio
echo ========================================
echo.

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Compilar TypeScript
echo Compilando TypeScript...
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo en la compilación de TypeScript
    pause
    exit /b 1
)

echo.
echo Iniciando servidor backend en puerto 3000...
start "Backend" cmd /c "node dist/server.js & pause"

timeout /t 4 /nobreak

echo.
echo Iniciando cliente frontend en puerto 5173...
start "Frontend" cmd /c "cd client && npm run dev & pause"

echo.
echo ========================================
echo Esperando a que se levanten los servidores...
timeout /t 3 /nobreak
echo.
echo ✓ Backend: http://localhost:3000
echo ✓ Frontend: http://localhost:5173
echo ✓ API Health: http://localhost:3000/health
echo ========================================
echo.
echo Abriendo dashboard en el navegador...
start http://localhost:5173

echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause

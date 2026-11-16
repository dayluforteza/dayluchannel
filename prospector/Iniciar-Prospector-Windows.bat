@echo off
chcp 65001 >nul
title Prospector
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

if exist node_modules goto run
echo.
echo  Instalando Prospector. Solo la primera vez, tarda 1-2 minutos...
echo.
call npm install
if errorlevel 1 goto fail

:run
echo.
echo  Prospector arrancando. Se abrira el navegador en http://localhost:5173
echo  Para cerrarlo: cierra esta ventana.
echo.
call npm run app
pause
exit /b

:nonode
echo.
echo  Falta Node.js. Se abre la pagina de descarga:
echo  instala la version LTS y vuelve a hacer doble clic en este archivo.
echo.
start https://nodejs.org/es/download
pause
exit /b

:fail
echo.
echo  Error en la instalacion. Revisa tu conexion a internet y vuelve a intentarlo.
pause

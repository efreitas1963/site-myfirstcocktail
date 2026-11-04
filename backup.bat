@echo off
REM Backup do banco MyFirstCocktail. Clique duas vezes neste arquivo.
cd /d "%~dp0"
node scripts/backup-supabase.mjs
echo.
pause

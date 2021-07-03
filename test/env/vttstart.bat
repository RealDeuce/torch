SETLOCAL
if "%1"=="" SET VTTVER=foundryvtt-0.8.8
if "%1"=="8" SET VTTVER=foundryvtt-0.8.8
if "%1"=="7" SET VTTVER=foundryvtt-0.7.10
if not exist %~dp0/Data mkdir %~dp0/Data
if exist %~dp0/Data/%VTTVER% GOTO CONTINUE
mkdir %~dp0/Data/%VTTVER%
:CONTINUE
cd %~dp0/%VTTVER%
call node resources/app/main.js --dataPath=%~dp0Data\%VTTVER%

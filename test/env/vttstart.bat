@echo off
SETLOCAL
rem Set up structure for keeping data paths
if not exist %~dp0Data mkdir %~dp0Data
rem Determine Foundry subtree to use for this major version
IF "%1"=="" ( SET "VTTNUM=8" ) ELSE ( SET "VTTNUM=%1" )
if "%VTTNUM%"=="8" SET VTTVER=foundryvtt-0.8.8
if "%VTTNUM%"=="7" SET VTTVER=foundryvtt-0.7.10
if "%VTTVER%"=="" ECHO "Invalid Foundry major version specified" && EXIT /B -1
rem Make sure the specified directory actually has a foundry in it
if not exist %~dp0%VTTVER%\resources\app\main.js ECHO "Foundry not installed in $~dp0\%VTTVER%" && EXIT /B -2
echo Starting Foundry in %~dp0%VTTVER%...
rem Build data path to use for this Foundry version
if not exist %~dp0Data\%VTTVER% mkdir %~dp0Data\%VTTVER%
rem Start Foundry
call node %~dp0%VTTVER%\resources\app\main.js --dataPath=%~dp0Data\%VTTVER%


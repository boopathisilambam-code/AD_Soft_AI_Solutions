@echo off
cd /d "%~dp0"
python serve.py --port 5501 --host 127.0.0.1

#!/bin/bash

# Vault Local Runner
# This script starts the secure vault as a local web application.

echo "Starting Vault Premium..."
cd "$(dirname "$0")"

# Start only the Vite dev server (isolating from Electron failures)
npm run vite:dev &

# Wait for the server to be ready
echo "Waiting for vault to initialize..."
while ! curl -s http://localhost:5173 > /dev/null; do
  sleep 1
done

echo "Vault is ready at http://127.0.0.1:5173"

# Attempt to open as a dedicated app window
if command -v google-chrome > /dev/null; then
  google-chrome --app=http://127.0.0.1:5173
elif command -v chromium-browser > /dev/null; then
  chromium-browser --app=http://127.0.0.1:5173
elif command -v brave-browser > /dev/null; then
  brave-browser --app=http://127.0.0.1:5173
elif command -v xdg-open > /dev/null; then
  xdg-open http://127.0.0.1:5173
else
  echo "Please open your browser and navigate to: http://127.0.0.1:5173"
fi

# Keep the script running to keep the server alive
wait

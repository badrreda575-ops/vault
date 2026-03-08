#!/bin/bash

# Vault Desktop Installer
# This script installs the .desktop file to your system.

DESKTOP_FILE="/home/badr-reda/.gemini/antigravity/scratch/vault/vault.desktop"
INSTALL_DIR="$HOME/.local/share/applications"

mkdir -p "$INSTALL_DIR"
cp "$DESKTOP_FILE" "$INSTALL_DIR/"
update-desktop-database "$INSTALL_DIR"

echo "Vault Premium has been added to your application menu!"
echo "You can now find it in your app launcher."

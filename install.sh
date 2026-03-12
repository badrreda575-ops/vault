#!/bin/bash

# Vault Premium Installer for Linux
# This script installs Vault to your local system for a native app experience.

APP_NAME="Vault"
INSTALL_DIR="$HOME/.local/share/vault-app"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
SOURCE_DIR="$(dirname "$0")"

echo "🚀 Starting Vault installation..."

# 1. Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$DESKTOP_DIR"

# 2. Copy application files
echo "📦 Copying files to $INSTALL_DIR..."
# Copy only necessary files to keep the installation clean
cp -r "$SOURCE_DIR/package.json" "$INSTALL_DIR/"
cp -r "$SOURCE_DIR/run-vault.sh" "$INSTALL_DIR/"
cp -r "$SOURCE_DIR/public" "$INSTALL_DIR/"
cp -r "$SOURCE_DIR/src" "$INSTALL_DIR/"
cp -r "$SOURCE_DIR/index.html" "$INSTALL_DIR/"
cp -r "$SOURCE_DIR/vite.config.js" "$INSTALL_DIR/"

# 3. Create the launcher command
echo "⚙️ Configuring launcher..."
cat <<EOF > "$BIN_DIR/vault-launcher"
#!/bin/bash
cd "$INSTALL_DIR"
./run-vault.sh
EOF
chmod +x "$BIN_DIR/vault-launcher"

# 4. Create the Desktop Entry
echo "🖥️ Integrating with application menu..."
cat <<EOF > "$DESKTOP_DIR/vault.desktop"
[Desktop Entry]
Name=Vault Premium
Comment=Secure Local Password Manager
Exec=$BIN_DIR/vault-launcher
Icon=$INSTALL_DIR/public/vault_icon.png
Terminal=false
Type=Application
Categories=Utility;Security;
Keywords=password;vault;secure;
EOF

chmod +x "$DESKTOP_DIR/vault.desktop"

# 5. Finalize
echo "✅ Installation complete!"
echo "You can now find 'Vault Premium' in your application menu."
echo "You can also run it from anywhere by typing 'vault-launcher' in your terminal."

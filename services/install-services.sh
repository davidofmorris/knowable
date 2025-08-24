#!/bin/bash

echo "🔧 Installing Knowable user systemd services..."
echo ""

# Define service files
SERVICES_DIR="/home/dmorris/projects/knowable/services/systemd"
USER_SYSTEMD_DIR="$HOME/.config/systemd/user"

# Check if service files exist
if [ ! -d "$SERVICES_DIR" ]; then
    echo "❌ Service files directory not found: $SERVICES_DIR"
    exit 1
fi

# Create user systemd directory
mkdir -p "$USER_SYSTEMD_DIR"

# Create symbolic links for each service
echo "📁 Creating symbolic links..."
for service in knowable-backend knowable-test; do
    service_file="$SERVICES_DIR/$service.service"
    if [ -f "$service_file" ]; then
        echo "   Linking $service.service"
        ln -sf "$service_file" "$USER_SYSTEMD_DIR/"
    else
        echo "❌ Service file not found: $service_file"
        exit 1
    fi
done

# Reload user systemd daemon
echo "🔄 Reloading user systemd daemon..."
systemctl --user daemon-reload

# Enable services for auto-start
echo "🚀 Enabling services for auto-start..."
systemctl --user enable knowable-backend knowable-frontend knowable-test

echo ""
echo "✅ Installation complete!"
echo ""
echo "Available commands:"
echo "  systemctl --user start knowable-backend    # Start backend service"
echo "  systemctl --user stop knowable-backend     # Stop backend service"
echo "  systemctl --user status knowable-backend   # Check backend status"
echo "  journalctl --user -u knowable-backend -f   # Follow backend logs"
echo ""
echo "Or use the management scripts:"
echo "  cd /home/dmorris/projects/knowable/services/scripts"
echo "  ./start-all.sh     # Start all services"
echo "  ./stop-all.sh      # Stop all services"
echo "  ./status-all.sh    # Check all service status"
echo "  ./restart-all.sh   # Restart all services"
echo ""
echo "Services will automatically start when you log in."
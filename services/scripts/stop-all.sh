#!/bin/bash

echo "🛑 Stopping all Knowable services..."
systemctl --user stop knowable-backend knowable-test

echo "✅ All services stopped!"
echo ""
echo "Use './start-all.sh' to start all services"
echo "Use './status-all.sh' to check service status"
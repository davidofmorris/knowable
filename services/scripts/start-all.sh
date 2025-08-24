#!/bin/bash

echo "🚀 Starting all Knowable services..."
systemctl --user start knowable-backend knowable-test

echo "✅ All services started!"
echo ""
echo "🔗 Test Page: http://localhost:8081"
echo "🔗 Backend:  http://localhost:3000"
echo ""
echo "Use './status-all.sh' to check service status"
echo "Use './stop-all.sh' to stop all services"
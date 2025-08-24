#!/bin/bash

echo "🔄 Restarting all Knowable services..."
systemctl --user restart knowable-backend knowable-test

echo "✅ All services restarted!"
echo ""
echo "🔗 Test Page: http://localhost:8081"
echo "🔗 Backend:  http://localhost:3000"
echo ""
echo "Use './status-all.sh' to check service status"
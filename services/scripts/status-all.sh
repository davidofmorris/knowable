#!/bin/bash

echo "=== Knowable Services Status ==="
echo ""

for service in knowable-backend knowable-frontend knowable-test; do
    echo "--- $service ---"
    systemctl --user status $service --no-pager -l
    echo ""
done

echo "=== Quick Status Summary ==="
echo "Backend:  $(systemctl --user is-active knowable-backend)"
echo "Frontend: $(systemctl --user is-active knowable-frontend)"
echo "Test:     $(systemctl --user is-active knowable-test)"
echo ""
echo "Use 'journalctl --user -u SERVICE_NAME -f' to follow logs"
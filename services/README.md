# Knowable Systemd Services

This directory contains systemd service definitions and management scripts for running Knowable as managed Linux services.

## Installation

1. **Install the services**:
   ```bash
   ./install-services.sh
   ```

2. **Start all services**:
   ```bash
   cd scripts/
   ./start-all.sh
   ```

## Directory Structure

```
services/
├── systemd/                    # Systemd service files
│   ├── knowable-backend.service    # Backend server (port 3000)
│   ├── knowable-frontend.service   # Frontend server (port 8080)
│   └── knowable-test.service       # Test server (port 8081)
├── scripts/                    # Management scripts
│   ├── start-all.sh               # Start all services
│   ├── stop-all.sh                # Stop all services
│   ├── status-all.sh              # Check service status
│   └── restart-all.sh             # Restart all services
├── install-services.sh        # Install services to systemd
└── README.md                  # This file
```

## Management Scripts

All scripts are located in the `scripts/` directory:

- **`./start-all.sh`** - Start all three services
- **`./stop-all.sh`** - Stop all three services
- **`./status-all.sh`** - Check status of all services
- **`./restart-all.sh`** - Restart all three services

## Manual Service Management

You can also manage services individually:

```bash
# Start/stop individual services
sudo systemctl start knowable-backend
sudo systemctl stop knowable-backend

# Check service status
sudo systemctl status knowable-backend

# View logs
journalctl -u knowable-backend -f

# Enable/disable auto-start on boot
sudo systemctl enable knowable-backend
sudo systemctl disable knowable-backend
```

## Service Details

| Service | Port | Description |
|---------|------|-------------|
| `knowable-backend` | 3000 | Main API server |
| `knowable-frontend` | 8080 | Static file server |
| `knowable-test` | 8081 | Test server |

## Troubleshooting

1. **Check service status**:
   ```bash
   ./status-all.sh
   ```

2. **View logs**:
   ```bash
   journalctl -u knowable-backend -f
   ```

3. **Reload after changes**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart knowable-backend
   ```

4. **Verify service files**:
   ```bash
   sudo systemctl cat knowable-backend
   ```
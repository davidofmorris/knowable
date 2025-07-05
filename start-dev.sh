#!/bin/bash

# Knowable Development Server Launcher
# Starts both backend (port 3000) and frontend (port 8080) servers

echo "🚀 Starting Knowable development servers..."

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend server
echo "📡 Starting backend server on port 3000..."
cd /home/dmorris/projects/knowable/server
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server on port 8080..."
cd /home/dmorris/projects/knowable/docs
serve -p 8080 &
FRONTEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start test page server
echo "🌐 Starting test page on port 8081..."
cd /home/dmorris/projects/knowable/test
serve -p 8081 &
TESTPAGE_PID=$!

# Wait a moment for test page server to start
sleep 2

echo ""
echo "✅ Both servers are running!"
echo "🔗 Frontend: http://localhost:8080"
echo "🔗 Test Page: http://localhost:8081"
echo "🔗 Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Keep script running and wait for user interrupt
wait
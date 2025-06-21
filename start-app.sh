#!/bin/bash

# Display welcome message
echo "Starting Kudos Board Application..."
echo "This script will start both the backend and frontend servers."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm and try again."
    exit 1
fi

# Function to check if a port is in use
is_port_in_use() {
    if command -v lsof &> /dev/null; then
        lsof -i :$1 &> /dev/null
        return $?
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$1 "
        return $?
    else
        # If neither lsof nor netstat is available, assume port is free
        return 1
    fi
}

# Check if ports 3000 and 3001 are available
if is_port_in_use 3000; then
    echo "Error: Port 3000 is already in use. Please free up this port and try again."
    exit 1
fi

if is_port_in_use 3001; then
    echo "Error: Port 3001 is already in use. Please free up this port and try again."
    exit 1
fi

# Start backend server in the background
echo "Starting backend server..."
cd "$(dirname "$0")" # Navigate to the script's directory
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend server to start..."
sleep 5

# Start frontend server in the background
echo "Starting frontend server..."
cd "$(dirname "$0")/frontend"
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM

# Keep the script running
echo ""
echo "Both servers are now running!"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait for user to press Ctrl+C
waitcd /Users/aaokoro/kudos-boardcd /Users/aaokoro/kudos-boardcd /Users/aaokoro/kudos-boardcd /Users/aaokoro/kudos-board

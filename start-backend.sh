#!/bin/bash

# Start FastAPI Backend for File Management
echo "Starting FastAPI backend for file management..."

# Install requirements if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing requirements..."
pip install -r requirements-backend.txt

echo "Starting FastAPI server on port 3001..."
python file-management-api.py

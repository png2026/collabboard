#!/usr/bin/env bash
set -euo pipefail

echo "Starting backend (dev mode)..."
docker compose up --build

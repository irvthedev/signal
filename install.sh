#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Setting up Python virtual environment"
python3 -m venv "$REPO_ROOT/.venv"
source "$REPO_ROOT/.venv/bin/activate"

echo "==> Installing backend dependencies"
pip install -r "$REPO_ROOT/backend/requirements.txt"

echo "==> Installing frontend dependencies"
cd "$REPO_ROOT/frontend"
npm install

echo ""
echo "Done. To start the app:"
echo "  Tab 1: source .venv/bin/activate && PYTHONPATH=backend uvicorn backend.main:app --port 8000"
echo "  Tab 2: cd frontend && npm run dev"

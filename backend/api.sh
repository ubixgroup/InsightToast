#!/usr/bin/env bash
set -euo pipefail

CONDA_ENV="${CONDA_ENV:-prototype}"
PYTHON_VERSION="${PYTHON_VERSION:-3.11}"
API_HOST="${API_HOST:-0.0.0.0}"
API_PORT="${API_PORT:-4343}"
PID_FILE="${PID_FILE:-/tmp/insighttoast-api.pid}"
LOG_FILE="${LOG_FILE:-/tmp/insighttoast-api.log}"

command -v conda >/dev/null 2>&1 || {
  echo "Error: conda is not installed or not in PATH."
  exit 1
}

usage() {
  echo "Usage: ./api.sh {init|dev|start|stop|restart|logs|status}"
  echo ""
  echo "Commands:"
  echo "  init     - Create conda env and install dependencies"
  echo "  dev      - Run API in foreground with auto-reload (for debugging)"
  echo "  start    - Run API in background"
  echo "  stop     - Stop background API"
  echo "  restart  - Restart background API"
  echo "  logs     - Tail background API logs"
  echo "  status   - Show API status"
}

is_running() {
  if [ -f "${PID_FILE}" ]; then
    local pid
    pid="$(cat "${PID_FILE}")"
    if [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

env_exists() {
  conda run -n "${CONDA_ENV}" python -V >/dev/null 2>&1
}

init_env() {
  if ! env_exists; then
    echo "Conda env '${CONDA_ENV}' not found. Creating it with Python ${PYTHON_VERSION}..."
    conda create -y -n "${CONDA_ENV}" "python=${PYTHON_VERSION}" >/dev/null
    echo "Created env '${CONDA_ENV}'."
  else
    echo "Conda env '${CONDA_ENV}' found."
  fi

  echo "Installing/updating dependencies in '${CONDA_ENV}' with uv..."
  conda run -n "${CONDA_ENV}" python -m pip install -q --upgrade pip uv
  conda run -n "${CONDA_ENV}" uv pip install -r requirements.txt
}

dev() {
  # Run API in foreground with auto-reload for debugging
  
  # Check if API is already running and stop it
  if is_running; then
    echo "API is already running in background. Stopping it first..."
    stop
    sleep 2
  fi

  # More aggressive port cleanup
  if lsof -Pi :${API_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port ${API_PORT} is already in use. Freeing it..."
    
    # Get all PIDs using the port
    pids=$(lsof -Pi :${API_PORT} -sTCP:LISTEN -t 2>/dev/null)
    
    for pid in $pids; do
      echo "Found process ${pid} using port ${API_PORT}"
      
      # Kill child processes first
      pkill -TERM -P "${pid}" 2>/dev/null || true
      
      # Kill the main process
      kill -TERM "${pid}" 2>/dev/null || true
    done
    
    # Wait for graceful shutdown
    echo "Waiting for processes to terminate..."
    sleep 3
    
    # Force kill if still running
    if lsof -Pi :${API_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "Processes didn't terminate gracefully. Force killing..."
      pids=$(lsof -Pi :${API_PORT} -sTCP:LISTEN -t 2>/dev/null)
      for pid in $pids; do
        pkill -9 -P "${pid}" 2>/dev/null || true
        kill -9 "${pid}" 2>/dev/null || true
      done
      sleep 2
    fi
    
    # Final check
    if lsof -Pi :${API_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "ERROR: Unable to free port ${API_PORT}. Please investigate manually."
      echo "Run: lsof -i :${API_PORT} to see what's using the port"
      return 1
    fi
    
    echo "Port ${API_PORT} is now free."
  fi

  if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    set -a
    # shellcheck disable=SC1091
    source ".env"
    set +a
  fi

  echo "Starting API in dev mode on ${API_HOST}:${API_PORT} (foreground, auto-reload)..."
  echo "Press Ctrl+C to stop."
  echo ""
  
  conda run -n "${CONDA_ENV}" --no-capture-output python -m uvicorn API.main:app \
    --host "${API_HOST}" --port "${API_PORT}" --reload \
    --reload-exclude="qdrant_storage/*" \
    --reload-exclude="__pycache__/*" \
    --reload-exclude="*.pyc"
}

start() {
  if is_running; then
    echo "API is already running with PID $(cat "${PID_FILE}")."
    exit 0
  fi

  if [ -f "${PID_FILE}" ]; then
    rm -f "${PID_FILE}"
  fi

  init_env

  echo "Starting API on ${API_HOST}:${API_PORT} using conda env '${CONDA_ENV}'..."
  if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    source ".env"
    set +a
  fi

  nohup conda run -n "${CONDA_ENV}" python -m uvicorn API.main:app --host "${API_HOST}" --port "${API_PORT}" \
    > "${LOG_FILE}" 2>&1 &

  local pid=$!
  echo "${pid}" > "${PID_FILE}"
  sleep 1

  if kill -0 "${pid}" 2>/dev/null; then
    echo "Started API with PID ${pid}."
    echo "Log file: ${LOG_FILE}"
  else
    echo "Failed to start API. Check logs: ${LOG_FILE}"
    exit 1
  fi
}

stop() {
  if is_running; then
    local pid
    pid="$(cat "${PID_FILE}")"
    kill "${pid}" 2>/dev/null || true
    sleep 1
    if kill -0 "${pid}" 2>/dev/null; then
      kill -9 "${pid}" 2>/dev/null || true
    fi
    rm -f "${PID_FILE}"
    echo "Stopped API process ${pid}."
  else
    echo "API is not running."
    rm -f "${PID_FILE}" || true
  fi
}

logs() {
  if [ -f "${LOG_FILE}" ]; then
    tail -f "${LOG_FILE}"
  else
    echo "Log file not found: ${LOG_FILE}"
  fi
}

status() {
  if is_running; then
    local pid
    pid="$(cat "${PID_FILE}")"
    echo "API is running (PID ${pid}) at ${API_HOST}:${API_PORT}"
    echo "Log file: ${LOG_FILE}"
  else
    echo "API is not running."
  fi
}

case "${1:-}" in
  init) init_env ;;
  dev) dev ;;
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  logs) logs ;;
  status) status ;;
  *) usage; exit 1 ;;
esac

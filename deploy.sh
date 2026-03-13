#!/usr/bin/env bash
# Deploy gaeilge.quest to morrigan
# Usage: ./deploy.sh

set -euo pipefail

REMOTE=morrigan
REMOTE_DIR=/var/www/gaeilge.quest
REMOTE_USER=www-data
SERVICE=gaeilge-quest

echo "=== Deploying gaeilge.quest to $REMOTE ==="

# Sync files (exclude venv, __pycache__, .git)
rsync -avz --delete \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  --exclude 'venv' \
  --exclude '.env' \
  . nthmost@${REMOTE}:${REMOTE_DIR}/

echo "=== Installing/updating Python dependencies ==="
ssh nthmost@${REMOTE} "
  cd ${REMOTE_DIR} &&
  python3 -m venv venv &&
  venv/bin/pip install -q -r requirements.txt
"

echo "=== Restarting service ==="
ssh nthmost@${REMOTE} "sudo systemctl restart ${SERVICE}"

echo "=== Done! ==="

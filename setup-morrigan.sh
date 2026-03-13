#!/usr/bin/env bash
# First-time setup of gaeilge.quest on morrigan
# Run this locally: bash setup-morrigan.sh
# Requires ANTHROPIC_API_KEY to be set in environment or passed as argument

set -euo pipefail

REMOTE=morrigan
REMOTE_DIR=/var/www/gaeilge.quest
APIKEY="${1:-${ANTHROPIC_API_KEY:-}}"

if [[ -z "$APIKEY" ]]; then
  echo "ERROR: Pass Anthropic API key as argument or set ANTHROPIC_API_KEY"
  exit 1
fi

echo "=== Creating remote directory ==="
ssh nthmost@${REMOTE} "sudo mkdir -p ${REMOTE_DIR} && sudo chown nthmost:nthmost ${REMOTE_DIR}"

echo "=== Syncing files ==="
rsync -avz --delete \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  --exclude 'venv' \
  --exclude '.env' \
  . nthmost@${REMOTE}:${REMOTE_DIR}/

echo "=== Setting ownership ==="
ssh nthmost@${REMOTE} "sudo chown -R www-data:www-data ${REMOTE_DIR}"

echo "=== Installing Python dependencies ==="
ssh nthmost@${REMOTE} "
  cd ${REMOTE_DIR} &&
  sudo -u www-data python3 -m venv venv &&
  sudo -u www-data venv/bin/pip install -q -r requirements.txt
"

echo "=== Writing env file ==="
ssh nthmost@${REMOTE} "echo 'ANTHROPIC_API_KEY=${APIKEY}' | sudo tee /etc/gaeilge-quest.env > /dev/null && sudo chmod 640 /etc/gaeilge-quest.env && sudo chown root:www-data /etc/gaeilge-quest.env"

echo "=== Installing systemd service ==="
ssh nthmost@${REMOTE} "
  sudo cp ${REMOTE_DIR}/gaeilge-quest.service /etc/systemd/system/ &&
  sudo systemctl daemon-reload &&
  sudo systemctl enable gaeilge-quest &&
  sudo systemctl start gaeilge-quest
"

echo "=== Installing nginx config ==="
ssh nthmost@${REMOTE} "
  sudo cp ${REMOTE_DIR}/nginx-gaeilge.quest.conf /etc/nginx/sites-available/gaeilge.quest &&
  sudo ln -sf /etc/nginx/sites-available/gaeilge.quest /etc/nginx/sites-enabled/ &&
  sudo nginx -t &&
  sudo systemctl reload nginx
"

echo "=== Status ==="
ssh nthmost@${REMOTE} "sudo systemctl status gaeilge-quest --no-pager"

echo ""
echo "=== Done! Site should be up at http://gaeilge.quest ==="
echo "    (DNS A record must point to 193.24.234.210 first)"
echo ""
echo "    To get HTTPS, run on morrigan:"
echo "    sudo certbot certonly --webroot -w /var/www/certbot -d gaeilge.quest -d www.gaeilge.quest"
echo "    Then uncomment the HTTPS block in /etc/nginx/sites-available/gaeilge.quest"

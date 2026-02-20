#!/usr/bin/env bash
set -euo pipefail

PROJECT="collabboard-487701"
REGION="us-central1"
SERVICE="collabboard-backend"
ALLOWED_ORIGINS='["http://localhost:5173","https://collabboard-487701.web.app"]'

COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"

echo "Running tests..."
docker compose -f "$COMPOSE_FILE" run --rm -T backend pytest tests/ -v || { echo "Tests failed, aborting deploy."; exit 1; }

echo "Deploying $SERVICE to Cloud Run ($REGION)..."

gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --project "$PROJECT" \
  --set-secrets "OPENAI_API_KEY=openai-api-key:latest" \
  --set-env-vars "^;;^OPENAI_MODEL=gpt-4-turbo;;GOOGLE_CLOUD_PROJECT=$PROJECT;;ALLOWED_ORIGINS=$ALLOWED_ORIGINS" \
  --no-invoker-iam-check

echo ""
echo "Deployed successfully!"
gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" --format="value(status.url)"

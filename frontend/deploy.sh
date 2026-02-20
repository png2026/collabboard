#!/usr/bin/env bash
set -euo pipefail

PROJECT="collabboard-487701"

echo "Building frontend..."
npm run build

echo "Deploying to Firebase Hosting ($PROJECT)..."
firebase deploy --only hosting --project "$PROJECT"

echo ""
echo "Deployed successfully!"
echo "https://$PROJECT.web.app"

#!/bin/bash
# ─────────────────────────────────────────────────
#  Melodies of Care — One-Click Launcher (macOS)
#  Double-click this file to start the website.
# ─────────────────────────────────────────────────

# Go to this script's directory (the project folder)
cd "$(dirname "$0")"

echo ""
echo "  🎵  Melodies of Care"
echo "  Starting development server..."
echo ""

# Install dependencies if next binary is missing (handles partial/missing node_modules)
if [ ! -f "node_modules/.bin/next" ]; then
  echo "  Installing dependencies (first run only — takes ~30 seconds)..."
  npm install
  echo ""
fi

echo "  ✅  Open your browser to:  http://localhost:3000"
echo "  Press Ctrl+C to stop the server."
echo ""

npm run dev

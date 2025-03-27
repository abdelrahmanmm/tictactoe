#!/bin/bash

# Exit on error
set -e

# Repository name - Change this to your actual repository name
REPO_NAME="tictactoe"

echo "=== Tic-tac-toe GitHub Pages Deployment ==="
echo "Building the project using the GitHub Pages configuration..."

# Check if the Vite GitHub Pages config file exists
if [ ! -f "vite.github-pages.config.ts" ]; then
  echo "Error: vite.github-pages.config.ts file not found!"
  echo "Please create this file first before running this script."
  exit 1
fi

# Update vite.github-pages.config.ts with correct repo name
sed -i "s|/your-repo-name/|/${REPO_NAME}/|g" vite.github-pages.config.ts

# Build the frontend for GitHub Pages using the specific config
echo "Building project with repository name: ${REPO_NAME}"
npx vite build --config vite.github-pages.config.ts

# Create gh-pages directory if it doesn't exist
if [ ! -d "gh-pages" ]; then
  mkdir -p gh-pages
fi

# Clear previous content
rm -rf gh-pages/*

# Check if build directory exists
if [ ! -d "github-pages-build" ]; then
  echo "Error: github-pages-build directory not found!"
  echo "The build process may have failed. Check for errors above."
  exit 1
fi

# Check if build directory has content
if [ -z "$(ls -A github-pages-build 2>/dev/null)" ]; then
  echo "Warning: github-pages-build directory is empty!"
  echo "The build process may have failed. Check for errors above."
  exit 1
fi

# Copy build files to gh-pages directory
echo "Copying build files to gh-pages directory..."
cp -r github-pages-build/* gh-pages/

# Create .nojekyll file to disable Jekyll processing
touch gh-pages/.nojekyll

# Create a simple README for the gh-pages branch
cat > gh-pages/README.md << EOF
# 4-Player Tic-tac-toe Game

This is the GitHub Pages deployment of the 4-Player Tic-tac-toe game.
The game is running in static mode without a server backend.

Visit the main repository at https://github.com/abdelrahmanmm/tictactoe for the full source code.
EOF

echo "Files are prepared in the gh-pages directory."
echo ""
echo "To deploy to GitHub Pages, perform these steps:"
echo ""
echo "1. Create and switch to a new gh-pages branch:"
echo "   git checkout -b gh-pages"
echo ""
echo "2. Remove all files from the branch (but keep the directory):"
echo "   git rm -rf ."
echo "   # If the above command gives an error, use these commands instead:"
echo "   find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} \;"
echo ""
echo "3. Copy the build files:"
echo "   cp -r gh-pages/* ."
echo "   cp gh-pages/.nojekyll ."
echo ""
echo "4. Add and commit the changes:"
echo "   git add ."
echo "   git commit -m \"Deploy to GitHub Pages\""
echo ""
echo "5. Push to GitHub:"
echo "   git push -u origin gh-pages"
echo ""
echo "6. Return to your main branch:"
echo "   git checkout main"
echo ""
echo "7. Then enable GitHub Pages in your repository settings:"
echo "   - Go to Settings > Pages"
echo "   - Select 'Deploy from a branch' under Source"
echo "   - Select 'gh-pages' branch and '/ (root)' folder"
echo "   - Click Save"
echo ""
echo "Your site will be available at: https://abdelrahmanmm.github.io/${REPO_NAME}/"
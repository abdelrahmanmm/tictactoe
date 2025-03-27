#!/bin/bash

# Exit on error
set -e

# Repository name - IMPORTANT: Change this to your actual repository name
REPO_NAME="your-repo-name"

echo "=== Tic-tac-toe GitHub Pages Deployment ==="
echo "Building the project using the GitHub Pages configuration..."

# Update vite.github-pages.config.ts with correct repo name
sed -i "s|/your-repo-name/|/${REPO_NAME}/|g" vite.github-pages.config.ts

# Build the frontend for GitHub Pages using the specific config
npx vite build --config vite.github-pages.config.ts

echo "Build complete! Files are ready in the github-pages-build directory."

# Create temporary directory for gh-pages branch
rm -rf gh-pages-temp
mkdir -p gh-pages-temp

# Copy build files to gh-pages-temp
cp -r github-pages-build/* gh-pages-temp/

# Create .nojekyll file to disable Jekyll processing
touch gh-pages-temp/.nojekyll

# Create a simple README for the gh-pages branch
cat > gh-pages-temp/README.md << EOF
# 4-Player Tic-tac-toe Game

This is the GitHub Pages deployment of the 4-Player Tic-tac-toe game.
The game is running in static mode without a server backend.

Visit the main repository for the full source code.
EOF

# Navigate to the gh-pages directory
cd gh-pages-temp

# Initialize git repository
git init
git add .
git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"
git commit -m "Deploy to GitHub Pages"

# Create gh-pages branch
git branch -M gh-pages

echo "=== Ready for GitHub Pages Deployment ==="
echo ""
echo "To complete deployment, run these commands (adjusting for your GitHub username and repo):"
echo ""
echo "cd gh-pages-temp"
echo "git remote add origin https://github.com/username/${REPO_NAME}.git"
echo "git push -f origin gh-pages"
echo ""
echo "Then enable GitHub Pages in your repository settings:"
echo "- Go to Settings > Pages"
echo "- Select 'Deploy from a branch' under Source"
echo "- Select 'gh-pages' branch and '/ (root)' folder"
echo "- Click Save"
echo ""
echo "Your site will be available at: https://username.github.io/${REPO_NAME}/"
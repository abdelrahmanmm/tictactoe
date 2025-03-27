#!/bin/bash

# Ensure the script is executable
# chmod +x deploy-to-github.sh

echo "=== Tic-tac-toe GitHub Pages Deployment ==="
echo "Building the project using the GitHub Pages configuration..."

# Build the frontend for GitHub Pages using the specific config
npx vite build --config vite.github-pages.config.ts

echo "Build complete! Files are ready in the github-pages-build directory."

# Check if gh-pages directory exists (from previous deployment)
if [ -d "gh-pages" ]; then
  echo "Removing previous gh-pages directory..."
  rm -rf gh-pages
fi

# Create a temporary gh-pages directory
echo "Creating temporary deployment directory..."
mkdir -p gh-pages
cp -r github-pages-build/* gh-pages/

# Create or update the .nojekyll file to disable Jekyll processing
touch gh-pages/.nojekyll

echo ""
echo "=== GitHub Pages Deployment Options ==="
echo "Option 1: Automated deployment with gh-pages branch"
echo "----------------------------------------"
echo "If you have git configured and have permission to push to the repository:"
echo ""
echo "Run these commands to deploy to GitHub Pages:"
echo "  git add ."
echo "  git commit -m \"Update main codebase\""
echo "  git push origin main"
echo "  cd gh-pages"
echo "  git init"
echo "  git add ."
echo "  git commit -m \"Deploy to GitHub Pages\""
echo "  git branch -M gh-pages"
echo "  git remote add origin https://github.com/yourusername/your-repository-name.git"
echo "  git push -f origin gh-pages"
echo ""
echo "Then configure GitHub Pages in your repository settings:"
echo "  - Go to Settings > Pages"
echo "  - Select 'Deploy from a branch' under Source"
echo "  - Select 'gh-pages' branch and '/ (root)' folder"
echo "  - Click Save"
echo ""
echo "Option 2: Manual deployment"
echo "----------------------------------------"
echo "1. Copy all files from the 'gh-pages' directory"
echo "2. Go to GitHub repository in your browser"
echo "3. Create a new branch called 'gh-pages'"
echo "4. Upload all files directly to that branch"
echo "5. Configure GitHub Pages to use the 'gh-pages' branch"
echo ""
echo "Once deployed, your site will be available at: https://yourusername.github.io/your-repository-name/"
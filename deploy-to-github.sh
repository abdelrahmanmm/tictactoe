#!/bin/bash

# Ensure the script is executable
# chmod +x deploy-to-github.sh

echo "=== Tic-tac-toe GitHub Pages Deployment ==="
echo "Building the project using the GitHub Pages configuration..."

# Build the frontend for GitHub Pages using the specific config
npx vite build --config vite.github-pages.config.ts

echo "Build complete! Files are ready in the github-pages-build directory."
echo ""
echo "=== GitHub Pages Deployment Instructions ==="
echo "To deploy to GitHub Pages:"
echo "1. Create a new GitHub repository (if you haven't already)"
echo "2. Initialize a git repository in the github-pages-build directory:"
echo "   cd github-pages-build"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"Initial commit\""
echo ""
echo "3. Add your GitHub repo as remote and push:"
echo "   git remote add origin https://github.com/yourusername/your-repository-name.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Configure GitHub Pages in your repository settings:"
echo "   - Go to Settings > Pages"
echo "   - Select 'Deploy from a branch' under Source"
echo "   - Select 'main' branch and '/ (root)' folder"
echo "   - Click Save"
echo ""
echo "Once deployed, your site will be available at: https://yourusername.github.io/your-repository-name/"
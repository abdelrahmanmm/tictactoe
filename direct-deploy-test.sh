#!/bin/bash

# Exit on error
set -e

echo "=== GitHub Pages Simple Test Deployment ==="

# Navigate to the direct-deploy directory
cd direct-deploy

# Initialize git repository
git init
git add .
git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"
git commit -m "Test deployment to GitHub Pages"

# Create gh-pages branch
git branch -M gh-pages

echo "=== Ready for GitHub Pages Test Deployment ==="
echo ""
echo "To complete deployment, run these commands (adjusting for your GitHub username and repo):"
echo ""
echo "cd direct-deploy"
echo "git remote add origin https://github.com/username/your-repo-name.git"
echo "git push -f origin gh-pages"
echo ""
echo "Then enable GitHub Pages in your repository settings:"
echo "- Go to Settings > Pages"
echo "- Select 'Deploy from a branch' under Source"
echo "- Select 'gh-pages' branch and '/ (root)' folder"
echo "- Click Save"
echo ""
echo "Your test page will be available at: https://username.github.io/your-repo-name/"
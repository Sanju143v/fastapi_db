#!/bin/bash

cd /vercel/share/v0-project

# Configure git if needed
git config user.email "v0@vercel.dev" || true
git config user.name "v0 AI" || true

# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "feat: Update AskSanju chatbot with professional AI features

- Integrated JWT authentication and user session tracking
- Added professional UI with enhanced styling and user information display
- Implemented database-backed chat history and conversation management
- Added voice input with improved speech recognition
- Enhanced AI routes with authentication verification
- Added logout functionality and dashboard integration
- Improved multilingual support and professional system prompts
- Updated authentication modal with feature highlights"

# Push to the ask-sanju-chatbot branch
git push origin ask-sanju-chatbot --force-with-lease

echo "Successfully pushed to GitHub!"

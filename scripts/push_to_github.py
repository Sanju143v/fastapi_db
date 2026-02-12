#!/usr/bin/env python3

import subprocess
import os
import sys

# Change to project directory
os.chdir('/vercel/share/v0-project')

try:
    # Configure git
    print("[v0] Configuring git...")
    subprocess.run(['git', 'config', 'user.email', 'v0@vercel.dev'], check=False)
    subprocess.run(['git', 'config', 'user.name', 'v0 AI'], check=False)
    
    # Stage all changes
    print("[v0] Staging all changes...")
    subprocess.run(['git', 'add', '-A'], check=True)
    
    # Commit with descriptive message
    print("[v0] Committing changes...")
    commit_message = """feat: Update AskSanju chatbot with professional AI features

- Integrated JWT authentication and user session tracking
- Added professional UI with enhanced styling and user information display
- Implemented database-backed chat history and conversation management
- Added voice input with improved speech recognition
- Enhanced AI routes with authentication verification
- Added logout functionality and dashboard integration
- Improved multilingual support and professional system prompts
- Updated authentication modal with feature highlights"""
    
    subprocess.run(['git', 'commit', '-m', commit_message], check=True)
    
    # Push to ask-sanju-chatbot branch
    print("[v0] Pushing to GitHub...")
    subprocess.run(['git', 'push', 'origin', 'ask-sanju-chatbot', '--force-with-lease'], check=True)
    
    print("[v0] Successfully pushed all changes to GitHub!")
    sys.exit(0)
    
except subprocess.CalledProcessError as e:
    print(f"[v0] Error during git operation: {e}")
    sys.exit(1)
except Exception as e:
    print(f"[v0] Unexpected error: {e}")
    sys.exit(1)

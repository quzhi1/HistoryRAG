#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting HistoryRAG installation..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    brew install pnpm
else
    echo "✅ pnpm is already installed"
fi

# Check if .env exists
if [ ! -f .env ]; then
    # Prompt for environment variables
    echo "📝 Setting up environment variables..."
    read -p "Enter your PostgreSQL connection URL (e.g., postgres://postgres:postgres@localhost:5432/historyrag): " DATABASE_URL
    read -p "Enter your OpenAI API key: " OPENAI_API_KEY

    # Create .env file
    echo "DATABASE_URL=$DATABASE_URL" > .env
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
    echo "✅ Environment variables have been saved to .env"
else
    echo "✅ .env file already exists, skipping environment setup"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
pnpm install

# Database setup
echo "🗄️ Setting up database..."
pnpm db:migrate
pnpm db:push

# Install AI dependencies
echo "🤖 Installing AI dependencies..."
pnpm add ai @ai-sdk/react @ai-sdk/openai @radix-ui/react-progress

echo "✨ Installation complete! You can now start the development server with 'pnpm dev'" 
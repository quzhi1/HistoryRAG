#!/bin/bash

# Exit on error
set -e

# Fallback defaults if .env.example doesn't exist
DEFAULT_DATABASE_URL="postgres://postgres:postgres@localhost:5432/historyrag"
DEFAULT_LOCAL_MODEL_BASE_URL="http://localhost:11434/v1"
DEFAULT_LOCAL_CHAT_MODEL="qwen3:8b"
DEFAULT_LOCAL_EMBEDDING_MODEL="qwen3-embedding"

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
    read -p "Enter your PostgreSQL connection URL [$DEFAULT_DATABASE_URL]: " DATABASE_URL

    # Create .env file with DATABASE_URL
    DATABASE_URL=${DATABASE_URL:-$DEFAULT_DATABASE_URL}
    echo "DATABASE_URL=$DATABASE_URL" > .env
    read -p "Use local model? (yes/no) [yes]: " USE_LOCAL_MODEL
    USE_LOCAL_MODEL=${USE_LOCAL_MODEL:-yes}
    echo "USE_LOCAL_MODEL=$USE_LOCAL_MODEL" >> .env

    if [ "$USE_LOCAL_MODEL" = "yes" ]; then
        echo "🤖 Configuring local model settings..."
        echo ""
        echo "Default values:"
        echo "  - Base URL: $DEFAULT_LOCAL_MODEL_BASE_URL (Ollama)"
        echo "  - Chat Model: $DEFAULT_LOCAL_CHAT_MODEL"
        echo "  - Embedding Model: $DEFAULT_LOCAL_EMBEDDING_MODEL"
        echo ""

        read -p "Enter local model base URL [$DEFAULT_LOCAL_MODEL_BASE_URL]: " LOCAL_MODEL_BASE_URL
        LOCAL_MODEL_BASE_URL=${LOCAL_MODEL_BASE_URL:-$DEFAULT_LOCAL_MODEL_BASE_URL}

        read -p "Enter chat model name [$DEFAULT_LOCAL_CHAT_MODEL]: " LOCAL_CHAT_MODEL
        LOCAL_CHAT_MODEL=${LOCAL_CHAT_MODEL:-$DEFAULT_LOCAL_CHAT_MODEL}

        read -p "Enter embedding model name [$DEFAULT_LOCAL_EMBEDDING_MODEL]: " LOCAL_EMBEDDING_MODEL
        LOCAL_EMBEDDING_MODEL=${LOCAL_EMBEDDING_MODEL:-$DEFAULT_LOCAL_EMBEDDING_MODEL}

        echo "LOCAL_MODEL_BASE_URL=$LOCAL_MODEL_BASE_URL" >> .env
        echo "LOCAL_CHAT_MODEL=$LOCAL_CHAT_MODEL" >> .env
        echo "LOCAL_EMBEDDING_MODEL=$LOCAL_EMBEDDING_MODEL" >> .env

        echo "✅ Local model configuration saved"
        echo "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️"
        echo "📌 To make sure you have the models available, run:"
        echo "   ollama pull $LOCAL_CHAT_MODEL"
        echo "   ollama pull $LOCAL_EMBEDDING_MODEL"
        echo "⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️"
    else
        read -p "Enter your OpenAI API key: " OPENAI_API_KEY
        echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
    fi

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

# Install test dependencies
echo "🧪 Installing test dependencies..."
pnpm add -D @types/jest jest ts-jest @jest/globals babel-jest @babel/core @babel/preset-env @babel/plugin-transform-runtime crypto-browserify

echo "✨ Installation complete! You can now start the development server with 'pnpm dev'" 

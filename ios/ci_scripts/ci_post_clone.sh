#!/bin/sh
set -e

echo "===== Xcode Cloud Post Clone Script ====="

# Navigate to project root
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Decode GoogleService-Info.plist from environment variable
echo "Creating GoogleService-Info.plist..."
echo "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | base64 -d > ios/GoogleService-Info.plist

# Install Node.js using Homebrew
echo "Installing Node.js..."
brew install node@22
brew link node@22 --force --overwrite

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install Yarn
echo "Installing Yarn..."
npm install -g yarn

# Install dependencies
echo "Installing npm dependencies..."
yarn install --frozen-lockfile

# Install CocoaPods dependencies
echo "Installing CocoaPods dependencies..."
cd ios
export USE_FRAMEWORKS=static
export RCT_NEW_ARCH_ENABLED=1

# Install CocoaPods via Homebrew (system Ruby has no write permission)
brew install cocoapods
pod install

echo "===== Post Clone Script Complete ====="

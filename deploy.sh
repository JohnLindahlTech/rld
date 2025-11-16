#!/bin/bash

# This script packages the Chrome extension for deployment.
# It reads the version from src/manifest.json, creates a zip file
# with the necessary files from the src directory, and names it using the version.

# Stop on any error
set -e

# Define the source directory
SRC_DIR="src"

# Read the version from src/manifest.json
VERSION=$(grep '"version":' "${SRC_DIR}/manifest.json" | sed 's/.*"version": "\(.*\)".*/\1/')

if [ -z "$VERSION" ]; then
  echo "Error: Could not find version in ${SRC_DIR}/manifest.json"
  exit 1
fi

# Define the output filename, placing it in the project root
FILENAME="../rld-plus-v${VERSION}.zip"

# Define the files and directories to be included in the zip
# We will zip all files in the src directory
# FILES_TO_ZIP="manifest.json background.js content.js popup.html popup.css popup.js images"

# Navigate into the src directory to create the zip file with correct paths
echo "Navigating to ${SRC_DIR} to package extension..."
cd "${SRC_DIR}"

# Create the zip file, including all files in the current directory
echo "Packaging extension version ${VERSION} into ${FILENAME}..."
zip -r "${FILENAME}" . -x "*.DS_Store"

# Navigate back to the original directory
cd ..

echo "Successfully created ${FILENAME} in the project root."
echo "You can now upload this file to the Chrome Web Store."


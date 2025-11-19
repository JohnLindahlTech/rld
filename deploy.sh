#!/bin/bash

# This script packages the Chrome extension for deployment.
# It can automatically increment the version number in src/manifest.json,
# package the files, and create a versioned zip file.

# --- Configuration ---
SRC_DIR="src"
MANIFEST_FILE="${SRC_DIR}/manifest.json"

# --- Script Logic ---
set -e # Stop on any error

# --- Help Message ---
print_help() {
  echo "Usage: ./deploy.sh [OPTIONS]"
  echo ""
  echo "Packages the RLD+ Chrome extension for deployment."
  echo "It can automatically increment the version number in src/manifest.json"
  echo "and creates a versioned zip file."
  echo ""
  echo "Options:"
  echo "  -h, --help             Display this help message."
  echo "  --patch                Increment the patch version (e.g., 1.0.0 -> 1.0.1). This is the default."
  echo "  --minor                Increment the minor version and reset patch to 0 (e.g., 1.0.1 -> 1.1.0)."
  echo "  --major                Increment the major version and reset minor and patch to 0 (e.g., 1.1.0 -> 2.0.0)."
  echo "  --version \"x.y.z\"      Set the version in manifest.json to the exact specified string."
  echo "  --no-version           Do not change the version in manifest.json. Just package with the current version."
  echo ""
  echo "Example:"
  echo "  ./deploy.sh --minor"
  echo "  ./deploy.sh --version \"2.0.0\""
}

# --- Argument Parsing ---
VERSION_ACTION="patch" # Default action
NEW_VERSION=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help) print_help; exit 0;;
        --patch) VERSION_ACTION="patch";;
        --minor) VERSION_ACTION="minor";;
        --major) VERSION_ACTION="major";;
        --version) NEW_VERSION="$2"; shift;;
        --no-version) VERSION_ACTION="none";;
        *) echo "Unknown parameter passed: $1"; print_help; exit 1;;
    esac
    shift
done

# --- Version Handling ---
if [ "$VERSION_ACTION" != "none" ]; then
  # Read the current version from manifest.json
  CURRENT_VERSION=$(grep '"version":' "$MANIFEST_FILE" | sed 's/.*"version": "\(.*\)".*/\1/')
  if [ -z "$CURRENT_VERSION" ]; then
    echo "Error: Could not find version in $MANIFEST_FILE"
    exit 1
  fi

  if [ -n "$NEW_VERSION" ]; then
    # Use the explicitly provided version
    echo "Setting version explicitly to $NEW_VERSION..."
  else
    # Increment the version based on the action
    IFS='.' read -r -a V_PARTS <<< "$CURRENT_VERSION"
    MAJOR=${V_PARTS[0]}
    MINOR=${V_PARTS[1]}
    PATCH=${V_PARTS[2]}

    case $VERSION_ACTION in
        patch)
            PATCH=$((PATCH + 1))
            ;;
        minor)
            MINOR=$((MINOR + 1))
            PATCH=0
            ;;
        major)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            ;;
    esac
    NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
    echo "Incrementing version from ${CURRENT_VERSION} to ${NEW_VERSION}..."
  fi

  # Update the manifest file
  # The sed command works on both macOS and Linux
  sed -i.bak "s/\"version\": \"${CURRENT_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" "$MANIFEST_FILE"
  rm "${MANIFEST_FILE}.bak" # Remove the backup file created by sed
else
  echo "Skipping version change as per --no-version flag."
  NEW_VERSION=$(grep '"version":' "$MANIFEST_FILE" | sed 's/.*"version": "\(.*\)".*/\1/')
fi


# --- Packaging ---
# Define the build directory and output filename
BUILD_DIR="build"
FILENAME="${BUILD_DIR}/rld-plus-v${NEW_VERSION}.zip"

# Create the build directory if it doesn't exist
mkdir -p "${BUILD_DIR}"

# Navigate into the src directory to create the zip file with correct paths
echo "Navigating to ${SRC_DIR} to package extension..."
cd "${SRC_DIR}"

# Create the zip file, including all files in the current directory
echo "Packaging extension version ${NEW_VERSION} into ${FILENAME}..."
zip -r "../${FILENAME}" . -x "*.DS_Store"

# Navigate back to the original directory
cd ..

echo "Successfully created ${FILENAME}."
echo "You can now upload this file to the Chrome Web Store."

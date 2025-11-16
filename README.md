# RLD+

RLD+ is a simple yet powerful Chrome extension designed to automatically reload any website at a specified interval. It offers second-level granularity, giving you precise control over your refresh rates.

## Features

- **Custom Reload Intervals:** Set any reload interval in seconds.
- **Visual Countdown:** The extension icon displays a live countdown timer, so you always know when the next reload will occur.
- **Simple Interface:** An easy-to-use popup to start and stop the reloading process.
- **Dark/Light Mode Support:** Automatically adapts to your system's dark or light mode preference for a seamless visual experience.

## How to Use

<div style="text-align: center;">
  <img src="docs/assets/main.png" alt="RLD+ Popup Interface" width="625" height="884" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
</div>

1.  Click on the RLD+ extension icon in your Chrome toolbar.
2.  Set the desired reload interval using either the predefined buttons (10s, 1m, 5m, 10m) or by entering values into the Hours (H), Minutes (M), and Seconds (S) input fields.
3.  Click the **Start** button.
4.  The countdown will begin on the extension icon. The current tab will reload each time the countdown finishes.
5.  Optionally, check "Hard Refresh (bypass cache)" to force a full reload without using cached content.
6.  Optionally, check "Stop refreshing if clicking anywhere on the page" to automatically halt the reloading process if you interact with the page.
7.  To end the process, click the **Stop** button.

## Installation

1.  Download or clone this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click on **Load unpacked**.
5.  Select the directory where you saved the extension files.
6.  Pin the RLD+ icon to your toolbar for easy access.

## Deployment

To package the extension for the Chrome Web Store, follow these steps:

1.  **Update Version:** Before creating a new release, manually update the `version` field in `src/manifest.json` to a new, unique version number. The Chrome Web Store requires a higher version for each upload.

2.  **Run Deploy Script:** Run the `deploy.sh` script from the project root. You can use flags to control how the version is incremented.

    *   `./deploy.sh`: (Default) Increments the patch version (e.g., 1.0.0 -> 1.0.1).
    *   `./deploy.sh --minor`: Increments the minor version (e.g., 1.0.1 -> 1.1.0).
    *   `./deploy.sh --major`: Increments the major version (e.g., 1.1.0 -> 2.0.0).
    *   `./deploy.sh --version "x.y.z"`: Sets a specific version.
    *   `./deploy.sh --no-version`: Packages without changing the version.

3.  **Upload to Store:** The script will generate a `rld-plus-v<version>.zip` file in the project root. Upload this file to the Chrome Web Store Developer Dashboard.

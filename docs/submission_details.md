# Chrome Web Store Submission Details

This file contains the specific text and configuration details to be used when submitting the RLD+ extension to the Chrome Web Store.

---

## Extension Name

RLD+

## Short Description

A simple extension to auto-reload the current tab at a specified interval.

## Detailed Description

RLD+ is a simple yet powerful Chrome extension designed to automatically reload any website at a specified interval. It offers second-level granularity, giving you precise control over your refresh rates.

**Key Features:**

- **Custom Reload Intervals:** Set any reload interval in seconds, minutes, and hours.
- **Preset Timers:** Quickly start a reload with common presets (10s, 1m, 5m, 10m).
- **Dark/Light Mode Support:** Automatically adapts to your system's theme for a seamless visual experience.
- **Hard Refresh:** Option to bypass the cache for a complete, fresh reload.
- **Stop on Interaction:** Automatically stops the timer if you click anywhere on the page.
- **Visual Countdown:** The extension icon displays a live countdown timer, so you always know when the next reload will occur.
- **Efficient:** Uses Chrome's `alarms` API for reliable and battery-friendly timing.

## Category

Productivity - Tools

## Privacy

This section details the information required for the "Privacy practices" tab in the Chrome Web Store developer dashboard.

### 1. Single Purpose

The single purpose of this extension is to automatically reload the current browser tab at a user-specified interval. All features are directly related to this core purpose.

### 2. Permission Justification

The extension requests the following permissions, each of which is essential for its single purpose:

*   **`activeTab`**: This permission is used to perform the reload action on the currently active tab and to get its URL for context.
*   **`storage`**: This permission is used to save the user's settings (such as the reload interval, hard refresh preference, and other UI states) locally on their machine. This allows user preferences to persist between browser sessions.
*   **`alarms`**: This is the core permission for the extension's functionality. The `alarms` API is used to create a reliable and battery-efficient timer that triggers the page reload at the specified interval.
*   **`scripting`**: This permission is used to inject a content script into the active tab. This script is necessary for the "Stop refreshing if clicking anywhere on the page" feature, as it listens for user interaction on the page to stop the timer.

### 3. Remote Code Usage

**Are you using remote code?**
No, I am not using remote code.

**Justification:**
All JavaScript, CSS, and HTML code required for the extension to function is included directly within the extension's package. No external scripts or resources are fetched or executed.

### 4. Data Usage

**What user data do you plan to collect?**
This extension **does not** collect any of the following types of user data:

*   Personally identifiable information
*   Health information
*   Financial and payment information
*   Authentication information
*   Personal communications
*   Location
*   Web history
*   User activity (beyond what is needed for the "stop on click" feature, which is processed locally and not collected or stored)
*   Website content

The only data the extension handles is the user's own settings for the extension (e.g., the desired reload time), which is stored locally on the user's machine via the `chrome.storage` API and is never transmitted.

**Data Usage Certifications:**
*   [x] I do not sell or transfer user data to third parties, outside of the approved use cases.
*   [x] I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
*   [x] I do not use or transfer user data to determine creditworthiness or for lending purposes.

### 5. Privacy Policy URL

Since this extension does not collect or transmit any user data, a privacy policy is not strictly required by the Chrome Web Store policy. However, it is good practice to provide one. The privacy policy for this extension is available in the `PRIVACY.md` file in the project root. If hosted online, its URL would be provided here.

# RLD+ Architecture

This document provides a high-level overview of the RLD+ Chrome extension architecture.

## Core Components

RLD+ consists of three main components that interact to provide the reloading functionality:

### 1. Background Script (`src/background.js`)

- **Role:** The central coordinator and state manager.
- **Responsibilities:**
  - Manages the state of all active timers using `chrome.storage.local`.
  - Handles `chrome.alarms` for scheduling reloads.
  - Updates the extension badge text (countdown).
  - Injects `content.js` into tabs when needed.
  - Listens for keyboard shortcuts (`chrome.commands`).
  - Handles messages from the popup and content scripts.
- **Key Events:** `onAlarm`, `onMessage`, `onCommand`, `onUpdated`, `onRemoved`.

### 2. Popup (`src/popup.html`, `src/popup.js`, `src/popup.css`)

- **Role:** The user interface.
- **Responsibilities:**
  - Allows users to set intervals and start/stop timers.
  - Displays the "Management View" for controlling multiple tabs.
  - Reads current state from `chrome.storage.local` to update the UI.
  - Sends commands (`start`, `stop`, `remove`) to the background script.
  - Handles dark/light mode theming via CSS variables.

### 3. Content Script (`src/content.js`)

- **Role:** The bridge to the web page.
- **Responsibilities:**
  - **Scroll Preservation:** Saves scroll position to `sessionStorage` before unload and restores it after load.
  - **Visual Countdown:** Renders the floating overlay using Shadow DOM to avoid style conflicts.
  - **Interaction:** Detects clicks to stop the timer (if "Stop on click" is enabled).
  - **Communication:** Listens for `showCountdown` and `hideCountdown` messages from the background script.

## Data Flow

1.  **Starting a Timer:**
    - User clicks "Start" in Popup -> Popup sends `start` message to Background.
    - Background saves state to Storage -> Sets Alarm -> Updates Badge.
    - Background injects Content Script -> Sends `showCountdown` message.

2.  **Reload Cycle:**
    - Alarm fires in Background -> Background reloads the tab.
    - Content Script loads -> Restores scroll position -> Re-initializes overlay.
    - Background calculates next reload time -> Updates Badge -> Sends `showCountdown` to Content Script.

3.  **Stopping a Timer:**
    - User clicks "Stop" (Popup or Shortcut) OR clicks page (if enabled).
    - Message sent to Background -> Background clears Alarm -> Removes state from Storage -> Clears Badge.
    - Background sends `hideCountdown` to Content Script.

## Storage Schema

The `timers` object in `chrome.storage.local` maps `tabId` to a timer configuration:

```json
{
  "timers": {
    "12345": {
      "interval": 60,
      "isActive": true,
      "lastReload": 1678900000000,
      "nextReloadTime": 1678900060000,
      "isHardRefresh": false,
      "stopOnClick": true,
      "showCountdown": true,
      "isRandom": false,
      "minInterval": 0,
      "maxInterval": 0
    }
  }
}
```

## Testing

The extension uses **Vitest** for unit testing. Tests are located in the `tests/` directory.

### Test Coverage

- **`tests/utils.test.js`** - Time formatting, badge text formatting, and time calculations
- **`tests/storage.test.js`** - Storage schema validation and random interval logic
- **`tests/position.test.js`** - Visual countdown position calculations and rotation

### Running Tests

```bash
npm test              # Run all tests
npm test -- --run     # Run tests once (no watch mode)
```

### Writing Tests

When adding new utility functions or core logic:

1. Create a new test file in `tests/` or add to an existing one
2. Follow the existing structure using Vitest's `describe`, `test`, and `expect`
3. Use descriptive test names that explain the expected behavior
4. Test edge cases and boundary conditions

Example:

```javascript
import { describe, test, expect } from 'vitest';

describe('My Feature', () => {
  test('handles normal case', () => {
    expect(myFunction(10)).toBe(20);
  });
});
```

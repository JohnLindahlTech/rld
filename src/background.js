// background.js

// Formats remaining seconds into a compact string for the badge
function formatBadgeText(seconds) {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }
  return String(seconds);
}

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "start") {
    const { tabId, settings } = request;

    chrome.storage.local.get("timers", (result) => {
      const timers = result.timers || {};

      // Get existing settings for the tab or create an empty object
      const existingSettings = timers[tabId] || {};

      // Create or update the timer for this tab
      timers[tabId] = {
        ...existingSettings, // Preserve old settings
        ...settings, // Overwrite with new settings
        isActive: true, // Set timer to active
        nextReloadTime: Date.now() + settings.interval * 1000,
      };

      chrome.storage.local.set({ timers: timers });

      if (settings.stopOnClick) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["content.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Could not inject script: " + chrome.runtime.lastError.message
              );
              return;
            }
            chrome.tabs.sendMessage(tabId, { command: "addClickListener" });
          }
        );
      }

      // Set initial badge text and color for the specific tab
      chrome.action.setBadgeText({
        tabId: tabId,
        text: formatBadgeText(settings.interval),
      });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#4688F1" });

      // Create a unique alarm for this tab
      chrome.alarms.create(`countdown-${tabId}`, { periodInMinutes: 1 / 60 });

      sendResponse({ status: "Countdown started" });
    });

    return true; // Indicate async response
  } else if (request.command === "stop") {
    // The tabId can come from the request (from the popup) or the sender (from a content script)
    const tabId = request.tabId || (sender.tab && sender.tab.id);
    if (!tabId) return true;

    chrome.storage.local.get("timers", (result) => {
      const timers = result.timers || {};
      const timerData = timers[tabId];

      if (timerData) {
        // Deactivate the timer instead of deleting it
        timerData.isActive = false;
        timerData.nextReloadTime = null;
        timers[tabId] = timerData;
        chrome.storage.local.set({ timers: timers });

        // Clear the specific alarm for this tab
        chrome.alarms.clear(`countdown-${tabId}`);

        // Clear the badge for this tab
        chrome.action.setBadgeText({ tabId: tabId, text: "" });

        // If stopOnClick was active, try to remove the listener
        if (timerData.stopOnClick) {
          chrome.tabs.sendMessage(
            tabId,
            { command: "removeClickListener" },
            () => {
              if (chrome.runtime.lastError) {
                // Expected if the content script is no longer there
              }
            }
          );
        }
      }

      if (sendResponse) {
        sendResponse({ status: "Countdown stopped" });
      }
    });

    return true; // Indicate async response
  } else if (request.command === "remove") {
    const tabId = request.tabId;
    if (!tabId) return true;

    chrome.storage.local.get("timers", (result) => {
      const timers = result.timers || {};

      if (timers[tabId]) {
        // Clear the alarm if active
        chrome.alarms.clear(`countdown-${tabId}`);

        // Clear the badge
        chrome.action.setBadgeText({ tabId: tabId, text: "" });

        // Remove click listener if stopOnClick was active
        if (timers[tabId].stopOnClick) {
          chrome.tabs.sendMessage(
            tabId,
            { command: "removeClickListener" },
            () => {
              if (chrome.runtime.lastError) {
                // Expected if content script is not there
              }
            }
          );
        }

        // Remove from storage
        delete timers[tabId];
        chrome.storage.local.set({ timers: timers });
      }

      if (sendResponse) {
        sendResponse({ status: "Timer removed" });
      }
    });

    return true; // Indicate async response
  }
});

// Listener for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("countdown-")) {
    const tabId = parseInt(alarm.name.split("-")[1], 10);

    chrome.storage.local.get("timers", (result) => {
      const timers = result.timers || {};
      const timerData = timers[tabId];

      // Only proceed if a timer exists and it is active
      if (timerData && timerData.isActive) {
        const remaining = Math.round(
          (timerData.nextReloadTime - Date.now()) / 1000
        );

        if (remaining > 0) {
          // Update badge for the specific tab
          chrome.action.setBadgeText({
            tabId: tabId,
            text: formatBadgeText(remaining),
          });
        } else {
          // Time is up, check if tab exists and then reload
          chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) {
              // Tab has been closed, so stop the timer for this tab.
              console.log(`Tab ${tabId} not found. Stopping reloader.`);
              delete timers[tabId];
              chrome.storage.local.set({ timers: timers });
              chrome.alarms.clear(alarm.name);
              return;
            }

            // Tab exists, reload it
            chrome.tabs.reload(tabId, {
              bypassCache: timerData.isHardRefresh || false,
            });

            // Reset for the next countdown cycle
            timerData.nextReloadTime = Date.now() + timerData.interval * 1000;
            timers[tabId] = timerData;
            chrome.storage.local.set({ timers: timers });
            chrome.action.setBadgeText({
              tabId: tabId,
              text: formatBadgeText(timerData.interval),
            });
          });
        }
      }
    });
  }
});

// Listener for tab updates to re-inject content script if necessary
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.local.get("timers", (result) => {
      const timers = result.timers || {};
      const timerData = timers[tabId];
      // If a timer is active for this tab and stopOnClick is enabled, re-inject the script
      if (timerData && timerData.stopOnClick) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            files: ["content.js"],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Could not re-inject script: " +
                  chrome.runtime.lastError.message
              );
              return;
            }
            chrome.tabs.sendMessage(tabId, { command: "addClickListener" });
          }
        );
      }
    });
  }
});

// Listener for when a tab is closed to clean up its timer
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.storage.local.get("timers", (result) => {
    const timers = result.timers || {};
    if (timers[tabId]) {
      console.log(`Tab ${tabId} closed. Removing its timer.`);
      // Remove the timer from storage
      delete timers[tabId];
      chrome.storage.local.set({ timers: timers });
      // Clear the specific alarm
      chrome.alarms.clear(`countdown-${tabId}`);
    }
  });
});

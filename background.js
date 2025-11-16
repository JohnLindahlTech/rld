
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
  if (request.command === 'start') {
    const intervalInSeconds = request.interval;
    const nextReloadTime = Date.now() + intervalInSeconds * 1000;

    // Store interval, reload time, and hard refresh preference
    chrome.storage.local.set({ 
      interval: intervalInSeconds, 
      isReloading: true, 
      nextReloadTime: nextReloadTime,
      isHardRefresh: request.isHardRefresh || false,
      stopOnClick: request.stopOnClick || false
    });

    if (request.stopOnClick) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
          }, () => {
            chrome.tabs.sendMessage(tabs[0].id, { command: 'addClickListener' });
          });
        }
      });
    }

    // Set initial badge text and color
    chrome.action.setBadgeText({ text: formatBadgeText(intervalInSeconds) });
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' }); // Blue

    // Create an alarm that fires every second to update the countdown
    chrome.alarms.create('countdown', { periodInMinutes: 1 / 60 });
    
    sendResponse({ status: "Countdown started" });

  } else if (request.command === 'stop') {
    chrome.alarms.clear('countdown');
    chrome.action.setBadgeText({ text: '' });

    // This function will be our single point of exit for stopping the reloader.
    const stopReloading = () => {
      chrome.storage.local.set({ isReloading: false, nextReloadTime: null }, () => {
        // The popup expects a response, but a content script click does not provide a sendResponse function.
        if (sendResponse) {
          sendResponse({ status: "Countdown stopped" });
        }
      });
    };

    chrome.storage.local.get('stopOnClick', (data) => {
      // Only try to remove the listener if the feature was active.
      if (data.stopOnClick) {
        // Determine the target tab ID. If the sender has a tab, it's a content script.
        // Otherwise, it's the popup, so we query for the active tab.
        const getTabId = new Promise(resolve => {
          if (sender.tab) {
            resolve(sender.tab.id);
          } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              resolve(tabs.length > 0 ? tabs[0].id : null);
            });
          }
        });

        getTabId.then(tabId => {
          if (tabId) {
            chrome.tabs.sendMessage(tabId, { command: 'removeClickListener' }, () => {
              // This callback runs whether the message was received or not.
              if (chrome.runtime.lastError) {
                // This error is expected if the content script isn't on the page.
              }
              // Once messaging is attempted, proceed to stop the reloader.
              stopReloading();
            });
          } else {
            // If there's no tab to message, just stop.
            stopReloading();
          }
        });
      } else {
        // If the feature wasn't active, just stop.
        stopReloading();
      }
    });

    // Return true to indicate we will respond asynchronously.
    return true;
  }
});

// Listener for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'countdown') {
    chrome.storage.local.get(['nextReloadTime', 'interval', 'isReloading', 'isHardRefresh'], (data) => {
      if (data.isReloading && data.nextReloadTime) {
        const remaining = Math.round((data.nextReloadTime - Date.now()) / 1000);

        if (remaining > 0) {
          // Update badge with formatted remaining time
          chrome.action.setBadgeText({ text: formatBadgeText(remaining) });
        } else {
          // Time is up, reload the tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              chrome.tabs.reload(tabs[0].id, { bypassCache: data.isHardRefresh || false });
            }
          });

          // Reset for the next countdown cycle
          const newNextReloadTime = Date.now() + data.interval * 1000;
          chrome.storage.local.set({ nextReloadTime: newNextReloadTime });
          chrome.action.setBadgeText({ text: formatBadgeText(data.interval) });
        }
      }
    });
  }
});

// Optional: A listener to clear the badge if the user closes the tab
// or navigates away, to prevent a stale countdown.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.storage.local.get(['isReloading', 'stopOnClick'], (data) => {
            if (data.isReloading && data.stopOnClick) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Could not inject script: ' + chrome.runtime.lastError.message);
                        return;
                    }
                    chrome.tabs.sendMessage(tabId, { command: 'addClickListener' });
                });
            }
        });
    } else if (changeInfo.status === 'loading') {
        chrome.storage.local.get('isReloading', data => {
            if(!data.isReloading) {
                chrome.action.setBadgeText({ text: '' });
                chrome.alarms.clear('countdown');
            }
        });
    }
});

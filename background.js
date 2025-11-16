
// background.js

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === 'start') {
    const intervalInSeconds = request.interval;
    const nextReloadTime = Date.now() + intervalInSeconds * 1000;

    // Store interval and next reload time
    chrome.storage.local.set({ 
      interval: intervalInSeconds, 
      isReloading: true, 
      nextReloadTime: nextReloadTime 
    });

    // Set initial badge text and color
    chrome.action.setBadgeText({ text: String(intervalInSeconds) });
    chrome.action.setBadgeBackgroundColor({ color: '#4688F1' }); // Blue

    // Create an alarm that fires every second to update the countdown
    chrome.alarms.create('countdown', { periodInMinutes: 1 / 60 });
    
    sendResponse({ status: "Countdown started" });

  } else if (request.command === 'stop') {
    // Stop the alarm and clear storage/badge
    chrome.alarms.clear('countdown');
    chrome.storage.local.set({ isReloading: false, nextReloadTime: null });
    chrome.action.setBadgeText({ text: '' });
    sendResponse({ status: "Countdown stopped" });
  }
});

// Listener for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'countdown') {
    chrome.storage.local.get(['nextReloadTime', 'interval', 'isReloading'], (data) => {
      if (data.isReloading && data.nextReloadTime) {
        const remaining = Math.round((data.nextReloadTime - Date.now()) / 1000);

        if (remaining > 0) {
          // Update badge with remaining time
          chrome.action.setBadgeText({ text: String(remaining) });
        } else {
          // Time is up, reload the tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
              chrome.tabs.reload(tabs[0].id);
            }
          });

          // Reset for the next countdown cycle
          const newNextReloadTime = Date.now() + data.interval * 1000;
          chrome.storage.local.set({ nextReloadTime: newNextReloadTime });
          chrome.action.setBadgeText({ text: String(data.interval) });
        }
      }
    });
  }
});

// Optional: A listener to clear the badge if the user closes the tab
// or navigates away, to prevent a stale countdown.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        chrome.storage.local.get('isReloading', data => {
            if(!data.isReloading) {
                chrome.action.setBadgeText({ text: '' });
                chrome.alarms.clear('countdown');
            }
        });
    }
});

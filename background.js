let reloadInterval;

function startReloading(intervalInSeconds) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      reloadInterval = setInterval(() => {
        chrome.tabs.reload(tabId);
      }, intervalInSeconds * 1000);
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === 'start') {
    clearInterval(reloadInterval); // Clear any existing interval
    const intervalInSeconds = request.interval;
    const nextReloadTime = Date.now() + intervalInSeconds * 1000;
    chrome.storage.local.set({ interval: intervalInSeconds, isReloading: true, nextReloadTime: nextReloadTime });
    startReloading(intervalInSeconds);
  } else if (request.command === 'stop') {
    clearInterval(reloadInterval);
    chrome.storage.local.set({ isReloading: false });
  }
});

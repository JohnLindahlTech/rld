// content.js

if (typeof window.stopRefreshListenerAttached === 'undefined') {
  window.stopRefreshListenerAttached = true;

  const stopRefresh = () => {
    chrome.runtime.sendMessage({ command: 'stop' });
    document.removeEventListener('click', stopRefresh);
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'addClickListener') {
      // Clean up any previous listener before adding a new one
      document.removeEventListener('click', stopRefresh);
      document.addEventListener('click', stopRefresh);
      sendResponse({ status: 'Click listener added' });
    } else if (request.command === 'removeClickListener') {
      document.removeEventListener('click', stopRefresh);
      sendResponse({ status: 'Click listener removed' });
    }
    // Return true to indicate you wish to send a response asynchronously
    return true;
  });
}

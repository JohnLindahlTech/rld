// content.js

if (typeof window.stopRefreshListenerAttached === 'undefined') {
  window.stopRefreshListenerAttached = true;

  const stopRefresh = () => {
    chrome.runtime.sendMessage({ command: 'stop' });
    document.removeEventListener('click', stopRefresh);
  };

  // --- Visual Countdown ---
  let countdownInterval = null;
  let countdownContainer = null;
  let countdownShadow = null;

  let currentPosition = parseInt(sessionStorage.getItem('rld_overlay_position') || '0', 10); // 0: Bottom-Right, 1: Bottom-Left, 2: Top-Left, 3: Top-Right

  function getPositionStyle(index) {
    switch (index) {
      case 0:
        return { bottom: '20px', right: '20px', top: 'auto', left: 'auto' };
      case 1:
        return { bottom: '20px', left: '20px', top: 'auto', right: 'auto' };
      case 2:
        return { top: '20px', left: '20px', bottom: 'auto', right: 'auto' };
      case 3:
        return { top: '20px', right: '20px', bottom: 'auto', left: 'auto' };
      default:
        return { bottom: '20px', right: '20px', top: 'auto', left: 'auto' };
    }
  }

  function createCountdownOverlay() {
    if (countdownContainer) return;

    countdownContainer = document.createElement('div');
    countdownContainer.id = 'rld-countdown-container';

    // Apply initial position
    Object.assign(countdownContainer.style, {
      position: 'fixed',
      zIndex: '2147483647',
      pointerEvents: 'auto', // Enable clicks
      fontFamily: 'system-ui, -apple-system, sans-serif',
      cursor: 'pointer',
      userSelect: 'none',
      ...getPositionStyle(currentPosition),
    });

    // Add click listener for rotation
    countdownContainer.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering stop-on-click
      currentPosition = (currentPosition + 1) % 4;
      sessionStorage.setItem('rld_overlay_position', currentPosition);
      Object.assign(countdownContainer.style, getPositionStyle(currentPosition));
    });

    countdownShadow = countdownContainer.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
        .countdown-box {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: opacity 0.3s;
          backdrop-filter: blur(4px);
        }
        .countdown-box:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.02);
        }
        .countdown-box.hidden {
          opacity: 0;
        }
      `;

    const box = document.createElement('div');
    box.className = 'countdown-box';
    box.id = 'countdown-box';
    box.textContent = 'Reloading...';

    countdownShadow.appendChild(style);
    countdownShadow.appendChild(box);
    document.body.appendChild(countdownContainer);
  }

  function removeCountdownOverlay() {
    if (countdownContainer) {
      countdownContainer.remove();
      countdownContainer = null;
      countdownShadow = null;
    }
    clearInterval(countdownInterval);
  }

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function updateCountdown(nextReloadTime) {
    createCountdownOverlay();
    const box = countdownShadow.getElementById('countdown-box');

    clearInterval(countdownInterval);

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((nextReloadTime - Date.now()) / 1000));
      if (remaining <= 0) {
        box.textContent = 'Reloading now...';
        clearInterval(countdownInterval);
      } else {
        box.textContent = `Reload in ${formatTime(remaining)}`;
      }
    };

    tick();
    countdownInterval = setInterval(tick, 250);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === 'addClickListener') {
      // Clean up any previous listener before adding a new one
      document.removeEventListener('click', stopRefresh);
      document.addEventListener('click', stopRefresh);
      sendResponse({ status: 'Click listener added' });
    } else if (request.command === 'removeClickListener') {
      document.removeEventListener('click', stopRefresh);
      sendResponse({ status: 'Click listener removed' });
    } else if (request.command === 'showCountdown') {
      updateCountdown(request.nextReloadTime);
    } else if (request.command === 'hideCountdown') {
      removeCountdownOverlay();
    }
    // Return true to indicate you wish to send a response asynchronously
    return true;
  });
}

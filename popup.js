document.addEventListener('DOMContentLoaded', () => {
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const statusDiv = document.getElementById('status');
  const inputs = [hoursInput, minutesInput, secondsInput];
  let countdownInterval = null;

  // Formats seconds into HH:MM:SS string
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Starts the live countdown in the popup
  const startPopupCountdown = () => {
    clearInterval(countdownInterval); // Clear any existing interval
    countdownInterval = setInterval(() => {
      chrome.storage.local.get('nextReloadTime', (result) => {
        if (result.nextReloadTime) {
          const remainingSeconds = Math.max(0, (result.nextReloadTime - Date.now()) / 1000);
          statusDiv.textContent = formatTime(remainingSeconds);
        } else {
          clearInterval(countdownInterval);
        }
      });
    }, 1000);
  };

  // Function to update the UI based on reloading state
  const setUiState = (isReloading) => {
    inputs.forEach(input => input.disabled = isReloading);
    startButton.disabled = isReloading;
    stopButton.disabled = !isReloading;

    clearInterval(countdownInterval);
    if (isReloading) {
      startPopupCountdown();
    } else {
      statusDiv.textContent = 'Click "Start" to begin.';
    }
  };

  // Load saved state when popup opens
  chrome.storage.local.get(['isReloading', 'interval'], (result) => {
    setUiState(result.isReloading || false);
    if (result.interval) {
      const hours = Math.floor(result.interval / 3600);
      const minutes = Math.floor((result.interval % 3600) / 60);
      const seconds = result.interval % 60;
      hoursInput.value = hours > 0 ? hours : '';
      minutesInput.value = minutes > 0 ? minutes : '';
      secondsInput.value = seconds > 0 ? seconds : '';
    }
  });

  // Start button event listener
  startButton.addEventListener('click', () => {
    const hours = parseInt(hoursInput.value, 10) || 0;
    const minutes = parseInt(minutesInput.value, 10) || 0;
    const seconds = parseInt(secondsInput.value, 10) || 0;
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

    if (totalSeconds < 1) {
      statusDiv.textContent = 'Interval must be at least 1 second.';
      return;
    }

    chrome.runtime.sendMessage({ command: 'start', interval: totalSeconds }, 
      (response) => {
        if (response && response.status === "Countdown started") {
          setUiState(true);
        }
      }
    );
  });

  // Stop button event listener
  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'stop' }, 
      (response) => {
        if (response && response.status === "Countdown stopped") {
          setUiState(false);
        }
      }
    );
  });
});


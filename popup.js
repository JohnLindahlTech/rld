const intervalInput = document.getElementById('interval');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const countdownDiv = document.getElementById('countdown');

let countdownInterval;

function updateCountdown(remaining) {
  countdownDiv.textContent = `Reloading in ${remaining} seconds...`;
}

function startCountdown(duration) {
  let remaining = duration;
  updateCountdown(remaining);
  countdownInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      remaining = duration;
    }
    updateCountdown(remaining);
  }, 1000);
}

startButton.addEventListener('click', () => {
  const interval = parseInt(intervalInput.value, 10);
  if (isNaN(interval) || interval < 1) {
    return;
  }

  chrome.runtime.sendMessage({
    command: 'start',
    interval: interval,
  });

  clearInterval(countdownInterval);
  startCountdown(interval);
});

stopButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({
    command: 'stop',
  });
  clearInterval(countdownInterval);
  countdownDiv.textContent = '';
});

chrome.storage.local.get(['interval', 'isReloading', 'nextReloadTime'], (result) => {
  if (result.interval) {
    intervalInput.value = result.interval;
  }
  if (result.isReloading && result.nextReloadTime) {
    const remainingSeconds = Math.max(0, Math.ceil((result.nextReloadTime - Date.now()) / 1000));
    startCountdown(remainingSeconds);
  }
});


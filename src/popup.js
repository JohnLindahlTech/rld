document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const minSecondsInput = document.getElementById('min-seconds');
  const maxSecondsInput = document.getElementById('max-seconds');
  const fixedInputsDiv = document.getElementById('fixed-inputs');
  const randomInputsDiv = document.getElementById('random-inputs');
  const randomIntervalCheckbox = document.getElementById('random-interval');
  const hardRefreshCheckbox = document.getElementById('hard-refresh');
  const stopOnClickCheckbox = document.getElementById('stop-on-click');

  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const statusDiv = document.getElementById('status');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const toggleViewButton = document.getElementById('toggle-view');
  const timerView = document.getElementById('timer-view');
  const manageView = document.getElementById('manage-view');
  const timersListDiv = document.getElementById('timers-list');
  const inputs = [
    hoursInput,
    minutesInput,
    secondsInput,
    minSecondsInput,
    maxSecondsInput,
    randomIntervalCheckbox,
    hardRefreshCheckbox,
    stopOnClickCheckbox,
    stopOnClickCheckbox,
  ];

  // --- State ---
  let countdownInterval = null;
  let currentTabId = null;
  let isManageView = false;

  // --- Utility Functions ---
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.ceil(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // --- View Logic ---
  const showTimerView = () => {
    manageView.classList.add('hidden');
    timerView.classList.remove('hidden');
    isManageView = false;
    loadTimerViewData();
  };

  const showManageView = () => {
    timerView.classList.add('hidden');
    manageView.classList.remove('hidden');
    isManageView = true;
    buildManageView();
  };

  // --- Timer View Functions ---
  const startPopupCountdown = (nextReloadTime) => {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      const remainingSeconds = Math.max(0, (nextReloadTime - Date.now()) / 1000);
      statusDiv.textContent = formatTime(remainingSeconds);
      if (remainingSeconds <= 0) clearInterval(countdownInterval);
    }, 250);
  };

  const setTimerUiState = (timerData) => {
    const isReloading = timerData && timerData.isActive;
    inputs.filter(Boolean).forEach((input) => (input.disabled = isReloading));
    presetButtons.forEach((button) => (button.disabled = isReloading));
    startButton.disabled = isReloading;
    stopButton.disabled = !isReloading;
    clearInterval(countdownInterval);

    if (isReloading) {
      startPopupCountdown(timerData.nextReloadTime);
      const {
        interval,
        isHardRefresh,
        stopOnClick,
        showCountdown,
        isRandom,
        minInterval,
        maxInterval,
      } = timerData;
      hardRefreshCheckbox.checked = isHardRefresh || false;
      stopOnClickCheckbox.checked = stopOnClick || false;
      randomIntervalCheckbox.checked = isRandom || false;

      if (isRandom) {
        minSecondsInput.value = minInterval;
        maxSecondsInput.value = maxInterval;
        fixedInputsDiv.classList.add('hidden');
        randomInputsDiv.classList.remove('hidden');
      } else {
        const hours = Math.floor(interval / 3600);
        const minutes = Math.floor((interval % 3600) / 60);
        const seconds = interval % 60;
        hoursInput.value = hours > 0 ? hours : '';
        minutesInput.value = minutes > 0 ? minutes : '';
        secondsInput.value = seconds > 0 ? seconds : '';
        fixedInputsDiv.classList.remove('hidden');
        randomInputsDiv.classList.add('hidden');
      }
    } else if (timerData) {
      statusDiv.textContent = 'Click "Start" to begin.';
      const {
        interval,
        isHardRefresh,
        stopOnClick,
        showCountdown,
        isRandom,
        minInterval,
        maxInterval,
      } = timerData;
      hardRefreshCheckbox.checked = isHardRefresh || false;
      stopOnClickCheckbox.checked = stopOnClick || false;
      randomIntervalCheckbox.checked = isRandom || false;

      if (isRandom) {
        minSecondsInput.value = minInterval;
        maxSecondsInput.value = maxInterval;
        fixedInputsDiv.classList.add('hidden');
        randomInputsDiv.classList.remove('hidden');
      } else {
        const hours = Math.floor(interval / 3600);
        const minutes = Math.floor((interval % 3600) / 60);
        const seconds = interval % 60;
        hoursInput.value = hours > 0 ? hours : '';
        minutesInput.value = minutes > 0 ? minutes : '';
        secondsInput.value = seconds > 0 ? seconds : '';
        fixedInputsDiv.classList.remove('hidden');
        randomInputsDiv.classList.add('hidden');
      }
    } else {
      statusDiv.textContent = 'Click "Start" to begin.';
      secondsInput.value = 10;
      stopOnClickCheckbox.checked = true;
      hardRefreshCheckbox.checked = false;
      hardRefreshCheckbox.checked = false;
      randomIntervalCheckbox.checked = false;
      fixedInputsDiv.classList.remove('hidden');
      randomInputsDiv.classList.add('hidden');
    }
  };

  const loadTimerViewData = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        currentTabId = tabs[0].id;
        chrome.storage.local.get('timers', (result) => {
          const timers = result.timers || {};
          setTimerUiState(timers[currentTabId]);
        });
      }
    });
  };

  // --- Manage View Functions ---
  const cleanupZombieTimers = async () => {
    const { timers } = await chrome.storage.local.get('timers');
    if (!timers || Object.keys(timers).length === 0) return;

    const tabs = await chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    });
    const existingTabIds = new Set(tabs.map((tab) => tab.id));

    let hasChanges = false;
    for (const tabIdStr in timers) {
      const tabId = parseInt(tabIdStr, 10);
      if (!existingTabIds.has(tabId)) {
        // Tab doesn't exist, remove it
        delete timers[tabId];
        hasChanges = true;
        console.log(`Cleaned up zombie timer for tab ${tabId}`);
      }
    }

    if (hasChanges) {
      await chrome.storage.local.set({ timers: timers });
    }
  };

  const buildManageView = async () => {
    await cleanupZombieTimers(); // Clean up before building view

    const { timers } = await chrome.storage.local.get('timers');
    const tabs = await chrome.tabs.query({
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    });
    const tabsById = Object.fromEntries(tabs.map((tab) => [tab.id, tab]));

    timersListDiv.innerHTML = ''; // Clear previous list

    if (!timers || Object.keys(timers).length === 0) {
      timersListDiv.innerHTML = '<p>No timers set.</p>';
      return;
    }

    for (const tabIdStr in timers) {
      const tabId = parseInt(tabIdStr, 10);
      const timer = timers[tabId];
      const tab = tabsById[tabId];

      if (!tab) continue; // Skip timers for closed tabs or tabs in other windows

      const item = document.createElement('div');
      item.className = `timer-item ${timer.isActive ? 'is-active' : 'is-inactive'}`;
      item.innerHTML = `
        <div class="timer-item-info">
          <img src="${tab.favIconUrl || 'images/icon16.png'}" alt="favicon">
          <span>${tab.title || 'Unknown Tab'}</span>
        </div>
        <div class="timer-item-controls">
          <button data-tab-id="${tabId}" class="js-open-tab-btn" title="Open Tab">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </button>
          <button data-tab-id="${tabId}" class="js-play-btn" title="Start Timer" style="display: ${
            timer.isActive ? 'none' : 'flex'
          }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button data-tab-id="${tabId}" class="js-stop-btn" title="Stop Timer" style="display: ${
            timer.isActive ? 'flex' : 'none'
          }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>
          </button>
          <button data-tab-id="${tabId}" class="js-remove-btn" title="Remove Timer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      timersListDiv.appendChild(item);
    }

    // Add event listeners to the new buttons
    document.querySelectorAll('.js-open-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.currentTarget.dataset.tabId, 10);
        chrome.tabs.update(tabId, { active: true });
        chrome.tabs.get(tabId, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true });
        });
      });
    });

    document.querySelectorAll('.js-play-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.currentTarget.dataset.tabId, 10);
        const timerData = timers[tabId];
        if (timerData) {
          chrome.runtime.sendMessage(
            { command: 'start', tabId: tabId, settings: timerData },
            buildManageView
          );
        }
      });
    });

    document.querySelectorAll('.js-stop-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.currentTarget.dataset.tabId, 10);
        chrome.runtime.sendMessage({ command: 'stop', tabId: tabId }, buildManageView);
      });
    });

    document.querySelectorAll('.js-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabId = parseInt(e.currentTarget.dataset.tabId, 10);
        chrome.runtime.sendMessage({ command: 'remove', tabId: tabId }, buildManageView);
      });
    });
  };

  // --- Event Listeners ---
  toggleViewButton.addEventListener('click', () => {
    if (isManageView) {
      showTimerView();
    } else {
      showManageView();
    }
  });

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const totalSeconds = parseInt(button.dataset.seconds, 10);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      hoursInput.value = hours > 0 ? hours : '';
      minutesInput.value = minutes > 0 ? minutes : '';
      secondsInput.value = seconds > 0 ? seconds : '';
    });
  });

  randomIntervalCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      fixedInputsDiv.classList.add('hidden');
      randomInputsDiv.classList.remove('hidden');
    } else {
      fixedInputsDiv.classList.remove('hidden');
      randomInputsDiv.classList.add('hidden');
    }
  });

  startButton.addEventListener('click', () => {
    if (!currentTabId) return;

    const isRandom = randomIntervalCheckbox.checked;
    const isHardRefresh = hardRefreshCheckbox.checked;
    const stopOnClick = stopOnClickCheckbox.checked;
    const showCountdown = true;

    let interval = 0;
    let minInterval = 0;
    let maxInterval = 0;

    if (isRandom) {
      minInterval = parseInt(minSecondsInput.value, 10) || 0;
      maxInterval = parseInt(maxSecondsInput.value, 10) || 0;

      if (minInterval < 1 || maxInterval < 1) {
        statusDiv.textContent = 'Min and Max must be at least 1 second.';
        return;
      }
      if (minInterval >= maxInterval) {
        statusDiv.textContent = 'Max must be greater than Min.';
        return;
      }
      // Initial interval for the first run
      interval = Math.floor(Math.random() * (maxInterval - minInterval + 1) + minInterval);
    } else {
      const hours = parseInt(hoursInput.value, 10) || 0;
      const minutes = parseInt(minutesInput.value, 10) || 0;
      const seconds = parseInt(secondsInput.value, 10) || 0;
      interval = hours * 3600 + minutes * 60 + seconds;

      if (interval < 1) {
        statusDiv.textContent = 'Interval must be at least 1 second.';
        return;
      }
    }

    chrome.runtime.sendMessage(
      {
        command: 'start',
        tabId: currentTabId,
        settings: {
          interval,
          isHardRefresh,
          stopOnClick,
          showCountdown,
          isRandom,
          minInterval,
          maxInterval,
        },
      },
      (response) => {
        if (response && response.status === 'Countdown started') {
          loadTimerViewData();
        }
      }
    );
  });

  stopButton.addEventListener('click', () => {
    if (!currentTabId) return;
    chrome.runtime.sendMessage({ command: 'stop', tabId: currentTabId }, (response) => {
      if (response && response.status === 'Countdown stopped') {
        loadTimerViewData();
      }
    });
  });

  // --- Storage Listener ---
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.timers) {
      const newTimers = changes.timers.newValue || {};
      if (currentTabId && newTimers[currentTabId]) {
        setTimerUiState(newTimers[currentTabId]);
      } else if (currentTabId && !newTimers[currentTabId]) {
        // Timer was removed
        setTimerUiState(null);
      }

      if (isManageView) {
        buildManageView();
      }
    }
  });

  // --- Initial Load ---
  showTimerView();
});

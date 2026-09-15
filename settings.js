// Settings page logic

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('compression-enabled').addEventListener('change', saveSettings);
  document.getElementById('cache-enabled').addEventListener('change', saveSettings);
  document.getElementById('clear-all-btn').addEventListener('click', clearAllData);
  document.getElementById('export-stats-btn').addEventListener('click', exportStats);
}

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || { compressionEnabled: true, cacheEnabled: true };
    document.getElementById('compression-enabled').checked = settings.compressionEnabled !== false;
    document.getElementById('cache-enabled').checked = settings.cacheEnabled !== false;
  });
}

function saveSettings() {
  const settings = {
    compressionEnabled: document.getElementById('compression-enabled').checked,
    cacheEnabled: document.getElementById('cache-enabled').checked
  };
  chrome.storage.local.set({ settings }, () => {
    showStatus('Settings saved!');
  });
}

function clearAllData() {
  if (confirm('Are you sure? This will clear all stats, cache, and settings.')) {
    chrome.storage.local.clear(() => {
      chrome.storage.local.set({
        settings: { compressionEnabled: true, cacheEnabled: true },
        stats: {
          savedToday: 0,
          inputTokens: 0,
          outputTokens: 0,
          aiBreakdown: {},
          cacheSize: 0
        },
        cache: {}
      }, () => {
        showStatus('All data cleared!');
        loadSettings();
      });
    });
  }
}

function exportStats() {
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || {};
    const json = JSON.stringify(stats, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokenoptim-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showStatus('Stats exported!');
  });
}

function showStatus(message) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.classList.add('show');
  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 3000);
}

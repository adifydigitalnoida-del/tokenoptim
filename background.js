// Background service worker - Stats aggregation + accuracy tracking

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    stats: {
      savedToday: 0,
      inputTokens: 0,
      outputTokens: 0,
      aiBreakdown: {},
      cacheSize: 0,
      lastAccuracy: '~Est'
    },
    settings: {
      compressionEnabled: true,
      accuracyMode: '~Est'
    }
  });
});

let lastAccuracy = '~Est';
const seenRequestIds = new Set();

// Listen for token count messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOKENS_COUNTED') {
    const { data } = request;
    const { inputTokens, outputTokens, accuracy, requestId } = data;

    // FIX #7: Deduplicate on request ID at background level too
    if (requestId && seenRequestIds.has(requestId)) {
      return;
    }
    if (requestId) seenRequestIds.add(requestId);

    // Update stats
    chrome.storage.local.get(['stats', 'settings'], (result) => {
      const stats = result.stats || {};
      const settings = result.settings || {};

      // FIX #1: Fix token calculation with correct formula
      const totalTokens = inputTokens + outputTokens;
      const estimatedSavings = Math.round(totalTokens * 0.15); // 15% savings from compression

      stats.inputTokens = (stats.inputTokens || 0) + inputTokens;
      stats.outputTokens = (stats.outputTokens || 0) + outputTokens;
      stats.savedToday = (stats.savedToday || 0) + estimatedSavings;

      // Update AI breakdown
      const tabUrl = sender.url || 'unknown';
      let aiPlatform = 'Unknown';
      if (tabUrl.includes('claude.ai')) aiPlatform = 'Claude';
      else if (tabUrl.includes('chatgpt')) aiPlatform = 'ChatGPT';
      else if (tabUrl.includes('gemini')) aiPlatform = 'Gemini';
      else if (tabUrl.includes('grok')) aiPlatform = 'Grok';
      else if (tabUrl.includes('kimi')) aiPlatform = 'Kimi';
      else if (tabUrl.includes('glm')) aiPlatform = 'GLM';

      stats.aiBreakdown = stats.aiBreakdown || {};
      stats.aiBreakdown[aiPlatform] = (stats.aiBreakdown[aiPlatform] || 0) + inputTokens;

      // FIX #9: Update accuracy badge if it changed
      if (accuracy && accuracy !== lastAccuracy) {
        stats.lastAccuracy = accuracy;
        lastAccuracy = accuracy;
        
        // Broadcast accuracy change to all popups
        chrome.runtime.sendMessage({
          type: 'ACCURACY_CHANGED',
          data: { accuracy }
        }).catch(() => {}); // Popup might not be open
      }

      chrome.storage.local.set({ stats, settings });
    });
  }

  if (request.type === 'CACHE_UPDATED') {
    chrome.storage.local.get('stats', (result) => {
      const stats = result.stats || {};
      // Update cache size estimate
      stats.cacheSize = Math.round(JSON.stringify(localStorage).length / 1024);
      chrome.storage.local.set({ stats });
    });
  }

  if (request.type === 'TEXTAREA_NOT_FOUND') {
    console.warn('TokenOptim: Could not find textarea on', request.url);
    // Could send analytics or create issue
  }

  if (request.type === 'COMPRESSION_TOGGLED') {
    chrome.storage.local.get('settings', (result) => {
      const settings = result.settings || {};
      settings.compressionEnabled = request.enabled;
      chrome.storage.local.set({ settings });
    });
  }
});

// Reset daily stats at midnight
function scheduleResetAtMidnight() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilMidnight = tomorrow - now;

  setTimeout(() => {
    chrome.storage.local.get('stats', (result) => {
      const stats = result.stats || {};
      stats.savedToday = 0;
      stats.inputTokens = 0;
      stats.outputTokens = 0;
      chrome.storage.local.set({ stats });
    });
    scheduleResetAtMidnight(); // Schedule next reset
  }, msUntilMidnight);
}

scheduleResetAtMidnight();

// Cleanup seenRequestIds periodically to avoid memory leak
setInterval(() => {
  if (seenRequestIds.size > 10000) {
    seenRequestIds.clear();
  }
}, 60 * 60 * 1000);

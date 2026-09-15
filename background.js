// Background service worker - handles cross-tab communication and stats management

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'TOKENS_COUNTED':
      updateTokenStats(request.data, sender.url);
      sendResponse({ success: true });
      break;

    case 'PROMPT_COMPRESSED':
      recordCompression(request.data);
      sendResponse({ success: true });
      break;

    case 'COMPRESSION_TOGGLED':
      chrome.storage.local.get('settings', (result) => {
        result.settings = result.settings || {};
        result.settings.compressionEnabled = request.enabled;
        chrome.storage.local.set({ settings: result.settings });
      });
      sendResponse({ success: true });
      break;

    case 'CACHE_UPDATED':
      updateCacheSize();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown request type' });
  }
  return true; // Keep channel open for async responses
});

function updateTokenStats(data, tabUrl) {
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || {
      savedToday: 0,
      inputTokens: 0,
      outputTokens: 0,
      aiBreakdown: {},
      cacheSize: 0
    };

    // Extract AI platform from URL
    const ai = extractAIPlatform(tabUrl);

    // Update tokens
    if (data.inputTokens) stats.inputTokens += data.inputTokens;
    if (data.outputTokens) stats.outputTokens += data.outputTokens;

    // Update AI breakdown
    if (ai) {
      stats.aiBreakdown[ai] = (stats.aiBreakdown[ai] || 0) + (data.inputTokens + data.outputTokens);
    }

    // Reset daily stats at midnight
    const lastReset = localStorage.getItem('lastStatsReset');
    const today = new Date().toDateString();
    if (lastReset !== today) {
      stats.savedToday = 0;
      localStorage.setItem('lastStatsReset', today);
    }

    chrome.storage.local.set({ stats });
  });
}

function recordCompression(data) {
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || { savedToday: 0 };
    stats.savedToday += data.tokensSaved || 0;
    chrome.storage.local.set({ stats });
  });
}

function updateCacheSize() {
  chrome.storage.local.get(['cache'], (result) => {
    const cache = result.cache || {};
    let size = JSON.stringify(cache).length;
    
    chrome.storage.local.get(['stats'], (statsResult) => {
      const stats = statsResult.stats || {};
      stats.cacheSize = size;
      chrome.storage.local.set({ stats });
    });
  });
}

function extractAIPlatform(url) {
  if (url.includes('claude.ai')) return 'Claude';
  if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'ChatGPT';
  if (url.includes('grok.com')) return 'Grok';
  if (url.includes('gemini.google.com')) return 'Gemini';
  if (url.includes('kimi.moonshot.cn')) return 'Kimi';
  if (url.includes('chatglm.cn')) return 'GLM';
  return null;
}

// Initialize settings on first install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    settings: { compressionEnabled: true },
    stats: {
      savedToday: 0,
      inputTokens: 0,
      outputTokens: 0,
      aiBreakdown: {},
      cacheSize: 0
    },
    cache: {}
  });
});

// Periodic cleanup (run every hour)
setInterval(() => {
  chrome.storage.local.get(['cache'], (result) => {
    const cache = result.cache || {};
    const oneHourAgo = Date.now() - 3600000;
    
    Object.keys(cache).forEach(key => {
      if (cache[key].timestamp < oneHourAgo) {
        delete cache[key];
      }
    });
    
    chrome.storage.local.set({ cache });
  });
}, 3600000);

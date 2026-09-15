// Popup script - handles UI, cost calculations, and compression preview

const PRICING = {
  claude: { input: 0.003, output: 0.015 },
  chatgpt: { input: 0.005, output: 0.015 },
  grok: { input: 0.005, output: 0.015 },
  gemini: { input: 0.0005, output: 0.0016 },
  kimi: { input: 0.003, output: 0.009 },
  glm: { input: 0.001, output: 0.004 }
};

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('compression-toggle').addEventListener('change', toggleCompression);
  document.getElementById('compress-btn').addEventListener('click', showCompressionPreview);
  document.getElementById('clear-cache-btn').addEventListener('click', clearCache);
  document.getElementById('export-btn').addEventListener('click', exportStats);
}

function loadStats() {
  chrome.storage.local.get(['stats', 'settings'], (result) => {
    const stats = result.stats || getDefaultStats();
    const settings = result.settings || { compressionEnabled: true };

    displayStats(stats);
    displayCosts(stats);
    displayAIBreakdown(stats);
    displayAccuracyBadge(result.stats?.lastAccuracy || '~Est');
    document.getElementById('compression-toggle').checked = settings.compressionEnabled;
  });

  setTimeout(loadStats, 2000);
}

function getDefaultStats() {
  return {
    savedToday: 0,
    inputTokens: 0,
    outputTokens: 0,
    aiBreakdown: {},
    cacheSize: 0,
    lastAccuracy: '~Est',
    compressions: 0
  };
}

function displayStats(stats) {
  document.getElementById('saved-today').textContent = formatNumber(stats.savedToday);
  document.getElementById('input-tokens').textContent = formatNumber(stats.inputTokens);
  document.getElementById('output-tokens').textContent = formatNumber(stats.outputTokens);
  
  const totalTokens = stats.inputTokens + stats.outputTokens;
  const reductionPercent = totalTokens > 0 ? Math.round((stats.savedToday / totalTokens) * 100) : 0;
  document.getElementById('reduction-percent').textContent = reductionPercent + '%';

  const moneyFromSavings = (stats.savedToday * PRICING.claude.input) / 1000000;
  document.getElementById('saved-money').textContent = `Save $${moneyFromSavings.toFixed(2)}`;

  document.getElementById('cache-size').textContent = formatBytes(stats.cacheSize);
}

function displayCosts(stats) {
  const dailyTokens = stats.inputTokens;
  const dailyCost = (dailyTokens * PRICING.claude.input) / 1000000;
  const weeklyCost = dailyCost * 7;

  document.getElementById('cost-today').textContent = '$' + dailyCost.toFixed(2);
  document.getElementById('cost-weekly').textContent = '$' + weeklyCost.toFixed(2);
}

function displayAIBreakdown(stats) {
  const aiList = document.getElementById('ai-list');
  aiList.innerHTML = '';
  
  Object.entries(stats.aiBreakdown || {}).forEach(([ai, tokens]) => {
    const item = document.createElement('div');
    item.className = 'ai-item';
    const pricing = PRICING[ai.toLowerCase()] || { input: 0.003 };
    const cost = (tokens * pricing.input) / 1000000;
    item.innerHTML = `
      <span class="ai-name">${ai}</span>
      <span class="ai-tokens">${formatNumber(tokens)}</span>
      <span class="ai-cost">$${cost.toFixed(3)}</span>
    `;
    aiList.appendChild(item);
  });
}

function displayAccuracyBadge(accuracy) {
  const badge = document.getElementById('accuracy-badge');
  badge.textContent = accuracy;
  
  if (accuracy === 'API') {
    badge.style.background = 'rgba(76, 175, 80, 0.2)';
    badge.style.borderColor = 'rgba(76, 175, 80, 0.4)';
    badge.style.color = '#4caf50';
  } else if (accuracy === 'LIVE') {
    badge.style.background = 'rgba(0, 212, 255, 0.2)';
    badge.style.borderColor = 'rgba(0, 212, 255, 0.4)';
    badge.style.color = '#00d4ff';
  } else {
    badge.style.background = 'rgba(255, 152, 0, 0.2)';
    badge.style.borderColor = 'rgba(255, 152, 0, 0.4)';
    badge.style.color = '#ff9800';
  }
}

function showCompressionPreview() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'COMPRESS_PROMPT' }, (response) => {
      if (response && response.success) {
        displayPreview(response);
      } else {
        alert('Could not compress. Make sure you\'re on Claude, ChatGPT, Gemini, Grok, Kimi, or GLM.');
      }
    });
  });
}

function displayPreview(response) {
  const panel = document.getElementById('preview-panel');
  
  document.getElementById('preview-original').textContent = response.original;
  document.getElementById('preview-original-tokens').textContent = `${estimateTokens(response.original)} tokens`;
  
  document.getElementById('preview-compressed').textContent = response.compressed;
  document.getElementById('preview-compressed-tokens').textContent = `${estimateTokens(response.compressed)} tokens • Save ${response.savings}`;
  
  panel.classList.remove('hidden');

  if (response.fillerWords && response.fillerWords.length > 0) {
    const fillerPanel = document.getElementById('filler-words-panel');
    const chipsContainer = document.getElementById('filler-words-chips');
    chipsContainer.innerHTML = response.fillerWords.map(word => 
      `<span class="chip">${word}</span>`
    ).join('');
    fillerPanel.classList.remove('hidden');
  }

  if (response.recommendations && response.recommendations.length > 0) {
    const recPanel = document.getElementById('recommendations-panel');
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = response.recommendations.map(rec => 
      `<li>${rec}</li>`
    ).join('');
    recPanel.classList.remove('hidden');
  }

  displayAccuracyBadge(response.accuracy || '~Est');
}

function toggleCompression(event) {
  const enabled = event.target.checked;
  chrome.storage.local.get('settings', (result) => {
    const settings = result.settings || {};
    settings.compressionEnabled = enabled;
    chrome.storage.local.set({ settings });
  });
}

function clearCache() {
  if (confirm('Clear all cached responses?')) {
    chrome.storage.local.set({ cache: {} });
    loadStats();
  }
}

function exportStats() {
  chrome.storage.local.get('stats', (result) => {
    const stats = result.stats || getDefaultStats();
    
    const csv = [
      ['Metric', 'Value'],
      ['Tokens Saved Today', stats.savedToday],
      ['Input Tokens', stats.inputTokens],
      ['Output Tokens', stats.outputTokens],
      ['Cache Size', formatBytes(stats.cacheSize)],
      ['Est. Cost Today', '$' + ((stats.inputTokens * PRICING.claude.input) / 1000000).toFixed(4)],
      ['Est. Cost Weekly', '$' + ((stats.inputTokens * 7 * PRICING.claude.input) / 1000000).toFixed(4)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokenoptim-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatBytes(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function estimateTokens(text) {
  const words = text.split(/\s+/).length;
  return Math.ceil(words * 1.3);
}

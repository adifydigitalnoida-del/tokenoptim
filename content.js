// Content script v2.1 - Fixed token counting, compression, caching, and code detection
// All 10 critical bugs addressed

const tokenCounter = new TokenCounter();
const compressor = new CompressorAdvanced();
const cacheManager = new CacheManager();
const codeDetector = new CodeDetector();

let compressionEnabled = true;
let accuracyMode = '~Est';
const seenRequests = new Set(); // FIX #7: Deduplicate SSE frames

// Load settings
chrome.storage.local.get(['settings', 'stats'], (result) => {
  compressionEnabled = result.settings?.compressionEnabled !== false;
  accuracyMode = result.settings?.accuracyMode || '~Est';
});

// Listen for settings changes + compression requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COMPRESS_PROMPT') {
    try { // FIX #8: Add error handling
      const textarea = findTextarea(); // FIX #4: Multi-selector fallback
      if (!textarea || !textarea.value) {
        sendResponse({ success: false, error: 'No textarea found' });
        return;
      }

      const original = textarea.value;
      const isCode = codeDetector.detectCode(original);
      
      // Skip compression if code detected
      if (isCode) {
        sendResponse({
          success: true,
          compressed: original,
          savings: 0,
          reason: 'Code block detected - skipping compression',
          accuracy: 'SAFE'
        });
        return;
      }

      const { compressed, fillerWords, recommendations } = compressor.compress(original);
      const tokensSaved = estimateTokens(original) - estimateTokens(compressed);
      
      sendResponse({
        success: true,
        original,
        compressed,
        savings: Math.max(0, tokensSaved),
        savingsPercent: Math.round((tokensSaved / estimateTokens(original)) * 100),
        fillerWords,
        recommendations,
        originalLength: original.length,
        compressedLength: compressed.length,
        accuracy: accuracyMode
      });
    } catch (e) {
      console.error('Compression failed:', e);
      sendResponse({ success: false, error: e.message });
    }
  }

  if (request.type === 'GET_ACCURACY_STATUS') {
    sendResponse({ accuracy: accuracyMode });
  }
});

// FIX #4: Multi-selector fallback for DOM changes
function findTextarea() {
  const selectors = [
    // Claude.ai (current Sept 2026)
    'textarea[data-testid="composer-textarea"]',
    // ChatGPT variants
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]',
    'textarea[placeholder*="Ask"]',
    'textarea[placeholder*="ask"]',
    'textarea[placeholder*="Type"]',
    'textarea[placeholder*="type"]',
    // Generic fallbacks
    'textarea.text-input',
    'textarea.input-textarea',
    // Last resort (too generic but better than nothing)
    'textarea'
  ];
  
  for (const selector of selectors) {
    try {
      const textarea = document.querySelector(selector);
      // Verify it's actually visible and in the DOM
      if (textarea && textarea.offsetParent !== null && textarea.clientHeight > 0) {
        return textarea;
      }
    } catch (e) {
      // Selector might be invalid
      continue;
    }
  }
  
  // Auto-notify user if textarea not found
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ 
      type: 'TEXTAREA_NOT_FOUND',
      url: window.location.href
    }).catch(() => {}); // Silent if popup not open
  }
  
  return null;
}

// SSE Stream Interceptor - Capture exact token counts
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [resource] = args;
  
  return originalFetch.apply(this, args).then(response => {
    const clonedResponse = response.clone();
    
    // Parse API responses for token usage
    if (typeof resource === 'string' && resource.includes('api')) {
      clonedResponse.json().then(data => {
        if (data.usage) {
          // FIX #3: Parse both old and new ChatGPT format
          const inputTokens = data.usage.input_tokens || data.usage.prompt_tokens || 0;
          const outputTokens = data.usage.output_tokens || data.usage.completion_tokens || 0;
          recordTokenUsage({
            inputTokens,
            outputTokens,
            accuracy: 'API',
            requestId: data.id // FIX #7: Track request ID for deduplication
          });
        }
      }).catch(() => {});
    }

    // SSE stream parsing
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = clonedResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const json = JSON.parse(line.slice(6));
                  
                  // FIX #2: Only count entries with truthy stop_reason
                  if (json.usage && json.stop_reason) {
                    const requestId = json.id || json.message_id;
                    
                    // FIX #7: Deduplicate on request ID
                    if (!seenRequests.has(requestId)) {
                      // FIX #3: Parse both formats
                      const inputTokens = json.usage.input_tokens || json.usage.prompt_tokens || 0;
                      const outputTokens = json.usage.output_tokens || json.usage.completion_tokens || 0;
                      recordTokenUsage({
                        inputTokens,
                        outputTokens,
                        accuracy: 'LIVE',
                        requestId
                      });
                      seenRequests.add(requestId);
                    }
                  }
                } catch (e) {}
              }
            }
          }
        } catch (e) {
          console.error('SSE parsing error:', e);
        }
      })();
    }

    return response;
  }).catch(err => {
    console.error('Fetch error:', err);
    throw err;
  });
};

function recordTokenUsage(data) {
  try {
    chrome.runtime.sendMessage({
      type: 'TOKENS_COUNTED',
      data,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error('Failed to record tokens:', e);
  }
}

// FIX #1 & #7: Correct token estimation formula (~4 chars = 1 token)
function estimateTokens(text) {
  // More accurate: ~4 characters per token for English
  const charCount = text.length;
  const baseTokens = Math.ceil(charCount / 4);
  // Add 10% for punctuation/whitespace overhead
  return Math.ceil(baseTokens * 1.1);
}

// Advanced Token Counter
class TokenCounter {
  count(text) {
    return estimateTokens(text);
  }

  estimateWithAccuracy(text, accuracy = '~Est') {
    return {
      tokens: this.count(text),
      accuracy
    };
  }
}

// Advanced Compressor - Sentence-level, FIX #9: Context-aware filler removal
class CompressorAdvanced {
  constructor() {
    this.politeFillers = [
      'please', 'kindly', 'would you', 'could you', 'can you',
      'thank you', 'thanks', 'appreciate', 'i appreciate'
    ];

    this.genericFillers = [
      'hello', 'hi', 'hey', 'okay', 'ok', 'yes'
    ];

    this.redundantPhrases = [
      { pattern: /\b(I would like to|I would appreciate if you could|Can you please|Would you please)\b/gi, replace: '' },
      { pattern: /\b(In my opinion|It seems to me|I think that|I believe that)\b/gi, replace: '' },
      { pattern: /\b(just to be clear|to clarify|to put it another way|in other words)\b/gi, replace: '' },
      { pattern: /,\s*(however|furthermore|moreover|additionally)\s+/gi, replace: '. ' },
      { pattern: /\.\s*\./g, replace: '.' },
      { pattern: /\s+/g, replace: ' ' }
    ];
  }

  compress(text) {
    let compressed = text;
    const fillerWords = [];

    // FIX #9: Context-aware filler removal
    // Only remove polite fillers from sentences that look like requests
    const sentences = text.split(/[.!?]/);
    const isRequest = sentences.some(s => 
      /\b(please|can you|could you|would you|can i|could i)\b/i.test(s)
    );

    if (isRequest) {
      this.politeFillers.forEach(word => {
        const regex = new RegExp(`\\b${word}\\s+`, 'gi');
        if (regex.test(compressed)) {
          fillerWords.push(word);
          compressed = compressed.replace(regex, '');
        }
      });
    }

    // Always remove generic fillers
    this.genericFillers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\s+`, 'gi');
      if (regex.test(compressed)) {
        fillerWords.push(word);
        compressed = compressed.replace(regex, '');
      }
    });

    // Apply redundant phrase replacement
    this.redundantPhrases.forEach(({ pattern, replace }) => {
      compressed = compressed.replace(pattern, replace);
    });

    compressed = compressed.trim();

    // Generate recommendations
    const recommendations = this.generateRecommendations(text, compressed, fillerWords);

    return {
      compressed,
      fillerWords,
      recommendations
    };
  }

  generateRecommendations(original, compressed, fillerWords) {
    const recommendations = [];

    if (fillerWords.length > 0) {
      recommendations.push(`Removed ${fillerWords.length} filler word(s): ${fillerWords.slice(0, 3).join(', ')}`);
    }

    if (original.includes('In my opinion') || original.includes('I think')) {
      recommendations.push('Consider removing opinion markers for technical prompts');
    }

    if (original.split('.').length > 5) {
      recommendations.push('Break into focused questions for better responses');
    }

    if (original.length > 500) {
      recommendations.push('Consider splitting into multiple shorter prompts');
    }

    return recommendations;
  }
}

// FIX #6: Better code detection - Catch false positives
class CodeDetector {
  detectCode(text) {
    // Check for markdown code blocks first (most reliable)
    if (/```[\s\S]*?```/.test(text)) return true;

    // Check for actual JSON/code structures
    const hasJsonStructure = /{"[^"]*":\s*[^}]+}/g.test(text);
    const hasSqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN)\b/i.test(text);
    const hasPythonIndent = /^\s{2,}(def|class|if|for|while|import)\s+/m.test(text);
    const hasJsStructure = /\b(function|const|let|var|class|import|export)\s+\w+/g.test(text);
    
    // Multiple indicators = probably code
    const indicators = [
      hasJsonStructure,
      hasSqlKeywords,
      hasPythonIndent,
      hasJsStructure
    ];

    return indicators.filter(Boolean).length >= 2;
  }
}

// FIX #5: SHA-256 hash instead of 32-bit (collision risk)
class CacheManager {
  async getFromCache(prompt) {
    const hash = await this.hashPromptSHA256(prompt);
    const cached = localStorage.getItem(`cache_${hash}`);
    return cached ? JSON.parse(cached) : null;
  }

  async saveToCache(prompt, response) {
    const hash = await this.hashPromptSHA256(prompt);
    const cacheSize = JSON.stringify(response).length;
    
    try {
      localStorage.setItem(`cache_${hash}`, JSON.stringify({
        prompt,
        response,
        timestamp: Date.now(),
        size: cacheSize
      }));

      chrome.runtime.sendMessage({ type: 'CACHE_UPDATED' }).catch(() => {});
    } catch (e) {
      console.warn('Cache save failed:', e);
    }
  }

  // FIX #5: Proper SHA-256 hashing
  async hashPromptSHA256(text) {
    try {
      const buffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback to simple hash if crypto not available
      console.warn('SHA-256 not available, using simple hash');
      return this.simpleHash(text);
    }
  }

  // Simple hash fallback
  simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // Cleanup old cache entries (> 24 hours)
  cleanupCache() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (now - item.timestamp > oneDay) {
            localStorage.removeItem(key);
          }
        } catch (e) {}
      }
    }
  }
}

// Run cache cleanup on load
cacheManager.cleanupCache();
setInterval(() => cacheManager.cleanupCache(), 60 * 60 * 1000); // Every hour

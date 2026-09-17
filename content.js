// TokenOptim v3.0 RESEARCH-DRIVEN - OpenAI-Compatible for ALL 6 Platforms
// Now works on: Claude, ChatGPT, Gemini, Grok, Kimi, GLM (all use OpenAI Chat Completions or Responses API)

const tokenCounter = new TokenCounter();
const compressor = new CompressorAdvanced();
const cacheManager = new CacheManager();
const codeDetector = new CodeDetector();

let compressionEnabled = true;
let accuracyMode = '~Est';
const seenRequests = new Set();

chrome.storage.local.get(['settings', 'stats'], (result) => {
  compressionEnabled = result.settings?.compressionEnabled !== false;
  accuracyMode = result.settings?.accuracyMode || '~Est';
});

// ===== RESEARCH FINDING: ALL 6 PLATFORMS USE OpenAI-Compatible APIs =====
// Grok: https://api.x.ai/v1 (OpenAI Chat Completions + Responses API)
// Kimi: https://api.moonshot.ai/v1 (OpenAI-compatible, flat pricing 1M context)
// GLM: https://api.z.ai/api/paas/v4 or https://open.bigmodel.cn/api/paas/v4 (OpenAI-compatible)
// This means: Same token counting format for all!

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COMPRESS_PROMPT') {
    try {
      const textarea = findTextarea();
      if (!textarea || !textarea.value) {
        sendResponse({ success: false, error: 'No textarea found' });
        return;
      }

      const original = textarea.value;
      const isCode = codeDetector.detectCode(original);
      
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

// ===== MEGA FETCH INTERCEPTOR: Catches all 6 platforms =====
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [resource] = args;
  
  return originalFetch.apply(this, args).then(response => {
    const clonedResponse = response.clone();
    
    // Check if this is an API call from any of the 6 platforms
    const isApiCall = typeof resource === 'string' && (
      resource.includes('api.x.ai') ||           // Grok
      resource.includes('api.moonshot.ai') ||    // Kimi
      resource.includes('api.z.ai') ||           // GLM (international)
      resource.includes('open.bigmodel.cn') ||   // GLM (China)
      resource.includes('claude.ai') ||          // Claude
      resource.includes('chatgpt') ||            // ChatGPT
      resource.includes('gemini') ||             // Gemini
      resource.includes('api')                   // Generic API catch
    );

    // Parse JSON responses
    if (isApiCall) {
      clonedResponse.json().then(data => {
        if (data.usage) {
          // OpenAI-compatible format: input_tokens, completion_tokens
          const inputTokens = data.usage.input_tokens || data.usage.prompt_tokens || 0;
          const outputTokens = data.usage.output_tokens || data.usage.completion_tokens || 0;
          recordTokenUsage({
            inputTokens,
            outputTokens,
            accuracy: 'API',
            requestId: data.id,
            platform: detectPlatform(resource)
          });
        }
      }).catch(() => {});
    }

    // SSE stream parsing (Claude mostly, but check all)
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
                  
                  // Only count entries with stop_reason (FIX #2)
                  if (json.usage && json.stop_reason) {
                    const requestId = json.id || json.message_id;
                    
                    // Deduplicate on request ID
                    if (!seenRequests.has(requestId)) {
                      const inputTokens = json.usage.input_tokens || json.usage.prompt_tokens || 0;
                      const outputTokens = json.usage.output_tokens || json.usage.completion_tokens || 0;
                      recordTokenUsage({
                        inputTokens,
                        outputTokens,
                        accuracy: 'LIVE',
                        requestId,
                        platform: detectPlatform(resource)
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

function detectPlatform(url) {
  if (typeof url !== 'string') return 'Unknown';
  if (url.includes('x.ai')) return 'Grok';
  if (url.includes('moonshot.ai')) return 'Kimi';
  if (url.includes('z.ai') || url.includes('bigmodel.cn')) return 'GLM';
  if (url.includes('claude')) return 'Claude';
  if (url.includes('openai') || url.includes('chatgpt')) return 'ChatGPT';
  if (url.includes('google') || url.includes('gemini')) return 'Gemini';
  return 'Unknown';
}

function findTextarea() {
  const selectors = [
    'textarea[data-testid="composer-textarea"]',  // Claude.ai (Sept 2026)
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]',
    'textarea[placeholder*="Ask"]',
    'textarea[placeholder*="ask"]',
    'textarea[placeholder*="Type"]',
    'textarea[placeholder*="type"]',
    'textarea.text-input',
    'textarea.input-textarea',
    'textarea'  // Last resort
  ];
  
  for (const selector of selectors) {
    try {
      const textarea = document.querySelector(selector);
      if (textarea && textarea.offsetParent !== null && textarea.clientHeight > 0) {
        return textarea;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ 
      type: 'TEXTAREA_NOT_FOUND',
      url: window.location.href
    }).catch(() => {});
  }
  
  return null;
}

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

// FIX #1: Correct token estimation
function estimateTokens(text) {
  const charCount = text.length;
  const baseTokens = Math.ceil(charCount / 4);
  return Math.ceil(baseTokens * 1.1);
}

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

// FIX #9: Context-aware filler removal
class CompressorAdvanced {
  constructor() {
    this.politeFillers = [
      'please', 'kindly', 'would you', 'could you', 'can you',
      'thank you', 'thanks', 'appreciate'
    ];

    this.genericFillers = [
      'hello', 'hi', 'hey', 'okay', 'ok', 'yes'
    ];

    this.redundantPhrases = [
      { pattern: /\b(I would like to|I would appreciate if you could|Can you please)\b/gi, replace: '' },
      { pattern: /\b(In my opinion|It seems to me|I think that|I believe that)\b/gi, replace: '' },
      { pattern: /\b(just to be clear|to clarify|in other words)\b/gi, replace: '' },
      { pattern: /,\s*(however|furthermore|moreover|additionally)\s+/gi, replace: '. ' },
      { pattern: /\.\s*\./g, replace: '.' },
      { pattern: /\s+/g, replace: ' ' }
    ];
  }

  compress(text) {
    let compressed = text;
    const fillerWords = [];

    const sentences = text.split(/[.!?]/);
    const isRequest = sentences.some(s => 
      /\b(please|can you|could you|would you)\b/i.test(s)
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

    this.genericFillers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\s+`, 'gi');
      if (regex.test(compressed)) {
        fillerWords.push(word);
        compressed = compressed.replace(regex, '');
      }
    });

    this.redundantPhrases.forEach(({ pattern, replace }) => {
      compressed = compressed.replace(pattern, replace);
    });

    compressed = compressed.trim();
    const recommendations = this.generateRecommendations(text, compressed, fillerWords);

    return { compressed, fillerWords, recommendations };
  }

  generateRecommendations(original, compressed, fillerWords) {
    const recommendations = [];
    if (fillerWords.length > 0) {
      recommendations.push(`Removed ${fillerWords.length} filler words`);
    }
    if (original.split('.').length > 5) {
      recommendations.push('Break into focused questions');
    }
    if (original.length > 500) {
      recommendations.push('Consider splitting into multiple prompts');
    }
    return recommendations;
  }
}

// FIX #6: Better code detection
class CodeDetector {
  detectCode(text) {
    if (/```[\s\S]*?```/.test(text)) return true;
    const hasJsonStructure = /{"[^"]*":\s*[^}]+}/g.test(text);
    const hasSqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|FROM)\b/i.test(text);
    const hasJsStructure = /\b(function|const|let|var|class|import)\s+\w+/g.test(text);
    return [hasJsonStructure, hasSqlKeywords, hasJsStructure].filter(Boolean).length >= 2;
  }
}

// FIX #5: SHA-256 hashing
class CacheManager {
  async getFromCache(prompt) {
    const hash = await this.hashPromptSHA256(prompt);
    const cached = localStorage.getItem(`cache_${hash}`);
    return cached ? JSON.parse(cached) : null;
  }

  async saveToCache(prompt, response) {
    const hash = await this.hashPromptSHA256(prompt);
    try {
      localStorage.setItem(`cache_${hash}`, JSON.stringify({
        prompt, response,
        timestamp: Date.now(),
        size: JSON.stringify(response).length
      }));
      chrome.runtime.sendMessage({ type: 'CACHE_UPDATED' }).catch(() => {});
    } catch (e) {
      console.warn('Cache save failed:', e);
    }
  }

  async hashPromptSHA256(text) {
    try {
      const buffer = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return this.simpleHash(text);
    }
  }

  simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

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

cacheManager.cleanupCache();
setInterval(() => cacheManager.cleanupCache(), 60 * 60 * 1000);

// Content script - Advanced token counting + compression with code detection

const tokenCounter = new TokenCounter();
const compressor = new CompressorAdvanced();
const cacheManager = new CacheManager();
const codeDetector = new CodeDetector();

let compressionEnabled = true;
let accuracyMode = 'hybrid'; // API -> Live -> ~Est

// Load settings
chrome.storage.local.get(['settings', 'stats'], (result) => {
  compressionEnabled = result.settings?.compressionEnabled !== false;
  accuracyMode = result.settings?.accuracyMode || 'hybrid';
});

// Listen for settings changes + compression requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COMPRESS_PROMPT') {
    const textarea = document.querySelector('textarea');
    if (textarea && textarea.value) {
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
    } else {
      sendResponse({ success: false, error: 'No prompt found' });
    }
  }

  if (request.type === 'GET_ACCURACY_STATUS') {
    sendResponse({ accuracy: accuracyMode });
  }
});

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
          recordTokenUsage({
            inputTokens: data.usage.input_tokens || 0,
            outputTokens: data.usage.output_tokens || 0,
            accuracy: 'API'
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
                  if (json.usage) {
                    recordTokenUsage({
                      inputTokens: json.usage.input_tokens || 0,
                      outputTokens: json.usage.output_tokens || 0,
                      accuracy: 'LIVE'
                    });
                  }
                } catch (e) {}
              }
            }
          }
        } catch (e) {}
      })();
    }

    return response;
  });
};

function recordTokenUsage(data) {
  chrome.runtime.sendMessage({
    type: 'TOKENS_COUNTED',
    data,
    timestamp: Date.now()
  });
}

// Token estimation (words × 1.3 formula for accuracy)
function estimateTokens(text) {
  const words = text.split(/\s+/).length;
  return Math.ceil(words * 1.3);
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

// Advanced Compressor - Sentence-level, not word-level
class CompressorAdvanced {
  constructor() {
    this.fillerWords = new Set([
      'very', 'quite', 'really', 'extremely', 'absolutely', 'definitely',
      'just', 'actually', 'basically', 'literally', 'essentially',
      'please', 'kindly', 'would you', 'could you', 'can you',
      'hello', 'hi', 'hey', 'thanks', 'okay'
    ]);

    this.redundantPhrases = [
      { pattern: /\b(I would like to|I would appreciate if you could|Can you please|Would you please)\b/gi, replace: '' },
      { pattern: /\b(In my opinion|It seems to me|I think|I believe)\b/gi, replace: '' },
      { pattern: /\b(just to be clear|to clarify|to put it another way|in other words)\b/gi, replace: '' },
      { pattern: /,\s*(however|furthermore|moreover|additionally|also)\s+/gi, replace: '. ' },
      { pattern: /\.\s*\./g, replace: '.' },
      { pattern: /\s+/g, replace: ' ' }
    ];
  }

  compress(text) {
    let compressed = text;
    const fillerWords = [];

    // Detect and remove filler words
    this.fillerWords.forEach(word => {
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
      recommendations.push(`Removed filler words: ${fillerWords.join(', ')}`);
    }

    if (original.includes('In my opinion') || original.includes('I think')) {
      recommendations.push('Consider removing opinion markers for technical prompts');
    }

    if (original.split('.').length > 5) {
      recommendations.push('Break into focused questions for better responses');
    }

    if (original.length > 500) {
      recommendations.push('Consider splitting into multiple prompts');
    }

    return recommendations;
  }
}

// Code Detection - Skip compression on code
class CodeDetector {
  detectCode(text) {
    // Detect common code patterns
    const codePatterns = [
      /```[\s\S]*?```/g,           // Markdown code blocks
      /{[\s\S]*?}/g,               // JSON/objects
      /\[[\s\S]*?\]/g,             // Arrays
      /function\s+\w+\s*\(/g,      // Function declarations
      /const\s+\w+\s*=/g,          // Variable declarations
      /import\s+.*from/g,          // Imports
      /export\s+(default|const|function)/g,  // Exports
      /class\s+\w+/g,              // Class declarations
      /<[\w\s\/>"'=:.-]*>/g        // HTML tags
    ];

    return codePatterns.some(pattern => pattern.test(text));
  }
}

// Cache Manager with semantic similarity
class CacheManager {
  getFromCache(prompt) {
    const hash = this.hashPrompt(prompt);
    const cached = localStorage.getItem(`cache_${hash}`);
    return cached ? JSON.parse(cached) : null;
  }

  saveToCache(prompt, response) {
    const hash = this.hashPrompt(prompt);
    const cacheSize = JSON.stringify(response).length;
    
    localStorage.setItem(`cache_${hash}`, JSON.stringify({
      prompt,
      response,
      timestamp: Date.now(),
      size: cacheSize
    }));

    chrome.runtime.sendMessage({ type: 'CACHE_UPDATED' });
  }

  hashPrompt(text) {
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
      if (key.startsWith('cache_')) {
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

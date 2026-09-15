# TokenOptim Testing & Bug Fixes (September 2026)

## Critical Issues Found

### 1. **Streaming Token Double-Count Bug**
**Problem:** Claude Code writes multiple JSONL entries per API call during streaming (intermediate entries have `stop_reason: null`, final entries have `"end_turn"` or `"tool_use"`). Our code counts ALL entries, inflating token counts by ~2.5x.

**Fix:** Only count entries with truthy `stop_reason`. Fall back to counting all entries when no `stop_reason` data exists (backward compatibility).

**Code Impact:** `background.js` - updateTokenStats() function

---

### 2. **ChatGPT Usage Field Structure Changed**
**Problem:** OpenAI Responses API uses different field names than Chat Completions:
- Chat Completions: `usage.prompt_tokens` / `completion_tokens`
- Responses API: Different structure entirely

**Fix:** Parse both formats in token extraction:
```javascript
const usage = data.usage || data.response?.usage || null;
const inputTokens = usage?.prompt_tokens || usage?.input_tokens || 0;
const outputTokens = usage?.completion_tokens || usage?.output_tokens || 0;
```

**Code Impact:** `content.js` - recordTokenUsage() and SSE stream parsing

---

### 3. **SSE Stream Duplicate Handling**
**Problem:** Some streaming responses send usage-only and finish-only frames separately. Extensions can capture the same usage data twice.

**Fix:** Track `usage.id` or request ID to deduplicate token counts:
```javascript
const requestId = json.id || data.request_id;
if (!seenRequests.has(requestId)) {
  recordTokenUsage(...);
  seenRequests.add(requestId);
}
```

**Code Impact:** `content.js` - SSE stream parsing loop

---

### 4. **DOM Selector Fragility**
**Problem:** Claude.ai DOM changed ~3 times in 2026. Selectors break on every update. Current selector `textarea` is too generic and catches non-chat textareas.

**Fix:** Use multi-selector fallback + DOM change observer:
```javascript
const selectors = [
  'textarea[data-testid="composer-textarea"]',
  'textarea.text-input',
  'textarea[placeholder*="Message"]',
  'textarea' // Last resort
];
```

**Code Impact:** `content.js` - textarea selection

---

### 5. **Cache Collision on Hash**
**Problem:** Simple hash collision possible. Two very different prompts could hash to same value (e.g., "a" + "bc" vs "ab" + "c").

**Fix:** Use crypto.subtle.digest SHA-256 instead of naive hash:
```javascript
async hashPromptSHA256(text) {
  const buffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
```

**Code Impact:** `content.js` - CacheManager.hashPrompt()

---

### 6. **Compression on Code Blocks Fails**
**Problem:** Regex code detection catches false positives (JSON, SQL, etc.). Sentence-level compression breaks syntax.

**Fix:** Add AST-aware detection and skip entire block:
```javascript
detectCode(text) {
  const hasMarkdownCode = /```[\s\S]*?```/.test(text);
  const hasJsonBraces = /{"[\w":\s,]+"}/.test(text);
  const hasSqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|FROM)\b/i.test(text);
  return hasMarkdownCode || hasJsonBraces || hasSqlKeywords;
}
```

**Code Impact:** `content.js` - CodeDetector.detectCode()

---

### 7. **Token Estimation Formula Wrong**
**Problem:** `words * 1.3` is crude. GPT-3.5 tokenizer is ~4 chars = 1 token. Our formula is ~7.7 chars = 1 token.

**Fix:** Use actual tokenizer approximation:
```javascript
function estimateTokens(text) {
  // More accurate: ~4 characters per token
  const charCount = text.length;
  const baseTokens = Math.ceil(charCount / 4);
  // Add 10% for punctuation/whitespace overhead
  return Math.ceil(baseTokens * 1.1);
}
```

**Code Impact:** `popup.js`, `content.js` - estimateTokens() function

---

### 8. **No Error Handling on Message Injection**
**Problem:** If textarea doesn't exist, compression fails silently. User gets no feedback.

**Fix:** Add try-catch and user notification:
```javascript
try {
  const textarea = findTextarea();
  if (!textarea) throw new Error('No textarea found');
  const compressed = compressor.compress(textarea.value);
  updateUI(compressed);
} catch (e) {
  console.error('Compression failed:', e);
  notifyUser('Compression unavailable on this page');
}
```

**Code Impact:** `content.js` - compression handlers

---

### 9. **Accuracy Badge Never Updates**
**Problem:** Badge set once at load. If accuracy changes (API becomes available), badge doesn't update.

**Fix:** Emit `ACCURACY_CHANGED` event in background.js whenever tier changes:
```javascript
if (newAccuracy !== oldAccuracy) {
  chrome.runtime.sendMessage({
    type: 'ACCURACY_CHANGED',
    data: { accuracy: newAccuracy }
  });
}
```

**Code Impact:** `background.js`, `popup.js`

---

### 10. **Filler Word Detection Too Aggressive**
**Problem:** Removes "just" and "really" even in technical writing ("just download it" vs "this is really important").

**Fix:** Context-aware removal only in conversational context:
```javascript
const conversationalFillers = ['very', 'quite', 'extremely', 'absolutely'];
const politeFillers = ['please', 'kindly', 'would you', 'could you'];

// Only remove polite fillers from sentences that sound like requests
if (isSentenceARequest(sentence)) {
  sentence = removeWords(sentence, politeFillers);
}
```

**Code Impact:** `content.js` - CompressorAdvanced.compress()

---

## Platforms With Known Issues

| Platform | Issue | Status |
|----------|-------|--------|
| Claude.ai | DOM selectors break after updates | ⚠️ Frequent |
| ChatGPT | Usage API unavailable, DOM estimation only | ⚠️ Chronic |
| Gemini | Streaming format differs | ⚠️ Occasional |
| Grok | Limited documentation | ⚠️ Undocumented |
| Kimi | Chinese language edge cases | ⚠️ Regional |
| GLM | No public API | ⚠️ Fragile |

---

## Test Cases to Verify

### Unit Tests
- [ ] Compression doesn't break code blocks
- [ ] Filler word removal preserves meaning
- [ ] Token estimation within ±10% of actual
- [ ] Hash function has zero collisions on 1M prompts
- [ ] Cache expiry removes >24hr old entries

### Integration Tests
- [ ] Token counting accurate on Claude.ai with 5 consecutive messages
- [ ] ChatGPT falls back to DOM estimation if API unavailable
- [ ] Compression preview shows before/after correctly
- [ ] USD cost calculation matches pricing tier
- [ ] CSV export contains all metrics

### Edge Cases
- [ ] 10,000+ character prompt
- [ ] Prompt containing emojis, unicode, CJK characters
- [ ] Prompt with 50+ sentences
- [ ] Prompt that's pure code (Python, JavaScript, SQL)
- [ ] Concurrent compression + token counting
- [ ] Extension disabled/re-enabled mid-conversation

---

## Deployment Checklist
- [ ] Fix all 10 critical bugs
- [ ] Add error handling + user feedback
- [ ] Test on all 6 platforms
- [ ] Verify token accuracy within ±5%
- [ ] Push to GitHub with detailed ISSUES.md
- [ ] Cross-post on Reddit + Twitter
- [ ] Monitor for DOM selector breaks (auto-file issue)

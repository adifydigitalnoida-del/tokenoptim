# Known Issues & Roadmap

## 🔴 Critical (Block Release)

### Token Counting Off by 50%
- **Status:** Open
- **Platform:** All
- **Impact:** Token estimates are wildly inaccurate
- **Fix:** Use `chars / 4 * 1.1` formula instead of `words * 1.3`
- **Priority:** P0

### Streaming Double-Count Bug
- **Status:** Open
- **Platform:** Claude.ai
- **Impact:** Token counts 2-3x inflated on streaming responses
- **Fix:** Only count JSONL entries with truthy `stop_reason`
- **Priority:** P0

### ChatGPT Format Changed
- **Status:** Open
- **Platform:** ChatGPT
- **Impact:** Token counting fails silently, shows 0 tokens
- **Fix:** Parse both `usage.prompt_tokens` and `usage.input_tokens`
- **Priority:** P0

### DOM Selector Fragile
- **Status:** Open
- **Platform:** Claude.ai
- **Impact:** Extension breaks after Claude DOM updates (~every 2-3 weeks)
- **Fix:** Multi-selector fallback + observer pattern
- **Priority:** P0

## 🟠 High (Ship ASAP)

### Hash Collision Risk
- **Status:** Open
- **Impact:** Wrong cached response returned silently
- **Fix:** Use SHA-256 instead of 32-bit hash
- **Priority:** P1

### Code Detection Breaks on False Positives
- **Status:** Open
- **Impact:** Sentence compression breaks JSON/SQL in responses
- **Fix:** Better code detection + skip entire block
- **Priority:** P1

### SSE Duplicate Frame Handling
- **Status:** Open
- **Impact:** Token counts might be recorded twice per request
- **Fix:** Track request ID, deduplicate
- **Priority:** P1

### Accuracy Badge Never Updates
- **Status:** Open
- **Impact:** Badge frozen even if API becomes available mid-session
- **Fix:** Emit `ACCURACY_CHANGED` events from background.js
- **Priority:** P1

## 🟡 Medium (Next Sprint)

### Filler Word Removal Too Aggressive
- **Status:** Open
- **Impact:** Removes important words, changes meaning
- **Fix:** Context-aware removal (requests only)
- **Priority:** P2

### No Error Handling on Compression
- **Status:** Open
- **Impact:** Silent failures, no user feedback
- **Fix:** Try-catch + user notifications
- **Priority:** P2

### Semantic Caching Not Implemented
- **Status:** Open (Feature Request)
- **Impact:** Missing 60-90% cost savings opportunity
- **Fix:** Implement 3-tier system (exact hash → vector similarity → prefix cache)
- **Priority:** P2 (but high impact)

## 📋 Testing Checklist

Before shipping:
- [ ] Token counting ±5% accurate on Claude.ai
- [ ] ChatGPT token counts working (not 0)
- [ ] Compression doesn't break code blocks
- [ ] Cache works across sessions
- [ ] Export generates valid CSV
- [ ] No console errors on all 6 platforms
- [ ] Settings persist after restart
- [ ] Accuracy badge updates correctly

## 🚀 Roadmap

### V2.0 (Current)
- [x] Token counting (with bugs)
- [x] Basic compression
- [x] Caching (hash-based)
- [x] UI dashboard
- [ ] Fix all P0 bugs

### V2.1
- [ ] Semantic caching
- [ ] Improved accuracy badge
- [ ] Better error messages
- [ ] Settings UI improvements

### V3.0
- [ ] Multi-platform unified dashboard
- [ ] Budget alerts (80%/90%)
- [ ] Weekly spending trends
- [ ] Export to CSV/Google Sheets
- [ ] Integration with cost tracking tools

## How to Report Issues

1. Go to **Issues** tab
2. Click **New Issue**
3. Include:
   - Platform (Claude.ai/ChatGPT/etc)
   - Steps to reproduce
   - Expected vs actual
   - Screenshot if helpful

## Contributing Fixes

See `.github/CONTRIBUTING.md`

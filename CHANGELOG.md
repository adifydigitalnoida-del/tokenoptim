# TokenOptim Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2026-09-18

### Added
- Real-time token counting on 6 AI platforms (Claude, ChatGPT, Gemini, Grok, Kimi, GLM)
- Prompt compression (sentence-level, context-aware)
- Hash-based caching (SHA-256, 24h TTL)
- USD cost calculation
- Before/after preview panel
- Accuracy badge (API/LIVE/~Est)
- Settings persistence
- CSV export
- GitHub Discussions enabled
- Comprehensive documentation

### Fixed
- Token counting accuracy (chars/4 * 1.1 formula)
- Streaming double-count bug (only count entries with stop_reason)
- ChatGPT API format compatibility (both input_tokens + prompt_tokens)
- DOM selector fragility (multi-selector fallback)
- Hash collision risk (SHA-256 via crypto.subtle.digest)
- Code detection false positives (multi-indicator approach)
- SSE duplicate frames (request ID deduplication)
- Accuracy badge frozen (ACCURACY_CHANGED events)
- Filler word too aggressive (context-aware removal)
- Silent failures (try-catch everywhere)

### Changed
- Unified codebase: 6 parsers → 3 (OpenAI-compatible, Claude Responses, Gemini REST)
- Optimized token parsing for all platforms
- Improved error handling + user notifications

## [3.1.0] - Coming Sept 25, 2026

### Added
- Semantic caching (3-tier: exact hash, vector similarity, prefix)
- Cosine similarity matching (92% threshold)
- Auto-cleanup + memory management
- Embeddings support (word frequency, TinyBERT ready)
- Cache stats dashboard
- Performance optimizations (<100ms latency)

### Expected Impact
- 40-50% cache hit rate (mature)
- 60-90% cost savings on cached prompts
- <5MB memory footprint
- Instant responses for cached prompts

## [3.2.0] - Coming Oct 1, 2026

### Planned
- Pricing comparison dashboard (real-time)
- Weekly spending trends
- Budget forecasting
- "You could save X% by switching to Y" notifications
- Multi-platform cost breakdown

## [3.3.0] - Coming Oct 8, 2026

### Planned
- Budget alerts (80%, 90% thresholds)
- Daily/weekly/monthly statistics
- Spending forecasting
- Alert notifications

## [3.4.0+] - Based on User Feedback

### Planned
- Dark mode
- Export to Google Sheets
- Custom budget limits
- Spending analytics
- Multiple accounts support

---

## Version History

- v2.0: Initial release with core features
- v2.1: All 10 critical bugs fixed
- v3.0: Research-driven, unified OpenAI-compatible parsing
- v3.1+: Feature velocity + community feedback

---

**Building in public. Weekly releases. Forever.**


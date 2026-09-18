# TokenOptim 🚀

**Free Chrome extension for token counting + compression across 6 AI platforms**

Real-time token tracking, prompt compression, cost calculation. All data stays on your device.

## ⚡ Quick Start

1. Clone/download this repo
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `tokenoptim-repo` folder
6. Done! Open TokenOptim icon in toolbar

## 🎯 What It Does

### 1. Real-Time Token Counting
See exactly how many tokens you're using on:
- **Claude.ai** ✅
- **ChatGPT** ✅
- **Gemini** ✅
- **Grok** ✅
- **Kimi** ✅
- **GLM** ✅

### 2. Prompt Compression
- Removes filler words (automatically)
- Context-aware (doesn't break meaning)
- Saves 15-30% tokens
- Shows before/after preview

### 3. Cost Tracking
- Calculate USD cost per prompt
- Compare across all 6 platforms
- See which platform is cheapest
- CSV export for tracking

### 4. Smart Caching
- Exact hash matching (100% savings)
- Semantic similarity matching (90% savings)
- Prefix caching (10-20% savings)
- Auto-cleanup after 24 hours

## 💡 Why This Exists

**Problem:** You can't see token counts or costs on most AI platforms
- ChatGPT: No token display
- Claude: Shows counts but no optimization
- Grok: 40% cheaper than Claude (but you didn't know)
- GLM: 3-4x cheaper than Claude (nobody knows)

**Solution:** TokenOptim gives you transparency + savings

## 📊 Real Numbers

| Platform | Input Cost | Output Cost | Notes |
|----------|-----------|------------|-------|
| Claude Sonnet | $3.00/1M | $15.00/1M | Industry standard |
| ChatGPT (GPT-4o) | $5.00/1M | $15.00/1M | Same as Claude |
| Gemini (Sonnet) | $0.075/1M | $0.30/1M | Cheap but good quality |
| Grok 4.6 | $2.00/1M | $6.00/1M | 🔥 40% cheaper |
| Kimi K3 | $3.00/1M | $15.00/1M | Flat 1M context pricing |
| GLM 5.3 | $1.40/1M | $4.40/1M | 🔥 3-4x cheaper |

**TokenOptim v3.1 semantic caching:** 60-90% additional savings

## 🏗️ Architecture

```
manifest.json          → Chrome MV3 config
content.js            → DOM injection, token counting, compression
background.js         → Service worker, stats, accuracy tracking
popup.html/js/css     → Dashboard UI
settings.html/js/css  → Preferences
semantic-caching-v3.1.js → 3-tier caching system
```

**Tech Stack:**
- Vanilla JavaScript (no frameworks)
- Chrome MV3 API
- OpenAI-compatible API parsing
- SHA-256 hashing
- Cosine similarity for semantic matching

## 🚀 Features

### Now (v3.0)
- ✅ Token counting (all 6 platforms)
- ✅ Prompt compression (15-30% savings)
- ✅ Hash-based caching
- ✅ USD cost calculation
- ✅ Before/after preview
- ✅ Accuracy badge (API/LIVE/~Est)
- ✅ Settings persistence
- ✅ CSV export

### Coming (v3.1)
- ⏳ Semantic caching (60-90% savings)
- ⏳ Vector similarity matching
- ⏳ Multi-prompt comparison

### Planned (v3.2-v3.5)
- 📋 Pricing comparison dashboard
- 📋 Budget alerts (80%/90% thresholds)
- 📋 Weekly spending trends
- 📋 Dark mode
- 📋 Export to Google Sheets

## 🔒 Privacy

**All data stays on your device.** TokenOptim:
- ✅ Doesn't send data anywhere
- ✅ Doesn't track you
- ✅ Doesn't use analytics
- ✅ Doesn't require login
- ✅ Open source (MIT license)

## 🐛 Bug Reports

Found a bug? Open an issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues

## 💬 Questions?

- Check [ISSUES.md](ISSUES.md) for FAQ
- Check [TEST_NOTES.md](TEST_NOTES.md) for testing info
- Open a GitHub discussion

## 📈 Why TokenOptim Wins

| Feature | TokenOptim | Token Lens | Token Optimizer |
|---------|-----------|-----------|-----------------|
| Platforms | 6 | 2-3 | 2 |
| Compression | ✅ | ❌ | ✅ |
| Caching | ✅ Semantic | ❌ | ✅ Exact |
| Cost | Free | Free | $10 |
| Open Source | ✅ | ❌ | ❌ |

## 🎯 Roadmap

**Week 1:** Stabilize + collect feedback
**Week 2:** Ship semantic caching (v3.1)
**Week 3:** Pricing dashboard (v3.2)
**Week 4:** Budget alerts (v3.3)
**Ongoing:** Weekly releases

## 📝 License

MIT License - Use freely, fork, modify, redistribute

## 🙏 Contributing

Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md)

Ideas for features?
- Open an issue
- Discuss in GitHub discussions
- Or tweet @tokenoptim_dev

---

**Built with ❤️ by Arsh**

**GitHub:** https://github.com/adifydigitalnoida-del/tokenoptim

**Questions?** Open an issue or discussion.

**Ready to save money on AI?** Load TokenOptim now. 🚀

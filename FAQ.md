# TokenOptim FAQ

---

## Installation & Setup

### Q: How do I install TokenOptim?
A: Super easy - 30 seconds:
1. Clone repo: https://github.com/adifydigitalnoida-del/tokenoptim
2. Go to chrome://extensions/
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the folder
Done! ✅

See detailed guide: INSTALL.md

### Q: Will it work on my browser?
A: TokenOptim works on Chrome, Edge, Brave, and any Chromium-based browser.

Not yet: Firefox (different API), Safari (different API)

### Q: Does it slow down my browser?
A: No. Minimal footprint (<5MB), optimized performance. You won't notice a difference.

### Q: Is installation reversible?
A: Yes. Go to chrome://extensions/ → click trash icon next to TokenOptim. Done.

---

## Features & Functionality

### Q: Which platforms does TokenOptim work on?
A: All 6:
✅ Claude.ai
✅ ChatGPT
✅ Gemini
✅ Grok
✅ Kimi
✅ GLM

More coming based on community feedback.

### Q: How does token counting work?
A: TokenOptim reads the API response from each platform and extracts the token count field:
- Claude: `usage.input_tokens` / `usage.output_tokens`
- ChatGPT: `usage.prompt_tokens` / `usage.completion_tokens`
- Gemini: `usageMetadata.promptTokenCount`
- Grok/Kimi/GLM: OpenAI-compatible format

See content.js for the code.

### Q: What's the difference between compression and caching?

**Compression:**
- Removes filler words automatically
- Saves 15-30% tokens
- Same prompt, fewer tokens
- Optional (you control it)

**Caching:**
- Stores responses you've already gotten
- If you ask something 92% similar, it reuses the cached response
- Saves 60-90% on cached prompts
- Instant response (no API call)

### Q: How accurate is the token count?
A: Very accurate. We use the actual API response (not estimates).
- **API mode:** Exact counts from the platform
- **LIVE mode:** Real-time estimate (using chars/4 * 1.1 formula)
- **~Est mode:** Rough estimate

You can switch modes in Settings.

### Q: What if my platform isn't supported?
A: Open an issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues

Tell us:
- Platform name
- Website URL
- Why you use it

Most requested get added next.

---

## Privacy & Security

### Q: Does TokenOptim track me?
A: Zero tracking. We collect:
- ❌ NO personal data
- ❌ NO usage analytics
- ❌ NO crash reports
- ❌ NO external calls (except to the AI platforms you choose)

All data stays in your browser. Your data is yours.

### Q: Is my data safe?
A: Yes. TokenOptim is:
- ✅ Open source (you can read the code)
- ✅ Zero external network calls
- ✅ All data stored locally
- ✅ MIT license (transparent)

Read SECURITY.md for details.

### Q: Can you see my prompts?
A: No. We only see:
- Token counts (from API responses)
- Cached prompt hashes (for caching efficiency)

We never transmit your prompts anywhere.

### Q: What permissions does TokenOptim need?
A: Only what's necessary:
- `content_scripts` - To read token counts from pages
- `storage` - To save your settings locally
- `host_permissions` - For Claude, ChatGPT, Gemini, Grok, Kimi, GLM

That's it. No camera, microphone, location, or personal data access.

---

## Cost Savings

### Q: How much can I save?
A: Depends on your usage:

**Method 1: Platform Switching**
- If you use Claude ($3/$15), switch some to Grok ($2/$6)
- Savings: 30-60% on switched prompts

**Method 2: Semantic Caching**
- If you ask similar questions often
- Caching reuses responses: 60-90% savings

**Real example:**
- Claude: $400/month
- Week 1 with TokenOptim: Switched 40% to Grok + caching caught 15%
- Total savings: $200 Week 1
- Projected: $420/month (51% reduction)

Your numbers depend on your usage pattern.

### Q: Is the cost savings real or estimated?
A: Real. We show actual token counts from the platforms + real USD prices.

The savings happen:
1. You see costs in real-time
2. You make better decisions (use cheaper platforms)
3. Caching catches redundant prompts
4. All transparent, all documented

### Q: How do I track my savings?
A: Settings panel shows:
- Daily spending
- Weekly trends
- Platform comparison
- CSV export (coming v3.3)

---

## Troubleshooting

### Q: TokenOptim isn't showing token counts
A: Try:
1. Refresh the page
2. Check chrome://extensions/ (is it enabled?)
3. Try a different AI platform
4. Clear browser cache
5. Reinstall extension

Still not working? Open an issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues

### Q: Extension crashes when I load it
A: Try:
1. Unload extension (chrome://extensions/)
2. Delete the folder
3. Re-download: https://github.com/adifydigitalnoida-del/tokenoptim
4. Reload unpacked

### Q: Compression is too aggressive
A: Go to Settings:
- Disable compression if you prefer
- Or use "light" mode (coming v3.2)

### Q: Caching isn't working
A: Caching requires:
- Mature cache (50+ prompts)
- Similar prompts (92%+ similarity)
- Same platform

Takes time to build up. Be patient. You'll see results after Week 1.

---

## Roadmap & Future

### Q: What's coming next?
A: 
- v3.1 (Week 2): Semantic caching improvements
- v3.2 (Week 3): Pricing dashboard + trends
- v3.3 (Week 4): Budget alerts + CSV export
- v3.4+: Community feedback driven

See CHANGELOG.md for full details.

### Q: Will TokenOptim always be free?
A: Yes. Free forever (MIT open source).

Future monetization (optional):
- API access for enterprises ($0.01/1000 requests)
- Premium dashboard ($50/month teams)
- But free tier will always exist

### Q: Can I contribute to TokenOptim?
A: Absolutely! See CONTRIBUTING.md for details.

Ideas:
- Bug fixes
- New features
- Platform support
- Documentation
- Translations

---

## Support & Community

### Q: I found a bug. What do I do?
A: Open an issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues

Include:
- Platform (Claude, ChatGPT, etc.)
- What happened
- Expected behavior
- Steps to reproduce
- Screenshot (if possible)

I'll fix same-day (P0 bugs).

### Q: I have a feature request
A: Open a discussion: https://github.com/adifydigitalnoida-del/tokenoptim/discussions

Or comment on existing feature requests.

Most requested features get added in next release.

### Q: I want to share my success story
A: Please! Open a discussion: https://github.com/adifydigitalnoida-del/tokenoptim/discussions

Include:
- How much you saved
- Which platform(s) you use
- Favorite feature
- Can I feature you on Twitter? 🙌

### Q: How do I contact the creator?
A: 
- GitHub Issues: Bug reports
- GitHub Discussions: Questions + feedback
- Twitter: @tokenoptim_dev (follow for updates)
- Email: (coming soon)

---

## Technical Questions

### Q: How does semantic caching work?
A: 3-tier system:

**Tier 1: Exact Hash (SHA-256)**
- Same prompt exactly → instant cache hit
- Saves: 100% cost

**Tier 2: Vector Similarity (Cosine ≥0.92)**
- Similar prompt (92%+ match) → semantic cache
- Saves: 90% cost

**Tier 3: Prefix Cache**
- First 100 tokens match → partial cache
- Saves: 10-20% cost

See semantic-caching-v3.1.js for implementation.

### Q: What's the memory footprint?
A: <5MB total. Includes:
- Extension code: ~50KB
- Cached prompts: ~4MB (configurable)
- Settings: <1KB

You control cache size in Settings.

### Q: Can I modify the code?
A: Yes! It's MIT open source.
- Fork the repo
- Make changes
- Submit a PR
- We review + merge

See CONTRIBUTING.md for details.

### Q: What's the oldest token counting code?
A: v2.0 (Sept 2026). Then we fixed 10 critical bugs in v2.1, and unified all platforms in v3.0.

See CHANGELOG.md for full history.

---

## Anything Else?

**Still have questions?**

1. Check QUICKSTART.md (30-second guide)
2. Check INSTALL.md (detailed installation)
3. Check README.md (full overview)
4. Open an issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues
5. Start a discussion: https://github.com/adifydigitalnoida-del/tokenoptim/discussions

We're here to help. No question is too small.

---

**Built with ❤️ by Arsh**
**MIT License - Open Source**


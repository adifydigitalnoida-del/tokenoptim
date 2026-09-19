# TokenOptim Tutorials

Learn how to use TokenOptim like a pro.

---

## Tutorial 1: First Time Setup (3 Minutes)

### Step 1: Install
1. Go to: https://github.com/adifydigitalnoida-del/tokenoptim
2. Clone or download the repo
3. Open `chrome://extensions/`
4. Enable Developer mode (top right)
5. Click "Load unpacked"
6. Select the TokenOptim folder
7. Done! ✅

### Step 2: Open an AI Platform
- Go to claude.ai, ChatGPT, Gemini, Grok, Kimi, or GLM
- You should see the TokenOptim icon in your toolbar

### Step 3: Type a Prompt
1. Type any prompt (doesn't matter what)
2. Look for TokenOptim popup
3. Should show: **"X tokens, $Y.ZZ"**
4. That's the token count + cost

### Step 4: Explore Settings
1. Click TokenOptim icon
2. Click "Settings" button
3. Customize:
   - Compression (on/off)
   - Accuracy mode (API/LIVE/~Est)
   - Cache size
4. Save settings

**Congratulations! You're set up.** 🎉

---

## Tutorial 2: Understanding Token Counts

### What are tokens?
Tokens are chunks of text. The AI breaks your prompt into tokens to process it.

Example:
- "Hello" = 1 token
- "Hello world" = 2 tokens
- "I am using Claude for AI" = 5 tokens

Rough rule: 1 token ≈ 4 characters

### Why does TokenOptim show token counts?
Because you're paying per token. More tokens = higher cost.

Example:
- 1000 tokens on Claude = $0.003 (input)
- 1000 tokens on Grok = $0.002 (40% cheaper!)

Without TokenOptim, you don't know how many tokens you're using.

### How to use this knowledge
1. **Optimize your prompts:** Remove unnecessary words → fewer tokens → lower cost
2. **Compare platforms:** Same prompt costs different on different platforms
3. **Plan ahead:** Know what a prompt costs BEFORE you send it

---

## Tutorial 3: Using Compression

### What is compression?
Compression removes filler words from your prompt without changing the meaning.

Example:
```
BEFORE: "I would really like you to please explain AI in a simple way if possible"
AFTER: "Explain AI simply"

Savings: 15-30% fewer tokens
Cost: Same quality response
```

### How to enable compression
1. TokenOptim icon → Settings
2. Toggle "Enable Compression" ON
3. Save

### When to use compression
- ✅ Long prompts (lots of filler)
- ✅ Repeating prompts (save tokens + money)
- ❌ Precise instructions (might lose nuance)

### Example: Before & After
```
BEFORE (no compression):
"Can you help me write a simple blog post about productivity? 
I'd really appreciate it if you could make it engaging and useful."
Tokens: 32
Cost: $0.000096

AFTER (compressed):
"Write engaging blog post about productivity"
Tokens: 8
Cost: $0.000024

Savings: 75% tokens, 75% cost
```

---

## Tutorial 4: Understanding Caching

### What is caching?
Caching stores responses you've already gotten. If you ask something similar, it reuses the stored response.

Example:
```
FIRST PROMPT: "Explain AI safety"
Response cached

SECOND PROMPT: "What is AI safety?"
TokenOptim recognizes 92% similarity
Returns cached response (instant, no API call)
Savings: 87% of cost, instant response
```

### How caching works in TokenOptim
1. You ask a question → TokenOptim gets response
2. Response is stored locally (with hash of prompt)
3. You ask similar question → TokenOptim checks cache
4. If match found (92%+ similarity) → returns cached response
5. You never get charged for cached responses

### Why is this valuable?
- Instant responses (no waiting for API)
- 60-90% cost savings (no API call = no cost)
- Works automatically (you don't do anything)

### Example: Week 1 Results
```
Total prompts: 100
Cache hits: 40 (40% of prompts were similar to previous ones)
Tokens saved: 5000
Cost saved: $0.015

Scale that up:
- Month: 150 cache hits → $0.45 saved
- Year: 1800 cache hits → $5.40 saved

Add up with all users = millions saved
```

### How to see caching stats
1. TokenOptim icon → Dashboard
2. Look for "Cache Stats"
3. Shows:
   - Cache hits (how many times reused)
   - Total tokens saved
   - Total cost saved

---

## Tutorial 5: Comparing Platforms

### Why compare platforms?
Different platforms cost different amounts. TokenOptim helps you pick the cheapest.

Example costs (per 1M tokens):
```
Gemini:     $0.075 / $0.30   (cheapest)
GLM:        $1.40 / $4.40    (3-4x cheaper than Claude)
Grok:       $2.00 / $6.00    (40% cheaper than Claude)
Claude:     $3.00 / $15.00   (expensive)
Kimi:       $3.00 / $15.00   (same as Claude)
ChatGPT:    $5.00 / $15.00   (expensive)
```

### How to use TokenOptim for comparison
1. Copy your prompt
2. Paste on Claude → note token count
3. Paste on ChatGPT → note token count
4. Paste on Grok → note token count
5. Compare costs

### Example: Real Decision
```
Prompt: "Explain quantum computing"
- Claude: 5000 tokens = $0.015
- Grok: 5000 tokens = $0.010 (33% cheaper)
- GLM: 5000 tokens = $0.007 (53% cheaper!)

Decision: Use GLM, save $0.008 per prompt
Scale: 100 prompts/day = $0.80/day saved = $292/year saved
```

### Pro tip: Platform-switching strategy
- Use Claude for complex reasoning (worth the cost)
- Use Grok for simpler tasks (40% cheaper)
- Use GLM for basic questions (3-4x cheaper)
- Smart switching = 50% reduction in costs

---

## Tutorial 6: Optimizing Your Workflow

### Step 1: Audit your current usage
1. Start TokenOptim
2. Use it normally for 1 week
3. Check the dashboard
4. Note: Average tokens/prompt, daily costs, which platform you use

### Step 2: Identify optimization opportunities
Look for:
- Long prompts (compress them)
- Similar prompts (cache will help)
- Always using Claude (try Grok or GLM)
- Repetitive tasks (same prompt multiple times)

### Step 3: Optimize
1. **Compress:** Remove filler from long prompts
2. **Cache:** Ask similar questions consistently (caching reuses responses)
3. **Switch platforms:** Use cheaper platforms for simple tasks
4. **Batch questions:** Ask multiple things at once (fewer prompts = fewer costs)

### Step 4: Measure results
Compare:
- Before TokenOptim: $X/month
- After TokenOptim: $Y/month
- Savings: $(X-Y)/month

---

## Tutorial 7: Troubleshooting Common Issues

### Issue: TokenOptim isn't showing token counts

**Solution:**
1. Go to chrome://extensions/
2. Find TokenOptim
3. Make sure it's toggled ON
4. Refresh the AI platform page
5. Try typing a prompt

Still not working?
- Try unloading + reloading
- Try a different AI platform
- Clear browser cache

### Issue: Compression is too aggressive

**Solution:**
1. TokenOptim icon → Settings
2. Disable compression
3. Or use lighter compression (coming v3.2)

### Issue: Cache doesn't seem to work

**Solution:**
Caching requires:
- Multiple similar prompts (over 50 in cache)
- 92%+ similarity threshold
- Same platform

Give it time. After Week 1, you'll see results.

### Issue: Extension keeps crashing

**Solution:**
1. Unload extension (chrome://extensions/)
2. Delete the folder
3. Re-download: https://github.com/adifydigitalnoida-del/tokenoptim
4. Reload unpacked
5. Report issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues

---

## Tutorial 8: Advanced: Custom Cache Management

### Viewing your cache
1. TokenOptim icon → Settings
2. Click "View Cache"
3. See all cached prompts + responses

### Clearing cache
1. TokenOptim icon → Settings
2. Click "Clear Cache"
3. Confirms before clearing
4. All cached data removed

### Cache size limits
Default: 4MB (you can change in Settings)
- Small cache (1MB): Faster, fewer prompts cached
- Large cache (10MB): Slower, more prompts cached

Find the balance that works for you.

---

## Video Tutorials (Coming Soon)

- 30-second install demo
- Cost savings walkthrough
- Platform comparison guide
- Semantic caching explained

Check back for videos!

---

## Need Help?

- **Installation issues?** → INSTALL.md
- **General questions?** → FAQ.md
- **Bug reports?** → https://github.com/adifydigitalnoida-del/tokenoptim/issues
- **Feature requests?** → https://github.com/adifydigitalnoida-del/tokenoptim/discussions

---

**Happy optimizing! 🚀**


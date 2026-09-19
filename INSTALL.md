# Installation Guide

## 🚀 Quick Install (30 Seconds)

### Method 1: Unpacked Load (Recommended for Testing)

1. **Download the repo**
   ```bash
   git clone https://github.com/adifydigitalnoida-del/tokenoptim.git
   cd tokenoptim-repo
   ```

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Turn on **Developer mode** (top right corner)

3. **Load Unpacked**
   - Click **Load unpacked**
   - Select the `tokenoptim-repo` folder
   - Done! ✅

**That's it. Extension is now active.**

---

## 📦 Method 2: Chrome Web Store (Coming Soon)

Once approved, you can install directly from Chrome Web Store:
- No unpacking needed
- One-click install
- Auto-updates

---

## ⚙️ First Time Setup

### Enable on Your AI Platform

1. Open an AI platform (Claude.ai, ChatGPT, etc.)
2. You'll see TokenOptim icon in Chrome toolbar
3. Click it → Dashboard opens
4. Settings available in popup

### Verify It's Working

1. Type a prompt in Claude.ai (or any AI platform)
2. Look for TokenOptim popup
3. Should show: **"X tokens, $Y.ZZ"**
4. If you see it → **Installation successful!** ✅

---

## 🛠️ Troubleshooting

### Extension Not Showing Up

**Problem:** Icon doesn't appear in toolbar
**Solution:**
1. Go to `chrome://extensions/`
2. Find "TokenOptim"
3. Toggle it **ON**
4. Refresh the AI platform tab

### Not Showing Token Counts

**Problem:** TokenOptim loaded but shows no numbers
**Solution:**
1. Refresh the page
2. Make sure you're on a supported platform (Claude, ChatGPT, etc.)
3. Check if extension is enabled (chrome://extensions/)
4. Try a different browser tab

### Crashes or Errors

**Problem:** Extension keeps crashing
**Solution:**
1. Unload extension (chrome://extensions/ → remove)
2. Delete the folder
3. Re-download and reload
4. Report bug: https://github.com/adifydigitalnoida-del/tokenoptim/issues

---

## 🔧 Advanced: Manual Installation

### For Developers

1. Clone repo:
   ```bash
   git clone https://github.com/adifydigitalnoida-del/tokenoptim.git
   ```

2. Install (if you want to modify):
   ```bash
   cd tokenoptim-repo
   npm install  # optional, we have zero deps
   ```

3. Load unpacked (see Method 1 above)

4. Make changes to:
   - `content.js` - Token counting logic
   - `popup.html/js/css` - Dashboard UI
   - `settings.html/js/css` - Settings panel

5. Reload extension (chrome://extensions/)

---

## 🌐 Supported Platforms

✅ Claude.ai
✅ ChatGPT
✅ Gemini
✅ Grok (grok.com)
✅ Kimi (kimi.ai)
✅ GLM (glm.cn)

---

## ❓ FAQ

**Q: Is it safe?**
A: Yes. All data stays local. Zero external calls. Code is open source (MIT).

**Q: Will it auto-update?**
A: Not yet (unpacked extensions don't auto-update). Check GitHub for new versions.

**Q: Does it slow down my browser?**
A: No. Minimal footprint (<5MB), optimized for speed.

**Q: Can I uninstall it?**
A: Yes. Go to chrome://extensions/ → click trash icon.

**Q: How do I report bugs?**
A: Open an issue: https://github.com/adifydigitalnoida-del/tokenoptim/issues

---

## 📞 Need Help?

- **Installation issues?** → https://github.com/adifydigitalnoida-del/tokenoptim/issues
- **Feature request?** → https://github.com/adifydigitalnoida-del/tokenoptim/discussions
- **General questions?** → GitHub Discussions: https://github.com/adifydigitalnoida-del/tokenoptim/discussions

---

**Installed? Welcome to TokenOptim!** 🎉

Next: Check out Settings to customize compression + caching preferences.


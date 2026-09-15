# Contributing to TokenOptim

## Found a Bug?

1. **Check if it's already reported** — Search existing issues
2. **Create a detailed issue** — Include:
   - Platform (Claude.ai, ChatGPT, Gemini, etc.)
   - Browser version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if helpful

## Want to Add a Feature?

1. **Open an issue first** — Discuss before coding
2. **Fork the repo** and create a feature branch
3. **Keep commits atomic** — One feature per commit
4. **Test thoroughly** — Test on all 6 platforms if possible
5. **Submit a PR** with clear description

## Development Setup

1. Clone the repo
2. Load as unpacked extension in Chrome (`chrome://extensions/`)
3. Make changes
4. Test in real Claude.ai/ChatGPT sessions
5. Check console for errors (`chrome://extensions/ → Details → Errors`)

## Code Style

- Use camelCase for functions/variables
- Add comments for complex logic
- Keep functions <50 lines
- Test DOM selectors work on actual sites

## Testing Checklist

Before submitting PR:
- [ ] No console errors
- [ ] Token counting accurate on Claude.ai
- [ ] Compression works on ChatGPT
- [ ] Settings persist across sessions
- [ ] Cache clears properly
- [ ] Export generates valid CSV

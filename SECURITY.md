# Security Policy

## Data Privacy

TokenOptim takes privacy seriously. Here's what we do:

### What We Collect
- ❌ NO personal data
- ❌ NO usage tracking
- ❌ NO analytics
- ❌ NO crash reports
- ❌ NO network calls to external servers (except the AI platforms you choose)

### What We Store
- ✅ Token counts (local browser only)
- ✅ Cached prompts (local browser only)
- ✅ Settings (local browser only)
- ✅ User preferences (local browser only)

**All data stays in your browser. All data is yours.**

### How We Verify This
The code is open source (MIT license). Read it yourself:
- content.js: All token counting happens here (no external calls)
- background.js: Service worker logic (no data transmission)
- No external dependencies (no hidden network calls)

---

## Security Best Practices

### For Users
1. **Only install from official GitHub:** https://github.com/adifydigitalnoida-del/tokenoptim
2. **Check the code:** It's open source. Review it.
3. **Report bugs immediately:** If you find a security issue, see below.
4. **Keep Chrome updated:** Security patches for Chrome itself

### For Developers
1. **No external dependencies:** Reduces attack surface
2. **Vanilla JavaScript:** No framework vulnerabilities
3. **Chrome MV3:** Modern, secure manifest version
4. **Content Security Policy:** Restricts script execution
5. **Input validation:** All user input validated

---

## Reporting Security Issues

Found a security vulnerability? **Don't open a public issue.**

### How to Report
1. Email: security@tokenoptim.dev (or reply on GitHub privately if possible)
2. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What Happens Next
1. We acknowledge receipt within 24 hours
2. We assess severity (P0/P1/P2)
3. We fix immediately (P0) or within a week (P1/P2)
4. We credit you in the release notes (if desired)
5. We release a patched version

### Responsible Disclosure
Please give us time to fix before disclosing publicly. We aim for:
- P0 (critical): Fix within 24 hours
- P1 (high): Fix within 3 days
- P2 (medium): Fix within 1 week

---

## Known Security Considerations

### 1. Local Storage
TokenOptim stores data in browser's local storage. This is encrypted by your browser, but:
- Anyone with physical access to your computer can read it
- Shared computers: Each user has separate browser profile
- Data persists until you clear browser cache

**Mitigation:** Use separate browser profiles on shared computers.

### 2. DOM Access
TokenOptim injects into AI platform websites (Claude.ai, ChatGPT, etc.). This means:
- We can see your prompts (necessary for token counting)
- We never transmit them anywhere
- Code is visible + auditable

**Mitigation:** Read the open source code. Trust is based on transparency.

### 3. API Access
TokenOptim reads responses from AI platforms' public APIs. This means:
- We see API responses (for token counting)
- We never modify responses
- We never intercept communication

**Mitigation:** HTTPS encryption on all AI platform traffic.

---

## Security Updates

### Automated Updates
TokenOptim doesn't auto-update (Chrome extensions can't do this with unpacked loads). To update:
1. Download latest version: https://github.com/adifydigitalnoida-del/tokenoptim
2. Unload old version (chrome://extensions/)
3. Load unpacked new version

### Update Notifications
Check GitHub for security updates:
- Release notes: https://github.com/adifydigitalnoida-del/tokenoptim/releases
- Security advisories: (none yet, but we'll post here)

---

## Dependencies

TokenOptim has **zero external dependencies**. All code is:
- Written by us
- Auditable (open source)
- Minimal + focused

This dramatically reduces security surface area.

---

## Compliance

### GDPR
✅ Compliant - No data collection, no transmission

### CCPA
✅ Compliant - No data collection, no selling

### SOC 2
Not applicable (no data processing/storage of PII)

---

## Questions?

Security question? Open a discussion:
https://github.com/adifydigitalnoida-del/tokenoptim/discussions

---

**Your privacy is our priority.**

Built by Arsh (adifydigitalnoida-del)
MIT License - See LICENSE file

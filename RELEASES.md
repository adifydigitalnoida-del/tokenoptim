# TokenOptim Releases

---

## v3.1.0 - Semantic Caching (Sept 25, 2026)

### 🔥 What's New
- **3-tier semantic caching system**
  - Exact hash (SHA-256): 100% savings
  - Vector similarity (cosine ≥0.92): 90% savings
  - Prefix cache (first 100 tokens): 10-20% savings

### 📊 Impact
- 40-50% of prompts cached (mature cache)
- 60-90% cost savings on cached prompts
- <100ms latency on similarity matching
- <5MB memory footprint

### 🚀 Features
- Automatic prompt similarity detection
- Smart response caching
- Cache statistics dashboard
- Auto-cleanup on storage limits

### 📝 Changes
- New file: semantic-caching-v3.1.js
- Updated content.js for caching integration
- Background.js handles cache lifecycle
- Settings: cache size configuration

### 🐛 Bug Fixes
- Fixed cache collision on old entries
- Improved embedding accuracy
- Better error handling for cache misses

---

## v3.2.0 - Pricing Dashboard (Oct 1, 2026)

### 🔥 What's New
- **Real-time pricing comparison dashboard**
  - Side-by-side platform costs
  - Weekly spending trends
  - Budget forecasting
  - "You could save X% by switching" alerts

### 📊 Features
- Multi-platform cost breakdown
- Daily/weekly/monthly statistics
- Intelligent platform recommendations
- Savings projection engine

### 💰 Insights
- See which platform is cheapest for YOUR usage
- Identify spending patterns
- Forecast monthly costs
- Compare historical trends

### 📝 Changes
- New file: pricing-dashboard.js
- Updated popup.html with dashboard tab
- New CSS: pricing-styles.css
- Enhanced settings.html

### 🎯 Use Cases
- "Should I use Grok instead of Claude?"
- "What's my average spend/day?"
- "How much can I save switching platforms?"
- "What's my projected monthly cost?"

---

## v3.3.0 - Budget Alerts (Oct 8, 2026)

### 🔥 What's New
- **Budget alerts + spending notifications**
  - 80% threshold warning
  - 90% threshold critical alert
  - Daily spending summary
  - Weekly spending report

### 🔔 Notifications
- Browser notifications on budget thresholds
- Email digest (optional, v3.4)
- In-app alerts
- Historical spending

### 📊 Analytics
- Spending by platform
- Token usage trends
- Cost per prompt analysis
- Peak usage times

### 📝 Changes
- New file: budget-alerts.js
- Updated settings.html with budget config
- New notifications.js module
- Enhanced background.js

### 🎯 Use Cases
- "Alert me when I hit $100/day"
- "Weekly spending report"
- "Show me where my money goes"
- "Predict if I'll exceed budget"

---

## v3.4.0 - Dark Mode + Export (Oct 15, 2026)

### 🔥 What's New
- **Dark mode support**
- **CSV/JSON export**
- **Multiple accounts support**
- **Custom themes**

### 🌙 Dark Mode
- Auto-detect system preference
- Manual toggle in settings
- OLED-optimized colors
- Easy on the eyes for late-night use

### 📤 Export
- CSV export (all data)
- JSON export (structured)
- Excel-ready format
- Backup capability

### 🤖 Multi-Account
- Switch between profiles
- Separate spending per account
- Independent cache per account
- Account-specific alerts

### 🎨 Themes
- Light (default)
- Dark (new)
- High contrast (accessibility)
- Custom colors (coming v3.5)

---

## v3.5.0 - AI Recommendations (Oct 22, 2026)

### 🔥 What's New
- **AI-powered recommendations**
- **Spending optimization engine**
- **Prompt efficiency scoring**
- **Savings prediction**

### 🤖 Recommendations
- "Switch this to Grok, save 40%"
- "Compress this prompt, save 25%"
- "You already cached this, reuse it"
- "GLM is perfect for this task, save 70%"

### 📈 Optimization
- Prompt efficiency score (1-100)
- Cost per token analysis
- Platform suitability ranking
- Savings opportunity detection

### 🎯 Predictions
- "You'll spend $X this month"
- "You could save $X with caching"
- "You could save $X by platform switching"
- "Best time to use which platform"

---

## Roadmap (Beyond v3.5)

### v4.0.0 - Enterprise (Jan 2027)
- Team dashboards
- Shared budgets
- Role-based access
- Audit logs
- SSO integration
- Billing integration

### v4.1.0 - API (Feb 2027)
- REST API for token counting
- Webhook support
- Bulk operations
- Rate limiting

### v4.2.0 - Mobile (Mar 2027)
- Mobile app
- iOS support
- Android support
- Synced data across devices

---

## Release Schedule

| Version | Date | Focus |
|---------|------|-------|
| v3.0 | Sept 18 | Token counting |
| v3.1 | Sept 25 | Semantic caching |
| v3.2 | Oct 1 | Pricing dashboard |
| v3.3 | Oct 8 | Budget alerts |
| v3.4 | Oct 15 | Dark mode + export |
| v3.5 | Oct 22 | AI recommendations |
| v4.0 | Jan 2027 | Enterprise |

**Weekly releases every Friday (forever)**

---

## How to Update

1. Go to: https://github.com/adifydigitalnoida-del/tokenoptim/releases
2. Download latest version
3. Unload old version (chrome://extensions/)
4. Load unpacked new version
5. Done!

---

**Every release makes TokenOptim better.** 🚀


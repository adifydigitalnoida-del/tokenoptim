/**
 * TokenOptim v3.4 - Advanced Analytics Module
 * Provides detailed analytics dashboard with trends and comparisons
 * Production-ready, no external dependencies
 */

class TokenOptimAnalytics {
  /**
   * Calculate daily savings trend over last N days
   * @param {Array} data - Token entries
   * @param {number} days - Number of days to analyze (default: 30)
   * @returns {Array} Daily savings data
   */
  static calculateSavingsOverTime(data, days = 30) {
    if (!data || data.length === 0) {
      return [];
    }

    const dailyData = {};
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Initialize days
    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * dayMs).toISOString().split('T')[0];
      dailyData[date] = { cost: 0, cached: 0, total: 0 };
    }

    // Aggregate data by day
    data.forEach(entry => {
      const date = new Date(entry.timestamp || Date.now()).toISOString().split('T')[0];
      if (dailyData[date]) {
        dailyData[date].cost += entry.cost || 0;
        if (entry.cached) dailyData[date].cached++;
        dailyData[date].total++;
      }
    });

    // Convert to array and sort
    return Object.entries(dailyData)
      .map(([date, stats]) => ({
        date,
        cost: Number(stats.cost.toFixed(4)),
        cached_count: stats.cached,
        total_count: stats.total,
        cache_hit_rate: `${((stats.cached / stats.total) * 100 || 0).toFixed(2)}%`
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get platform usage breakdown
   * @param {Array} data - Token entries
   * @returns {Object} Platform statistics
   */
  static getPlatformBreakdown(data) {
    if (!data || data.length === 0) {
      return {};
    }

    const platforms = {};
    const totalEntries = data.length;

    data.forEach(entry => {
      const platform = entry.platform || 'Unknown';
      if (!platforms[platform]) {
        platforms[platform] = {
          count: 0,
          input_tokens: 0,
          output_tokens: 0,
          cost: 0,
          cached: 0,
          avg_cost: 0
        };
      }

      platforms[platform].count++;
      platforms[platform].input_tokens += entry.input_tokens || 0;
      platforms[platform].output_tokens += entry.output_tokens || 0;
      platforms[platform].cost += entry.cost || 0;
      if (entry.cached) platforms[platform].cached++;
    });

    // Calculate percentages and average costs
    Object.keys(platforms).forEach(platform => {
      const p = platforms[platform];
      p.cost = Number(p.cost.toFixed(4));
      p.avg_cost = Number((p.cost / p.count).toFixed(4));
      p.percentage = Number(((p.count / totalEntries) * 100).toFixed(2));
      p.cache_hit_rate = Number(((p.cached / p.count) * 100).toFixed(2));
    });

    return platforms;
  }

  /**
   * Calculate caching efficiency statistics
   * @param {Array} data - Token entries
   * @returns {Object} Caching statistics
   */
  static getCachingStats(data) {
    if (!data || data.length === 0) {
      return {
        total_requests: 0,
        cached_requests: 0,
        cache_hit_rate: 0,
        estimated_savings: 0
      };
    }

    const cachedRequests = data.filter(e => e.cached).length;
    const totalRequests = data.length;
    const hitRate = (cachedRequests / totalRequests) * 100;
    
    // Calculate estimated savings from cached responses
    const cachedData = data.filter(e => e.cached);
    const estimatedSavings = cachedData.reduce((sum, e) => sum + (e.cost || 0), 0);

    const avgSimilarity = data.reduce((sum, e) => sum + (e.similarity || 0), 0) / data.length;

    return {
      total_requests: totalRequests,
      cached_requests: cachedRequests,
      cache_hit_rate: Number(hitRate.toFixed(2)),
      average_similarity_score: Number(avgSimilarity.toFixed(4)),
      estimated_savings: Number(estimatedSavings.toFixed(4)),
      savings_percentage: Number(((estimatedSavings / data.reduce((sum, e) => sum + (e.cost || 0), 0)) * 100).toFixed(2))
    };
  }

  /**
   * Generate analytics display HTML
   * @param {Array} data - Token entries
   * @returns {string} HTML dashboard
   */
  static generateAnalyticsDisplay(data) {
    const platformBreakdown = this.getPlatformBreakdown(data);
    const cachingStats = this.getCachingStats(data);
    const savingsTrend = this.calculateSavingsOverTime(data, 7);

    const totalCost = data.reduce((sum, e) => sum + (e.cost || 0), 0);
    const avgCostPerPrompt = totalCost / data.length;
    const projectedMonthlySavings = cachingStats.estimated_savings * 30;

    const html = `
      <div class="analytics-dashboard">
        <h2>TokenOptim Analytics</h2>
        
        <!-- Key Metrics -->
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-label">Total Tokens</div>
            <div class="metric-value">${data.reduce((sum, e) => sum + (e.input_tokens || 0) + (e.output_tokens || 0), 0).toLocaleString()}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Total Cost</div>
            <div class="metric-value">$${totalCost.toFixed(4)}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Cache Hit Rate</div>
            <div class="metric-value">${cachingStats.cache_hit_rate}%</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Monthly Projection</div>
            <div class="metric-value">$${projectedMonthlySavings.toFixed(2)}</div>
          </div>
        </div>

        <!-- Platform Breakdown -->
        <div class="section">
          <h3>Platform Usage</h3>
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Requests</th>
                <th>Usage %</th>
                <th>Total Cost</th>
                <th>Avg Cost</th>
                <th>Cache Hit %</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(platformBreakdown).map(([platform, stats]) => `
                <tr>
                  <td>${platform}</td>
                  <td>${stats.count}</td>
                  <td>${stats.percentage}%</td>
                  <td>$${stats.cost.toFixed(4)}</td>
                  <td>$${stats.avg_cost.toFixed(6)}</td>
                  <td>${stats.cache_hit_rate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 7-Day Trend -->
        <div class="section">
          <h3>7-Day Cost Trend</h3>
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cost</th>
                <th>Requests</th>
                <th>Cached</th>
                <th>Hit Rate</th>
              </tr>
            </thead>
            <tbody>
              ${savingsTrend.map(day => `
                <tr>
                  <td>${day.date}</td>
                  <td>$${day.cost.toFixed(4)}</td>
                  <td>${day.total_count}</td>
                  <td>${day.cached_count}</td>
                  <td>${day.cache_hit_rate}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Caching Summary -->
        <div class="section">
          <h3>Caching Efficiency</h3>
          <div class="metrics-row">
            <div class="metric-card">
              <div class="metric-label">Cached Responses</div>
              <div class="metric-value">${cachingStats.cached_requests}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Avg Similarity</div>
              <div class="metric-value">${(cachingStats.average_similarity_score * 100).toFixed(1)}%</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Savings from Cache</div>
              <div class="metric-value">$${cachingStats.estimated_savings.toFixed(4)}</div>
            </div>
            
            <div class="metric-card">
              <div class="metric-label">Savings %</div>
              <div class="metric-value">${cachingStats.savings_percentage}%</div>
            </div>
          </div>
        </div>

        <style>
          .analytics-dashboard {
            padding: 16px;
            background-color: var(--bg-primary);
            color: var(--text-primary);
          }
          
          .section {
            margin: 24px 0;
            padding: 16px;
            background-color: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }
          
          .analytics-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          
          .analytics-table th {
            background-color: var(--bg-secondary);
            padding: 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid var(--border-color);
          }
          
          .analytics-table td {
            padding: 8px;
            border-bottom: 1px solid var(--border-color);
          }
        </style>
      </div>
    `;

    return html;
  }

  /**
   * Export analytics summary as JSON
   * @param {Array} data - Token entries
   * @returns {Object} Complete analytics summary
   */
  static exportAnalytics(data) {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total_entries: data.length,
        total_tokens: data.reduce((sum, e) => sum + (e.input_tokens || 0) + (e.output_tokens || 0), 0),
        total_cost: Number(data.reduce((sum, e) => sum + (e.cost || 0), 0).toFixed(4))
      },
      platforms: this.getPlatformBreakdown(data),
      caching: this.getCachingStats(data),
      trends: this.calculateSavingsOverTime(data, 30)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimAnalytics;
}

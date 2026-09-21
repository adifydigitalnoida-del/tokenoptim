/**
 * TokenOptim v3.4 - Data Export Module
 * Export token counts, costs, and savings as CSV or JSON
 * Production-ready, no dependencies
 */

class TokenOptimExport {
  /**
   * Generate CSV string from token data
   * @param {Array} data - Array of token entries
   * @returns {string} CSV formatted data
   */
  static generateCSV(data) {
    if (!data || data.length === 0) {
      return 'No data to export';
    }

    // CSV headers
    const headers = ['Date', 'Platform', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost ($)', 'Cached Response', 'Similarity Score'];
    
    // CSV rows
    const rows = data.map(entry => [
      new Date(entry.timestamp || Date.now()).toLocaleDateString(),
      entry.platform || 'Unknown',
      entry.input_tokens || 0,
      entry.output_tokens || 0,
      (entry.input_tokens || 0) + (entry.output_tokens || 0),
      (entry.cost || 0).toFixed(4),
      entry.cached ? 'Yes' : 'No',
      entry.similarity ? (entry.similarity * 100).toFixed(2) + '%' : 'N/A'
    ]);

    // Calculate totals
    const totals = {
      input: data.reduce((sum, e) => sum + (e.input_tokens || 0), 0),
      output: data.reduce((sum, e) => sum + (e.output_tokens || 0), 0),
      cost: data.reduce((sum, e) => sum + (e.cost || 0), 0),
      cached: data.filter(e => e.cached).length
    };

    // Summary row
    rows.push([
      'TOTAL',
      '',
      totals.input,
      totals.output,
      totals.input + totals.output,
      totals.cost.toFixed(4),
      `${totals.cached} cached`,
      ''
    ]);

    // Convert to CSV string
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Generate JSON object from token data
   * @param {Array} data - Array of token entries
   * @returns {string} JSON formatted data
   */
  static generateJSON(data) {
    if (!data || data.length === 0) {
      return JSON.stringify({ entries: [], summary: {} });
    }

    // Calculate summary statistics
    const summary = {
      total_entries: data.length,
      date_range: {
        start: new Date(Math.min(...data.map(e => e.timestamp || Date.now()))).toISOString(),
        end: new Date(Math.max(...data.map(e => e.timestamp || Date.now()))).toISOString()
      },
      tokens: {
        total_input: data.reduce((sum, e) => sum + (e.input_tokens || 0), 0),
        total_output: data.reduce((sum, e) => sum + (e.output_tokens || 0), 0),
        total: data.reduce((sum, e) => sum + (e.input_tokens || 0) + (e.output_tokens || 0), 0),
        average_input: Math.round(data.reduce((sum, e) => sum + (e.input_tokens || 0), 0) / data.length),
        average_output: Math.round(data.reduce((sum, e) => sum + (e.output_tokens || 0), 0) / data.length)
      },
      cost: {
        total: Number(data.reduce((sum, e) => sum + (e.cost || 0), 0).toFixed(4)),
        average: Number((data.reduce((sum, e) => sum + (e.cost || 0), 0) / data.length).toFixed(4))
      },
      caching: {
        cached_responses: data.filter(e => e.cached).length,
        cache_hit_rate: Number(((data.filter(e => e.cached).length / data.length) * 100).toFixed(2)) + '%',
        average_similarity: Number((data.reduce((sum, e) => sum + (e.similarity || 0), 0) / data.length).toFixed(4))
      },
      by_platform: this._groupByPlatform(data)
    };

    return JSON.stringify({ entries: data, summary }, null, 2);
  }

  /**
   * Group and summarize data by platform
   * @private
   */
  static _groupByPlatform(data) {
    const grouped = {};

    data.forEach(entry => {
      const platform = entry.platform || 'Unknown';
      if (!grouped[platform]) {
        grouped[platform] = {
          count: 0,
          input_tokens: 0,
          output_tokens: 0,
          cost: 0,
          cached_count: 0
        };
      }

      grouped[platform].count++;
      grouped[platform].input_tokens += entry.input_tokens || 0;
      grouped[platform].output_tokens += entry.output_tokens || 0;
      grouped[platform].cost += entry.cost || 0;
      if (entry.cached) grouped[platform].cached_count++;
    });

    // Format with percentages
    Object.keys(grouped).forEach(platform => {
      grouped[platform].cost = Number(grouped[platform].cost.toFixed(4));
      grouped[platform].cache_hit_rate = Number(((grouped[platform].cached_count / grouped[platform].count) * 100).toFixed(2)) + '%';
    });

    return grouped;
  }

  /**
   * Trigger browser download of file
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} type - MIME type
   */
  static downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Main export function - triggers download based on format
   * @param {Array} data - Token entries to export
   * @param {string} format - 'csv' or 'json'
   * @param {string} filename - Optional custom filename
   */
  static async exportData(data, format = 'csv', filename = null) {
    try {
      let content, fileType, defaultFilename;

      if (format === 'json') {
        content = this.generateJSON(data);
        fileType = 'application/json';
        defaultFilename = filename || `tokenoptim-data-${new Date().toISOString().split('T')[0]}.json`;
      } else if (format === 'csv') {
        content = this.generateCSV(data);
        fileType = 'text/csv;charset=utf-8;';
        defaultFilename = filename || `tokenoptim-data-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      this.downloadFile(content, defaultFilename, fileType);
      
      // Log export event
      console.log(`✅ Exported ${data.length} entries as ${format.toUpperCase()}`);
      
      return {
        success: true,
        format,
        count: data.length,
        filename: defaultFilename
      };
    } catch (error) {
      console.error('❌ Export error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get export statistics
   * @param {Array} data - Token entries
   * @returns {Object} Statistics object
   */
  static getStatistics(data) {
    if (!data || data.length === 0) {
      return {
        entries: 0,
        total_tokens: 0,
        total_cost: 0,
        cache_hit_rate: '0%'
      };
    }

    const totalTokens = data.reduce((sum, e) => sum + (e.input_tokens || 0) + (e.output_tokens || 0), 0);
    const totalCost = data.reduce((sum, e) => sum + (e.cost || 0), 0);
    const cacheHits = data.filter(e => e.cached).length;

    return {
      entries: data.length,
      total_tokens: totalTokens,
      total_cost: Number(totalCost.toFixed(4)),
      cache_hit_rate: `${((cacheHits / data.length) * 100).toFixed(2)}%`,
      estimated_monthly_savings: Number((totalCost * 30).toFixed(2))
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimExport;
}

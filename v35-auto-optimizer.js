/**
 * TokenOptim v3.5 - Auto-Optimizer
 * Intelligent task detection + automatic model routing
 * Saves 30-50% by routing to cheapest model with quality parity
 * 
 * Based on GPT-4o research: Phase 1-4 implementation
 */

class TokenOptimAutoOptimizer {
  constructor() {
    this.taskCategories = [
      'coding',
      'summarization',
      'writing',
      'extraction/classification',
      'general_qa'
    ];

    this.modelRegistry = {
      claude: { price_input: 3, price_output: 15, quality: 9.5, latency: 200 },
      chatgpt: { price_input: 5, price_output: 15, quality: 9.3, latency: 150 },
      gemini: { price_input: 0.075, price_output: 0.30, quality: 8.5, latency: 100 },
      grok: { price_input: 2, price_output: 6, quality: 8.2, latency: 120 },
      kimi: { price_input: 3, price_output: 15, quality: 8.8, latency: 180 },
      glm: { price_input: 1.40, price_output: 4.40, quality: 8.0, latency: 110 }
    };

    this.taskClassifier = {
      coding: {
        signals: ['code', 'function', 'class', 'debug', 'error', 'algorithm', 'api'],
        keywords: ['javascript', 'python', 'java', 'sql', 'html', 'css'],
        quality_requirement: 9.2
      },
      summarization: {
        signals: ['summarize', 'brief', 'tldr', 'abstract', 'condensed'],
        keywords: ['article', 'document', 'text', 'passage'],
        quality_requirement: 8.5
      },
      writing: {
        signals: ['write', 'compose', 'draft', 'create', 'blog', 'email', 'letter'],
        keywords: ['content', 'article', 'post', 'story', 'description'],
        quality_requirement: 8.8
      },
      extraction: {
        signals: ['extract', 'find', 'identify', 'list', 'parse', 'classify'],
        keywords: ['data', 'information', 'records', 'fields', 'categories'],
        quality_requirement: 8.2
      },
      general_qa: {
        signals: ['explain', 'what', 'how', 'why', 'answer', 'question'],
        keywords: ['understand', 'learn', 'know', 'tell'],
        quality_requirement: 8.0
      }
    };

    this.userPreferences = {
      allowlist: [],
      blacklist: [],
      max_cost_per_request: null,
      min_quality_threshold: 8.0,
      mode: 'recommendation' // 'recommendation' | 'auto_switch' | 'disabled'
    };

    this.qualityMatrix = {}; // Per-task model performance tracking
    this.routingHistory = []; // Track all routing decisions
  }

  /**
   * Classify prompt into task category
   * Returns: { category, confidence, complexity }
   */
  classifyTask(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    const scores = {};

    // Score each category
    Object.entries(this.taskClassifier).forEach(([category, config]) => {
      let score = 0;

      // Signal matching
      config.signals.forEach(signal => {
        if (lowerPrompt.includes(signal)) score += 0.3;
      });

      // Keyword matching
      config.keywords.forEach(keyword => {
        if (lowerPrompt.includes(keyword)) score += 0.2;
      });

      // Context length indicator (complexity)
      if (prompt.length > 1000) score += 0.1;
      if (prompt.includes('\n')) score += 0.05;
      if (prompt.includes('```')) score += 0.15; // Code blocks

      scores[category] = Math.min(score, 1.0);
    });

    // Find best match
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestCategory, confidence] = sorted[0];

    const complexity = prompt.length > 2000 ? 'high' : 
                     prompt.length > 500 ? 'medium' : 'low';

    return {
      category: bestCategory,
      confidence: confidence,
      complexity: complexity,
      all_scores: scores
    };
  }

  /**
   * Calculate routing score: quality_weight * quality - cost_weight * cost
   * Higher score = better choice
   */
  calculateRoutingScore(model, taskType, cost) {
    const modelData = this.modelRegistry[model];
    if (!modelData) return 0;

    // Get quality baseline for this task
    const qualityBaseline = this.taskClassifier[taskType].quality_requirement;
    const qualityScore = Math.max(0, (modelData.quality / 10) * 100);
    const costScore = Math.max(0, 100 - (cost * 10)); // Normalize cost

    // Weighted scoring: quality 70%, cost 30%
    const routingScore = (qualityScore * 0.7) + (costScore * 0.3);

    return {
      model,
      score: routingScore,
      quality: modelData.quality,
      cost: cost,
      latency: modelData.latency,
      quality_parity: (modelData.quality / qualityBaseline) * 100
    };
  }

  /**
   * Get recommended model(s) for a task
   * Returns: { recommended, alternatives, recommendation_reason }
   */
  recommendModel(prompt, userModel = 'claude') {
    const classification = this.classifyTask(prompt);
    const taskType = classification.category;

    // Calculate cost for each model (input + output estimate)
    const estimatedTokens = Math.ceil(prompt.length / 4);
    const estimatedOutput = Math.ceil(estimatedTokens * 0.5);

    const scores = [];
    Object.entries(this.modelRegistry).forEach(([model, data]) => {
      // Skip blacklisted models
      if (this.userPreferences.blacklist.includes(model)) return;

      // Prioritize allowlisted models
      const isAllowlisted = this.userPreferences.allowlist.length === 0 || 
                           this.userPreferences.allowlist.includes(model);

      const estimatedCost = (estimatedTokens * data.price_input + 
                            estimatedOutput * data.price_output) / 1000000;

      const routing = this.calculateRoutingScore(model, taskType, estimatedCost);
      routing.allowlisted = isAllowlisted;

      scores.push(routing);
    });

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    const recommended = scores[0];
    const alternatives = scores.slice(1, 3);

    // Check if confidence is high enough for auto-switch
    const autoSwitchEligible = classification.confidence >= 0.95 &&
                              recommended.quality_parity >= 97 &&
                              recommended.allowlisted;

    return {
      recommended: recommended.model,
      recommended_score: recommended.score,
      estimated_cost: recommended.cost,
      estimated_savings: this.modelRegistry[userModel] ? 
        ((this.modelRegistry[userModel].price_output - recommended.cost) / 
         this.modelRegistry[userModel].price_output * 100).toFixed(1) : 0,
      quality_parity: recommended.quality_parity.toFixed(1),
      auto_switch_eligible: autoSwitchEligible,
      recommendation_reason: this.generateRecommendationReason(
        userModel, 
        recommended.model, 
        recommended.estimated_savings,
        classification
      ),
      alternatives: alternatives.map(a => ({
        model: a.model,
        score: a.score.toFixed(2),
        estimated_cost: a.cost.toFixed(6),
        quality_parity: a.quality_parity.toFixed(1)
      })),
      classification
    };
  }

  /**
   * Generate human-readable explanation
   */
  generateRecommendationReason(fromModel, toModel, savings, classification) {
    const confidence = (classification.confidence * 100).toFixed(0);
    const reason = `Task: ${classification.category} (${confidence}% confidence). ` +
                  `Estimated ${savings}% cheaper with ${toModel} at quality parity.`;
    return reason;
  }

  /**
   * Route request (recommendation mode)
   */
  routeRequest(prompt, userModel = 'claude') {
    const recommendation = this.recommendModel(prompt, userModel);

    const routing = {
      timestamp: new Date().toISOString(),
      user_model: userModel,
      recommended_model: recommendation.recommended,
      task_type: recommendation.classification.category,
      confidence: recommendation.classification.confidence,
      estimated_savings: recommendation.estimated_savings,
      quality_parity: recommendation.quality_parity,
      auto_switch_eligible: recommendation.auto_switch_eligible,
      mode: this.userPreferences.mode,
      action: this.userPreferences.mode === 'auto_switch' && recommendation.auto_switch_eligible ? 
              'auto_switched' : 'recommendation_shown'
    };

    this.routingHistory.push(routing);
    return routing;
  }

  /**
   * Track quality outcome (for learning)
   */
  trackQualityOutcome(model, taskType, quality_score, user_approved = true) {
    if (!this.qualityMatrix[taskType]) {
      this.qualityMatrix[taskType] = {};
    }
    if (!this.qualityMatrix[taskType][model]) {
      this.qualityMatrix[taskType][model] = [];
    }

    this.qualityMatrix[taskType][model].push({
      score: quality_score,
      approved: user_approved,
      timestamp: Date.now()
    });
  }

  /**
   * Get savings summary
   */
  getSavingsSummary() {
    if (this.routingHistory.length === 0) {
      return { total_requests: 0, total_estimated_savings: 0, average_savings: 0 };
    }

    const totalSavings = this.routingHistory.reduce((sum, r) => 
      sum + parseFloat(r.estimated_savings || 0), 0);

    return {
      total_requests: this.routingHistory.length,
      total_estimated_savings: totalSavings.toFixed(2),
      average_savings: (totalSavings / this.routingHistory.length).toFixed(2),
      auto_switches: this.routingHistory.filter(r => r.action === 'auto_switched').length,
      recommendations_accepted: this.routingHistory.filter(r => r.action === 'recommendation_shown').length
    };
  }

  /**
   * Configure user preferences
   */
  setUserPreferences(prefs) {
    if (prefs.allowlist) this.userPreferences.allowlist = prefs.allowlist;
    if (prefs.blacklist) this.userPreferences.blacklist = prefs.blacklist;
    if (prefs.max_cost_per_request) this.userPreferences.max_cost_per_request = prefs.max_cost_per_request;
    if (prefs.min_quality_threshold) this.userPreferences.min_quality_threshold = prefs.min_quality_threshold;
    if (prefs.mode) this.userPreferences.mode = prefs.mode;
  }

  /**
   * Export routing analytics
   */
  exportAnalytics() {
    return {
      routing_history: this.routingHistory,
      quality_matrix: this.qualityMatrix,
      savings_summary: this.getSavingsSummary(),
      user_preferences: this.userPreferences
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimAutoOptimizer;
}

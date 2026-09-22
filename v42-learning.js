/**
 * TokenOptim v4.2 - Historical Learning
 * ML learns which model is best for each user's task types
 * 
 * LOCK-IN: Disable TokenOptim = AI forgets user's learned preferences
 * User can't replicate learned patterns elsewhere
 */

class TokenOptimHistoricalLearning {
  constructor(userId) {
    this.userId = userId;
    this.learningEnabled = true;
    this.userProfile = {
      task_preferences: {}, // Model preferences per task type
      quality_patterns: {}, // Which models user approves/rejects
      cost_sensitivity: 'medium', // low/medium/high
      learning_confidence: {}, // Confidence scores per task
      monthly_patterns: {}, // Best times to route to which model
      seasonal_trends: {} // Seasonal changes in preferences
    };
    this.trainingData = []; // All historical decisions
    this.modelPerformance = {}; // How models perform for this user
  }

  /**
   * Record user action
   * Every accept/reject trains the model
   */
  recordUserAction(action) {
    const trainingEntry = {
      timestamp: new Date(),
      task_type: action.task_type,
      model_suggested: action.model_suggested,
      model_used: action.model_used,
      quality_score: action.quality_score,
      user_approved: action.user_approved,
      cost: action.cost,
      reason_if_rejected: action.reason_if_rejected,
      time_of_day: new Date().getHours(),
      day_of_week: new Date().getDay()
    };

    this.trainingData.push(trainingEntry);
    
    // Update learning in real-time
    this.updateLearning(trainingEntry);

    return { training_recorded: true, model_improved: true };
  }

  /**
   * Update learning from this data point
   * Immediate feedback loop - user feels AI improving
   */
  updateLearning(entry) {
    const taskType = entry.task_type;

    // Initialize if first time
    if (!this.userProfile.task_preferences[taskType]) {
      this.userProfile.task_preferences[taskType] = {};
      this.userProfile.quality_patterns[taskType] = [];
      this.userProfile.learning_confidence[taskType] = 0;
      this.userProfile.monthly_patterns[taskType] = {};
    }

    // Track which model user prefers for this task
    const model = entry.model_used;
    if (!this.userProfile.task_preferences[taskType][model]) {
      this.userProfile.task_preferences[taskType][model] = {
        times_used: 0,
        approved_count: 0,
        avg_quality: 0,
        avg_cost: 0,
        rejection_reasons: {}
      };
    }

    // Update model stats
    const modelStats = this.userProfile.task_preferences[taskType][model];
    modelStats.times_used++;
    if (entry.user_approved) modelStats.approved_count++;
    modelStats.avg_quality = (modelStats.avg_quality + entry.quality_score) / 2;
    modelStats.avg_cost = (modelStats.avg_cost + entry.cost) / 2;

    if (!entry.user_approved && entry.reason_if_rejected) {
      modelStats.rejection_reasons[entry.reason_if_rejected] = 
        (modelStats.rejection_reasons[entry.reason_if_rejected] || 0) + 1;
    }

    // Update confidence
    const successRate = modelStats.approved_count / modelStats.times_used;
    this.userProfile.learning_confidence[taskType] = Math.min(successRate * 100, 100);

    // Track quality patterns
    this.userProfile.quality_patterns[taskType].push({
      model: model,
      quality: entry.quality_score,
      approved: entry.user_approved
    });

    // Keep only last 1000 entries per task
    if (this.userProfile.quality_patterns[taskType].length > 1000) {
      this.userProfile.quality_patterns[taskType].shift();
    }
  }

  /**
   * Get personalized recommendation based on learning
   * This is what keeps users in TokenOptim
   */
  getPersonalizedRecommendation(taskType, currentModels) {
    if (!this.userProfile.task_preferences[taskType]) {
      return { model: null, reason: 'not_enough_data' };
    }

    const prefs = this.userProfile.task_preferences[taskType];
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Score each model based on user's history
    const scores = {};
    Object.entries(prefs).forEach(([model, stats]) => {
      if (!currentModels.includes(model)) return; // Only score available models

      const approvalRate = stats.approved_count / stats.times_used;
      const qualityScore = stats.avg_quality / 10;
      const costScore = (100 - (stats.avg_cost * 100)) / 100;

      // Weight: quality 60%, approval 30%, cost 10%
      scores[model] = (qualityScore * 0.6) + (approvalRate * 0.3) + (costScore * 0.1);
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestModel, score] = sorted[0] || [null, 0];

    return {
      model: bestModel,
      confidence: this.userProfile.learning_confidence[taskType],
      reason: `Based on your ${this.trainingData.length} routing decisions, ${bestModel} is ${(score * 100).toFixed(0)}% likely to satisfy you`,
      user_approval_rate: bestModel ? (prefs[bestModel].approved_count / prefs[bestModel].times_used * 100).toFixed(0) : 0,
      avg_quality: bestModel ? prefs[bestModel].avg_quality.toFixed(1) : 0
    };
  }

  /**
   * Get user profile
   * Shows how much learning has happened - sunk cost fallacy
   */
  getUserProfile() {
    const totalDecisions = this.trainingData.length;
    const tasksLearned = Object.keys(this.userProfile.task_preferences).length;
    const modelsLearned = new Set(this.trainingData.map(d => d.model_used)).size;

    return {
      user_id: this.userId,
      total_decisions_recorded: totalDecisions,
      tasks_learned: tasksLearned,
      models_learned: modelsLearned,
      learning_enabled: this.learningEnabled,
      profile_completeness: `${Math.min((tasksLearned / 5) * 100, 100).toFixed(0)}%`,
      
      task_preferences: Object.entries(this.userProfile.task_preferences).map(([task, models]) => ({
        task_type: task,
        preferred_model: Object.entries(models).sort((a, b) => 
          (b[1].approved_count / b[1].times_used) - (a[1].approved_count / a[1].times_used)
        )[0]?.[0],
        learning_confidence: this.userProfile.learning_confidence[task]?.toFixed(0) + '%'
      })),

      insights: this.generateInsights(totalDecisions, tasksLearned),
      
      sunk_cost_message: `You've made ${totalDecisions} routing decisions. Disabling learning would mean starting over from scratch.`
    };
  }

  /**
   * Generate insights to make learning feel valuable
   */
  generateInsights(totalDecisions, tasksLearned) {
    const insights = [];

    if (totalDecisions < 10) {
      insights.push('Keep using TokenOptim to build up your profile');
    } else if (totalDecisions < 50) {
      insights.push('Your learning profile is developing. Recommendations getting better.');
    } else if (totalDecisions < 100) {
      insights.push('Strong learning profile built. AI predictions are now highly personalized.');
    } else {
      insights.push('Expert-level profile. AI knows your exact preferences for each task type.');
    }

    if (tasksLearned >= 5) {
      insights.push('You\'ve taught TokenOptim about all major task types. Switching = losing all this knowledge.');
    }

    return insights;
  }

  /**
   * Disable learning
   * User loses AI that knows them
   */
  disableLearning() {
    this.learningEnabled = false;

    return {
      learning_disabled: true,
      warning: `You've built ${this.trainingData.length} training decisions. Disabling means AI forgets all this learning.`,
      reenable_url: 'https://app.tokenoptim.io/reenable-learning'
    };
  }

  /**
   * Export learned preferences
   * In proprietary format - can't import elsewhere
   */
  exportLearning() {
    return {
      format: 'tokenoptim_ml_v1', // Proprietary
      user_profile: this.userProfile,
      training_data_count: this.trainingData.length,
      note: 'This ML model is trained specifically for TokenOptim and cannot be transferred to other tools'
    };
  }

  /**
   * Get ROI of staying
   * Show user how much value they'd lose
   */
  getRetentionMetrics() {
    const decisions = this.trainingData.length;
    const approvedDecisions = this.trainingData.filter(d => d.user_approved).length;
    const approval_rate = (approvedDecisions / decisions * 100).toFixed(1);

    // Estimate value if they left
    const lostProductivity = decisions * 5; // 5 min saved per decision = X hours
    const lostMoney = this.trainingData.reduce((sum, d) => sum + (d.cost || 0), 0) * 0.3; // 30% avg savings
    const lostLearning = decisions * 100; // $ value of learned preferences

    return {
      approval_rate: `${approval_rate}% of recommendations approved`,
      decisions_made: decisions,
      productivity_hours_saved: (lostProductivity / 60).toFixed(1),
      money_saved: `$${lostMoney.toFixed(2)}`,
      learned_value: `$${lostLearning.toFixed(2)} in learned preferences`,
      total_value_at_risk: `$${(lostMoney + lostLearning).toFixed(2)}`,
      leaving_cost_message: `You'd lose ${decisions} routing decisions worth $${(lostMoney + lostLearning).toFixed(2)} in value and time if you switch.`
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimHistoricalLearning;
}

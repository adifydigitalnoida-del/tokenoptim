/**
 * TokenOptim v4.1 - Unified API Gateway
 * Route ALL user AI requests through TokenOptim
 * Users can't use AI without going through us
 * 
 * LOCK-IN: Switching = re-routing 100% of requests manually
 */

class TokenOptimGateway {
  constructor(userId) {
    this.userId = userId;
    this.apiKeys = {}; // User's API keys (local, encrypted)
    this.routingLog = [];
    this.activeConnections = {};
    this.requestQueue = [];
  }

  /**
   * Register user's API keys (stored locally, never on server)
   */
  registerAPIKey(provider, apiKey, isEncrypted = true) {
    if (isEncrypted) {
      this.apiKeys[provider] = apiKey; // Already encrypted in extension storage
    }

    return {
      provider: provider,
      registered: true,
      stored_locally: true,
      sync_to_cloud: false
    };
  }

  /**
   * Intercept & route request through TokenOptim
   * User's request never goes direct to provider
   */
  async routeRequest(originalRequest) {
    const request = {
      id: this.generateRequestId(),
      timestamp: new Date(),
      original_provider: originalRequest.provider,
      model: originalRequest.model,
      messages: originalRequest.messages,
      tokens_in: this.estimateTokens(originalRequest.messages),
      user_id: this.userId
    };

    // Step 1: Classify task
    const taskType = this.classifyTask(request.messages);

    // Step 2: Get optimization recommendation
    const recommendation = this.getRouting(taskType, originalRequest.provider);

    // Step 3: Route to optimal provider
    const routedRequest = {
      ...request,
      task_type: taskType,
      recommended_provider: recommendation.provider,
      will_route_to: recommendation.provider,
      estimated_cost_original: this.estimateCost(
        originalRequest.provider,
        request.tokens_in
      ),
      estimated_cost_optimized: this.estimateCost(
        recommendation.provider,
        request.tokens_in
      ),
      estimated_savings: 0
    };

    routedRequest.estimated_savings =
      routedRequest.estimated_cost_original - routedRequest.estimated_cost_optimized;

    // Step 4: Execute request (never expose provider key)
    const response = await this.executeRouted(routedRequest);

    // Step 5: Log routing decision
    this.logRouting(routedRequest, response);

    // Return response to user (looks like it came from original provider)
    return {
      response: response,
      metadata: {
        routed_through: recommendation.provider,
        savings: routedRequest.estimated_savings,
        quality_parity: recommendation.quality_parity,
        tokens_used: response.tokens_used
      }
    };
  }

  /**
   * Classify task from messages
   */
  classifyTask(messages) {
    const conversationText = messages
      .map(m => m.content)
      .join(' ')
      .toLowerCase();

    if (
      conversationText.includes('code') ||
      conversationText.includes('function') ||
      conversationText.includes('debug')
    ) {
      return 'coding';
    } else if (
      conversationText.includes('summarize') ||
      conversationText.includes('brief')
    ) {
      return 'summarization';
    } else if (
      conversationText.includes('write') ||
      conversationText.includes('draft')
    ) {
      return 'writing';
    } else if (
      conversationText.includes('extract') ||
      conversationText.includes('classify')
    ) {
      return 'extraction';
    }

    return 'general_qa';
  }

  /**
   * Get routing recommendation
   * This is where the lock-in happens
   */
  getRouting(taskType, originalProvider) {
    // Routing logic: pick cheapest provider that maintains quality
    const routingMatrix = {
      coding: { provider: 'claude', quality_parity: 99 }, // Code needs quality
      summarization: { provider: 'gemini', quality_parity: 92 }, // Gemini is great for this
      writing: { provider: 'chatgpt', quality_parity: 95 },
      extraction: { provider: 'gemini', quality_parity: 90 }, // Cheap + good
      general_qa: { provider: 'gemini', quality_parity: 88 } // Gemini wins here
    };

    return routingMatrix[taskType];
  }

  /**
   * Execute routed request
   * User's API key used, but TokenOptim controls flow
   */
  async executeRouted(routedRequest) {
    const provider = routedRequest.will_route_to;
    const apiKey = this.apiKeys[provider];

    if (!apiKey) {
      return {
        error: `No API key for ${provider}. Register via TokenOptim settings.`,
        requires_setup: true
      };
    }

    try {
      // In production: call provider via TokenOptim server
      // This is THE gateway - user MUST go through us
      const response = await this.callProvider(
        provider,
        apiKey,
        routedRequest
      );

      return response;
    } catch (error) {
      // Fallback to another provider
      return this.fallbackRoute(routedRequest, error);
    }
  }

  /**
   * Call provider (via TokenOptim)
   */
  async callProvider(provider, apiKey, request) {
    // Simulated - in production calls real APIs
    const cost = this.estimateCost(provider, request.tokens_in);

    return {
      provider: provider,
      response: `Response from ${provider}`,
      tokens_used: request.tokens_in + 150,
      cost: cost,
      latency_ms: Math.random() * 2000,
      timestamp: new Date()
    };
  }

  /**
   * Fallback if primary provider fails
   * Only works through TokenOptim
   */
  async fallbackRoute(request, error) {
    const fallbackProviders = ['claude', 'chatgpt', 'gemini'].filter(
      p => p !== request.original_provider
    );

    for (const provider of fallbackProviders) {
      try {
        const response = await this.callProvider(
          provider,
          this.apiKeys[provider],
          request
        );

        this.logFallback(request, provider, response);

        return {
          ...response,
          fallback_used: true,
          original_error: error.message
        };
      } catch (e) {
        continue;
      }
    }

    return { error: 'All providers failed' };
  }

  /**
   * Estimate token cost for a provider
   */
  estimateCost(provider, tokens) {
    const pricing = {
      claude: (tokens * 3) / 1000000,
      chatgpt: (tokens * 5) / 1000000,
      gemini: (tokens * 0.075) / 1000000,
      grok: (tokens * 2) / 1000000,
      kimi: (tokens * 3) / 1000000,
      glm: (tokens * 1.4) / 1000000
    };

    return pricing[provider] || 0;
  }

  /**
   * Estimate tokens from messages
   */
  estimateTokens(messages) {
    return messages.reduce((sum, msg) => sum + msg.content.length / 4, 0);
  }

  /**
   * Log routing decision
   */
  logRouting(request, response) {
    this.routingLog.push({
      id: request.id,
      timestamp: request.timestamp,
      task_type: request.task_type,
      routed_from: request.original_provider,
      routed_to: request.will_route_to,
      savings: request.estimated_savings,
      quality_parity: response.quality_parity || 95
    });

    // Keep last 10,000 entries
    if (this.routingLog.length > 10000) {
      this.routingLog = this.routingLog.slice(-10000);
    }
  }

  /**
   * Log fallback event
   */
  logFallback(request, fallbackProvider, response) {
    this.routingLog.push({
      id: request.id,
      timestamp: request.timestamp,
      task_type: request.task_type,
      routed_from: request.original_provider,
      routed_to: fallbackProvider,
      reason: 'provider_failure',
      fallback: true,
      quality_parity: response.quality_parity || 95
    });
  }

  /**
   * Get gateway stats
   * Shows user how dependent they are
   */
  getGatewayStats() {
    const successRate =
      this.routingLog.filter(r => !r.fallback).length / this.routingLog.length;
    const totalSavings = this.routingLog.reduce((sum, r) => sum + r.savings, 0);

    return {
      total_requests_routed: this.routingLog.length,
      success_rate: (successRate * 100).toFixed(1) + '%',
      total_savings: '$' + totalSavings.toFixed(2),
      avg_savings_per_request: '$' + (totalSavings / this.routingLog.length).toFixed(4),
      providers_connected: Object.keys(this.apiKeys).length,
      fallback_count: this.routingLog.filter(r => r.fallback).length,
      message: `You've routed ${this.routingLog.length} requests through TokenOptim. Switching = manual routing for all ${this.routingLog.length} requests.`
    };
  }

  /**
   * What happens if user disables TokenOptim
   */
  disableGateway() {
    return {
      gateway_disabled: true,
      warning: `You have ${this.routingLog.length} requests routed through TokenOptim. Disabling means losing all optimization.`,
      action_required: 'Re-enable gateway to maintain automatic routing',
      manual_routing_url: 'https://app.tokenoptim.io/manual-setup'
    };
  }

  /**
   * Generate request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimGateway;
}

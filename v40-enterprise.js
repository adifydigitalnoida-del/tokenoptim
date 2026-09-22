/**
 * TokenOptim v4.0 - Enterprise Tier
 * Team collaboration, SSO, audit logs, compliance controls
 * 
 * Based on GPT-4o research:
 * - Team management (roles, budgets, policies)
 * - Authentication (SSO, SAML)
 * - Compliance (audit logs, data residency)
 * - Advanced analytics
 */

class TokenOptimEnterprise {
  constructor(orgId, orgName) {
    this.orgId = orgId;
    this.orgName = orgName;
    this.created = new Date();
    
    this.team = {
      members: {},
      roles: {
        admin: { permissions: ['manage_team', 'manage_budget', 'view_audit', 'manage_policies'] },
        manager: { permissions: ['manage_budget', 'view_audit', 'view_analytics'] },
        developer: { permissions: ['use_optimizer', 'view_own_analytics'] },
        auditor: { permissions: ['view_audit', 'view_analytics'] }
      }
    };

    this.policies = {
      spend_limit: { monthly: null, per_request: null },
      allowed_models: [], // empty = all allowed
      blocked_models: [],
      data_residency: 'US', // US, EU, APAC
      require_approval: false,
      approval_threshold: null, // $ amount
      retention_days: 90
    };

    this.audit_log = [];
    this.budget_tracking = {};
    this.sso_config = null;
  }

  /**
   * Add team member
   */
  addTeamMember(userId, email, fullName, role) {
    if (!this.team.roles[role]) {
      throw new Error(`Invalid role: ${role}`);
    }

    this.team.members[userId] = {
      email,
      fullName,
      role,
      created: new Date(),
      last_active: null,
      api_key_hash: null
    };

    this.auditLog('team_member_added', {
      user_id: userId,
      email: email,
      role: role
    });

    return this.team.members[userId];
  }

  /**
   * Update team member role
   */
  updateTeamMemberRole(userId, newRole) {
    if (!this.team.members[userId]) {
      throw new Error(`User not found: ${userId}`);
    }

    const oldRole = this.team.members[userId].role;
    this.team.members[userId].role = newRole;

    this.auditLog('role_changed', {
      user_id: userId,
      old_role: oldRole,
      new_role: newRole
    });

    return this.team.members[userId];
  }

  /**
   * Remove team member
   */
  removeTeamMember(userId) {
    if (!this.team.members[userId]) {
      throw new Error(`User not found: ${userId}`);
    }

    const member = this.team.members[userId];
    delete this.team.members[userId];

    this.auditLog('team_member_removed', {
      user_id: userId,
      email: member.email,
      role: member.role
    });
  }

  /**
   * Set monthly spend limit
   */
  setSpendLimit(limit_dollars) {
    this.policies.spend_limit.monthly = limit_dollars;
    
    this.auditLog('spend_limit_updated', {
      limit: limit_dollars
    });
  }

  /**
   * Set per-request cost limit
   */
  setPerRequestLimit(limit_dollars) {
    this.policies.spend_limit.per_request = limit_dollars;
    
    this.auditLog('per_request_limit_updated', {
      limit: limit_dollars
    });
  }

  /**
   * Configure allowed models
   */
  setAllowedModels(models) {
    // models: ['claude', 'chatgpt', 'gemini']
    this.policies.allowed_models = models;
    
    this.auditLog('allowed_models_updated', {
      models: models
    });
  }

  /**
   * Block specific models
   */
  setBlockedModels(models) {
    this.policies.blocked_models = models;
    
    this.auditLog('blocked_models_updated', {
      models: models
    });
  }

  /**
   * Set data residency requirement
   */
  setDataResidency(region) {
    // region: 'US' | 'EU' | 'APAC'
    if (!['US', 'EU', 'APAC'].includes(region)) {
      throw new Error(`Invalid region: ${region}`);
    }

    this.policies.data_residency = region;
    
    this.auditLog('data_residency_updated', {
      region: region
    });
  }

  /**
   * Configure SSO (SAML/OAuth)
   */
  configureSSOSAML(provider, entityId, ssoUrl, certificateFingerprint) {
    this.sso_config = {
      type: 'SAML',
      provider: provider,
      entity_id: entityId,
      sso_url: ssoUrl,
      cert_fingerprint: certificateFingerprint,
      configured_at: new Date()
    };

    this.auditLog('sso_configured', {
      type: 'SAML',
      provider: provider
    });

    return this.sso_config;
  }

  /**
   * Configure OAuth
   */
  configureSSOOAuth(provider, clientId, clientSecret, authUrl, tokenUrl) {
    this.sso_config = {
      type: 'OAuth',
      provider: provider,
      client_id: clientId,
      client_secret_hash: this.hashSecret(clientSecret),
      auth_url: authUrl,
      token_url: tokenUrl,
      configured_at: new Date()
    };

    this.auditLog('sso_configured', {
      type: 'OAuth',
      provider: provider
    });

    return this.sso_config;
  }

  /**
   * Audit log entry
   */
  auditLog(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      org_id: this.orgId
    };

    this.audit_log.push(entry);

    // Trim old logs (keep last 10,000)
    if (this.audit_log.length > 10000) {
      this.audit_log = this.audit_log.slice(-10000);
    }

    return entry;
  }

  /**
   * Get audit log (with filtering)
   */
  getAuditLog(filters = {}) {
    let logs = this.audit_log;

    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }

    if (filters.start_date) {
      logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.start_date));
    }

    if (filters.end_date) {
      logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.end_date));
    }

    if (filters.limit) {
      logs = logs.slice(-filters.limit);
    }

    return logs;
  }

  /**
   * Check if request complies with policies
   */
  validateRequest(userId, model, estimatedCost) {
    const validationResult = {
      allowed: true,
      errors: [],
      warnings: []
    };

    // Check user exists
    if (!this.team.members[userId]) {
      validationResult.allowed = false;
      validationResult.errors.push(`User not found: ${userId}`);
      return validationResult;
    }

    // Check model is allowed
    if (this.policies.allowed_models.length > 0 && 
        !this.policies.allowed_models.includes(model)) {
      validationResult.allowed = false;
      validationResult.errors.push(`Model not allowed: ${model}`);
    }

    if (this.policies.blocked_models.includes(model)) {
      validationResult.allowed = false;
      validationResult.errors.push(`Model is blocked: ${model}`);
    }

    // Check per-request limit
    if (this.policies.spend_limit.per_request && 
        estimatedCost > this.policies.spend_limit.per_request) {
      validationResult.allowed = false;
      validationResult.errors.push(`Request cost exceeds limit: $${estimatedCost.toFixed(4)}`);
    }

    // Check monthly budget
    const monthlySpend = this.getMonthlySpend();
    if (this.policies.spend_limit.monthly && 
        monthlySpend + estimatedCost > this.policies.spend_limit.monthly) {
      validationResult.allowed = false;
      validationResult.errors.push(`Monthly budget exceeded`);
    } else if (this.policies.spend_limit.monthly && 
               monthlySpend + estimatedCost > this.policies.spend_limit.monthly * 0.8) {
      validationResult.warnings.push(`Approaching monthly budget limit`);
    }

    return validationResult;
  }

  /**
   * Track spend
   */
  trackSpend(userId, model, cost) {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM

    if (!this.budget_tracking[month]) {
      this.budget_tracking[month] = {};
    }

    if (!this.budget_tracking[month][userId]) {
      this.budget_tracking[month][userId] = {
        total: 0,
        by_model: {},
        requests: 0
      };
    }

    this.budget_tracking[month][userId].total += cost;
    this.budget_tracking[month][userId].by_model[model] = 
      (this.budget_tracking[month][userId].by_model[model] || 0) + cost;
    this.budget_tracking[month][userId].requests++;

    this.auditLog('spend_tracked', {
      user_id: userId,
      model: model,
      cost: cost,
      month: month
    });
  }

  /**
   * Get current month spending
   */
  getMonthlySpend() {
    const month = new Date().toISOString().slice(0, 7);
    if (!this.budget_tracking[month]) return 0;

    return Object.values(this.budget_tracking[month])
      .reduce((sum, user) => sum + user.total, 0);
  }

  /**
   * Get budget report
   */
  getBudgetReport(month = null) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    if (!this.budget_tracking[targetMonth]) {
      return {
        month: targetMonth,
        total_spend: 0,
        spend_limit: this.policies.spend_limit.monthly,
        users: {},
        models: {}
      };
    }

    const monthData = this.budget_tracking[targetMonth];
    let modelTotals = {};

    const users = Object.entries(monthData).map(([userId, data]) => {
      Object.entries(data.by_model).forEach(([model, cost]) => {
        modelTotals[model] = (modelTotals[model] || 0) + cost;
      });

      return {
        user_id: userId,
        spend: data.total,
        requests: data.requests,
        avg_cost_per_request: (data.total / data.requests).toFixed(6),
        by_model: data.by_model
      };
    });

    return {
      month: targetMonth,
      total_spend: Object.values(monthData).reduce((sum, u) => sum + u.total, 0),
      spend_limit: this.policies.spend_limit.monthly,
      budget_remaining: this.policies.spend_limit.monthly ? 
        (this.policies.spend_limit.monthly - Object.values(monthData).reduce((sum, u) => sum + u.total, 0)) : null,
      users: users,
      models: modelTotals,
      total_requests: Object.values(monthData).reduce((sum, u) => sum + u.requests, 0)
    };
  }

  /**
   * Generate compliance report
   */
  getComplianceReport(startDate, endDate) {
    const logs = this.getAuditLog({
      start_date: startDate,
      end_date: endDate
    });

    return {
      period: { start: startDate, end: endDate },
      organization: this.orgName,
      audit_log_entries: logs.length,
      team_changes: logs.filter(l => l.action.includes('team')).length,
      policy_changes: logs.filter(l => l.action.includes('policy') || l.action.includes('limit')).length,
      access_events: logs.filter(l => l.action.includes('access')).length,
      authentication_events: logs.filter(l => l.action.includes('auth')).length,
      data_residency: this.policies.data_residency,
      sso_configured: !!this.sso_config,
      full_audit_trail: logs
    };
  }

  /**
   * Hash secret for storage
   */
  hashSecret(secret) {
    // In production, use bcrypt or similar
    return `hashed_${secret.slice(-8)}`;
  }

  /**
   * Export enterprise config
   */
  exportConfig() {
    return {
      org_id: this.orgId,
      org_name: this.orgName,
      created: this.created,
      team: this.team,
      policies: this.policies,
      sso_configured: !!this.sso_config,
      audit_log_count: this.audit_log.length,
      budget_tracking_months: Object.keys(this.budget_tracking)
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimEnterprise;
}

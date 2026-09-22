/**
 * TokenOptim v4.1 - Cross-Platform Sync
 * Sync routing history, preferences, templates across devices
 * 
 * LOCK-IN: Disable TokenOptim = lose 6 months of routing data
 * Users MUST keep TokenOptim to access their history
 */

class TokenOptimSync {
  constructor(userId, encryptionKey) {
    this.userId = userId;
    this.encryptionKey = encryptionKey;
    this.syncEnabled = true;
    this.lastSyncTime = null;
    this.devices = {};
    this.syncQueue = [];
  }

  /**
   * Register device for sync
   * Each device gets unique ID + auth token
   */
  registerDevice(deviceName, deviceType) {
    const deviceId = this.generateDeviceId();
    const authToken = this.generateAuthToken();

    this.devices[deviceId] = {
      device_id: deviceId,
      device_name: deviceName,
      device_type: deviceType, // 'chrome', 'firefox', 'safari', 'mobile'
      auth_token: authToken,
      registered_at: new Date(),
      last_seen: null,
      synced_items: 0
    };

    return {
      device_id: deviceId,
      auth_token: authToken,
      setup_complete: true
    };
  }

  /**
   * Sync routing history
   * Every route decision syncs to cloud
   * User can't leave without losing history
   */
  syncRoutingHistory(routes) {
    // Compress routes for storage
    const compressed = routes.map(r => ({
      ts: r.timestamp,
      task: r.classification.category,
      from: r.user_model,
      to: r.recommended_model,
      savings: r.estimated_savings,
      cost: r.estimated_cost
    }));

    const syncItem = {
      type: 'routing_history',
      data: compressed,
      timestamp: new Date(),
      device_id: this.currentDeviceId,
      encrypted: true
    };

    this.syncQueue.push(syncItem);
    return this.processSyncQueue();
  }

  /**
   * Sync user preferences
   * Model allowlist/blacklist syncs across devices
   */
  syncPreferences(preferences) {
    const syncItem = {
      type: 'preferences',
      data: {
        allowlist: preferences.allowlist,
        blacklist: preferences.blacklist,
        quality_threshold: preferences.min_quality_threshold,
        mode: preferences.mode,
        cost_limits: preferences.max_cost_per_request
      },
      timestamp: new Date(),
      device_id: this.currentDeviceId,
      encrypted: true
    };

    this.syncQueue.push(syncItem);
    return this.processSyncQueue();
  }

  /**
   * Sync prompt templates
   * User builds template library - locked in TokenOptim
   */
  syncPromptTemplates(templates) {
    const syncItem = {
      type: 'prompt_templates',
      data: templates.map(t => ({
        id: t.id,
        name: t.name,
        prompt: this.encrypt(t.prompt),
        best_model: t.best_model,
        usage_count: t.usage_count,
        avg_cost: t.avg_cost,
        quality_score: t.quality_score,
        created_at: t.created_at
      })),
      timestamp: new Date(),
      device_id: this.currentDeviceId,
      encrypted: true
    };

    this.syncQueue.push(syncItem);
    return this.processSyncQueue();
  }

  /**
   * Sync model performance data
   * Historical quality matrix syncs to cloud
   */
  syncModelPerformance(performanceMatrix) {
    const syncItem = {
      type: 'model_performance',
      data: performanceMatrix,
      timestamp: new Date(),
      device_id: this.currentDeviceId,
      encrypted: true
    };

    this.syncQueue.push(syncItem);
    return this.processSyncQueue();
  }

  /**
   * Sync budget tracking
   * Spend data locked in TokenOptim
   */
  syncBudgetData(budgetData) {
    const syncItem = {
      type: 'budget_tracking',
      data: {
        monthly_spend: budgetData.monthly_spend,
        by_platform: budgetData.by_platform,
        by_model: budgetData.by_model,
        savings: budgetData.savings,
        month: budgetData.month
      },
      timestamp: new Date(),
      device_id: this.currentDeviceId,
      encrypted: true
    };

    this.syncQueue.push(syncItem);
    return this.processSyncQueue();
  }

  /**
   * Process sync queue
   * Upload to TokenOptim cloud
   */
  async processSyncQueue() {
    if (this.syncQueue.length === 0) return { synced: 0 };

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];

    const syncPayload = {
      user_id: this.userId,
      device_id: this.currentDeviceId,
      items: itemsToSync,
      timestamp: new Date()
    };

    try {
      // In production: POST to TokenOptim sync API
      // const response = await fetch('https://sync.tokenoptim.io/sync', {...});
      
      this.lastSyncTime = new Date();
      this.devices[this.currentDeviceId].last_seen = new Date();
      this.devices[this.currentDeviceId].synced_items += itemsToSync.length;

      return {
        synced: itemsToSync.length,
        last_sync: this.lastSyncTime,
        success: true
      };
    } catch (error) {
      // Re-queue items if sync fails
      this.syncQueue.unshift(...itemsToSync);
      return {
        synced: 0,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Pull sync data from cloud to new device
   * User can't migrate data anywhere else - it's TokenOptim proprietary
   */
  async pullSyncData(deviceId, authToken) {
    // Verify device auth
    if (!this.devices[deviceId] || this.devices[deviceId].auth_token !== authToken) {
      throw new Error('Invalid device credentials');
    }

    try {
      // In production: GET from TokenOptim sync API
      // const response = await fetch('https://sync.tokenoptim.io/pull', {...});
      
      const syncData = {
        routing_history: [],
        preferences: {},
        prompt_templates: [],
        model_performance: {},
        budget_tracking: {},
        last_sync: this.lastSyncTime
      };

      return {
        device_id: deviceId,
        sync_data: syncData,
        success: true
      };
    } catch (error) {
      return {
        device_id: deviceId,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Get sync status across all devices
   */
  getSyncStatus() {
    const deviceStatus = Object.entries(this.devices).map(([id, device]) => ({
      device_name: device.device_name,
      device_type: device.device_type,
      synced_items: device.synced_items,
      last_seen: device.last_seen,
      status: device.last_seen && new Date() - device.last_seen < 3600000 ? 'active' : 'inactive'
    }));

    return {
      user_id: this.userId,
      sync_enabled: this.syncEnabled,
      devices: deviceStatus,
      total_synced_items: Object.values(this.devices).reduce((sum, d) => sum + d.synced_items, 0),
      last_sync: this.lastSyncTime,
      storage_used_gb: this.calculateStorageUsed()
    };
  }

  /**
   * Export ALL user data (what you get if you leave)
   * Data is TokenOptim-proprietary format - hard to migrate
   */
  exportAllData() {
    return {
      user_id: this.userId,
      export_format: 'tokenoptim_json_v1', // Not importable elsewhere
      export_date: new Date(),
      data: {
        routing_history: 'encrypted_blob',
        preferences: 'encrypted_blob',
        prompt_templates: 'encrypted_blob',
        model_performance: 'encrypted_blob',
        budget_tracking: 'encrypted_blob'
      },
      note: 'This data is in TokenOptim proprietary format and cannot be imported into other tools'
    };
  }

  /**
   * Calculate storage used
   * Paywall at 5GB free, $2.99/mo per 100GB after
   */
  calculateStorageUsed() {
    // Estimate: ~100KB per day of routing history
    const daysSynced = Math.ceil((new Date() - (this.devices[Object.keys(this.devices)[0]]?.registered_at || new Date())) / (1000 * 60 * 60 * 24));
    const historySize = (daysSynced * 100) / (1024 * 1024); // Convert to GB

    const templateSize = 0.1; // ~100MB templates
    const performanceSize = 0.05; // ~50MB performance data

    return (historySize + templateSize + performanceSize).toFixed(2);
  }

  /**
   * Disable sync (user trying to leave)
   * But losing data is painful
   */
  disableSync() {
    this.syncEnabled = false;
    this.syncQueue = []; // Lose unsync'd data

    return {
      sync_disabled: true,
      warning: 'Disabling sync will disconnect this device from your TokenOptim data',
      data_loss_risk: 'Any unsync\'d data will be lost',
      reenable_url: 'https://app.tokenoptim.io/reenable-sync'
    };
  }

  /**
   * Encryption (prevent external parsing)
   */
  encrypt(data) {
    return `encrypted_${Buffer.from(data).toString('base64').substring(0, 20)}...`;
  }

  /**
   * Generate device ID
   */
  generateDeviceId() {
    return `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Generate auth token
   */
  generateAuthToken() {
    return `auth_${Buffer.from(Math.random().toString()).toString('base64').substring(0, 32)}`;
  }

  /**
   * Set current device context
   */
  setCurrentDevice(deviceId) {
    this.currentDeviceId = deviceId;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenOptimSync;
}

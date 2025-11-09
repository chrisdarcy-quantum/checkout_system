
module.exports = {
  flags: [
    {
      key: 'show-new-header',
      name: 'Show New Header',
      description: 'Displays the redesigned header with enhanced styling',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['public/app.js', 'server.js'],
    },
    {
      key: 'enable-premium-features',
      name: 'Enable Premium Features',
      description: 'Unlocks premium UI elements and features',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['public/app.js', 'server.js'],
    },
    {
      key: 'enable-user-analytics',
      name: 'Enable User Analytics',
      description: 'Tracks user behavior and analytics events',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['server.js'],
    },
    {
      key: 'use-new-api-endpoint',
      name: 'Use New API Endpoint',
      description: 'Switches to the new API endpoint implementation',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['server.js'],
    },
    {
      key: 'enable-search-filter',
      name: 'Enable Search Filter',
      description: 'Adds advanced search and filtering capabilities',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['server.js', 'database.js', 'public/app.js'],
    },
    {
      key: 'show-promotional-banner',
      name: 'Show Promotional Banner',
      description: 'Displays marketing and promotional content',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['public/app.js', 'server.js'],
    },
    {
      key: 'enable-caching',
      name: 'Enable Caching',
      description: 'Toggles the caching layer for improved performance',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['server.js'],
    },
    {
      key: 'use-new-database-query',
      name: 'Use New Database Query',
      description: 'Switches to optimized database query implementation',
      type: 'boolean',
      defaultValue: false,
      usedIn: ['database.js'],
    },
  ],
  
  getFlag(key) {
    return this.flags.find(flag => flag.key === key);
  },
  
  getAllKeys() {
    return this.flags.map(flag => flag.key);
  },
};

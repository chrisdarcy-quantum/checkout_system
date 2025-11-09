const express = require('express');
const cors = require('cors');
const path = require('path');
const LaunchDarkly = require('launchdarkly-node-server-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/vendor', express.static(path.join(__dirname, 'node_modules/launchdarkly-js-client-sdk/dist')));

app.use(express.static('public'));

const ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

let cache = {};

ldClient.once('ready', () => {
  console.log('LaunchDarkly client initialized successfully');
});

ldClient.on('error', (err) => {
  console.error('LaunchDarkly client error:', err);
});


app.get('/api/products', async (req, res) => {
  const user = { key: req.query.userId || 'anonymous' };
  
  const useNewEndpoint = await ldClient.variation('use-new-api-endpoint', user, false);
  
  const enableCaching = await ldClient.variation('enable-caching', user, false);
  
  if (enableCaching && cache.products) {
    console.log('Returning cached products');
    return res.json(cache.products);
  }
  
  let products;
  if (useNewEndpoint) {
    products = [
      { id: 1, name: 'Premium Widget', price: 99.99, premium: true },
      { id: 2, name: 'Standard Widget', price: 49.99, premium: false },
      { id: 3, name: 'Deluxe Widget', price: 149.99, premium: true },
    ];
  } else {
    products = [
      { id: 1, name: 'Widget A', price: 99.99 },
      { id: 2, name: 'Widget B', price: 49.99 },
    ];
  }
  
  if (enableCaching) {
    cache.products = products;
  }
  
  res.json(products);
});

app.get('/api/search', async (req, res) => {
  const user = { key: req.query.userId || 'anonymous' };
  const query = req.query.q || '';
  
  const enableSearchFilter = await ldClient.variation('enable-search-filter', user, false);
  
  if (!enableSearchFilter) {
    return res.status(403).json({ error: 'Search feature not enabled' });
  }
  
  const products = [
    { id: 1, name: 'Premium Widget', category: 'premium' },
    { id: 2, name: 'Standard Widget', category: 'standard' },
    { id: 3, name: 'Deluxe Widget', category: 'premium' },
  ];
  
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json(filtered);
});

app.get('/api/user/:id', async (req, res) => {
  const user = { key: req.params.id };
  
  const enableAnalytics = await ldClient.variation('enable-user-analytics', user, false);
  
  if (enableAnalytics) {
    console.log(`Analytics: User ${req.params.id} accessed their profile`);
  }
  
  res.json({
    id: req.params.id,
    name: 'Demo User',
    email: 'demo@example.com'
  });
});

const rateLimitMiddleware = async (req, res, next) => {
  const user = { key: req.query.userId || 'anonymous' };
  
  const enableRateLimiting = await ldClient.variation('enable-rate-limiting', user, false);
  
  if (enableRateLimiting) {
    const userKey = user.key;
    if (!cache[`ratelimit_${userKey}`]) {
      cache[`ratelimit_${userKey}`] = { count: 0, resetTime: Date.now() + 60000 };
    }
    
    const rateLimit = cache[`ratelimit_${userKey}`];
    if (Date.now() > rateLimit.resetTime) {
      rateLimit.count = 0;
      rateLimit.resetTime = Date.now() + 60000;
    }
    
    rateLimit.count++;
    if (rateLimit.count > 100) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
  }
  
  next();
};

app.use('/api', rateLimitMiddleware);

app.get('/api/flags', async (req, res) => {
  const user = { key: req.query.userId || 'anonymous' };
  
  const flags = {
    enableDarkMode: await ldClient.variation('enable-dark-mode', user, false),
    showNewHeader: await ldClient.variation('show-new-header', user, false),
    enablePremiumFeatures: await ldClient.variation('enable-premium-features', user, false),
    showPromotionalBanner: await ldClient.variation('show-promotional-banner', user, false),
  };
  
  res.json(flags);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

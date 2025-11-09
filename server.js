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
      { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 299.99, premium: true, category: 'audio', description: 'Premium over-ear headphones with active noise cancellation' },
      { id: 2, name: 'USB-C Fast Charging Cable', price: 24.99, premium: false, category: 'accessories', description: 'Durable braided cable with fast charging support' },
      { id: 3, name: 'Mechanical Gaming Keyboard', price: 159.99, premium: true, category: 'peripherals', description: 'RGB backlit keyboard with Cherry MX switches' },
      { id: 4, name: 'Wireless Mouse', price: 49.99, premium: false, category: 'peripherals', description: 'Ergonomic wireless mouse with precision tracking' },
      { id: 5, name: '4K Webcam', price: 129.99, premium: true, category: 'video', description: 'Professional webcam with auto-focus and HDR' },
      { id: 6, name: 'Laptop Stand', price: 39.99, premium: false, category: 'accessories', description: 'Adjustable aluminum laptop stand' },
    ];
  } else {
    products = [
      { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 299.99, category: 'audio', description: 'Premium over-ear headphones with active noise cancellation' },
      { id: 2, name: 'USB-C Fast Charging Cable', price: 24.99, category: 'accessories', description: 'Durable braided cable with fast charging support' },
      { id: 3, name: 'Mechanical Gaming Keyboard', price: 159.99, category: 'peripherals', description: 'RGB backlit keyboard with Cherry MX switches' },
      { id: 4, name: 'Wireless Mouse', price: 49.99, category: 'peripherals', description: 'Ergonomic wireless mouse with precision tracking' },
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
    { id: 1, name: 'Wireless Noise-Cancelling Headphones', category: 'audio', price: 299.99 },
    { id: 2, name: 'USB-C Fast Charging Cable', category: 'accessories', price: 24.99 },
    { id: 3, name: 'Mechanical Gaming Keyboard', category: 'peripherals', price: 159.99 },
    { id: 4, name: 'Wireless Mouse', category: 'peripherals', price: 49.99 },
    { id: 5, name: '4K Webcam', category: 'video', price: 129.99 },
    { id: 6, name: 'Laptop Stand', category: 'accessories', price: 39.99 },
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

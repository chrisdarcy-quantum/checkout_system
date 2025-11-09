const express = require('express');
const cors = require('cors');
const path = require('path');
const LaunchDarkly = require('launchdarkly-node-server-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('REQUEST:', req.method, req.url);
  next();
});

const ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

let cache = {};

ldClient.once('ready', () => {
  console.log('LaunchDarkly client initialized successfully');
});

ldClient.on('error', (err) => {
  console.error('LaunchDarkly client error:', err);
});

const rateLimitMiddleware = async (req, res, next) => {
  const user = { key: req.query.userId || 'anonymous' };
  
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
  
  next();
};

// app.use('/api', rateLimitMiddleware);

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

app.get('/api/posts', async (req, res) => {
  const user = { key: req.query.userId || 'anonymous' };
  
  const enableCaching = await ldClient.variation('enable-caching', user, false);
  
  if (enableCaching && cache.posts) {
    console.log('Returning cached posts');
    return res.json(cache.posts);
  }
  
  const posts = [
    { id: 1, title: 'Hidden Technical Debt in Machine Learning Systems', author: 'Sculley et al.', venue: 'NIPS 2015', category: 'ml-systems', summary: 'Explores the hidden costs and technical debt that accumulate in ML systems, including boundary erosion, entanglement, and configuration debt.', url: 'https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html', arxiv: 'https://arxiv.org/abs/1503.03585' },
    { id: 2, title: 'The ML Test Score: A Rubric for Production Readiness', author: 'Breck et al.', venue: 'Google Research 2017', category: 'ml-systems', summary: 'Provides a practical rubric for assessing ML system production readiness across data, model, infrastructure, and monitoring dimensions.', url: 'https://research.google/pubs/pub46555/', arxiv: null },
    { id: 3, title: 'Improving the Sensitivity of Online Controlled Experiments (CUPED)', author: 'Deng et al.', venue: 'KDD 2013', category: 'experimentation', summary: 'Introduces CUPED for variance reduction in A/B tests. Critical for trustworthy experimentation in noisy environments.', url: 'https://dl.acm.org/doi/10.1145/2487575.2488217', arxiv: null },
    { id: 4, title: 'The Dataflow Model: Balancing Correctness, Latency, and Cost', author: 'Akidau et al.', venue: 'VLDB 2015', category: 'streaming', summary: 'Foundational paper on stream processing semantics, event time vs processing time, and watermarking.', url: 'https://www.vldb.org/pvldb/vol8/p1792-Akidau.pdf', arxiv: null },
    { id: 5, title: 'Data Cascades in High-Stakes Machine Learning', author: 'Sambasivan et al.', venue: 'CHI 2021', category: 'ml-systems', summary: 'Documents how data quality issues compound in ML pipelines, causing silent failures in high-stakes domains.', url: 'https://dl.acm.org/doi/10.1145/3411764.3445518', arxiv: 'https://arxiv.org/abs/2012.07464' },
    { id: 6, title: 'Stop Explaining Black Box Machine Learning Models', author: 'Cynthia Rudin', venue: 'Nature Machine Intelligence 2019', category: 'interpretability', summary: 'Argues for inherently interpretable models in high-stakes decisions rather than post-hoc explanations.', url: 'https://www.nature.com/articles/s42256-019-0048-x', arxiv: 'https://arxiv.org/abs/1811.10154' },
  ];
  
  if (enableCaching) {
    cache.posts = posts;
  }
  
  res.json(posts);
});

app.get('/api/search', async (req, res) => {
  const user = { key: req.query.userId || 'anonymous' };
  const query = req.query.q || '';
  
  const enableSearchFilter = await ldClient.variation('enable-search-filter', user, false);
  
  if (!enableSearchFilter) {
    return res.status(403).json({ error: 'Search feature not enabled' });
  }
  
  const posts = [
    { id: 1, title: 'Hidden Technical Debt in Machine Learning Systems', author: 'Sculley et al.', category: 'ml-systems' },
    { id: 2, title: 'The ML Test Score: A Rubric for Production Readiness', author: 'Breck et al.', category: 'ml-systems' },
    { id: 3, title: 'Improving the Sensitivity of Online Controlled Experiments (CUPED)', author: 'Deng et al.', category: 'experimentation' },
    { id: 4, title: 'The Dataflow Model: Balancing Correctness, Latency, and Cost', author: 'Akidau et al.', category: 'streaming' },
    { id: 5, title: 'Data Cascades in High-Stakes Machine Learning', author: 'Sambasivan et al.', category: 'ml-systems' },
    { id: 6, title: 'Stop Explaining Black Box Machine Learning Models', author: 'Cynthia Rudin', category: 'interpretability' },
    { id: 7, title: 'A Unified Approach to Interpreting Model Predictions (SHAP)', author: 'Lundberg & Lee', category: 'interpretability' },
    { id: 8, title: 'TFX: A TensorFlow-Based Production-Scale Machine Learning Platform', author: 'Baylor et al.', category: 'ml-systems' },
    { id: 9, title: 'Equality of Opportunity in Supervised Learning', author: 'Hardt et al.', category: 'fairness' },
    { id: 10, title: 'Always Valid Inference: Bringing Sequential Analysis to A/B Testing', author: 'Johari et al.', category: 'experimentation' },
  ];
  
  const filtered = posts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.author.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
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

app.use('/vendor', express.static(path.join(__dirname, 'node_modules/launchdarkly-js-client-sdk/dist')));
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

const request = require('supertest');

const mockLdClient = {
  variation: jest.fn(),
  once: jest.fn((event, callback) => {
    if (event === 'ready') callback();
  }),
  on: jest.fn(),
};

jest.mock('launchdarkly-node-server-sdk', () => ({
  init: jest.fn(() => mockLdClient),
}));

describe('Checkout System API with Feature Flags', () => {
  let app;

  beforeAll(() => {
    process.env.LAUNCHDARKLY_SDK_KEY = 'test-sdk-key';
    app = require('./server');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/posts returns new endpoint data when use-new-api-endpoint flag is enabled', async () => {
    mockLdClient.variation.mockImplementation((key, user, defaultValue) => {
      if (key === 'use-new-api-endpoint') return Promise.resolve(true);
      return Promise.resolve(defaultValue);
    });

    const response = await request(app)
      .get('/api/posts?userId=test-user')
      .expect(200);

    expect(response.body).toHaveLength(10);
    expect(response.body[0]).toHaveProperty('premium');
    expect(mockLdClient.variation).toHaveBeenCalledWith('use-new-api-endpoint', expect.any(Object), false);
  });

  test('GET /api/search returns 403 when enable-search-filter flag is disabled', async () => {
    mockLdClient.variation.mockImplementation((key, user, defaultValue) => {
      if (key === 'enable-search-filter') return Promise.resolve(false);
      return Promise.resolve(defaultValue);
    });

    const response = await request(app)
      .get('/api/search?q=widget&userId=test-user')
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(mockLdClient.variation).toHaveBeenCalledWith('enable-search-filter', expect.any(Object), false);
  });

  test('GET /api/search returns filtered results when enable-search-filter flag is enabled', async () => {
    mockLdClient.variation.mockImplementation((key, user, defaultValue) => {
      if (key === 'enable-search-filter') return Promise.resolve(true);
      return Promise.resolve(defaultValue);
    });

    const response = await request(app)
      .get('/api/search?q=premium&userId=test-user')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(mockLdClient.variation).toHaveBeenCalledWith('enable-search-filter', expect.any(Object), false);
  });

  test('GET /api/user/:id logs analytics when enable-user-analytics flag is enabled', async () => {
    mockLdClient.variation.mockImplementation((key, user, defaultValue) => {
      if (key === 'enable-user-analytics') return Promise.resolve(true);
      return Promise.resolve(defaultValue);
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await request(app)
      .get('/api/user/test-user-123')
      .expect(200);

    expect(mockLdClient.variation).toHaveBeenCalledWith('enable-user-analytics', expect.any(Object), false);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Analytics:'));
    
    consoleSpy.mockRestore();
  });

  test('GET /api/flags returns all frontend feature flags', async () => {
    mockLdClient.variation.mockImplementation((key, user, defaultValue) => {
      const flags = {
        'show-new-header': false,
        'enable-premium-features': true,
      };
      return Promise.resolve(flags[key] !== undefined ? flags[key] : defaultValue);
    });

    const response = await request(app)
      .get('/api/flags?userId=test-user')
      .expect(200);

    expect(response.body).toHaveProperty('showNewHeader');
    expect(response.body).toHaveProperty('enablePremiumFeatures');
  });
});

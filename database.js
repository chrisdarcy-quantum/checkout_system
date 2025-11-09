const LaunchDarkly = require('launchdarkly-node-server-sdk');

const products = [
  { id: 1, name: 'Premium Widget', price: 99.99, category: 'premium', stock: 10 },
  { id: 2, name: 'Standard Widget', price: 49.99, category: 'standard', stock: 25 },
  { id: 3, name: 'Deluxe Widget', price: 149.99, category: 'premium', stock: 5 },
  { id: 4, name: 'Basic Widget', price: 29.99, category: 'basic', stock: 50 },
];

const orders = [];

async function getProducts(ldClient, user) {
  const useNewQuery = await ldClient.variation('use-new-database-query', user, false);
  
  if (useNewQuery) {
    return products.map(p => ({
      ...p,
      inStock: p.stock > 0,
      discount: p.category === 'premium' ? 0.1 : 0,
    }));
  } else {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
    }));
  }
}

async function searchProducts(ldClient, user, query) {
  const enableSearch = await ldClient.variation('enable-search-filter', user, false);
  
  if (!enableSearch) {
    throw new Error('Search feature not enabled');
  }
  
  return products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );
}

function createOrder(userId, productId, quantity) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  const order = {
    id: orders.length + 1,
    userId,
    productId,
    quantity,
    total: product.price * quantity,
    createdAt: new Date(),
  };
  
  orders.push(order);
  product.stock -= quantity;
  
  return order;
}

module.exports = {
  getProducts,
  searchProducts,
  createOrder,
};

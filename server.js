// server.js — Legend store backend
// Simple Express server.
// Catalogue data lives in /data/*.json

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const ORDERS_PATH = path.join(DATA_DIR, 'orders.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================
// Helpers
// ==========================================================

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(
    file,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function nextId(list, prefix) {
  let max = 0;

  list.forEach((item) => {
    const n = parseInt(
      String(item.id).replace(/\D/g, ''),
      10
    );

    if (!isNaN(n)) {
      max = Math.max(max, n);
    }
  });

  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

// ==========================================================
// Make sure required files exist
// ==========================================================

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(ORDERS_PATH)) {
  writeJSON(ORDERS_PATH, []);
}

const OFFERS_PATH = filePath('offers');

if (!fs.existsSync(OFFERS_PATH)) {
  writeJSON(OFFERS_PATH, []);
}

// ==========================================================
// Config
// ==========================================================

app.get('/api/config', (req, res) => {
  res.json(readJSON(CONFIG_PATH));
});

// ==========================================================
// Categories
// ==========================================================

app.get('/api/categories', (req, res) => {
  res.json(readJSON(filePath('categories')));
});

app.post('/api/categories', (req, res) => {
  const categories = readJSON(filePath('categories'));

  const item = {
    id: req.body.id || nextId(categories, 'cat'),
    order: categories.length + 1,
    ...req.body
  };

  categories.push(item);

  writeJSON(
    filePath('categories'),
    categories
  );

  res.status(201).json(item);
});

app.delete('/api/categories/:id', (req, res) => {
  let categories = readJSON(
    filePath('categories')
  );

  categories = categories.filter(
    (c) => c.id !== req.params.id
  );

  writeJSON(
    filePath('categories'),
    categories
  );

  res.json({ ok: true });
});

// ==========================================================
// Types
// ==========================================================

app.get('/api/types', (req, res) => {
  const types = readJSON(filePath('types'));

  const { categoryId } = req.query;

  res.json(
    categoryId
      ? types.filter(
          (t) => t.categoryId === categoryId
        )
      : types
  );
});

app.post('/api/types', (req, res) => {
  const types = readJSON(filePath('types'));

  const item = {
    id: req.body.id || nextId(types, 'type'),
    ...req.body
  };

  types.push(item);

  writeJSON(
    filePath('types'),
    types
  );

  res.status(201).json(item);
});

app.delete('/api/types/:id', (req, res) => {
  let types = readJSON(filePath('types'));

  types = types.filter(
    (t) => t.id !== req.params.id
  );

  writeJSON(
    filePath('types'),
    types
  );

  res.json({ ok: true });
});

// ==========================================================
// Products
// ==========================================================

app.get('/api/products', (req, res) => {
  const products = readJSON(
    filePath('products')
  );

  const { typeId, categoryId } = req.query;

  let result = products;

  if (typeId) {
    result = result.filter(
      (p) => p.typeId === typeId
    );
  }

  if (categoryId) {
    result = result.filter(
      (p) => p.categoryId === categoryId
    );
  }

  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const products = readJSON(
    filePath('products')
  );

  const product = products.find(
    (p) => p.id === req.params.id
  );

  if (!product) {
    return res.status(404).json({
      error: 'not found'
    });
  }

  res.json(product);
});

app.post('/api/products', (req, res) => {
  const products = readJSON(
    filePath('products')
  );

  const item = {
    id: req.body.id || nextId(products, 'p'),
    ...req.body
  };

  products.push(item);

  writeJSON(
    filePath('products'),
    products
  );

  res.status(201).json(item);
});

app.put('/api/products/:id', (req, res) => {
  const products = readJSON(
    filePath('products')
  );

  const idx = products.findIndex(
    (p) => p.id === req.params.id
  );

  if (idx === -1) {
    return res.status(404).json({
      error: 'not found'
    });
  }

  products[idx] = {
    ...products[idx],
    ...req.body,
    id: req.params.id
  };

  writeJSON(
    filePath('products'),
    products
  );

  res.json(products[idx]);
});

app.delete('/api/products/:id', (req, res) => {
  let products = readJSON(
    filePath('products')
  );

  products = products.filter(
    (p) => p.id !== req.params.id
  );

  writeJSON(
    filePath('products'),
    products
  );

  res.json({ ok: true });
});

// ==========================================================
// OFFERS
// ==========================================================

// Get all offers
app.get('/api/offers', (req, res) => {
  const offers = readJSON(OFFERS_PATH);

  res.json(offers);
});

// Get one offer
app.get('/api/offers/:id', (req, res) => {
  const offers = readJSON(OFFERS_PATH);

  const offer = offers.find(
    (o) => o.id === req.params.id
  );

  if (!offer) {
    return res.status(404).json({
      error: 'offer not found'
    });
  }

  res.json(offer);
});

// Add offer
app.post('/api/offers', (req, res) => {
  const offers = readJSON(OFFERS_PATH);

  const item = {
    id: req.body.id || nextId(offers, 'offer-'),
    name: req.body.name,
    description: req.body.description || '',
    price: req.body.price,
    quantity: req.body.quantity || 1,
    image: req.body.image || '',
    active: req.body.active !== false
  };

  offers.push(item);

  writeJSON(OFFERS_PATH, offers);

  res.status(201).json(item);
});

// Update offer
app.put('/api/offers/:id', (req, res) => {
  const offers = readJSON(OFFERS_PATH);

  const index = offers.findIndex(
    (o) => o.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'offer not found'
    });
  }

  offers[index] = {
    ...offers[index],
    ...req.body,
    id: req.params.id
  };

  writeJSON(OFFERS_PATH, offers);

  res.json(offers[index]);
});

// Delete offer
app.delete('/api/offers/:id', (req, res) => {
  let offers = readJSON(OFFERS_PATH);

  offers = offers.filter(
    (o) => o.id !== req.params.id
  );

  writeJSON(OFFERS_PATH, offers);

  res.json({
    ok: true
  });
});
// ==========================================================
// Orders
// ==========================================================

app.post('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_PATH);

  const order = {
    id: `ord${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...req.body
  };

  orders.push(order);

  writeJSON(
    ORDERS_PATH,
    orders
  );

  res.status(201).json(order);
});

// ==========================================================
// Start server
// ==========================================================
app.get('/api/test', (req, res) => {
  res.json({ ok: true });
});
app.listen(PORT, () => {
  console.log(
    `Legend store running → http://localhost:${PORT}`
  );
});

#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://api.minepi.com/v2';
const API_KEY = process.env.PI_API_KEY || process.env.VITE_PI_SERVER_API_KEY;

if (!API_KEY) {
  console.error('PI API key not set in env');
  process.exit(1);
}

async function run() {
  try {
    console.log('Testing Pi API auth by fetching payments (limit=1)...');
    const res = await axios.get(`${API_URL}/payments?limit=1`, {
      headers: { Authorization: `Key ${API_KEY}` },
      timeout: 10000,
    });
    console.log('Status:', res.status);
    console.log('Sample response keys:', Object.keys(res.data));
  } catch (err) {
    if (err.response) {
      console.error('Pi API responded with status', err.response.status);
      console.error(err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(1);
  }
}

run();

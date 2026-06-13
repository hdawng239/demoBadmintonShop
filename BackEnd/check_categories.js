const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Đọc file .env của BackEnd để lấy cấu hình DB
const envPath = 'd:/Badminton/BackEnd/.env';
let connStr = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const env = {};
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  connStr = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
} else {
  connStr = 'postgresql://postgres:FWKgMAcDYgUOdzBfwqBbQhxDmwLSzcDj@zephyr.proxy.rlwy.net:26963/railway';
}

console.log('Connecting to:', connStr);

const pool = new Pool({
  connectionString: connStr,
});

async function main() {
  try {
    const res = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    console.log('Categories from DB:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await pool.end();
  }
}

main();

const { Pool } = require('pg');
const fs = require('fs');

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

const pool = new Pool({
  connectionString: connStr,
});

async function main() {
  try {
    // 1. Kiểm tra kiểu dữ liệu của cột payment_status
    const colRes = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'payment_status'
    `);
    console.log('Column Info:');
    console.log(JSON.stringify(colRes.rows, null, 2));

    // 2. Kiểm tra CHECK constraints liên quan đến cột payment_status
    const constraintRes = await pool.query(`
      SELECT tc.constraint_name, cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'orders' AND ccu.column_name = 'payment_status'
    `);
    console.log('Check Constraints Info:');
    console.log(JSON.stringify(constraintRes.rows, null, 2));
  } catch (err) {
    console.error('Error querying DB schema:', err);
  } finally {
    await pool.end();
  }
}

main();

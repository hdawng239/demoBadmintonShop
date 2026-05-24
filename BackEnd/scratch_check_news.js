const pool = require('./config/db');

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_name LIKE '%news%' OR table_name LIKE '%post%' OR table_name LIKE '%blog%';
    `);
    console.log("Tables found:", res.rows.map(r => r.table_name));
    
    for (const row of res.rows) {
      const colRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${row.table_name}';
      `);
      console.log(`\nColumns in ${row.table_name}:`);
      console.log(colRes.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkSchema();

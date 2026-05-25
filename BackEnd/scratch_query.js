const pool = require('./config/db');

async function run() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders';
        `);
        console.log("Orders schema:", res.rows);
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    } finally {
        process.exit(0);
    }
}
run();

const pool = require('./config/db');

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product_variants'");
        console.log("product_variants schema:", res.rows);
        
        const res2 = await pool.query("SELECT * FROM product_variants LIMIT 5");
        console.log("product_variants data:", res2.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkSchema();

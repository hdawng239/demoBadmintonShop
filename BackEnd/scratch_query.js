const pool = require('./config/db');

async function run() {
    try {
        const axios = require('axios');
        await pool.query("ALTER TABLE orders ADD COLUMN to_district_id INTEGER DEFAULT 1442;");
        await pool.query("ALTER TABLE orders ADD COLUMN to_ward_code VARCHAR(20) DEFAULT '21012';");
        console.log("Added to_district_id and to_ward_code to orders");
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    } finally {
        process.exit(0);
    }
}
run();

const axios = require('axios');

async function main() {
  try {
    const res = await axios.get('http://localhost:5000/api/categories?limit=100');
    console.log('API Response Status:', res.status);
    console.log('API Response Data:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error fetching API:', err.message);
  }
}

main();

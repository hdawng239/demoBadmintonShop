const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));
let count = 0;

// The base API expression to use
const baseExpr = "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}";
const baseExprWithoutApi = "${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}";

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Replace http://localhost:5000/api in single quotes
  content = content.replace(/'http:\/\/localhost:5000\/api(.*?)'/g, '`' + baseExpr + '$1`');
  // 2. Replace http://localhost:5000/api in double quotes
  content = content.replace(/"http:\/\/localhost:5000\/api(.*?)"/g, '`' + baseExpr + '$1`');
  // 3. Replace http://localhost:5000/api in backticks
  content = content.replace(/`http:\/\/localhost:5000\/api(.*?)`/g, '`' + baseExpr + '$1`');
  
  // Also for the railway URL (which doesn't have /api at the end in the .env, it's just the root)
  // But in authService.js it is: 'https://demobadmintonshop-production.up.railway.app/api/auth'
  content = content.replace(/'https:\/\/demobadmintonshop-production\.up\.railway\.app\/api(.*?)'/g, '`' + baseExpr + '$1`');
  content = content.replace(/"https:\/\/demobadmintonshop-production\.up\.railway\.app\/api(.*?)"/g, '`' + baseExpr + '$1`');
  content = content.replace(/`https:\/\/demobadmintonshop-production\.up\.railway\.app\/api(.*?)`/g, '`' + baseExpr + '$1`');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log(`Replaced in ${count} files.`);

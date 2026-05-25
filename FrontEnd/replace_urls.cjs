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

const baseExpr = "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}";

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/'http:\/\/localhost:5000\/api(.*?)'/g, '`' + baseExpr + '$1`');
  content = content.replace(/"http:\/\/localhost:5000\/api(.*?)"/g, '`' + baseExpr + '$1`');
  content = content.replace(/`http:\/\/localhost:5000\/api(.*?)`/g, '`' + baseExpr + '$1`');
  
  content = content.replace(/'https:\/\/demobadmintonshop-production\.up\.railway\.app\/api(.*?)'/g, '`' + baseExpr + '$1`');
  content = content.replace(/"https:\/\/demobadmintonshop-production\.up\.railway\.app\/api(.*?)"/g, '`' + baseExpr + '$1`');
  content = content.replace(/`https:\/\/demobadmintonshop-production\.up\.railway\.app\/api(.*?)`/g, '`' + baseExpr + '$1`');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log(`Replaced in ${count} files.`);

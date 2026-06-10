const fs = require('fs');
const path = require('path');

const paths = [
  path.join(__dirname, 'page.tsx'),
  path.join(__dirname, '../components/Dashboard.tsx'),
  path.join(__dirname, '../Dashboard.tsx')
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`FOUND MAIN WORKSPACE FILE: ${p}`);
  }
});
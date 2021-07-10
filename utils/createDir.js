const path = require('path');
const fs = require('fs');

module.exports = (dir) => {
  const p = path.join(__dirname, dir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }

  console.log(p);
};
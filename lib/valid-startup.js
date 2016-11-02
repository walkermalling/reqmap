const fs = require('fs');
const log = require('./logger');

// Validate Starting Path

function start() {
  const startPath = process.argv[2];

  if (!startPath) {
    console.log('no start path');
    process.exit(1);
  }

  const exists = fs.existsSync(startPath) && fs.existsSync(`${startPath}/package.json`);

  if (!exists) {
    log(`given project directory ${startPath} was not accessible or did not have a package.json`);
    process.exit(1);
  }

  /* eslint-disable global-require */
  const pkgJson = require(`${startPath}/package.json`);
  /* eslint-enable global-require */

  log(`Req-map starting with project: ${pkgJson.name}\n\n`);

  return {
    root: startPath,
    name: pkgJson.name,
  };
}

module.exports = start;

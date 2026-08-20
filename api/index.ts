// api/index.ts
const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@': path.join(__dirname, '..', 'dist'),
  '@common': path.join(__dirname, '..', 'dist/common'),
  '@modules': path.join(__dirname, '..', 'dist/modules'),
  '@config': path.join(__dirname, '..', 'dist/config'),
});

module.exports = require('../dist/main');
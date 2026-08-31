const fs = require('fs');
const file = './tests/levora-smoke-tests.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Find the OAuth folder (index 3 or similar)
const oauthFolder = data.item.find((i) => i.name.includes('OAuth'));
if (oauthFolder) {
  oauthFolder.item.forEach((req) => {
    if (
      req.name.includes('Initiate Google') ||
      req.name.includes('Initiate LinkedIn')
    ) {
      req.protocolProfileBehavior = { followRedirects: false };
    }
  });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Fixed tests to not follow redirects.');
} else {
  console.log('OAuth folder not found');
}

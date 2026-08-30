const fs = require('fs');
const file = './tests/levora-smoke-tests.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const securityFolder = data.item[0]; // Assuming it is the 0th item

securityFolder.item.push({
  name: "GET /auth/me - JWT Invalid Signature Attack",
  event: [
    {
      listen: "test",
      script: {
        exec: [
          "pm.test('Status code is 401 Unauthorized', function () {",
          "    pm.response.to.have.status(401);",
          "});"
        ],
        type: "text/javascript"
      }
    }
  ],
  request: {
    method: "GET",
    header: [
      // Standard JWT format, but signed with a random secret so it's invalid.
      { key: "Authorization", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" }
    ],
    url: { raw: "{{baseUrl}}/auth/me", host: ["{{baseUrl}}"], path: ["auth", "me"] }
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JWT Invalid Signature Attack.');

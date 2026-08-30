const fs = require('fs');
const file = './tests/levora-smoke-tests.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const securityFolder = {
  name: '0. Pre-Auth Security & Validation Attacks',
  description:
    "Security tests that do not require valid authentication. These run first so they don't depend on or mess up the token/cookie state.",
  item: [
    {
      name: 'POST /auth/register - SQL Injection Email',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "pm.test('Status code is 422 Unprocessable Entity or 400 Bad Request', function () {",
              '    pm.expect(pm.response.code).to.be.oneOf([400, 422]);',
              '});',
            ],
            type: 'text/javascript',
          },
        },
      ],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: "' OR 1=1 --",
            password: 'Password123',
          }),
        },
        url: {
          raw: '{{baseUrl}}/auth/register',
          host: ['{{baseUrl}}'],
          path: ['auth', 'register'],
        },
      },
    },
    {
      name: 'POST /auth/login - SQL Injection Email',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "pm.test('Status code is 422, 400, or 401', function () {",
              '    pm.expect(pm.response.code).to.be.oneOf([400, 401, 422]);',
              '});',
            ],
            type: 'text/javascript',
          },
        },
      ],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: "' OR 1=1 --",
            password: 'Password123',
          }),
        },
        url: {
          raw: '{{baseUrl}}/auth/login',
          host: ['{{baseUrl}}'],
          path: ['auth', 'login'],
        },
      },
    },
    {
      name: 'POST /auth/register - Mass Assignment (Roles)',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "pm.test('Status code is 422 (forbidNonWhitelisted) or 400', function () {",
              '    pm.expect(pm.response.code).to.be.oneOf([400, 422]);',
              '});',
            ],
            type: 'text/javascript',
          },
        },
      ],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'mass@example.com',
            password: 'Password123',
            roles: ['system_admin'],
          }),
        },
        url: {
          raw: '{{baseUrl}}/auth/register',
          host: ['{{baseUrl}}'],
          path: ['auth', 'register'],
        },
      },
    },
    {
      name: 'GET /auth/me - JWT alg=none Attack',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "pm.test('Status code is 401 Unauthorized', function () {",
              '    pm.response.to.have.status(401);',
              '});',
            ],
            type: 'text/javascript',
          },
        },
      ],
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value:
              'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.',
          },
        ],
        url: {
          raw: '{{baseUrl}}/auth/me',
          host: ['{{baseUrl}}'],
          path: ['auth', 'me'],
        },
      },
    },
    {
      name: 'GET /auth/google/callback - Invalid Code',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              "pm.test('Status code is 400 or 401', function () {",
              '    pm.expect(pm.response.code).to.be.oneOf([400, 401]);',
              '});',
            ],
            type: 'text/javascript',
          },
        },
      ],
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/auth/google/callback?code=invalid_code_test',
          host: ['{{baseUrl}}'],
          path: ['auth', 'google', 'callback'],
          query: [{ key: 'code', value: 'invalid_code_test' }],
        },
      },
    },
  ],
};

data.item.unshift(securityFolder);

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added Pre-Auth Security Attacks.');

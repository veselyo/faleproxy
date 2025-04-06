const nock = require('nock');
const { sampleHtmlWithYale } = require('./test-utils');

// Intercept requests from the proxy server process
nock('https://example.com')
  .get('/')
  .reply(200, sampleHtmlWithYale);

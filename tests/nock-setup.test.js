// tests/nock-setup.test.js
const axios = require('axios');
const nock = require('nock');

describe('nock-setup', () => {
  beforeEach(() => {
    // Clean any interceptors before each test.
    nock.cleanAll();
  });
  
  test('should register interceptor for https://example.com/', async () => {
    // Require the nock setup file.
    require('./nock-setup.js');
    
    // Make a GET request to the intercepted URL.
    const response = await axios.get('https://example.com/');
    
    // Import the sample HTML to compare.
    const { sampleHtmlWithYale } = require('./test-utils');
    expect(response.data).toBe(sampleHtmlWithYale);
    
    // Ensure that no pending interceptors remain.
    expect(nock.pendingMocks()).toEqual([]);
  });
});

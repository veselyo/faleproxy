const request = require('supertest');
const nock = require('nock');
const path = require('path');
const fs = require('fs');
const app = require('../app'); // Import the Express app

describe('App Integration Tests', () => {
  // Test the GET / route
  test('GET / should serve index.html', async () => {
    // Ensure that public/index.html exists.
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
    const indexHtml = fs.readFileSync(indexPath, 'utf8');
    
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
    // Check that the response contains a snippet from index.html
    expect(response.text).toContain(indexHtml.slice(0, 20));
  });

  // Test the POST /fetch endpoint with valid URL using nock
  test('POST /fetch should replace Yale with Fale', async () => {
    const { sampleHtmlWithYale } = require('./test-utils');
    // Intercept the external request made by axios
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);
      
    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://example.com/' });
      
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    // Verify that the title is replaced correctly
    expect(response.body.title).toBe('Fale University Test Page');
    // Verify that the replacement occurred in the HTML content
    expect(response.body.content).toContain('Welcome to Fale University');
    // Ensure that URLs remain unchanged
    expect(response.body.content).toContain('https://www.yale.edu/about');
    // Verify that the link text is replaced
    expect(response.body.content).toContain('About Fale');
  });

  // Test POST /fetch with missing URL parameter
  test('POST /fetch with missing URL should return 400', async () => {
    const response = await request(app)
      .post('/fetch')
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('URL is required');
  });

  // Test error handling in POST /fetch (simulate axios failure)
  test('POST /fetch should return 500 when external fetch fails', async () => {
    // Set up nock to simulate a network error
    nock('https://example.com')
      .get('/')
      .replyWithError('Simulated network error');

    const response = await request(app)
      .post('/fetch')
      .send({ url: 'https://example.com/' });
      
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toMatch(/Failed to fetch content/);
  });
});

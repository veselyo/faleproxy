// tests/script.test.js
const fs = require('fs');
const path = require('path');

describe('Client-side script (script.js)', () => {
  let originalFetch;
  
  beforeAll(() => {
    // Save the original fetch so we can restore it later
    originalFetch = global.fetch;
  });
  
  afterAll(() => {
    global.fetch = originalFetch;
  });
  
  beforeEach(() => {
    // Set up a basic HTML structure that the script expects.
    document.body.innerHTML = `
      <form id="url-form">
        <input id="url-input" />
      </form>
      <div id="loading" class="hidden"></div>
      <div id="error-message" class="hidden"></div>
      <div id="result-container" class="hidden"></div>
      <div id="content-display"></div>
      <a id="original-url"></a>
      <h1 id="page-title"></h1>
    `;
    
    // Clear any cached modules so that the script runs fresh each time.
    jest.resetModules();
  });
  
  test('should show error if URL input is empty', () => {
    // Load the script file from public/script.js.
    require('../public/script.js');
    
    // Simulate DOMContentLoaded so the script registers its event listeners.
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Simulate form submission without a URL.
    const form = document.getElementById('url-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    const errorMessage = document.getElementById('error-message');
    expect(errorMessage.textContent).toBe('Please enter a valid URL');
    expect(errorMessage.classList.contains('hidden')).toBe(false);
  });
  
  test('should handle successful fetch and update DOM', async () => {
    // Prepare a fake response for fetch.
    const fakeResponseData = {
      title: 'Fale University Test Page',
      content: '<html><body><h1>Welcome to Fale University</h1></body></html>'
    };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponseData
    });
    
    require('../public/script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Set a valid URL in the input.
    const urlInput = document.getElementById('url-input');
    urlInput.value = 'https://example.com';
    
    // Dispatch form submission.
    const form = document.getElementById('url-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Wait briefly for async operations to complete.
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check that the loading indicator is hidden and the result container is visible.
    expect(document.getElementById('loading').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('result-container').classList.contains('hidden')).toBe(false);
    
    // Check that the original URL and page title have been updated.
    expect(document.getElementById('original-url').textContent).toBe('https://example.com');
    expect(document.getElementById('page-title').textContent).toBe(fakeResponseData.title);
    
    // Verify that an iframe was created and appended to content-display.
    const contentDisplay = document.getElementById('content-display');
    const iframe = contentDisplay.querySelector('iframe');
    expect(iframe).not.toBeNull();
  });
});

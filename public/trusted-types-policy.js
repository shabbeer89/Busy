// Trusted Types Policy for security - Browser Extension Compatible
if (typeof TrustedTypes !== 'undefined') {
  const policy = TrustedTypes.createPolicy('default', {
    createHTML: (html) => html,
    createScript: (script) => script,
    createScriptURL: (url) => url
  });

  // More selective Trusted Types enforcement for browser extension compatibility
  const originalCreateElement = Document.prototype.createElement;
  Document.prototype.createElement = function(tagName, options) {
    const element = originalCreateElement.call(this, tagName, options);

    // Only enforce Trusted Types for script elements we create, not existing ones
    if (tagName.toLowerCase() === 'script') {
      const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');

      Object.defineProperty(element, 'textContent', {
        get: originalTextContent.get,
        set: function(value) {
          if (value && typeof value === 'string') {
            try {
              // Check if this is likely from a browser extension (has extension-like patterns)
              const isBrowserExtension = value.includes('chrome-extension://') ||
                                       value.includes('moz-extension://') ||
                                       value.includes('safari-extension://') ||
                                       value.includes('extension://');

              if (isBrowserExtension) {
                // Allow browser extensions to set content directly
                originalTextContent.set.call(this, value);
              } else {
                // Use Trusted Types for regular scripts
                const trustedScript = policy.createScript(value);
                originalTextContent.set.call(this, trustedScript);
              }
            } catch (e) {
              console.warn('Trusted Types script validation failed:', e);
              // Allow the script to proceed for compatibility
              originalTextContent.set.call(this, value);
            }
          } else {
            originalTextContent.set.call(this, value);
          }
        }
      });
    }

    return element;
  };
}
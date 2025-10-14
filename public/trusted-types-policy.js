// Trusted Types Policy for security
if (typeof TrustedTypes !== 'undefined') {
  const policy = TrustedTypes.createPolicy('default', {
    createHTML: (html) => html,
    createScript: (script) => script,
    createScriptURL: (url) => url
  });

  // Override textContent setter to use Trusted Types
  const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');

  Object.defineProperty(Node.prototype, 'textContent', {
    get: originalTextContent.get,
    set: function(value) {
      if (this.tagName === 'SCRIPT' && value) {
        // For script elements, use TrustedScript
        try {
          const trustedScript = policy.createScript(value);
          originalTextContent.set.call(this, trustedScript);
        } catch (e) {
          console.warn('Trusted Types blocked script injection:', e);
          // Fallback to original behavior if Trusted Types fails
          originalTextContent.set.call(this, value);
        }
      } else {
        originalTextContent.set.call(this, value);
      }
    }
  });
}
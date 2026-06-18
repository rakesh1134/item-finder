/**
 * Smoke test to verify the testing framework is properly configured.
 */
describe('Testing framework setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should support TypeScript', () => {
    const greeting: string = 'Hello, Item Finder!';
    expect(greeting).toContain('Item Finder');
  });

  it('should resolve module path aliases', () => {
    // Verify @/ alias resolves to src/
    const types = require('@/types');
    expect(types).toBeDefined();
  });
});

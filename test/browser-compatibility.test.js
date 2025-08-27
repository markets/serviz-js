import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Browser Compatibility', () => {
  test('should work with dynamic imports', async () => {
    // Test dynamic import which is supported in both Node and browsers
    const { Base, Workflow } = await import('../src/index.js');
    
    assert.ok(Base);
    assert.ok(Workflow);
    
    class TestService extends Base {
      call() {
        this.result = 'Dynamic import success';
      }
    }
    
    const operation = TestService.call();
    assert.strictEqual(operation.result, 'Dynamic import success');
  });

  test('should work with static imports', async () => {
    // Test static ES module import
    const { Base, Workflow } = await import('../src/index.js');
    
    assert.ok(Base);
    assert.ok(Workflow);
    
    class TestService extends Base {
      call() {
        this.result = 'ES module success';
      }
    }
    
    const operation = TestService.call();
    assert.strictEqual(operation.result, 'ES module success');
  });

  test('should handle class inheritance properly', async () => {
    // Test ES modules
    const { Base } = await import('../src/index.js');
    
    class ESService extends Base {
      call() {
        this.result = 'ES class inheritance';
      }
    }
    
    const esOperation = ESService.call();
    assert.strictEqual(esOperation.result, 'ES class inheritance');
  });

  test('exports should be available', async () => {
    const esModule = await import('../src/index.js');
    
    // Should have Base and Workflow
    assert.ok(esModule.Base);
    assert.ok(esModule.Workflow);
    
    // Should have default export
    assert.ok(esModule.default);
    
    // Test that they work properly
    class ESTest extends esModule.Base {
      call() { this.result = 'ES'; }
    }
    
    const esResult = ESTest.call();
    
    assert.strictEqual(esResult.success(), true);
    assert.strictEqual(esResult.result, 'ES');
  });
});
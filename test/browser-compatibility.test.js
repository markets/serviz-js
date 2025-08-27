import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

// Create require for ES module context
const require = createRequire(import.meta.url);

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

  test('should work with CommonJS require', () => {
    // Test CommonJS compatibility
    const { Base, Workflow } = require('../dist/index.cjs');
    
    assert.ok(Base);
    assert.ok(Workflow);
    
    class TestService extends Base {
      call() {
        this.result = 'CommonJS success';
      }
    }
    
    const operation = TestService.call();
    assert.strictEqual(operation.result, 'CommonJS success');
  });

  test('should handle class inheritance properly in both module systems', async () => {
    // Test ES modules
    const { Base: ESBase } = await import('../src/index.js');
    
    class ESService extends ESBase {
      call() {
        this.result = 'ES class inheritance';
      }
    }
    
    const esOperation = ESService.call();
    assert.strictEqual(esOperation.result, 'ES class inheritance');
    
    // Test CommonJS
    const { Base: CJSBase } = require('../dist/index.cjs');
    
    class CJSService extends CJSBase {
      call() {
        this.result = 'CJS class inheritance';
      }
    }
    
    const cjsOperation = CJSService.call();
    assert.strictEqual(cjsOperation.result, 'CJS class inheritance');
  });

  test('exports should be consistent between ES and CommonJS', async () => {
    const esModule = await import('../src/index.js');
    const cjsModule = require('../dist/index.cjs');
    
    // Both should have Base and Workflow
    assert.ok(esModule.Base);
    assert.ok(esModule.Workflow);
    assert.ok(cjsModule.Base);
    assert.ok(cjsModule.Workflow);
    
    // Both should have default export
    assert.ok(esModule.default);
    assert.ok(cjsModule.default);
    
    // Test that they work the same way
    class ESTest extends esModule.Base {
      call() { this.result = 'ES'; }
    }
    
    class CJSTest extends cjsModule.Base {
      call() { this.result = 'CJS'; }
    }
    
    const esResult = ESTest.call();
    const cjsResult = CJSTest.call();
    
    assert.strictEqual(esResult.success(), true);
    assert.strictEqual(cjsResult.success(), true);
    assert.strictEqual(esResult.result, 'ES');
    assert.strictEqual(cjsResult.result, 'CJS');
  });
});
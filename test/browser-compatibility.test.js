import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('Browser Compatibility', () => {
  test('should work with dynamic imports', async () => {
    // Test dynamic import which is supported in both Node and browsers
    const { Serviz, ServizWorkflow } = await import('../src/index.js')
    
    assert.ok(Serviz)
    assert.ok(ServizWorkflow)
    
    class TestService extends Serviz {
      call() {
        this.result = 'Dynamic import success'
      }
    }
    
    const operation = TestService.call()
    assert.strictEqual(operation.result, 'Dynamic import success')
  })

  test('should work with static imports', async () => {
    // Test static ES module import
    const { Serviz, ServizWorkflow } = await import('../src/index.js')
    
    assert.ok(Serviz)
    assert.ok(ServizWorkflow)
    
    class TestService extends Serviz {
      call() {
        this.result = 'ES module success'
      }
    }
    
    const operation = TestService.call()
    assert.strictEqual(operation.result, 'ES module success')
  })

  test('should handle class inheritance properly', async () => {
    // Test ES modules
    const { Serviz } = await import('../src/index.js')
    
    class ESService extends Serviz {
      call() {
        this.result = 'ES class inheritance'
      }
    }
    
    const esOperation = ESService.call()
    assert.strictEqual(esOperation.result, 'ES class inheritance')
  })

  test('exports should be available', async () => {
    const esModule = await import('../src/index.js')
    
    // Should have Serviz and ServizWorkflow
    assert.ok(esModule.Serviz)
    assert.ok(esModule.ServizWorkflow)
    
    // Test that they work properly
    class ESTest extends esModule.Serviz {
      call() { this.result = 'ES' }
    }
    
    const esResult = ESTest.call()
    
    assert.strictEqual(esResult.success(), true)
    assert.strictEqual(esResult.result, 'ES')
  })
})
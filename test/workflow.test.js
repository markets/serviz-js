import { test, describe } from 'node:test'
import assert from 'node:assert'
import { ServizWorkflow } from '../src/workflow.js'
import { Step1, Step2 } from './scenarios.js'

describe('ServizWorkflow', () => {
  describe('basic workflow execution', () => {
    test('executes steps in sequence and returns the last result', () => {
      class TestWorkflow extends ServizWorkflow {
        constructor(arg1, arg2) {
          super()
          this.arg1 = arg1
          this.arg2 = arg2
        }
      }
      
      TestWorkflow.step(Step1, { 
        params: (instance) => ({ someFlag: instance.arg1 })
      })
      TestWorkflow.step(Step2, { 
        params: (instance) => ({ someFlag: instance.arg2 })
      })

      const operation = TestWorkflow.call('test1', 'test2')

      assert.strictEqual(operation.success(), true)
      assert.strictEqual(operation.result, 'step2_test2')
    })

    test('accumulates errors from failed steps', () => {
      class TestWorkflow extends ServizWorkflow {}
      
      TestWorkflow.step(Step1, { params: { someFlag: null } }) // This will fail
      TestWorkflow.step(Step2, { params: { someFlag: 'test' } })

      const operation = TestWorkflow.call()

      assert.strictEqual(operation.failure(), true)
      assert.ok(operation.errors.includes('Step1 failed'))
    })
  })

  describe('conditional execution', () => {
    test('skips steps when condition is false', () => {
      class TestWorkflow extends ServizWorkflow {}
      
      TestWorkflow.step(Step1, { params: { someFlag: null } }) // This will fail
      TestWorkflow.step(Step2, { 
        params: { someFlag: 'test' }, 
        if: (operation) => operation && operation.success()
      })

      const operation = TestWorkflow.call()

      assert.strictEqual(operation.failure(), true)
      assert.deepStrictEqual(operation.errors, ['Step1 failed'])
      assert.strictEqual(operation.result, null)
    })

    test('executes steps when condition is true', () => {
      class TestWorkflow extends ServizWorkflow {}
      
      TestWorkflow.step(Step1, { params: { someFlag: 'test1' } }) // This will succeed
      TestWorkflow.step(Step2, { 
        params: { someFlag: 'test2' }, 
        if: (operation) => operation && operation.success()
      })

      const operation = TestWorkflow.call()

      assert.strictEqual(operation.success(), true)
      assert.strictEqual(operation.result, 'step2_test2')
    })
  })

  describe('parameter handling', () => {
    test('uses workflow args when no params specified', () => {
      class TestWorkflow extends ServizWorkflow {}
      
      TestWorkflow.step(Step1) // Should use workflow constructor args

      const operation = TestWorkflow.call({ someFlag: 'workflow_test' })

      assert.strictEqual(operation.success(), true)
      assert.strictEqual(operation.result, 'step1_workflow_test')
    })

    test('uses static params when provided', () => {
      class TestWorkflow extends ServizWorkflow {}
      
      TestWorkflow.step(Step1, { params: { someFlag: 'static_test' } })

      const operation = TestWorkflow.call({ someFlag: 'ignored' })

      assert.strictEqual(operation.success(), true)
      assert.strictEqual(operation.result, 'step1_static_test')
    })

    test('uses dynamic params from function', () => {
      class TestWorkflow extends ServizWorkflow {
        constructor(flag) {
          super()
          this.dynamicFlag = flag
        }
      }
      
      TestWorkflow.step(Step1, { 
        params: (instance) => ({ someFlag: `dynamic_${instance.dynamicFlag}` })
      })

      const operation = TestWorkflow.call('test')

      assert.strictEqual(operation.success(), true)
      assert.strictEqual(operation.result, 'step1_dynamic_test')
    })
  })

  test('workflow inherits all serviz functionality', () => {
    class TestWorkflow extends ServizWorkflow {}
    
    TestWorkflow.step(Step1, { params: { someFlag: null } }) // This will fail

    const operation = TestWorkflow.call()

    // Test that workflow has all the serviz methods
    assert.strictEqual(typeof operation.success, 'function')
    assert.strictEqual(typeof operation.failure, 'function')
    assert.strictEqual(typeof operation.ok, 'function')
    assert.strictEqual(typeof operation.error, 'function')
    assert.strictEqual(typeof operation.errorMessages, 'function')
    
    assert.strictEqual(operation.failure(), true)
    assert.strictEqual(operation.errorMessages(), 'Step1 failed')
  })
})
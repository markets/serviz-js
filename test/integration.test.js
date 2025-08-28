import { test, describe } from 'node:test'
import assert from 'node:assert'
import { Serviz, ServizWorkflow } from '../src/index.js'

describe('Integration', () => {
  test('complete user registration workflow example', () => {
    // Define service classes
    class ValidateUser extends Serviz {
      constructor(userData) {
        super()
        this.userData = userData
      }

      call() {
        if (!this.userData) {
          this.errors.push('User data is required')
          return
        }

        if (!this.userData.email) {
          this.errors.push('Email is required')
          return
        }

        if (!this.userData.name) {
          this.errors.push('Name is required')
          return
        }

        this.result = this.userData
      }
    }

    class RegisterUser extends Serviz {
      constructor(userData) {
        super()
        this.userData = userData
      }

      call() {
        // Simulate registration
        const user = { 
          id: Math.random().toString(36), 
          ...this.userData,
          registeredAt: new Date().toISOString()
        }
        this.result = user
      }
    }

    class SendWelcomeEmail extends Serviz {
      constructor(user) {
        super()
        this.user = user
      }

      call() {
        // Simulate sending email
        this.result = `Welcome email sent to ${this.user.email}`
      }
    }

    // Define workflow
    class UserOnboarding extends ServizWorkflow {
    }

    UserOnboarding.step(ValidateUser)
    UserOnboarding.step(RegisterUser, { 
      if: (lastStep) => lastStep && lastStep.success()
    })
    UserOnboarding.step(SendWelcomeEmail, { 
      params: (instance) => instance._lastStep.result,
      if: (lastStep) => lastStep && lastStep.success()
    })

    // Test successful flow
    const successfulOnboarding = UserOnboarding.call({
      name: 'John Doe',
      email: 'john@example.com'
    })

    assert.strictEqual(successfulOnboarding.success(), true)
    assert.ok(successfulOnboarding.result.includes('Welcome email sent to john@example.com'))

    // Test failed validation
    const failedOnboarding = UserOnboarding.call({
      name: 'Jane Doe'
      // Missing email
    })

    assert.strictEqual(failedOnboarding.failure(), true)
    assert.ok(failedOnboarding.errors.includes('Email is required'))
  })
})

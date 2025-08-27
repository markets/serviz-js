import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Serviz as Base, ServizWorkflow as Workflow } from '../src/index.js';

describe('Integration', () => {
  test('can import everything from main module', () => {
    assert.ok(Base);
    assert.ok(Workflow);
    assert.strictEqual(typeof Base, 'function');
    assert.strictEqual(typeof Workflow, 'function');
  });

  test('complete user registration workflow example', () => {
    // Define service classes
    class ValidateUser extends Base {
      constructor(userData) {
        super();
        this.userData = userData;
      }

      call() {
        if (!this.userData) {
          this.errors.push('User data is required');
          return;
        }

        if (!this.userData.email) {
          this.errors.push('Email is required');
          return;
        }

        if (!this.userData.name) {
          this.errors.push('Name is required');
          return;
        }

        this.result = this.userData;
      }
    }

    class RegisterUser extends Base {
      constructor(userData) {
        super();
        this.userData = userData;
      }

      call() {
        // Simulate registration
        const user = { 
          id: Math.random().toString(36), 
          ...this.userData,
          registeredAt: new Date().toISOString()
        };
        this.result = user;
      }
    }

    class SendWelcomeEmail extends Base {
      constructor(user) {
        super();
        this.user = user;
      }

      call() {
        // Simulate sending email
        this.result = `Welcome email sent to ${this.user.email}`;
      }
    }

    // Define workflow
    class UserOnboarding extends Workflow {
      constructor(userData) {
        super();
        this.userData = userData;
      }
    }

    UserOnboarding.step(ValidateUser, { 
      params: (instance) => instance.userData 
    });
    UserOnboarding.step(RegisterUser, { 
      params: (instance) => instance.userData,
      if: (lastStep) => lastStep && lastStep.success()
    });
    UserOnboarding.step(SendWelcomeEmail, { 
      params: (instance) => instance._lastStep.result,
      if: (lastStep) => lastStep && lastStep.success()
    });

    // Test successful flow
    const successfulOnboarding = UserOnboarding.call({
      name: 'John Doe',
      email: 'john@example.com'
    });

    assert.strictEqual(successfulOnboarding.success(), true);
    assert.ok(successfulOnboarding.result.includes('Welcome email sent to john@example.com'));

    // Test failed validation
    const failedOnboarding = UserOnboarding.call({
      name: 'Jane Doe'
      // Missing email
    });

    assert.strictEqual(failedOnboarding.failure(), true);
    assert.ok(failedOnboarding.errors.includes('Email is required'));
  });

  test('block syntax simulation with call', () => {
    class TestService extends Base {
      constructor(shouldFail = false) {
        super();
        this.shouldFail = shouldFail;
      }

      call() {
        if (this.shouldFail) {
          this.errors.push('Intentional failure');
        } else {
          this.result = 'Success!';
        }
      }
    }

    let successMessage = '';
    let errorMessage = '';

    TestService.call(false, (operation) => {
      if (operation.success()) {
        successMessage = 'Operation succeeded!';
      }
    });

    TestService.call(true, (operation) => {
      if (operation.failure()) {
        errorMessage = 'Operation failed!';
      }
    });

    assert.strictEqual(successMessage, 'Operation succeeded!');
    assert.strictEqual(errorMessage, 'Operation failed!');
  });
});
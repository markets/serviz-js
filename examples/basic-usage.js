#!/usr/bin/env node

// This example demonstrates basic usage of serviz-js
import { Base, Workflow } from '../src/index.js';

// Define a simple service
class GreetUser extends Base {
  constructor(name) {
    super();
    this.name = name;
  }

  call() {
    if (!this.name) {
      this.errors.push('Name is required');
      return;
    }

    this.result = `Hello, ${this.name}!`;
  }
}

// Define services for workflow example
class ValidateName extends Base {
  constructor(name) {
    super();
    this.name = name;
  }

  call() {
    if (!this.name || this.name.trim().length === 0) {
      this.errors.push('Name cannot be empty');
    } else {
      this.result = this.name.trim();
    }
  }
}

class FormatGreeting extends Base {
  constructor(name) {
    super();
    this.name = name;
  }

  call() {
    this.result = `🎉 Welcome, ${this.name}! 🎉`;
  }
}

// Define a workflow
class GreetingWorkflow extends Workflow {
  constructor(name) {
    super();
    this.name = name;
  }
}

GreetingWorkflow.step(ValidateName, {
  params: (instance) => instance.name
});

GreetingWorkflow.step(FormatGreeting, {
  params: (instance) => instance._lastStep.result,
  if: (lastStep) => lastStep && lastStep.success()
});

// Example usage
console.log('=== Basic Service Example ===');

const greeting1 = GreetUser.call('Alice');
if (greeting1.success()) {
  console.log(greeting1.result); // "Hello, Alice!"
} else {
  console.log('Error:', greeting1.errorMessages());
}

const greeting2 = GreetUser.call(null);
if (greeting2.failure()) {
  console.log('Error:', greeting2.errorMessages()); // "Error: Name is required"
}

console.log('\n=== Workflow Example ===');

const workflow1 = GreetingWorkflow.call('Bob');
if (workflow1.success()) {
  console.log(workflow1.result); // "🎉 Welcome, Bob! 🎉"
} else {
  console.log('Error:', workflow1.errorMessages());
}

const workflow2 = GreetingWorkflow.call('');
if (workflow2.failure()) {
  console.log('Error:', workflow2.errorMessages()); // "Error: Name cannot be empty"
}

console.log('\n=== Block Syntax Example ===');

GreetUser.callWithBlock('Charlie', (operation) => {
  if (operation.success()) {
    console.log('Success:', operation.result);
  } else {
    console.log('Failed:', operation.errorMessages());
  }
});

console.log('\nExample completed successfully!');
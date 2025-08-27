# serviz-js

[![npm version](https://badge.fury.io/js/serviz.svg)](https://badge.fury.io/js/serviz)
[![CI](https://github.com/markets/serviz-js/actions/workflows/ci.yml/badge.svg)](https://github.com/markets/serviz-js/actions/workflows/ci.yml)

> Minimalistic Service Class Interface for JavaScript - A port of the Ruby gem [serviz](https://github.com/markets/serviz)

`serviz-js` provides a minimal interface to unify and homogenize your *Service* or *Command* objects in your JavaScript code. It works in both Node.js and browser environments.

## Installation

```bash
npm install serviz
```

## Usage

- Your class should extend from `Base`
- Your class should implement a `call()` method
- Return the _result_ via `this.result = value`
- Add _errors_ via `this.errors.push('error message')`
- Check the status via the provided `success()` or `failure()` methods

### Example

First, you should create a _Service_ class:

```javascript
import { Base } from 'serviz';

class RegisterUser extends Base {
  constructor(user) {
    super();
    this.user = user;
  }

  call() {
    if (this.user && this.user.email) {
      // Simulate user registration
      this.result = {
        id: Math.random().toString(36),
        ...this.user,
        registeredAt: new Date()
      };
    } else {
      this.errors.push('Invalid user data');
    }
  }
}
```

Now, you can run it by using the `call` method:

```javascript
const operation = RegisterUser.call({ name: 'John', email: 'john@example.com' });

if (operation.success()) {
  const user = operation.result;
  console.log(`Success! ${user.name} registered!`);
} else {
  console.log(`Error! ${operation.errorMessages()}`);
}
```

As you can see in the example above, you can use the `success()` method to check if your operation succeeded. You can also use the `ok()` alias.

In case you want to check if the operation failed, you can use the `failure()` method (or the alias `error()`):

```javascript
if (operation.failure()) {
  console.log("Error! Please try again...");
  return;
}
```

### Block syntax

You may like to use the _block_ syntax with `callWithBlock`:

```javascript
RegisterUser.callWithBlock(user, (operation) => {
  console.log("Success!") if operation.ok();
});
```

## Workflows

`serviz-js` also provides a `Workflow` class that allows you to compose multiple service objects together using a clean, declarative API for orchestrating complex multi-step operations.

### Basic Workflow Usage

```javascript
import { Workflow } from 'serviz';

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

// Usage
const operation = UserOnboarding.call({
  name: 'John Doe',
  email: 'john@example.com'
});

console.log(operation.success()); // => true
console.log(operation.result);    // => result from SendWelcomeEmail

// Handles failures gracefully
const failedOperation = UserOnboarding.call({
  name: 'Jane Doe'
  // Missing email
});

console.log(failedOperation.failure()); // => true
console.log(failedOperation.errors);    // => ["Email is required"]
```

### Advanced Workflow Features

- **Declarative step definition** using class-level `step()` method declarations
- **Conditional execution** using the `if:` option to control whether steps run based on previous results
- **Error accumulation** from all failed steps in the workflow
- **Result chaining** where the last successful step's result becomes the workflow result
- **Full compatibility** with the existing serviz interface (`success()`, `failure()`, `errors`, `result`)

### Custom Parameters

You can also pass custom parameters to individual steps:

```javascript
class OrderProcessing extends Workflow {}

OrderProcessing.step(ValidateOrder);

OrderProcessing.step(ChargePayment, { 
  params: { gateway: 'stripe' }, 
  if: (lastStep) => lastStep.success() 
});

OrderProcessing.step(ShipOrder, { 
  if: (lastStep) => lastStep.success() 
});
```

## Browser Usage

serviz-js works in browser environments via ES modules:

```html
<script type="module">
  import { Base, Workflow } from './node_modules/serviz/src/index.js';
  
  class MyService extends Base {
    call() {
      this.result = 'Hello from browser!';
    }
  }
  
  const result = MyService.call();
  console.log(result.result); // "Hello from browser!"
</script>
```

Or with a bundler like Webpack, Rollup, or Vite:

```javascript
import { Base, Workflow } from 'serviz';
```

## CommonJS Support

For CommonJS environments:

```javascript
const { Base, Workflow } = require('serviz');

class MyService extends Base {
  call() {
    this.result = 'Hello from CommonJS!';
  }
}

const result = MyService.call();
console.log(result.result); // "Hello from CommonJS!"
```

## API Reference

### Base Class

#### Static Methods

- `Base.call(...args)` - Creates instance with args and calls it
- `Base.callWithBlock(...args, callback)` - Creates instance and calls callback with result

#### Instance Methods

- `call()` - Must be implemented by subclasses
- `success()` / `ok()` - Returns true if no errors
- `failure()` / `error()` - Returns true if has errors  
- `errorMessages(separator = ', ')` - Join errors with separator

#### Properties

- `result` - The operation result
- `errors` - Array of error messages

### Workflow Class

Extends Base with additional workflow capabilities.

#### Static Methods

- `Workflow.step(ServiceClass, options)` - Define a workflow step
  - `options.params` - Parameters to pass (value or function)
  - `options.if` - Condition function for execution

## Development

To contribute to this project:

```bash
git clone https://github.com/markets/serviz-js.git
cd serviz-js
npm install
npm test
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Build CommonJS version
npm run build
```

## Compatibility

- **Node.js**: 18.0.0+
- **Browsers**: All modern browsers with ES module support
- **Module Systems**: ES modules and CommonJS

## License

Copyright (c) Marc Anguera. `serviz-js` is released under the [MIT](LICENSE) License.

## Credits

This is a JavaScript port of the Ruby gem [serviz](https://github.com/markets/serviz) by Marc Anguera.
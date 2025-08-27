import { Serviz } from '../src/base.js';

// Test service classes - equivalent to Ruby scenarios

export class RegisterUser extends Serviz {
  constructor(user = null) {
    super();
    this.user = user;
  }

  call() {
    if (this.user) {
      this.result = this.user;
    } else {
      this.errors.push('No user!');
    }
  }
}

export class PositionalAndKeyword extends Serviz {
  constructor(positional, options = {}) {
    super();
    this.positional = positional;
    this.keyword = options.keyword;
  }

  call() {
    this.result = [this.positional, this.keyword];
  }
}

export class NoCall extends Serviz {
  // Intentionally doesn't implement call() to test error handling
}

// Test services for Workflow
export class Step1 extends Serviz {
  constructor(options = {}) {
    super();
    this.someFlag = options.some_flag || options.someFlag;
  }

  call() {
    if (this.someFlag) {
      this.result = `step1_${this.someFlag}`;
    } else {
      this.errors.push('Step1 failed');
    }
  }
}

export class Step2 extends Serviz {
  constructor(options = {}) {
    super();
    this.someFlag = options.some_flag || options.someFlag;
  }

  call() {
    if (this.someFlag) {
      this.result = `step2_${this.someFlag}`;
    } else {
      this.errors.push('Step2 failed');
    }
  }
}
export class Base {
  constructor() {
    this._errors = [];
    this._result = null;
  }

  static call(...args) {
    const block = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const instance = new this(...args);
    instance.call();
    
    if (block) {
      block(instance);
    }
    
    return instance;
  }

  call() {
    throw new Error('NotImplementedError: call method must be implemented');
  }

  get errors() {
    return this._errors;
  }

  set errors(value) {
    this._errors = Array.isArray(value) ? value : [];
  }

  get result() {
    return this._result;
  }

  set result(value) {
    this._result = value;
  }

  errorMessages(separator = ', ') {
    return this.errors.join(separator);
  }

  success() {
    return !this.failure();
  }

  ok() {
    return this.success();
  }

  failure() {
    return this.errors.length > 0;
  }

  error() {
    return this.failure();
  }
}
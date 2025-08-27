/**
 * Base class for service objects in serviz
 * Provides a minimal interface for service/command objects
 */
export class Base {
  constructor() {
    this._errors = [];
    this._result = null;
  }

  /**
   * Class method to create instance and call it
   * @param {...any} args - Arguments to pass to constructor and optional callback function
   * @returns {Base} The service instance after calling
   */
  static call(...args) {
    const block = typeof args[args.length - 1] === 'function' ? args.pop() : null;
    const instance = new this(...args);
    instance.call();
    
    if (block) {
      block(instance);
    }
    
    return instance;
  }

  /**
   * Instance method that must be implemented by subclasses
   * @throws {Error} NotImplementedError if not overridden
   */
  call() {
    throw new Error('NotImplementedError: call method must be implemented');
  }

  /**
   * Get the errors array
   * @returns {Array<string>} Array of error messages
   */
  get errors() {
    return this._errors;
  }

  /**
   * Set the errors array
   * @param {Array<string>} value - Array of error messages
   */
  set errors(value) {
    this._errors = Array.isArray(value) ? value : [];
  }

  /**
   * Get the result
   * @returns {any} The operation result
   */
  get result() {
    return this._result;
  }

  /**
   * Set the result
   * @param {any} value - The operation result
   */
  set result(value) {
    this._result = value;
  }

  /**
   * Join error messages with separator
   * @param {string} [separator=', '] - Separator to join messages
   * @returns {string} Joined error messages
   */
  errorMessages(separator = ', ') {
    return this.errors.join(separator);
  }

  /**
   * Check if operation was successful (no errors)
   * @returns {boolean} true if no errors
   */
  success() {
    return !this.failure();
  }

  /**
   * Alias for success()
   * @returns {boolean} true if no errors
   */
  ok() {
    return this.success();
  }

  /**
   * Check if operation failed (has errors)
   * @returns {boolean} true if has errors
   */
  failure() {
    return this.errors.length > 0;
  }

  /**
   * Alias for failure()
   * @returns {boolean} true if has errors
   */
  error() {
    return this.failure();
  }
}
import { Base } from './base.js';

/**
 * Workflow class for orchestrating multiple service objects
 * Extends Base to provide step-by-step execution with conditional logic
 */
export class Workflow extends Base {
  constructor(...args) {
    super();
    this._lastStep = null;
    this._args = args;
    this._steps = this.constructor._steps || [];
  }

  /**
   * Define a step in the workflow
   * @param {Function} serviceClass - The service class to execute
   * @param {Object} [options={}] - Step configuration
   * @param {any} [options.params] - Parameters to pass to the service
   * @param {Function} [options.if] - Condition function to check before execution
   */
  static step(serviceClass, options = {}) {
    if (!this._steps) {
      this._steps = [];
    }
    
    this._steps.push({
      serviceClass,
      params: options.params,
      condition: options.if
    });
  }

  /**
   * Get the steps defined for this workflow class
   * @returns {Array} Array of step configurations
   */
  static get steps() {
    return this._steps || [];
  }

  /**
   * Execute the workflow by running each step
   */
  call() {
    for (const stepConfig of this._steps) {
      // Check condition if provided
      if (stepConfig.condition && !stepConfig.condition(this._lastStep)) {
        continue;
      }

      // Execute the step
      const operation = this._executeStep(stepConfig);

      // Accumulate errors if the operation failed
      if (operation.failure()) {
        this.errors.push(...operation.errors);
      }

      // Update last step and result
      this._lastStep = operation;
      this.result = operation.result;
    }

    return this;
  }

  /**
   * Execute a single step in the workflow
   * @private
   * @param {Object} stepConfig - Step configuration
   * @returns {Base} The executed service instance
   */
  _executeStep(stepConfig) {
    const { serviceClass, params } = stepConfig;

    if (params !== undefined && params !== null) {
      // Use step-specific params
      const stepParams = typeof params === 'function' ? params(this) : params;
      
      if (Array.isArray(stepParams)) {
        return serviceClass.call(...stepParams);
      } else if (typeof stepParams === 'object' && stepParams !== null) {
        return serviceClass.call(stepParams);
      } else {
        return serviceClass.call(stepParams);
      }
    } else {
      // Use workflow args
      return serviceClass.call(...this._args);
    }
  }
}
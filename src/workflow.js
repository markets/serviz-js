import { Serviz } from './base.js';

export class ServizWorkflow extends Serviz {
  constructor(...args) {
    super();
    this._lastStep = null;
    this._args = args;
    this._steps = this.constructor._steps || [];
  }

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

  static get steps() {
    return this._steps || [];
  }

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
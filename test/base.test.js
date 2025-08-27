import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Serviz } from '../src/serviz.js';
import { RegisterUser, PositionalAndKeyword, NoCall } from './scenarios.js';

describe('Serviz', () => {
  test('operation success', () => {
    const user = 'random_user';
    const operation = RegisterUser.call(user);

    assert.strictEqual(operation.success(), true);
    assert.strictEqual(operation.ok(), true);
    assert.strictEqual(operation.failure(), false);
    assert.strictEqual(operation.errors.length, 0);
    assert.strictEqual(operation.errorMessages(), '');
    assert.strictEqual(operation.result, user);
  });

  test('operation error', () => {
    const operation = RegisterUser.call(null);

    assert.strictEqual(operation.success(), false);
    assert.strictEqual(operation.failure(), true);
    assert.strictEqual(operation.error(), true);
    assert.strictEqual(operation.errors.length, 1);
    assert.strictEqual(operation.errorMessages(), 'No user!');
    assert.strictEqual(operation.result, null);
  });

  test('raises exception if call is not implemented', () => {
    assert.throws(() => {
      NoCall.call();
    }, {
      name: 'Error',
      message: 'NotImplementedError: call method must be implemented'
    });
  });

  test('accepts positional and keyword args', () => {
    const operation = PositionalAndKeyword.call('foo', { keyword: 'bar' });

    assert.strictEqual(operation.success(), true);
    assert.deepStrictEqual(operation.result, ['foo', 'bar']);
  });

  test('accepts a block via call', () => {
    let blockCalled = false;
    let blockOperation = null;

    RegisterUser.call(null, (operation) => {
      blockCalled = true;
      blockOperation = operation;
    });

    assert.strictEqual(blockCalled, true);
    assert.strictEqual(blockOperation.failure(), true);
  });

  test('error messages with custom separator', () => {
    const operation = new RegisterUser(null);
    operation.call();
    operation.errors.push('Another error');

    assert.strictEqual(operation.errorMessages(' | '), 'No user! | Another error');
  });

  test('can manually set errors and result', () => {
    const operation = new RegisterUser();
    operation.errors = ['Manual error'];
    operation.result = 'Manual result';

    assert.strictEqual(operation.failure(), true);
    assert.strictEqual(operation.result, 'Manual result');
    assert.deepStrictEqual(operation.errors, ['Manual error']);
  });
});
import parseStack from 'parse-stack';
import { generate as randomString } from 'randomstring';
import { compose } from '../utils';
import configureStore from '../redux';
import KarelError from './KarelError';
import { karelDied } from './duck';

/**
 * TODO:
 * - Check for args
 */

const generateSecretVarName = () => `___karel_internals_${randomString()}___`;

const getLineNum = (offset = 0, err = new Error, idx = 2) => {
  const { lineNumber: line } = parseStack(err)[idx];
  return (line - offset) + 1; // Lines are 1-indexed
};

const prepFunctions = (store, getLineOffset, functions) => {
  const actions = [];
  const names = [];
  const values = [];
  const hasProp = {}.hasOwnProperty;
  const getState = store.getState;
  const getLine = () => getLineNum(getLineOffset(), undefined, 3);

  const dispatch = action => {
    actions.push(action);
    store.dispatch(action);
  };

  const wrapFunction = f => (...args) => f(getLine(), ...args);

  for (const key in functions) {
    if (!hasProp.call(functions, key)) continue;
    names.push(key);
    values.push(wrapFunction(functions[key](dispatch, getState)));
  }

  return { names, values, actions };
};

/**
 * Execute some Karel code.
 *
 * @param code: the code to execute. (Warning: this is totally vulernable to every possible attack.)
 * @param functions<String: Function>: A maping of functions to expose to the code. The key is the
 *                                     exposed name, the value is a redux action-creator which
 *                                     creates the relevant actions.
 * @param store: a *COPY* of the store to execute the code against *THIS SHOULD NOT BE THE REAL STORE*
 */
const runKarel = (code, functions, store) => {
  const __karel__ = generateSecretVarName();
  let lineOffset;

  code = `"use strict";\n${__karel__}.initLineNums();\n${code}`;

  const karelInternals = {
    initLineNums() {
      lineOffset = getLineNum();
    },
  };

  // We pass lineOffset as a thunk because we don't know what it is yet, and we can't do inout.
  const { names, values, actions } = prepFunctions(store, () => lineOffset, functions);

  try {
    new Function(__karel__, ...names, code)(karelInternals, ...values);
  } catch (e) {
    if (e.earlyExit) return actions;
    console.log(e.message);
    console.log(e.stack);
    if (!e.karel) {
      // (At least in Chrome), syntax errors in new Function don't report where or what they are,
      // just that there's *something* wrong. (Neither does eval)
      e = KarelError(e.message, { line: null }, e);
    }
    actions.pop(); // Get rid of the failed command.
    // This is cheating a bit so we don't return actions with a thunk in it.
    karelDied(e)(::actions.push);
  }
  return actions;
};

export default runKarel;

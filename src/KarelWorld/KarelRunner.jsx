import parseStack from 'parse-stack';
import { generate as randomString } from 'randomstring';

/**
 * TODO:
 * - Check for args
 * - We need to parse all the actions twice: Once as their executing, to ensure a valid state and to allow conditionals, and once
 *   as we're rendering it.
 */

const generateSecretVarName = () => `___karel_internals_${randomString()}___`;

const getLineNum = (offset = 0) => {
  let { lineNumber: line } = parseStack(new Error)[2];
  line += offset;
  return line;
};

const prepFunctions = (actions, lineOffset, functions) => {
  const names  = [];
  const values = [];
  const hasProp = {}.hasOwnProperty;

  const wrapFunction = f => (...args) => {
    const ret = f(getLineNum(lineOffset), ...args);
    actions.push(ret.action);
  };

  for (const key in functions) {
    if (!hasProp.call(functions, key)) continue;
    names.push(key);
    values.push(wrapFunction(functions[key]));
  }

  return { names, values };
};

/**
 * Execute some Karel code.
 *
 * @param code: the code to execute. (Warning: this is totally vulernable to every possible attack.)
 * @param functions<String: Function>: A maping of functions to expose to the code. The key is the exposed name,
 *                                     the value is a redux action-creator which creates the relevant actions.
 */
const runKarel = (code, functions) => {
  const actions = [];
  const __karel__ = generateSecretVarName();
  let lineOffset;

  code = `${__karel__}.initLineNums();\n${code}`;

  const karelInternals = {
    initLineNums() {
      const { line } = getLineNum();
      lineOffset = line + 1; // initLineNums is on it's own line to preserve the collumns.
    },
  };

  const { names, values } = prepFunctions(actions, lineOffset, functions);

  new Function(__karel__, ...names, code)(karelInternals, ...values);
  return actions;
};

export default runKarel;

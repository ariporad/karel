export const KarelError = (msg, { cmd = null, line = null }, err = new Error) => {
  if (err.name === 'Error') err.name = 'KarelError';
  err.message = msg;
  err.karel = true;
  if (typeof cmd === 'string' && typeof line === 'number') {
    err.stack = `At \`${cmd}\` on line ${line}.`;
  } else if (typeof line === 'number') {
    err.stack = `On line ${line}.`;
  } else {
    err.stack = `That's all we know.`;
  }
  err.line = line;
  err.cmd = cmd;

  return err;
};

export default KarelError;


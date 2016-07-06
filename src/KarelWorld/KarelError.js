export const KarelError = (msg, { cmd, line }) => {
  const err = new Error(msg);

  err.karel = true;
  err.stack = `\`${cmd}\` at line ${line}.`;
  err.line = line;
  err.cmd = cmd;

  return err;
};

export default KarelError;

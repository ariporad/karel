import Overlay from './Overlay';

const styles = {
  stack: {
  },
  code: {
    fontFamily: 'monospace',
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
};

const ErrorOverlay = Radium(({ err: { message, line, cmd }, height, width, size }) => {
  // We don't care about the grid.
  height = height * size;
  width = width * size;

  let msg;
  if (typeof line === 'number' && typeof cmd === 'string') {
    msg = (
      <text
        textAnchor="middle"
        x={width / 2}
        y={height / 2 + 15}
        style={[styles.text, styles.stack]}
        fill="#FFFFFF"
      >
        At <tspan style={[styles.code]}>{cmd}</tspan> on line {line}.
      </text>
    );
  } else if (typeof line === 'number') {
    msg = (
      <text
        textAnchor="middle"
        x={width / 2}
        y={height / 2 + 15}
        style={[styles.text, styles.stack]}
        fill="#FFFFFF"
      >
        On line {line}.
      </text>
    );
  }

  return <Overlay fill='#FF0000' title={message} height={height} width={width}>{msg}</Overlay>;
});

export default ErrorOverlay;


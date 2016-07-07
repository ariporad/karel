const ERROR_BOX_HEIGHT = 150;
const ERROR_BOX_WIDTH  = 300;

const styles = {
  text: {
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '16pt',
  },
  stack: {
  },
  code: {
    fontFamily: 'monospace',
  },
};

const ErrorOverlay = Radium(({ err: { message, line, cmd }, height, width, size }) => {
  // We don't care about the grid.
  height = height * size;
  width = width * size;

  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill='#888888' opacity={0.9}/>
      <rect
        x={(width - ERROR_BOX_WIDTH) / 2}
        y={(height - ERROR_BOX_HEIGHT) / 2}
        rx={20}
        ry={20}
        width={ERROR_BOX_WIDTH}
        height={ERROR_BOX_HEIGHT}
        fill='#FF0000'
      />
      <text
        textAnchor='middle'
        x={width / 2}
        y={height / 2 - 10}
        style={[styles.text, styles.title]}
        fill='#FFFFFF'
      >{ message }</text>
      <text textAnchor='middle' x={width / 2} y={height / 2 + 15} style={[styles.text, styles.stack]} fill='#FFFFFF'>
        At <tspan style={[styles.code]}>{ cmd }</tspan> on line { line }.
      </text>
    </g>
  );
});

export default ErrorOverlay;


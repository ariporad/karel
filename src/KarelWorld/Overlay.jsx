const BOX_HEIGHT = 150;
const BOX_WIDTH = 300;

const styles = {
  text: {
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '16pt',
  },
};

const Overlay = Radium(({ fill, title, height, width, children }) => {
  let titleY = React.Children.count(children) > 0 ? height / 2 - 10 : height / 2;
  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill="#888888" opacity={0.9} />
      <rect
        x={(width - BOX_WIDTH) / 2}
        y={(height - BOX_HEIGHT) / 2}
        rx={20}
        ry={20}
        width={BOX_WIDTH}
        height={BOX_HEIGHT}
        fill={fill}
      />
      <text
        textAnchor="middle"
        x={width / 2}
        y={titleY}
        style={[styles.text, styles.title]}
        fill="#FFFFFF"
      >{title}</text>
      {children}
    </g>
  );
});

export default Overlay;


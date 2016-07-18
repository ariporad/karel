const BOX_HEIGHT_FACTOR = 0.375;
const BOX_WIDTH_FACTOR = 0.75;

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
  let titleY = React.Children.count(children) > 0 ? height / 2 - (height * (1/15)) : height / 2;
  const boxWidth = BOX_WIDTH_FACTOR * width;
  const boxHeight = BOX_HEIGHT_FACTOR * height;
  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill="#888888" opacity={0.9} />
      <rect
        x={(width - boxWidth) / 2}
        y={(height - boxHeight) / 2}
        rx={width/20}
        ry={width/20}
        width={boxWidth}
        height={boxHeight}
        fill={fill}
      />
      <text
        textAnchor="middle"
        x={width / 2}
        y={titleY}
        style={[styles.text, styles.title, { fontSize: width / 17 }]}
        fill="#FFFFFF"
      >{title}</text>
      <g style={[{ fontSize: width / 25 }]}>
        {children}
      </g>
    </g>
  );
});

export default Overlay;


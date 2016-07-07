import Radium from 'radium';
import { connect }  from 'react-redux';
import KarelSpy from './KarelSpy';
import runKarel from './KarelRunner';
import ErrorOverlay from './ErrorOverlay';

const generateBorders = (width, height, size) => {
  const padding = LASER_WIDTH / 2;
  const fullX = width * size - padding;
  const fullY = height * size - padding;
  const createBorder = ({ x1 = padding, y1 = padding, x2 = padding, y2 = padding }) => (
    <Laser x1={x1} y1={y1} x2={x2} y2={y2} key={[x1, y1, x2, y2].join(',')} />
  );
  return [
    createBorder({ x1: fullX }),
    createBorder({ y1: fullY }),
    createBorder({ x1: fullX, y1: padding, x2: fullX, y2: fullY }),
    createBorder({ x1: padding, y1: fullY, x2: fullX, y2: fullY }),
  ];
};

const LASER_WIDTH = 2;
export const Laser = ({ x, x1 = x, y1, x2 = x, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={LASER_WIDTH} stroke='red'/>
);

const styles = {
  bomb: {
    counter: {
      fontFamily: 'Ariel, sans-serif',
    },
  }
};
const cpos = size => pos => pos * size + size / 2;
let KarelWorld = Radium(({ size, karel, bombs, lasers, height, width, err }) => {
  const objects = [];
  const c = cpos(size);
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      objects.push(<circle key={`${x}:${y}`} cx={c(x)} cy={c(y)} r={5} />);
      if(lasers[y][x]) objects.push(<Laser key={`L${x}:${y}`} x={(x + 1) * size} y1={y * size} y2={y * size + size} />);
    }
  }
  bombs.forEach(bomb => {
    objects.push(<circle r={size / 5} cx={c(bomb.x)} cy={c(bomb.y)} key={`bomb @ (${bomb.x},${bomb.y})`} />);
    if (typeof bomb.limit === 'number') objects.push(
      <text
        x={c(bomb.x)}
        y={c(bomb.y)}
        dy='0.4em'
        style={[styles.bomb.counter]}
        textAnchor='middle'
        fill='white'
        key={`counter @ (${bomb.x},${bomb.y})`}
      >{bomb.limit}</text>
    );
  });
  return <svg height={height * size} width={width * size}>
    {generateBorders(width, height, size)}
    {objects}
    <KarelSpy cx={c(karel.x)} cy={c(karel.y)} dir={karel.dir} size={size}/>
    {err && <ErrorOverlay err={err} width={width} height={height} size={size}/>}
  </svg>;
});

KarelWorld = connect(({ KarelWorld: { karel, bombs, lasers, height, width, err } }) => {
  return { karel, bombs, lasers, height, width, err };
})(KarelWorld);

export default KarelWorld;


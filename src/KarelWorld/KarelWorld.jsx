import Radium from 'radium';
import { connect } from 'react-redux';
import KarelSpy from './KarelSpy';
import runKarel from './runKarel';
import ErrorOverlay from './ErrorOverlay';
import Overlay from './Overlay';
import crownSVG from 'file!./crown.svg';

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
  <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={LASER_WIDTH} stroke="red" />
);

const styles = {
  bomb: {
    counter: {
      fontFamily: 'Ariel, sans-serif',
    },
  },
  svg: {
    width: '100%',
    height: '100%',
  }
};
const cpos = size => pos => pos * size + size / 2;
const SIZE = 100;
export const _KarelWorld = Radium(({ style, karel, bombs, lasers, height, width, err, crown, won }) => {
  const objects = [];
  const c = cpos(SIZE);
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      objects.push(<circle key={`${x}:${y}`} cx={c(x)} cy={c(y)} r={5} />);
      if (lasers[y][x]) objects.push(<Laser key={`L${x}:${y}`} x={(x + 1) * SIZE} y1={y * SIZE} y2={y * SIZE + SIZE} />);
    }
  }
  bombs.forEach(bomb => {
    objects.push(<circle r={SIZE / 5} cx={c(bomb.x)} cy={c(bomb.y)} key={`bomb @ (${bomb.x},${bomb.y})`} />);
    if (typeof bomb.limit === 'number') objects.push(
      <text
        x={c(bomb.x)}
        y={c(bomb.y)}
        dy="0.4em"
        style={[styles.bomb.counter]}
        textAnchor="middle"
        fill="white"
        key={`counter @ (${bomb.x},${bomb.y})`}
      >{bomb.limit}</text>
    );
  });
  if (crown){
    const crownX = crown.x * SIZE + SIZE * .125;
    const crownY = crown.y * SIZE + SIZE * .125;
    objects.push(
      <image
        key='crown'
        x={crownX}
        y={crownY}
        width={SIZE * .75}
        height={SIZE * .75}
        xlinkHref={crownSVG}
      />
    );
  }
  return (
    <div style={style}>
      <svg style={styles.svg} viewBox={`0 0 ${width * SIZE} ${height * SIZE}`}>
        {generateBorders(width, height, SIZE)}
        {objects}
        <KarelSpy cx={c(karel.x)} cy={c(karel.y)} dir={karel.dir} size={SIZE} />
        {err && <ErrorOverlay err={err} width={width} height={height} size={SIZE} />}
        {won && <Overlay width={width * SIZE} height={height * SIZE} title={'World Complete!'} />}
      </svg>
    </div>
  );
});

const KarelWorld = connect(({ KarelWorld: { karel, bombs, lasers, height, width, err, crown, won } }) => {
  return { karel, bombs, lasers, height, width, err, crown, won };
})(_KarelWorld);

export default KarelWorld;


import Radium from 'radium';

const LASER_WIDTH = 2;
const styles = {
  bomb: {
    counter: {
      fontFamily: 'Ariel, sans-serif',
    },
  }
};


export const Laser = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={LASER_WIDTH} stroke='red'/>
);

export const KarelSpace = Radium(({ x, y, size, isKarel, bomb, laser }) => {
  const cx = (x * size) + (size / 2);
  const cy = (y * size) + (size / 2);

  let self;
  if (isKarel) {
    self = <circle r={size / 4} cx={cx} cy={cy} fill='brown'/>;
  } else if (bomb) {
    self = [<circle r={size / 5} cx={cx} cy={cy} key='bomb'/>];
    if (typeof bomb === 'number') self.push(
      <text x={cx} y={cy} dy='0.4em' style={[styles.bomb.counter]} textAnchor='middle' fill='white'>{bomb}</text>
    );
  } else {
    self = <circle r={5} cx={cx} cy={cy}/>;
  }

  const laserX = (x + 1) * size - LASER_WIDTH;
  if (laser) laser = <Laser x1={laserX} y1={y * size} x2={laserX} y2={y * size + size} />

  return (
    <g>
      {self}
      {laser}
    </g>
  );
});


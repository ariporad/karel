import { _KarelWorld } from '../src/KarelWorld/KarelWorld';
import runKarel from './runKarel';

// FIXME: MEMOIZE, CACHE, SHOULD_COMPONENT_UPDATE

const KarelWorld = ({ code, world, style }) => {
  const { final: { karel, bombs, lasers, height, width, err, crown, won } } = runKarel(world, code);
  return (
    <_KarelWorld
      err={err}
      won={won}
      style={style}
      karel={karel}
      bombs={bombs}
      crown={crown}
      width={width}
      height={height}
      lasers={lasers}
    />
  );
};

export default KarelWorld;


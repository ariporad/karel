import { _KarelWorld as KarelWorld } from '../src/KarelWorld/KarelWorld';
import runKarel from './runKarel';

// FIXME: MEMOIZE, CACHE, SHOULD_COMPONENT_UPDATE

const KarelWorld = ({ code, world, style }) => {
  const { final: { karel, bombs, height, width, err, crown, won } } = runKarel(code, world);
  return (
    <KarelWorld
      karel={karel}
      bombs={bombs}
      height={height}
      width={width}
      err={err}
      crown={crown}
      won={won}
      style={style}
    />
  );
};


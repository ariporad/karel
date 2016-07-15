import karelSVG from 'file!./karel.svg';
import superkarelSVG from 'file!./superkarel.svg';
import ultrakarelSVG from 'file!./ultrakarel.svg';

const KarelSpy = ({ cx, cy, dir, size }) => {
  const pad = size / 8;
  const x = (cx - size / 2) + pad;
  const y = (cy - size / 2) + pad;

  let transform = `rotate(${dir * -90}, ${cx}, ${cy})`;
  // Only flip when going left/right.
  // http://stackoverflow.com/a/23902773/1928484
  if (dir === 0 || dir === 2) transform = `translate(${2 * cx}, 0) scale(-1, 1) ${transform}`;
  else transform = `translate(0, ${2 * cy}) scale(1, -1) ${transform}`;

  return (
    <g transform={transform}>
      <image x={x} y={y} width={size * .75} height={size * .75} xlinkHref={karelSVG}/>
    </g>
  );
};

export default KarelSpy;


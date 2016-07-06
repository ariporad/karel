export const KarelSpy = ({ cx, cy, dir, size }) => {
  let x = cx - size / 2;
  let y = cy - size / 2;
  let pad = size / 8;
  return (
    <polygon
      transform={`rotate(${dir * -90}, ${cx}, ${cy})`}
      points={[[x + pad, y + pad], [x + pad, y + size - pad], [x + size - pad, cy]]}
      fill='black'
    />
  );
};


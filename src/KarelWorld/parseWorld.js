export const parseWorld = text => {
  const lines = text.trim().toUpperCase().split('\n');
  let karel = { x: 0, y: 0, dir: 0 };
  const bombs = []; // { x: 0, y: 0, limit: Num | false }
  const lasers = [];
  const height = lines.length;
  let width = 0;
  for (let y = 0; y < lines.length; ++y) {
    const line = lines[y].trim().split('');
    lasers[y] = [];
    for (let i = 0, x = 0; i < line.length; i += 2, x++) {
      if (!isNaN(parseInt(line[i], 10))) {
        let bombLimit = '';
        do {
          bombLimit += line[i];
        } while (i + 1 < line.length && !isNaN(parseInt(line[i + 1], 10)) && ++i);
        bombLimit = parseInt(bombLimit, 10);
        bombs.push({ x, y, limit: bombLimit });
      }
      if (line[i] === '#') bombs.push({ x, y, limit: false });
      if (line[i] === '*') karel = { x, y, dir: 0 };
      lasers[y][x] = line[i + 1] === '|';
      if (y === 0) width++; // Each loop is one 'space', but it's >=1 char.
    }
  }
  return { karel, bombs, lasers, height, width };
};


import { parseWorld } from './parseWorld';

describe('parseWorld()', () => {
  it('properly detects demensions', () => {
    const { height, width } = parseWorld(`
      . * .|.|.
      . 0 .|9999 .
      99999 . .|.|.
    `);

    expect(height).to.equal(3);
    expect(width).to.equal(5);
  });

  it('parses karel (`*`)', () => {
    const { karel: { x, y, dir } } = parseWorld(`
      . . . .
      .|.|*|.
      . .|.|.
      . . . .
    `);

    expect(x).to.equal(2);
    expect(y).to.equal(1);
    expect(dir).to.equal(0);
  });

  it('parses lasers', () => {
    const { lasers } = parseWorld(`
      . .|.
      .|.|.
    `);
    expect(lasers).to.deep.equal([
      [false, true, false],
      [true, true, false],
    ]);
  });

  it('parses limitless bombs', () => {
    const { bombs } = parseWorld(`
      . *|.
      # . .
    `);
    expect(bombs.length).to.equal(1);
    expect(bombs[0].limit).to.be.false();
    expect(bombs[0].x).to.equal(0);
    expect(bombs[0].y).to.equal(1);
  });

  it('parses limited bombs (single digit)', () => {
    const { bombs } = parseWorld(`
      . *|.
      4|. .
    `);
    expect(bombs.length).to.equal(1);
    expect(bombs[0].limit).to.equal(4);
    expect(bombs[0].x).to.equal(0);
    expect(bombs[0].y).to.equal(1);
  });

  it('parses limited bombs (multi-digit)', () => {
    const { bombs, karel } = parseWorld(`
      . .|.
      999|* .
    `);
    expect(bombs.length).to.equal(1);
    expect(bombs[0].limit).to.equal(999);
    expect(bombs[0].x).to.equal(0);
    expect(bombs[0].y).to.equal(1);
    expect(karel.x).to.equal(1);
    expect(karel.y).to.equal(1);
  });
});


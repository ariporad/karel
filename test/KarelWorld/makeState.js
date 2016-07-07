const makeState = (diff = {}) => Object.assign({
  width: 4,
  height: 4,
  karel: { x: 0, y: 3, dir: 0 },
  bombs: [{ x: 2, y: 0, limit: 9 }, { x: 0, y: 1, limit: 123 }, { x: 3, y: 2, limit: false }],
  lasers: [
    [false, true, false, false],
    [false, true, true, false],
    [false, true, true, false],
    [false, false, false, false],
  ],
  err: null,
}, diff);

export default makeState;


import { KarelError } from './KarelError';
import makeState from '../../test/KarelWorld/makeState';
import { moveForward, turnLeft, reset, karelDied, reducer } from './duck';

describe('KarelWorld/duck.js', () => {
  describe('Action Creators', () => {
    describe('moveForward()', () => {
      it('returns the proper action', () => {
        expect(moveForward(42)).to.deep.equal({
          type: 'karel/KarelWorld/MOVE_FORWARD',
          meta: {
            line: 42,
            cmd: 'moveForward();',
          },
        });
      });
    });

    describe('turnLeft()', () => {
      it('returns the proper action', () => {
        expect(turnLeft(42)).to.deep.equal({
          type: 'karel/KarelWorld/TURN_LEFT',
          meta: {
            line: 42,
            cmd: 'turnLeft();',
          },
        });
      });
    });

    describe('reset()', () => {
      it('should return the proper action', () => {
        expect(reset()).to.deep.equal({ type: 'karel/KarelWorld/RESET' });
      });
    });

    describe('karelDied()', () => {
      it('should return the proper action', () => {
        const err = { foo: 'bar' };
        expect(karelDied(err)).to.deep.equal({
          type: 'karel/KarelWorld/KAREL_DIED',
          error: true,
          payload: err,
        });
      });
    });
  });

  describe('reducer()', () => {
    it('inital state', () => {
      const state = reducer(undefined, { type: '@@TEST/INIT' });
      expect(state).to.deep.equal(makeState());
    });

    describe('Actions', () => {
      describe('MOVE_FORWARD', () => {
        it('properly decrements bombs', () => {
          const newState = reducer(
            makeState({ bombs: [
              { x: 2, y: 2, limit: 3 },
              { x: 3, y: 1, limit: 100 },
              { x: 1, y: 3, limit: false },
            ] }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          );
          expect(newState.bombs).to.deep.equal([
            { x: 2, y: 2, limit: 2 },
            { x: 3, y: 1, limit: 99 },
            { x: 1, y: 3, limit: false },
          ]);
        });

        it('raises a KarelError when a bomb goes off', () => {
          expect(() => reducer(
            makeState({ bombs: [{ x: 2, y: 2, limit: 1 }] }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          )).to.throw(/exploded/i, /bomb/i, KarelError);
        });

        it('allows movement in all four directions', () => {
          expect(reducer( // Right
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 2, y: 2, dir: 0 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.deep.equal({ x: 3, y: 2, dir: 0 });

          expect(reducer( // Up
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 2, y: 2, dir: 1 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.deep.equal({ x: 2, y: 1, dir: 1 });

          expect(reducer( // Left
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 2, y: 2, dir: 2 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.deep.equal({ x: 1, y: 2, dir: 2 });

          expect(reducer( // Down
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 2, y: 2, dir: 3 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.deep.equal({ x: 2, y: 3, dir: 3 });
        });

        it('throws a KarelError if you hit a wall', () => {
          expect(() => reducer( // Right
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 3, y: 2, dir: 0 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.throw(/wall/i);

          expect(() => reducer( // Up
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 2, y: 0, dir: 1 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.throw(/wall/i);

          expect(() => reducer( // Left
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 0, y: 2, dir: 2 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.throw(/wall/i);

          expect(() => reducer( // Down
            makeState({ lasers: [[], [], [], []], bombs: [], karel: { x: 2, y: 3, dir: 3 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          ).karel).to.throw(/wall/i);
        });

        it('throws a KarelError if you hit a tripwire', () => {
          // >|, .<|, |^|
          expect(() => reducer( // >|
            makeState({ lasers: [[true, true, false]], bombs: [], karel: { x: 0, y: 0, dir: 0 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          )).to.throw(/laser/i);

          expect(() => reducer( // .<|
            makeState({ lasers: [[false, true, false]], bombs: [], karel: { x: 1, y: 0, dir: 2 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          )).to.not.throw();

          expect(() => reducer( // |^|
            makeState({ lasers: [
              [true, true, false],
              [true, true, false],
              [true, true, false],
              [true, true, false],
            ], bombs: [], karel: { x: 1, y: 2, dir: 1 } }),
            { type: 'karel/KarelWorld/MOVE_FORWARD', meta: { line: 5, command: 'moveForward();' } }
          )).to.not.throw();
        });
      });

      describe('TURN_LEFT', () => {
        it('properly decrements bombs', () => {
          const newState = reducer(
            makeState({ bombs: [
              { x: 2, y: 2, limit: 3 },
              { x: 3, y: 1, limit: 100 },
              { x: 1, y: 3, limit: false },
            ] }),
            { type: 'karel/KarelWorld/TURN_LEFT', meta: { line: 5, command: 'turnLeft();' } }
          );
          expect(newState.bombs).to.deep.equal([
            { x: 2, y: 2, limit: 2 },
            { x: 3, y: 1, limit: 99 },
            { x: 1, y: 3, limit: false },
          ]);
        });

        it('raises a KarelError when a bomb goes off', () => {
          expect(() => reducer(
              makeState({ bombs: [{ x: 2, y: 2, limit: 1 }] }),
              { type: 'karel/KarelWorld/TURN_LEFT', meta: { line: 5, command: 'turnLeft();' } }
          )).to.throw(/exploded/i, /bomb/i);
        });

        it('properly turns left', () => {
          expect(reducer(
            makeState({ bombs: [], karel: { x: 0, y: 0, dir: 0 } }),
            { type: 'karel/KarelWorld/TURN_LEFT', meta: { line: 5, command: 'turnLeft();' } }
          ).karel.dir).to.equal(1);

          expect(reducer( // Wraparound
            makeState({ bombs: [], karel: { x: 0, y: 0, dir: 3 } }),
            { type: 'karel/KarelWorld/TURN_LEFT', meta: { line: 5, command: 'turnLeft();' } }
          ).karel.dir).to.equal(0);
        });
      });

      describe('RESET', () => {
        it('resets the state to it\'s default state', () => {
          expect(reducer(
            makeState({ bombs: [], karel: { x: 3, y: 2, dir: 1 } }),
            { type: 'karel/KarelWorld/RESET' }
          )).to.deep.equal(reducer(undefined, { type: '@@TEST/INIT' }));
        });
      });

      describe('KAREL_DIED', () => {
        it('sets the error', () => {
          const err = KarelError('Everything\'s broken!', { line: 5, cmd: 'test();' });
          expect(reducer(
            makeState(),
            { type: 'karel/KarelWorld/KAREL_DIED', error: true, payload: err }
          ).err).to.deep.equal(err);
        });
      });
    });
  });
});


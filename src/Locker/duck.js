const LOCK   = 'karel/Locker/LOCK';
const UNLOCK = 'karel/Locker/UNLOCK';

export const lock   = () => ({ type: LOCK   });
export const unlock = () => ({ type: UNLOCK });

export default (state = { locked: false }, action) => {
  switch (action.type) {
    case LOCK:   return { ...state, locked: true  };
    case UNLOCK: return { ...state, locked: false };
    default: return state;
  }
};


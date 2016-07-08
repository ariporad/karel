const SET_TITLE_DESC = 'karel/TopBar/SET_TITLE_DESC';

export const setTitleDesc = (title, desc) => ({ type: SET_TITLE_DESC, payload: { title, desc } });

export default (state = { title: 'Loading...', desc: '' }, action) => {
  switch (action.type) {
    case SET_TITLE_DESC: return { ...state, ...action.payload };
    default: return state;
  }
};

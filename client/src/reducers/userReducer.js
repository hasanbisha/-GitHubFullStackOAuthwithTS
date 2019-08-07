import { FETCH_USER, FETCH_REPOSITORIES } from '../actions/types';

const initialState = {
  user: {},
  repositories: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER:
      return {
        ...state,
        user: action.payload
      }
    case FETCH_REPOSITORIES: 
      return {
        ...state,
        repositories: action.payload
      }
    default:
      return state;
  }
};

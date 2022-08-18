import { LangActions, LangState, LangTypes } from '../types/langTypes';

const initialState: LangState = {
  lang: 'fi',
  translations: null
}

const langReducer = (state = initialState, action: LangActions): LangState => {
  switch (action.type) {
    case LangTypes.SET_LANG:
      return { ...state, lang: action.lang }
    case LangTypes.SET_TRANSLATIONS:
      return { ...state, translations: action.translations }
    default:
      return state
  }
}

export default langReducer

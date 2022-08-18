import { call, put, takeLatest } from 'redux-saga/effects';
import { LangSetLanguage, LangTypes } from '../types/langTypes';
import { getTranslationsForLang } from '../components/translations';

export function* langSaga() {
  yield takeLatest(LangTypes.SET_LANG, setLanguage);
}

function* setLanguage(action: LangSetLanguage): Generator<any, any, any> {
  localStorage.setItem('lang', action.lang)
  const translations = yield call(getTranslationsForLang, action.lang)
  yield put({ type: LangTypes.SET_TRANSLATIONS, translations })
}

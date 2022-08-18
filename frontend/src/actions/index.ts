import { fork } from 'redux-saga/effects'
import { authSaga } from './authActions'
import { langSaga } from './langActions'

export function* rootSaga() {
  yield fork(authSaga)
  yield fork(langSaga)
}

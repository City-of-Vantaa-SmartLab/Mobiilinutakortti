// action types

import {Language, Translations} from "../customizations/types";

export enum LangTypes {
  SET_LANG = 'LANG_SET_LANG',
  SET_TRANSLATIONS = 'LANG_SET_TRANSLATIONS'
}

// action interfaces

export interface LangSetLanguage {
  type: LangTypes.SET_LANG
  lang: Language
}

export interface LangSetTranslations {
  type: LangTypes.SET_TRANSLATIONS
  translations: Translations
}

export type LangActions = LangSetLanguage | LangSetTranslations

// reducer interfaces

export interface LangState {
  lang: Language
  translations: Translations | null
}

import { Language, Translations } from '../customizations/types'
import { useAppSelector } from '../store/getStore';

export async function getTranslationsForLang(lang: Language): Promise<Translations> {
  const { translations } = await import(`../customizations/translations/${lang}.tsx`)
  return translations
}

export function useTranslationsLoaded(): boolean {
  return useAppSelector(store => store.lang.translations) !== null
}

export function useTranslations(): Translations {
  const translations = useAppSelector(store => store.lang.translations)
  if (!translations) throw new Error('Translations have not been loaded')
  return translations
}

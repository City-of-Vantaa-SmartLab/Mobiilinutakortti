import { Translations } from '../customizations/types'
import { translations } from '../customizations'

// This can be changed to use Context when multiple languages are supported
export function useTranslations(): Translations {
  return translations
}

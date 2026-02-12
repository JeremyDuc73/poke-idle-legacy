type Locale = 'fr' | 'en'

const locale = ref<Locale>('fr')

export function useLocale() {
  function setLocale(l: Locale) {
    locale.value = l
  }

  function t(fr: string, en: string): string {
    return locale.value === 'fr' ? fr : en
  }

  return {
    locale: readonly(locale),
    setLocale,
    t,
  }
}

// SPDX-License-Identifier: AGPL-3.0-only

export const FUMI_TRANSLATION_LOCALES: ReadonlyArray<string> = ['en', 'ja'];

export function getFumiTranslationLocale(matchedLocale: string): 'en' | 'ja' {
  return matchedLocale === 'ja' ? 'ja' : 'en';
}

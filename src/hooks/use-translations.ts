"use client";

import { useSettings } from "@/contexts/settings-context";
import { getTranslation, type TranslationKey } from "@/lib/translations";

export function useTranslations() {
  const { language } = useSettings();

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  return { t, language };
}

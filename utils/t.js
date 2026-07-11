import en from "../locales/en.json";
import zh from "../locales/zh.json";
import ms from "../locales/ms.json";

const dict = {
  en,
  zh,
  ms,
};

export const t = (key, lang) => {
  return dict[lang]?.[key] || key;
};
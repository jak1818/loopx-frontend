import { create } from "zustand";

const getInitialLang = () => {
  if (typeof window === "undefined") {
    return "en";
  }

  return localStorage.getItem("lang") || "en";
};

export const useLanguage = create((set) => ({
  lang: getInitialLang(),

  setLang: (lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }

    set({ lang });
  },
}));
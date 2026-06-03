// Contexto de idioma: idioma activo (es/en) y la funcion `t` para traducir.
// El idioma se persiste en el navegador para conservarlo entre visitas.
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations.js';

export const LanguageContext = createContext(null);

const STORAGE_KEY = 'app.lang.v1';
const IDIOMAS = ['es', 'en'];

// Lee el idioma guardado; si no hay uno valido, usa español.
function leerIdioma() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado && IDIOMAS.includes(guardado)) return guardado;
  } catch {
    /* ignora storage no disponible */
  }
  return 'es';
}

// Resuelve una clave 'a.b.c' en el idioma dado; cae a español y luego a la clave.
function resolver(lang, clave) {
  const partes = clave.split('.');
  for (const idioma of [lang, 'es']) {
    let nodo = translations[idioma];
    for (const p of partes) {
      nodo = nodo?.[p];
      if (nodo == null) break;
    }
    if (typeof nodo === 'string') return nodo;
  }
  return clave;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(leerIdioma);

  // Cambia el idioma, lo persiste y lo refleja en el atributo lang del <html>.
  const setLang = useCallback((nuevo) => {
    const idioma = IDIOMAS.includes(nuevo) ? nuevo : 'es';
    setLangState(idioma);
    try {
      localStorage.setItem(STORAGE_KEY, idioma);
    } catch {
      /* ignora storage no disponible */
    }
  }, []);

  // Alterna entre español e ingles.
  const toggle = useCallback(() => {
    setLang(lang === 'es' ? 'en' : 'es');
  }, [lang, setLang]);

  // Mantiene <html lang> sincronizado con el idioma activo.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((clave) => resolver(lang, clave), [lang]);

  const valor = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);

  return <LanguageContext.Provider value={valor}>{children}</LanguageContext.Provider>;
}

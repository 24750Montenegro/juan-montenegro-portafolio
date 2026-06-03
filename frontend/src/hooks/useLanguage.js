// Hook para consumir el contexto de idioma
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext.jsx';

export const useLanguage = () => {
  const contexto = useContext(LanguageContext);
  if (!contexto) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return contexto;
};

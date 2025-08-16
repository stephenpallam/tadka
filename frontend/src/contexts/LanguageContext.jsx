import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide default values instead of throwing error
    console.warn('useLanguage used outside of LanguageProvider, using defaults');
    return {
      currentLanguage: 'English',
      updateLanguage: () => {},
      t: (key, fallback = key) => fallback
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('English');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tadka_language') || 'English';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Update language
  const updateLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('tadka_language', language);
  };

  // Translation function
  const t = (key, fallback = key) => {
    if (currentLanguage === 'English') {
      return fallback;
    }

    const translation = translations[currentLanguage];
    if (!translation) {
      return fallback;
    }

    // Handle nested keys like 'nav.home'
    const keys = key.split('.');
    let result = translation;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && result[k] !== undefined) {
        result = result[k];
      } else {
        return fallback;
      }
    }

    return typeof result === 'string' ? result : fallback;
  };

  const value = {
    currentLanguage,
    updateLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
import React, { createContext, useContext, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestoreContext = createContext();

export const useScrollRestore = () => {
  const context = useContext(ScrollRestoreContext);
  if (!context) {
    throw new Error('useScrollRestore must be used within a ScrollRestoreProvider');
  }
  return context;
};

export const ScrollRestoreProvider = ({ children }) => {
  const scrollPositions = useRef({});
  const location = useLocation();

  const saveScrollPosition = (path, position) => {
    scrollPositions.current[path] = position;
    console.log(`[SCROLL SAVE] ${path}: ${position}`);
  };

  const getScrollPosition = (path) => {
    return scrollPositions.current[path] || 0;
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      console.log('[SCROLL] Back/Forward detected');
      setTimeout(() => {
        const currentPath = location.pathname;
        const savedPosition = scrollPositions.current[currentPath];
        
        if (savedPosition && savedPosition > 0) {
          console.log(`[SCROLL RESTORE] ${currentPath}: ${savedPosition}`);
          window.scrollTo(0, savedPosition);
        } else {
          console.log(`[SCROLL] No saved position for ${currentPath}`);
        }
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  const value = {
    saveScrollPosition,
    getScrollPosition,
    currentPath: location.pathname
  };

  return (
    <ScrollRestoreContext.Provider value={value}>
      {children}
    </ScrollRestoreContext.Provider>
  );
};

export default ScrollRestoreProvider;
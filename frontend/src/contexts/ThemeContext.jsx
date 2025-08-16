import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Provide default values instead of throwing error
    console.warn('useTheme used outside of ThemeProvider, using defaults');
    return {
      theme: 'light',
      updateTheme: () => {},
      getSectionHeaderStyles: () => ({
        backgroundColor: '#e5e7eb',
        textColor: '#111827',
        borderColor: '#d1d5db'
      }),
      getSectionHeaderClasses: () => ({
        containerClass: 'bg-gray-300 border-gray-300 rounded-t-lg',
        textClass: 'text-gray-900',
        borderClass: 'border-gray-300',
        moreButtonClass: 'text-gray-600 hover:text-gray-900',
        unselectedTabClass: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
        selectedTabTextClass: 'text-gray-900',
        selectedTabBorderClass: 'border-b-2 border-blue-600'
      }),
      getSectionContainerClasses: () => 'bg-white border border-gray-300 rounded-lg',
      getSectionBodyClasses: () => ({
        backgroundClass: 'bg-gray-25',
        dividerClass: 'border-gray-200',
        hoverClass: 'hover:bg-gray-100'
      })
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tadka_theme') || 'light';
    setTheme(savedTheme);
  }, []);

  // Listen for theme changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem('tadka_theme') || 'light';
      setTheme(savedTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get theme-specific styles for section headers
  const getSectionHeaderStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          backgroundColor: '#192236',
          textColor: '#ffffff',
          borderColor: '#192236'
        };
      case 'blue':
        return {
          backgroundColor: '#0d7ebb', // Updated blue color
          textColor: '#ffffff', // white text
          borderColor: '#0d7ebb'
        };
      case 'red':
        return {
          backgroundColor: '#ff4e51', // Custom red
          textColor: '#ffffff', // white text
          borderColor: '#ff4e51'
        };
      case 'colorful':
        return {
          backgroundColor: '#f6bf04', // Custom yellow
          textColor: '#dc2626', // red
          borderColor: '#f6bf04'
        };
      default: // light
        return {
          backgroundColor: '#e5e7eb', // gray-200 (darker)
          textColor: '#111827', // gray-900
          borderColor: '#d1d5db' // gray-300
        };
    }
  };

  // Get Tailwind classes for section headers
  const getSectionHeaderClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          containerClass: 'bg-dark-header border-dark-header rounded-t-lg',
          textClass: 'text-white',
          borderClass: 'border-dark-header',
          moreButtonClass: 'text-gray-300 hover:text-white', // Brighter for dark theme
          unselectedTabClass: 'bg-dark-unselected text-gray-300 hover:bg-gray-700 hover:text-white', // Custom dark blue for unselected tabs
          selectedTabTextClass: 'text-gray-300', // Same as unselected for dark theme
          selectedTabBorderClass: '' // No border for dark theme selected tabs
        };
      case 'blue':
        return {
          containerClass: 'bg-blue-header border-blue-header rounded-t-lg',
          textClass: 'text-white',
          borderClass: 'border-blue-header',
          moreButtonClass: 'text-gray-200 hover:text-white', // Light text for blue theme
          unselectedTabClass: 'bg-blue-unselected text-white hover:bg-blue-unselected-hover hover:text-white', // Custom blue for unselected tabs with custom hover
          selectedTabTextClass: 'text-white', // White text for blue theme
          selectedTabBorderClass: 'border-b-2 border-blue-600' // Blue border for selected tabs
        };
      case 'red':
        return {
          containerClass: 'bg-red-header border-red-header rounded-t-lg',
          textClass: 'text-white',
          borderClass: 'border-red-header',
          moreButtonClass: 'text-gray-200 hover:text-white', // Light text for red theme
          unselectedTabClass: 'bg-red-unselected text-white hover:bg-red-400 hover:text-white', // Custom red for unselected tabs
          selectedTabTextClass: 'text-white', // White text for red theme
          selectedTabBorderClass: 'border-b-2 border-blue-600' // Blue border for selected tabs
        };
      case 'colorful':
        return {
          containerClass: 'bg-colorful-header border-colorful-header rounded-t-lg',
          textClass: 'text-red-600',
          borderClass: 'border-colorful-header',
          moreButtonClass: 'text-red-500 hover:text-red-700', // Colorful theme
          unselectedTabClass: 'bg-yellow-300 text-red-600 hover:bg-yellow-200 hover:text-red-700', // Lighter yellow for better distinction
          selectedTabTextClass: 'text-red-600', // Same as section headers for colorful theme
          selectedTabBorderClass: 'border-b-2 border-blue-600' // Blue border for selected tabs
        };
      default: // light
        return {
          containerClass: 'bg-gray-300 border-gray-300 rounded-t-lg',
          textClass: 'text-gray-900',
          borderClass: 'border-gray-300',
          moreButtonClass: 'text-gray-600 hover:text-gray-900', // Default light theme
          unselectedTabClass: 'bg-gray-200 text-gray-600 hover:bg-gray-300', // Lighter gray for unselected tabs
          selectedTabTextClass: 'text-gray-900', // Match TopStories color for consistency
          selectedTabBorderClass: 'border-b-2 border-blue-600' // Blue border for selected tabs
        };
    }
  };

  // Get Tailwind classes for section containers (main section background)
  const getSectionContainerClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-dark-section border border-dark-section rounded-lg';
      case 'blue':
        return 'bg-blue-section border border-dark-section rounded-lg';
      case 'red':
        return 'bg-red-section border border-dark-section rounded-lg';
      case 'colorful':
        return 'bg-colorful-section border border-dark-section rounded-lg';
      default: // light
        return 'bg-white border border-gray-300 rounded-lg';
    }
  };

  // Get Tailwind classes for section content/body areas
  const getSectionBodyClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          backgroundClass: 'bg-dark-section',
          dividerClass: 'border-dark-divider',
          hoverClass: 'hover:bg-gray-100'
        };
      case 'blue':
        return {
          backgroundClass: 'bg-blue-section',
          dividerClass: 'border-gray-200',
          hoverClass: 'hover:bg-gray-100'
        };
      case 'red':
        return {
          backgroundClass: 'bg-red-section',
          dividerClass: 'border-gray-200',
          hoverClass: 'hover:bg-gray-100'
        };
      case 'colorful':
        return {
          backgroundClass: 'bg-colorful-section',
          dividerClass: 'border-gray-200',
          hoverClass: 'hover:bg-gray-100'
        };
      default: // light
        return {
          backgroundClass: 'bg-gray-25',
          dividerClass: 'border-gray-200',
          hoverClass: 'hover:bg-gray-100'
        };
    }
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('tadka_theme', newTheme);
  };

  const value = {
    theme,
    updateTheme,
    getSectionHeaderStyles,
    getSectionHeaderClasses,
    getSectionContainerClasses,
    getSectionBodyClasses
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
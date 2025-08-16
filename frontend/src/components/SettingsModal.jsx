import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getStateNames, DEFAULT_SELECTED_STATES, parseStoredStates } from '../utils/statesConfig';
import { useDragDrop } from '../contexts/DragDropContext';

const SettingsModal = ({ isOpen, onClose, onSave, onLayoutChange }) => {
  const { updateTheme } = useTheme();
  const { resetToDefault } = useDragDrop();
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [selectedStates, setSelectedStates] = useState(DEFAULT_SELECTED_STATES); // Changed to array
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Add debug logging for component mount
  console.log('🚀 SettingsModal component rendered/mounted');

  // Handle modal close - mark as configured even without selections
  const handleClose = () => {
    console.log('🎯 handleClose called - marking settings as configured');
    
    // Mark settings as configured when user closes modal (even without selections)
    localStorage.setItem('tadka_settings_configured', 'true');
    console.log('✅ Settings marked as configured via modal close');
    
    // Double-check that it was set
    const checkValue = localStorage.getItem('tadka_settings_configured');
    console.log('🔍 Verification - tadka_settings_configured is now:', checkValue);
    
    // Create current settings object
    const currentSettings = {
      theme: selectedTheme,
      states: selectedStates,
      language: selectedLanguage
    };
    
    // Call the onSave callback if provided
    if (onSave && typeof onSave === 'function') {
      console.log('📞 Calling onSave callback with settings:', currentSettings);
      onSave(currentSettings); // Pass the current settings
    } else {
      console.log('⚠️ onSave callback not available or not a function:', onSave);
    }
    
    // Call the original onClose
    if (onClose && typeof onClose === 'function') {
      console.log('📞 Calling onClose callback');
      onClose();
    } else {
      console.log('⚠️ onClose callback not available or not a function:', onClose);
    }
  };

  // State to local language mapping
  const stateLanguageMap = {
    'Andhra Pradesh': 'Telugu',
    'Telangana': 'Telugu',
    'Tamil Nadu': 'Tamil',
    'Karnataka': 'Kannada',
    'Bihar': 'Hindi',
    'Maharashtra': 'Marathi',
    'Gujarat': 'Gujarati',
    'Rajasthan': 'Hindi',
    'West Bengal': 'Bengali',
    'Madhya Pradesh': 'Hindi',
    'Uttar Pradesh': 'Hindi',
    'Kerala': 'Malayalam',
    'Punjab': 'Punjabi',
    'Haryana': 'Hindi',
    'Assam': 'Assamese',
    'Odisha': 'Odia',
    'Jharkhand': 'Hindi',
    'Chhattisgarh': 'Hindi',
    'Himachal Pradesh': 'Hindi',
    'Uttarakhand': 'Hindi',
    'Goa': 'Konkani',
    'Manipur': 'Manipuri',
    'Meghalaya': 'Khasi',
    'Tripura': 'Bengali',
    'Mizoram': 'Mizo',
    'Arunachal Pradesh': 'Hindi',
    'Nagaland': 'English',
    'Sikkim': 'Nepali',
    'Delhi': 'Hindi',
    'Jammu and Kashmir': 'Urdu',
    'Ladakh': 'Urdu'
  };

  // State to available languages mapping (includes English + local language + additional languages)
  const stateLanguagesMap = {
    'Andhra Pradesh': ['English', 'Telugu', 'Urdu'],
    'Telangana': ['English', 'Telugu', 'Urdu'],
    'Tamil Nadu': ['English', 'Tamil'],
    'Karnataka': ['English', 'Kannada'],
    'Bihar': ['English', 'Hindi'],
    'Maharashtra': ['English', 'Marathi'],
    'Gujarat': ['English', 'Gujarati'],
    'Rajasthan': ['English', 'Hindi'],
    'West Bengal': ['English', 'Bengali'],
    'Madhya Pradesh': ['English', 'Hindi'],
    'Uttar Pradesh': ['English', 'Hindi'],
    'Kerala': ['English', 'Malayalam'],
    'Punjab': ['English', 'Punjabi'],
    'Haryana': ['English', 'Hindi'],
    'Assam': ['English', 'Assamese'],
    'Odisha': ['English', 'Odia'],
    'Jharkhand': ['English', 'Hindi'],
    'Chhattisgarh': ['English', 'Hindi'],
    'Himachal Pradesh': ['English', 'Hindi'],
    'Uttarakhand': ['English', 'Hindi'],
    'Goa': ['English', 'Konkani'],
    'Manipur': ['English', 'Manipuri'],
    'Meghalaya': ['English', 'Khasi'],
    'Tripura': ['English', 'Bengali'],
    'Mizoram': ['English', 'Mizo'],
    'Arunachal Pradesh': ['English', 'Hindi'],
    'Nagaland': ['English'],
    'Sikkim': ['English', 'Nepali'],
    'Delhi': ['English', 'Hindi'],
    'Jammu and Kashmir': ['English', 'Urdu'],
    'Ladakh': ['English', 'Urdu']
  };

  // Get local language for selected state
  const getLocalLanguage = (state) => {
    return stateLanguageMap[state] || 'Hindi';
  };

  // Get available languages for selected state (now returns all languages for all states)
  const getAvailableLanguages = (state) => {
    return allLanguages; // Return all languages sorted alphabetically for any state
  };

  // Get Indian states from centralized configuration
  const indianStates = getStateNames();

  // All available languages (sorted alphabetically)
  const allLanguages = [
    'Assamese',
    'Bengali',
    'English',
    'Gujarati',
    'Hindi',
    'Kannada',
    'Konkani',
    'Malayalam',
    'Manipuri',
    'Marathi',
    'Nepali',
    'Odia',
    'Punjabi',
    'Tamil',
    'Telugu',
    'Urdu'
  ];

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tadka_theme') || 'light';
    const savedStatesString = localStorage.getItem('tadka_state') || '';
    const savedLanguage = localStorage.getItem('tadka_language') || 'English';
    setSelectedTheme(savedTheme);
    setSelectedStates(parseStoredStates(savedStatesString));
    setSelectedLanguage(savedLanguage);
  }, [isOpen]);

  // Reset language to English when states change
  useEffect(() => {
    if (selectedStates && selectedStates.length > 0) {
      setSelectedLanguage('English');
    }
  }, [selectedStates]);

  // Auto-save function
  const autoSave = (theme, states, language, markAsConfigured = false) => {
    console.log('🔧 SettingsModal autoSave called:', { theme, states, language, markAsConfigured });
    
    localStorage.setItem('tadka_theme', theme);
    localStorage.setItem('tadka_state', JSON.stringify(states)); // Store as JSON array
    localStorage.setItem('tadka_language', language);
    
    // Create settings object for callback
    const settings = {
      theme,
      states,
      language
    };
    
    // Call onSave callback if provided and we want to mark as configured
    if (markAsConfigured && onSave && typeof onSave === 'function') {
      console.log('✅ Calling onSave to mark settings as configured');
      onSave(settings); // Pass the settings object
    } else if (markAsConfigured) {
      console.log('⚠️ markAsConfigured is true but onSave is not available:', onSave);
    }
    
    // Dispatch custom event for state change
    if (states && states.length > 0) {
      const stateChangeEvent = new CustomEvent('statePreferenceChanged', {
        detail: { 
          newState: states, 
          previousState: selectedStates 
        }
      });
      window.dispatchEvent(stateChangeEvent);
    }
  };

  // Handle theme change with auto-save
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    updateTheme(theme); // This triggers immediate theme update on homepage
    autoSave(theme, selectedStates, selectedLanguage, true); // Mark as configured when user makes a choice
    
    // Direct localStorage setting as backup
    localStorage.setItem('tadka_settings_configured', 'true');
    console.log('✅ Settings marked as configured via handleThemeChange');
  };

  // Handle multiple state selection
  const handleStateToggle = (stateName) => {
    const newSelectedStates = selectedStates.includes(stateName)
      ? selectedStates.filter(state => state !== stateName)
      : [...selectedStates, stateName];
    
    setSelectedStates(newSelectedStates);
    const newLanguage = 'English'; // Reset to English when states change
    setSelectedLanguage(newLanguage);
    autoSave(selectedTheme, newSelectedStates, newLanguage, true); // Mark as configured
    
    // Direct localStorage setting as backup
    localStorage.setItem('tadka_settings_configured', 'true');
    console.log('✅ Settings marked as configured via handleStateToggle');
  };

  // Handle language change with auto-save
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    autoSave(selectedTheme, selectedStates, language, true); // Mark as configured
    
    // Direct localStorage setting as backup
    localStorage.setItem('tadka_settings_configured', 'true');
    console.log('✅ Settings marked as configured via handleLanguageChange');
  };

  const themeOptions = [
    {
      id: 'light',
      name: 'Light Theme',
      description: 'Clean grey and white',
      color: '#f3f4f6'
    },
    {
      id: 'dark',
      name: 'Dark Theme', 
      description: 'Elegant black design',
      color: '#1f2937'
    },
    {
      id: 'colorful',
      name: 'Colorful Theme',
      description: 'Vibrant yellow & red',
      color: '#fbbf24'
    },
    {
      id: 'blue',
      name: 'Blue Theme',
      description: 'Modern blue design',
      color: '#10a0eb'
    },
    {
      id: 'red',
      name: 'Red Theme',
      description: 'Bold red design',
      color: '#ff4e51'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full max-h-[70vh] border border-gray-600 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-600 p-4 flex-shrink-0 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-gray-800 font-bold text-sm">T</span>
            </div>
            {/* Title and Subtitle */}
            <div className="flex flex-col text-left">
              <span className="text-lg font-bold text-white leading-tight">
                Tadka
              </span>
              <span className="text-xs text-gray-300 leading-none -mt-1">
                Personalized News
              </span>
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Theme Selection */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3">Choose Your Theme</h3>
            <div className="space-y-2">
              {themeOptions.map((theme) => (
                <label
                  key={theme.id}
                  className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedTheme === theme.id
                      ? 'border-red-400 bg-red-900 bg-opacity-30'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 border-gray-400 mr-2 flex-shrink-0"
                    style={{ backgroundColor: theme.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{theme.name}</div>
                    <div className="text-xs text-gray-400">{theme.description}</div>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    checked={selectedTheme === theme.id}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="ml-2 text-red-400 focus:ring-red-400 bg-gray-700 border-gray-600"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* State Selection */}
          <div>
            <h3 className="text-base font-semibold text-white mb-3">Select Your States (Multiple allowed)</h3>
            <div className="max-h-48 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-700">
              <div className="grid grid-cols-1 gap-1">
                {indianStates.map((state) => (
                  <label 
                    key={state}
                    className="flex items-center p-2 hover:bg-gray-600 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state)}
                      onChange={() => handleStateToggle(state)}
                      className="mr-3 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">{state}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              You can select multiple states to see news from all selected regions.
            </p>
          </div>

          {/* Language Selection */}
          {selectedStates && selectedStates.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-white mb-3">Choose Language</h3>
              <div className="space-y-2">
                {getAvailableLanguages(selectedStates[0]).map((language) => (
                  <label 
                    key={language}
                    className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedLanguage === language
                        ? 'border-red-400 bg-red-900 bg-opacity-30'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={language}
                      checked={selectedLanguage === language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="mr-3 text-red-400 focus:ring-red-400 bg-gray-700 border-gray-600"
                    />
                    <span className="text-white font-medium">{language}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 p-4 flex space-x-3">
          <button
            onClick={() => {
              console.log('Layout change button clicked, onLayoutChange:', onLayoutChange);
              if (onLayoutChange && typeof onLayoutChange === 'function') {
                onLayoutChange();
                handleClose();
              } else {
                console.error('onLayoutChange is not a function:', onLayoutChange);
              }
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span>Change Layout</span>
          </button>
          
          <button
            onClick={() => {
              resetToDefault();
              handleClose();
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Default Layout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
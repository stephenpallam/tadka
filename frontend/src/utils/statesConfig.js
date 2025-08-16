// Single source of truth for Indian states configuration
// This ensures consistency across all state dropdowns in the application
// Source: Preferences Modal (31 states - AP & Telangana split)

export const INDIAN_STATES = [
  { code: 'ap', name: 'Andhra Pradesh' },
  { code: 'ar', name: 'Arunachal Pradesh' },
  { code: 'as', name: 'Assam' },
  { code: 'br', name: 'Bihar' },
  { code: 'cg', name: 'Chhattisgarh' },
  { code: 'dl', name: 'Delhi' },
  { code: 'ga', name: 'Goa' },
  { code: 'gj', name: 'Gujarat' },
  { code: 'hr', name: 'Haryana' },
  { code: 'hp', name: 'Himachal Pradesh' },
  { code: 'jk', name: 'Jammu and Kashmir' },
  { code: 'jh', name: 'Jharkhand' },
  { code: 'ka', name: 'Karnataka' },
  { code: 'kl', name: 'Kerala' },
  { code: 'ld', name: 'Ladakh' },
  { code: 'mp', name: 'Madhya Pradesh' },
  { code: 'mh', name: 'Maharashtra' },
  { code: 'mn', name: 'Manipur' },
  { code: 'ml', name: 'Meghalaya' },
  { code: 'mz', name: 'Mizoram' },
  { code: 'nl', name: 'Nagaland' },
  { code: 'or', name: 'Odisha' },
  { code: 'pb', name: 'Punjab' },
  { code: 'rj', name: 'Rajasthan' },
  { code: 'sk', name: 'Sikkim' },
  { code: 'tn', name: 'Tamil Nadu' },
  { code: 'ts', name: 'Telangana' },
  { code: 'tr', name: 'Tripura' },
  { code: 'up', name: 'Uttar Pradesh' },
  { code: 'uk', name: 'Uttarakhand' },
  { code: 'wb', name: 'West Bengal' }
];

// Default selected states for new users
export const DEFAULT_SELECTED_STATES = ['Andhra Pradesh', 'Telangana'];

// Special states for specific use cases
export const SPECIAL_STATES = {
  ALL_STATES: { code: 'national', name: 'All States' }, // Renamed from NATIONAL
  ALL_FILTER: { code: '', name: 'All States' }
};

// Get state name by code
export const getStateNameByCode = (code) => {
  const state = INDIAN_STATES.find(s => s.code === code);
  return state ? state.name : code;
};

// Get state code by name
export const getStateCodeByName = (name) => {
  const state = INDIAN_STATES.find(s => s.name === name);
  return state ? state.code : name;
};

// Get sorted states for dropdowns (alphabetically by name)
export const getSortedStates = () => {
  return [...INDIAN_STATES].sort((a, b) => a.name.localeCompare(b.name));
};

// Get state names only (for SettingsModal compatibility)
export const getStateNames = () => {
  return getSortedStates().map(state => state.name);
};

// State to code mapping for backend compatibility
export const STATE_CODE_MAPPING = INDIAN_STATES.reduce((acc, state) => {
  acc[state.name] = state.code;
  return acc;
}, {});

// Helper function to format state display for navigation
export const formatStateDisplay = (selectedStates) => {
  if (!selectedStates || selectedStates.length === 0) {
    // Use default states - if only one, show full name; otherwise use codes
    if (DEFAULT_SELECTED_STATES.length === 1) {
      return DEFAULT_SELECTED_STATES[0];
    }
    const defaultCodes = DEFAULT_SELECTED_STATES.map(stateName => {
      const state = INDIAN_STATES.find(s => s.name === stateName);
      return state ? state.code.toUpperCase() : stateName;
    });
    return defaultCodes.length > 1 
      ? `${defaultCodes.slice(0, -1).join(', ')} & ${defaultCodes[defaultCodes.length - 1]}`
      : defaultCodes[0];
  }
  
  if (selectedStates.length > 3) {
    return 'Multiple States';
  }
  
  if (selectedStates.length === 1) {
    // Show complete state name for single selection
    return selectedStates[0];
  }
  
  // Convert state names to codes for multiple selections (2-3 states)
  const stateCodes = selectedStates.map(stateName => {
    const state = INDIAN_STATES.find(s => s.name === stateName);
    return state ? state.code.toUpperCase() : stateName;
  });
  
  // Format with & for the last state
  return stateCodes.length > 1 
    ? `${stateCodes.slice(0, -1).join(', ')} & ${stateCodes[stateCodes.length - 1]}`
    : stateCodes[0];
};

// Helper function to parse stored state string to array
export const parseStoredStates = (stateString) => {
  if (!stateString) {
    return DEFAULT_SELECTED_STATES;
  }
  
  // Try to parse as JSON array first
  try {
    const parsed = JSON.parse(stateString);
    return Array.isArray(parsed) ? parsed : [stateString];
  } catch {
    // Fallback: treat as single state
    return [stateString];
  }
};

export default INDIAN_STATES;
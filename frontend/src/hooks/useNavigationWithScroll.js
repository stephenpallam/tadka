import { useNavigate, useLocation } from 'react-router-dom';
import { useScrollRestore } from '../contexts/ScrollRestoreContext';

// Custom hook for handling ANY navigation with scroll restore
export const useNavigationWithScroll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveScrollPosition } = useScrollRestore();

  const navigateWithScroll = (targetPath, options = {}) => {
    // Save current scroll position before navigating
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    saveScrollPosition(location.pathname, currentScroll);
    
    console.log(`[NAV] Saving ${location.pathname} scroll: ${currentScroll}, navigating to: ${targetPath}`);
    
    // Navigate to target page
    navigate(targetPath, options);
  };

  return navigateWithScroll;
};

export default useNavigationWithScroll;
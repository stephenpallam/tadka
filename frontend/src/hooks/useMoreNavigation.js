import { useNavigationWithScroll } from './useNavigationWithScroll';

// Custom hook for handling "More" button navigation with scroll restore
export const useMoreNavigation = () => {
  const navigateWithScroll = useNavigationWithScroll();
  
  return navigateWithScroll;
};

export default useMoreNavigation;
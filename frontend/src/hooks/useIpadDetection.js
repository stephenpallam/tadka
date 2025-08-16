import { useState, useEffect } from 'react';

const useIpadDetection = () => {
  const [isIpad, setIsIpad] = useState(false);

  useEffect(() => {
    const checkIsIpad = () => {
      // iPad detection: width between 768px and 1024px
      const width = window.innerWidth;
      const isIpadWidth = width >= 768 && width <= 1024;
      setIsIpad(isIpadWidth);
    };

    // Check on mount
    checkIsIpad();

    // Add resize listener
    window.addEventListener('resize', checkIsIpad);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsIpad);
  }, []);

  return isIpad;
};

export default useIpadDetection;
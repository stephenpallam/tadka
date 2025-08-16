import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ImageModal from './ImageModal';
import { PlaceholderImage } from '../utils/imageUtils';

const TadkaPics = ({ images, onImageClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses } = useTheme();
  // Create an array of 20 actress images with names and IDs - same as gallery page
  const actressImages = [
    {
      id: 1,
      name: "Emma Stone",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=1200&fit=crop"
    },
    {
      id: 2,
      name: "Zendaya",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1200&fit=crop"
    },
    {
      id: 3,
      name: "Margot Robbie",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop"
    },
    {
      id: 4,
      name: "Lupita Nyong'o",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&h=1200&fit=crop"
    },
    {
      id: 5,
      name: "Saoirse Ronan",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1200&fit=crop"
    },
    {
      id: 6,
      name: "Anya Taylor-Joy",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop"
    },
    {
      id: 7,
      name: "Florence Pugh",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop"
    },
    {
      id: 8,
      name: "Timothée Chalamet",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop"
    },
    {
      id: 9,
      name: "Zoe Kravitz",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop"
    },
    {
      id: 10,
      name: "Ryan Gosling",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop"
    },
    {
      id: 11,
      name: "Brie Larson",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1200&fit=crop"
    },
    {
      id: 12,
      name: "Oscar Isaac",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1200&fit=crop"
    },
    {
      id: 13,
      name: "Lupita Nyong'o",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&h=1200&fit=crop"
    },
    {
      id: 14,
      name: "Michael B. Jordan",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop"
    },
    {
      id: 15,
      name: "Lupita Nyong'o",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1200&fit=crop"
    },
    {
      id: 16,
      name: "Adam Driver",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1200&fit=crop"
    },
    {
      id: 17,
      name: "Tessa Thompson",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop"
    },
    {
      id: 18,
      name: "LaKeith Stanfield",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop"
    },
    {
      id: 19,
      name: "Kiki Layne",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop"
    },
    {
      id: 20,
      name: "John Boyega",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=150&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1200&fit=crop"
    }
  ];

  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const scrollContainerRef = useRef(null);

  // Enhanced analytics tracking
  const trackImageClick = async (imageId, imageName, action) => {
    try {
      // Comprehensive tracking data
      const trackingData = {
        imageId: imageId,
        imageName: imageName,
        action: action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        source: 'home_page_slider'
      };

      // Send to backend API
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Update browser history for SEO/analytics tracking
      const newUrl = `${window.location.pathname}?image=${imageId}&actress=${encodeURIComponent(imageName)}&source=slider`;
      window.history.pushState(
        { imageId, imageName, action }, 
        `${imageName} - Tadka Pics`, 
        newUrl
      );

    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const handleImageClick = (index) => {
    const clickedImage = actressImages[index];
    if (clickedImage && onImageClick) {
      trackImageClick(clickedImage.id, clickedImage.name, 'home_slider_click');
      onImageClick(clickedImage, actressImages);
    }
  };

  // Touch event handlers for swipe functionality
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const container = scrollContainerRef.current;
      if (container) {
        const imageWidth = 110; // Width + margin
        const currentScroll = container.scrollLeft;
        const newPosition = isLeftSwipe ? 
          Math.min(currentScroll + imageWidth, container.scrollWidth - container.clientWidth) :
          Math.max(currentScroll - imageWidth, 0);
        
        setScrollPosition(newPosition);
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
      }
    }
  };

  // Auto scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (scrollPosition >= maxScroll) {
          // Reset to beginning
          setScrollPosition(0);
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll 1px to the right for slow movement
          const newPosition = scrollPosition + 1;
          setScrollPosition(newPosition);
          container.scrollTo({ left: newPosition, behavior: 'smooth' });
        }
      }
    }, 50); // 50ms interval for slow, smooth scrolling

    return () => clearInterval(interval);
  }, [scrollPosition]);

  return (
    <div className="bg-white">
      <div className="max-w-5xl-plus mx-auto px-8">
        {/* Header matching Events slider style */}
        <div className={`${getSectionHeaderClasses().containerClass} px-3 py-2 border rounded-lg text-left mb-3 flex items-center justify-between relative`}>
          <h3 className={`${getSectionHeaderClasses().textClass}`} style={{fontSize: '14px', fontWeight: '500'}}>{t('sections.tadka_pics', 'Tadka Pics')}</h3>
          <Link 
            to="/top-insta-pics" 
            className={`group flex items-center justify-center text-xs ${getSectionHeaderClasses().moreButtonClass} transition-colors duration-200 absolute top-1/2 transform -translate-y-1/2 right-4`}
          >
            <svg 
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
        
        {/* Multiple Images Horizontal Scroll Container */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {actressImages.map((actress, index) => (
              <div 
                key={actress.id} 
                className="flex-shrink-0 cursor-pointer group transition-transform duration-300 hover:scale-105"
                onClick={() => handleImageClick(index)}
              >
                <div className="relative w-24 h-36 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
                  <img
                    src={actress.image}
                    alt={actress.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = PlaceholderImage;
                    }}
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-12"></div>
                  {/* Name overlay */}
                  <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium truncate">
                    {actress.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TadkaPics;
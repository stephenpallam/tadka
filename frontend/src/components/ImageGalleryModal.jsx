import React, { useEffect, useState, useRef } from 'react';
import ImageModal from './ImageModal';

const ImageGalleryModal = ({ article, onClose, relatedImages = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(article);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const modalScrollRef = useRef(null);
  const modalContentRef = useRef(null);
  
  // Image Modal state for full-screen image viewing
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle modal content scroll on mobile
  const handleModalScroll = (e) => {
    if (isMobile) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setShowScrollIndicator(!isNearBottom);
    }
  };

  // Check scroll indicator visibility on mobile
  useEffect(() => {
    if (isMobile && modalContentRef.current) {
      const checkScrollIndicator = () => {
        const element = modalContentRef.current;
        if (element) {
          const hasScroll = element.scrollHeight > element.clientHeight;
          setShowScrollIndicator(hasScroll);
        }
      };
      
      checkScrollIndicator();
      window.addEventListener('resize', checkScrollIndicator);
      return () => window.removeEventListener('resize', checkScrollIndicator);
    }
  }, [isMobile, isLoading, currentArticle]);

  // Check desktop scroll indicator visibility
  useEffect(() => {
    if (!isMobile) {
      const checkDesktopScrollIndicator = () => {
        const scrollableElement = document.querySelector('.image-gallery-modal-content');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        if (scrollableElement && scrollIndicator) {
          const hasScrollableContent = scrollableElement.scrollHeight > scrollableElement.clientHeight;
          scrollIndicator.style.opacity = hasScrollableContent ? '0.6' : '0';
        }
      };

      // Check after content loads
      setTimeout(checkDesktopScrollIndicator, 100);
      window.addEventListener('resize', checkDesktopScrollIndicator);
      return () => window.removeEventListener('resize', checkDesktopScrollIndicator);
    }
  }, [isMobile, isLoading, currentArticle]);

  // Update current article when prop changes
  const galleryImages = [
    {
      id: 1,
      fullImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      name: 'Beautiful Mountain Landscape',
      isVertical: false
    },
    {
      id: 2,
      fullImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      name: 'Serene Lake View',
      isVertical: false
    },
    {
      id: 3,
      fullImage: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop',
      name: 'Tropical Paradise Beach',
      isVertical: false
    },
    {
      id: 4,
      fullImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      name: 'Forest Trail Adventure',
      isVertical: false
    },
    {
      id: 5,
      fullImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      name: 'Desert Sunset Views',
      isVertical: false
    },
    {
      id: 6,
      fullImage: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop',
      name: 'City Skyline at Night',
      isVertical: false
    }
  ];

  // SEO and Analytics tracking
  useEffect(() => {
    if (!currentArticle) return;

    // Update document title for SEO
    const originalTitle = document.title;
    document.title = `${currentArticle.title} - Blog CMS`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.content || '';
    if (metaDescription) {
      metaDescription.content = currentArticle.summary || 'Explore stunning travel photography and destination images on our platform.';
    }

    // Update URL for SEO (without page reload)
    const newUrl = `${window.location.pathname}?gallery=${currentArticle.id}&title=${encodeURIComponent(currentArticle.title)}&source=image_gallery_modal`;
    window.history.pushState(
      { galleryId: currentArticle.id, galleryTitle: currentArticle.title, type: 'image_gallery_modal' },
      currentArticle.title,
      newUrl
    );

    // Analytics tracking
    trackGalleryView();

    // Cleanup
    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.content = originalDescription;
      }
    };
  }, [currentArticle]);

  // Update current article when prop changes
  useEffect(() => {
    setCurrentArticle(article);
    setCurrentImageIndex(0);
  }, [article]);

  // Analytics tracking function
  const trackGalleryView = async () => {
    try {
      const trackingData = {
        galleryId: currentArticle.id,
        galleryTitle: currentArticle.title,
        section: currentArticle.section || 'travel_pics',
        action: 'image_gallery_modal_view',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        source: 'image_gallery_modal',
        engagement: 'high' // Modal view indicates high engagement
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Gallery analytics tracking failed:', error);
    }
  };

  // Track image navigation for analytics
  const trackImageNavigation = async (action, imageIndex) => {
    try {
      const trackingData = {
        galleryId: currentArticle.id,
        galleryTitle: currentArticle.title,
        imageIndex: imageIndex,
        imageName: galleryImages[imageIndex]?.name || `Image ${imageIndex + 1}`,
        action: action,
        timestamp: new Date().toISOString(),
        source: 'image_gallery_modal',
        engagement: 'navigation'
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Image navigation tracking failed:', error);
    }
  };

  // Touch and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentImageIndex]);



  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % galleryImages.length;
    setCurrentImageIndex(nextIndex);
    setIsLoading(true);
    trackImageNavigation('next_image', nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setIsLoading(true);
    trackImageNavigation('prev_image', prevIndex);
  };

  // Handle image click to open full-screen ImageModal
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentImage = galleryImages[currentImageIndex];
    console.log('Image clicked:', currentImage); // Debug log
    console.log('Current index:', currentImageIndex); // Debug log
    
    setSelectedImage(currentImage);
    setImageModalOpen(true);
    
    // Update URL when opening full-screen mode
    updateImageURL(currentImage, currentImageIndex);
    
    trackImageNavigation('image_click_fullscreen', currentImageIndex);
  };

  // Handle ImageModal navigation with enhanced analytics and URL updates
  const handleImageModalNext = (currentId) => {
    const currentIndex = galleryImages.findIndex(img => img.id === currentId);
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    const nextImage = galleryImages[nextIndex];
    
    setSelectedImage(nextImage);
    setCurrentImageIndex(nextIndex);
    
    // Update URL for SEO - each image gets unique URL
    updateImageURL(nextImage, nextIndex);
    
    trackImageNavigation('fullscreen_next', nextIndex);
    
    // Enhanced SEO and site ranking analytics for image slides
    trackImageSlideForSEO('next_slide', nextIndex, nextImage);
  };

  const handleImageModalPrev = (currentId) => {
    const currentIndex = galleryImages.findIndex(img => img.id === currentId);
    const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    const prevImage = galleryImages[prevIndex];
    
    setSelectedImage(prevImage);
    setCurrentImageIndex(prevIndex);
    
    // Update URL for SEO - each image gets unique URL
    updateImageURL(prevImage, prevIndex);
    
    trackImageNavigation('fullscreen_prev', prevIndex);
    
    // Enhanced SEO and site ranking analytics for image slides
    trackImageSlideForSEO('prev_slide', prevIndex, prevImage);
  };

  // Update URL for individual image SEO
  const updateImageURL = (image, imageIndex) => {
    try {
      const imageSlug = image.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();

      const newUrl = `${window.location.pathname}?gallery=${currentArticle.id}&image=${image.id}&slug=${imageSlug}&position=${imageIndex + 1}&total=${galleryImages.length}&source=travel_gallery_slider`;
      
      // Update URL without page reload for SEO
      window.history.pushState(
        { 
          galleryId: currentArticle.id,
          imageId: image.id,
          imageIndex: imageIndex,
          imageName: image.name,
          type: 'image_gallery_slider'
        },
        `${image.name} - ${currentArticle.title} - Blog CMS`,
        newUrl
      );

      // Update document title for SEO
      document.title = `${image.name} - ${currentArticle.title} - Blog CMS`;
      
      // Update meta description for current image
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.content = `View ${image.name} from ${currentArticle.title}. Image ${imageIndex + 1} of ${galleryImages.length} in this stunning travel photography gallery.`;
      }

      console.log('URL updated for image:', image.name, 'URL:', newUrl); // Debug log
      
    } catch (error) {
      console.error('URL update failed:', error);
    }
  };

  // Enhanced analytics tracking for SEO and site ranking
  const trackImageSlideForSEO = async (action, imageIndex, image) => {
    try {
      const trackingData = {
        galleryId: currentArticle.id,
        galleryTitle: currentArticle.title,
        imageId: image.id,
        imageName: image.name,
        imageIndex: imageIndex,
        imagePosition: `${imageIndex + 1}/${galleryImages.length}`,
        totalImages: galleryImages.length,
        action: `image_slide_${action}`,
        slideDirection: action.includes('next') ? 'forward' : 'backward',
        timestamp: new Date().toISOString(),
        sessionId: Date.now(), // Simple session tracking
        userAgent: navigator.userAgent,
        url: window.location.href, // Current URL with image-specific parameters
        previousUrl: document.referrer,
        source: 'image_gallery_fullscreen',
        engagement: 'high_value_slide',
        seoValue: 'image_navigation_with_url',
        rankingSignal: 'user_image_engagement_deep',
        urlUpdated: true, // Indicates URL was updated for this slide
        imageSlug: image.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Additional SEO tracking for page engagement
      trackPageEngagementForSEO(action, imageIndex, image);
      
    } catch (error) {
      console.error('Enhanced image slide tracking failed:', error);
    }
  };

  // Track page engagement metrics for SEO ranking with URL data
  const trackPageEngagementForSEO = async (slideAction, imageIndex, image) => {
    try {
      const engagementData = {
        pageUrl: window.location.href, // Updated URL with image parameters
        pageTitle: document.title, // Updated title with image name
        galleryId: currentArticle.id,
        imageId: image.id,
        imageName: image.name,
        userAction: 'image_slide_engagement_with_url',
        slideAction: slideAction,
        imagePosition: imageIndex + 1,
        totalImages: galleryImages.length,
        engagementScore: calculateEngagementScore(imageIndex),
        timestamp: new Date().toISOString(),
        source: 'travel_gallery_modal_with_seo_urls',
        contentType: 'travel_photography_individual_image',
        userBehavior: 'high_engagement_sliding_with_url_tracking',
        seoSignals: {
          uniqueUrl: true,
          dynamicTitle: true,
          metaDescription: true,
          imageSpecificContent: true
        }
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(engagementData)
      });
    } catch (error) {
      console.error('Page engagement tracking failed:', error);
    }
  };

  // Calculate engagement score for SEO ranking
  const calculateEngagementScore = (imageIndex) => {
    // Higher engagement score for users who slide through more images
    const viewedPercentage = (imageIndex + 1) / galleryImages.length;
    if (viewedPercentage >= 0.8) return 'very_high';
    if (viewedPercentage >= 0.6) return 'high';
    if (viewedPercentage >= 0.4) return 'medium';
    return 'low';
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
    
    // Reset URL to gallery URL when closing image modal
    const galleryUrl = `${window.location.pathname}?gallery=${currentArticle.id}&title=${encodeURIComponent(currentArticle.title)}&source=image_gallery_modal`;
    window.history.pushState(
      { galleryId: currentArticle.id, galleryTitle: currentArticle.title, type: 'image_gallery_modal' },
      `${currentArticle.title} - Blog CMS`,
      galleryUrl
    );
    
    // Reset document title
    document.title = `${currentArticle.title} - Blog CMS`;
    
    // Reset meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = currentArticle.summary || 'Explore stunning travel photography and destination images on our platform.';
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // Social sharing functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentArticle.title);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
    trackSocialShare('facebook');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentArticle.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
    trackSocialShare('x_twitter');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentArticle.title);
    const text = encodeURIComponent(`${currentArticle.title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'width=600,height=400');
    trackSocialShare('whatsapp');
  };

  const shareOnInstagram = () => {
    navigator.clipboard.writeText(`${currentArticle.title} - ${window.location.href}`).then(() => {
      alert('Content copied to clipboard! You can now paste it in your Instagram story or post.');
      trackSocialShare('instagram');
    });
  };

  const shareOnTikTok = () => {
    navigator.clipboard.writeText(`${currentArticle.title} - ${window.location.href}`).then(() => {
      alert('Content copied to clipboard! You can now share it on TikTok.');
      trackSocialShare('tiktok');
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
      trackSocialShare('copy_link');
    });
  };

  const trackSocialShare = async (platform) => {
    try {
      const trackingData = {
        galleryId: currentArticle.id,
        galleryTitle: currentArticle.title,
        action: 'social_share',
        platform: platform,
        timestamp: new Date().toISOString(),
        source: 'image_gallery_modal'
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Social share tracking failed:', error);
    }
  };

  // Handle related image click
  const handleRelatedImageClick = async (relatedImage) => {
    try {
      // Track related image click
      const trackingData = {
        currentGalleryId: currentArticle.id,
        relatedGalleryId: relatedImage.id,
        relatedGalleryTitle: relatedImage.title,
        action: 'related_image_click',
        timestamp: new Date().toISOString(),
        source: 'image_gallery_modal_related'
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Create enhanced image object for gallery modal
      const imageGalleryArticle = {
        ...relatedImage,
        category: 'Related Images',
        section: 'related_image',
        author: 'Travel Team',
        publishedAt: 'Today'
      };

      // Switch to the related image gallery
      setCurrentArticle(imageGalleryArticle);
      setCurrentImageIndex(0);
      setIsLoading(true);
      
      // Auto-scroll to top on mobile when new gallery loads
      if (isMobile && modalScrollRef.current) {
        setTimeout(() => {
          modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
      }
      
    } catch (error) {
      console.error('Related image click tracking failed:', error);
    }
  };

  const handleClose = () => {
    // Reset URL
    window.history.pushState({}, 'Blog CMS', window.location.pathname);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Sample thumbnail images for related galleries
  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=60&h=45&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  if (!currentArticle) return null;

  // Generate related images if not provided
  const defaultRelatedImages = relatedImages.length > 0 ? relatedImages : [
    {
      id: 1,
      title: "Stunning Mountain Peaks and Valley Views Captured in High Definition",
      summary: "Breathtaking mountain photography from exotic travel destinations."
    },
    {
      id: 2,
      title: "Tropical Beach Paradise with Crystal Clear Waters and White Sand",
      summary: "Pristine beach destinations showcasing nature's beauty."
    },
    {
      id: 3,
      title: "Ancient Architecture and Historical Landmarks Photo Collection",
      summary: "Cultural heritage sites and architectural marvels from around the world."
    },
    {
      id: 4,
      title: "Urban Cityscape Photography Featuring Modern Skylines",
      summary: "Metropolitan cityscapes and modern urban architecture."
    },
    {
      id: 5,
      title: "Wildlife Safari Images Showcasing Exotic Animals in Natural Habitat",
      summary: "Amazing wildlife photography from safari adventures."
    },
    {
      id: 6,
      title: "Scenic Road Trip Routes Through Beautiful Countryside Landscapes",
      summary: "Picturesque road trip destinations and scenic drives."
    }
  ];

  const currentImage = galleryImages[currentImageIndex];

  // Debug logging
  console.log('ImageGalleryModal state:', {
    imageModalOpen,
    selectedImage,
    currentImage,
    currentImageIndex
  });

  return (
    <div 
      ref={modalScrollRef}
      className="fixed inset-0 bg-black bg-opacity-75 z-50"
      style={{
        overflow: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
      onClick={handleBackdropClick}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="min-h-screen py-4 px-2 flex items-start lg:items-center justify-center">
        <div 
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden relative" 
          style={{ 
            height: 'fit-content',
            maxHeight: isMobile ? '95vh' : 'none'
          }}
        >

          {/* Close Button - Top Right Corner for Mobile */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-[70] bg-black hover:bg-gray-800 text-white rounded-lg p-2 shadow-lg transition-all duration-200 lg:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Close Button - Positioned on Modal (Hidden) */}
          <button
            onClick={handleClose}
            className="absolute top-8 right-3 z-[70] bg-black hover:bg-gray-800 text-white rounded-lg p-2 shadow-lg transition-all duration-200"
            style={{ display: 'none' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col lg:flex-row">

          {/* Mobile: Scrollable Content Wrapper */}
          <div 
            ref={modalContentRef}
            className={isMobile ? "overflow-y-auto h-full" : ""}
            style={isMobile ? {
              maxHeight: '90vh',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            } : {}}
            onScroll={isMobile ? handleModalScroll : undefined}
          >
            {isMobile && (
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            )}
            <div className="flex flex-col lg:flex-row">
            
            {/* Main Content - 80% width for image */}
            <div className="w-full lg:w-[69%] border-r-0 lg:border-r border-gray-200">
              
              {/* Image Slider - 80% fill */}
              <div className="relative w-full h-96 overflow-hidden pt-6 px-6 flex items-start justify-center">
                {isLoading && (
                  <div className="absolute inset-6 flex items-center justify-center bg-white rounded">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                )}

                {imageError && (
                  <div className="absolute inset-6 flex items-center justify-center bg-white rounded">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-gray-600">Failed to load image</p>
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <img
                    src={currentImage.fullImage}
                    alt={currentImage.name}
                    className={`rounded-lg shadow-md object-cover cursor-pointer ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 hover:shadow-lg`}
                    style={{ width: '560px', height: '315px' }} // Standard horizontal dimensions
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    onClick={handleImageClick}
                  />

                  {/* Image Slider Indicators - Within Image */}
                  <div 
                    className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none"
                  >
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>

                  {/* Small View Gallery Icon - Center of Image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Click to View Indicator - Within Image */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Click to view gallery
                  </div>

                  {/* Slide Indicator Dots - Within Image */}
                  <div className="absolute bottom-3 right-3 flex space-x-1 pointer-events-none">
                    {galleryImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg' 
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Hover Overlay with Navigation Hint - Within Image */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center rounded-lg pointer-events-none">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-white text-center">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                      </svg>
                      <p className="text-xs font-medium">View Gallery</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Article Content - Scrollable */}
              <div className="p-3 md:p-4 -mt-12 relative">
                
                {/* Title - Fixed Position */}
                <h1 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 leading-tight mb-3">
                  {currentArticle.title}
                </h1>

                {/* Scrollable Content Area */}
                <div 
                  className="overflow-y-auto px-4 relative image-gallery-modal-content" 
                  style={{ 
                    maxHeight: '320px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  onScroll={(e) => {
                    const scrollIndicator = e.target.parentElement.querySelector('.scroll-indicator');
                    if (scrollIndicator) {
                      const { scrollTop, scrollHeight, clientHeight } = e.target;
                      const hasScrollableContent = scrollHeight > clientHeight;
                      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
                      
                      if (hasScrollableContent && !isScrolledToBottom) {
                        scrollIndicator.style.opacity = '0.6';
                      } else {
                        scrollIndicator.style.opacity = '0';
                      }
                    }
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {/* Article Body - Travel focused content */}
                  <div className="prose prose-sm max-w-none">
                    
                    {/* First Paragraph */}
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                      {currentArticle.summary || "This stunning travel photography gallery showcases some of the most breathtaking destinations around the world. Our travel team has curated these incredible images to inspire your next adventure and showcase the beauty of global travel destinations."}
                    </p>

                    {/* Second Paragraph */}
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-4 text-justify">
                      Each image in this collection tells a unique story of adventure, natural beauty, and cultural discovery. From pristine beaches to majestic mountains, these travel photographs capture the essence of wanderlust and the amazing diversity our planet has to offer to intrepid travelers and photography enthusiasts.
                    </p>

                  </div>
                </div>

                {/* Scroll Indicator - Desktop Only */}
                <div className="scroll-indicator absolute bottom-0 right-4 pointer-events-none transition-opacity duration-300 hidden lg:block" style={{ opacity: '0' }}>
                  <div className="bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                    <span>Scroll</span>
                    <svg className="w-3 h-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Social Sharing Footer */}
              <div className="bg-gray-50 px-3 md:px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-end">
                  <div className="flex space-x-3">
                    
                    {/* Facebook */}
                    <button
                      onClick={shareOnFacebook}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors duration-200"
                      title="Share on Facebook"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>

                    {/* X (Twitter) */}
                    <button
                      onClick={shareOnTwitter}
                      className="bg-black hover:bg-gray-900 text-white p-1 rounded-full transition-colors duration-200"
                      title="Share on X"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={shareOnWhatsApp}
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors duration-200"
                      title="Share on WhatsApp"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </button>

                    {/* Instagram */}
                    <button
                      onClick={shareOnInstagram}
                      className="bg-pink-600 hover:bg-pink-700 text-white p-1 rounded-full transition-colors duration-200"
                      title="Share on Instagram"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </button>

                    {/* TikTok */}
                    <button
                      onClick={shareOnTikTok}
                      className="bg-black hover:bg-gray-900 text-white p-1 rounded-full transition-colors duration-200"
                      title="Share on TikTok"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={copyToClipboard}
                      className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded-full transition-colors duration-200"
                      title="Copy Link"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>

                  </div>
                </div>
              </div>
            </div>

            {/* Related Images Sidebar */}
            <div className="lg:w-[31%] bg-gray-50 flex flex-col relative">
              
              {/* Close Button - Positioned in header section (Desktop only) */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 z-[70] bg-black hover:bg-gray-800 text-white rounded-lg p-2 shadow-lg transition-all duration-200 hidden lg:block"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-gray-100 px-3 py-2 pt-3 text-left">
                <h3 className="text-sm font-semibold text-gray-900">Related Images</h3>
              </div>
              
              <div 
                className="overflow-y-auto bg-gray-50 flex-1" 
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  minHeight: '320px'
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="p-2">
                  <ul className="space-y-1">
                    {defaultRelatedImages.map((relatedImage, index) => (
                      <li
                        key={relatedImage.id}
                        className={`group cursor-pointer py-1 px-1 hover:bg-gray-100 transition-colors duration-200 ${
                          index < defaultRelatedImages.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                        onClick={() => handleRelatedImageClick(relatedImage)}
                      >
                        <div className="flex items-start space-x-2 text-left">
                          <img
                            src={getThumbnail(index)}
                            alt=""
                            className="flex-shrink-0 w-16 h-12 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
                              {relatedImage.title}
                            </h4>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>

          {/* Mobile Scroll Indicator */}
          {isMobile && showScrollIndicator && (
            <div 
              className="absolute bottom-4 right-4 z-[60] bg-black bg-opacity-70 text-white rounded-full p-2 pointer-events-none transition-opacity duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}

        </div>
      </div>

      {/* Image Modal for full-screen image viewing */}
      {imageModalOpen && selectedImage && (
        <div style={{ zIndex: 9999 }}>
          <ImageModal
            image={{
              id: selectedImage.id,
              fullImage: selectedImage.fullImage,
              name: selectedImage.name
            }}
            images={galleryImages.map(img => ({
              id: img.id,
              fullImage: img.fullImage,
              name: img.name
            }))}
            onClose={handleImageModalClose}
            onNext={handleImageModalNext}
            onPrev={handleImageModalPrev}
            onImageChange={(imageId) => {
              const clickedImage = galleryImages.find(img => img.id === imageId);
              if (clickedImage) {
                setSelectedImage(clickedImage);
                const newIndex = galleryImages.findIndex(img => img.id === imageId);
                setCurrentImageIndex(newIndex);
                trackImageNavigation('fullscreen_thumbnail_click', newIndex);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal;
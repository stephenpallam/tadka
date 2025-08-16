import React, { useEffect, useState, useRef } from 'react';

const BlogModal = ({ article, onClose, relatedArticles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(article);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const modalScrollRef = useRef(null);
  const modalContentRef = useRef(null);

  // Check if this is a breaking news article
  const isBreakingNews = currentArticle?.section === 'top_story_main' || currentArticle?.category === 'Breaking News';

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
      metaDescription.content = currentArticle.summary || 'Read the latest news and insights on our blog platform.';
    }

    // Update URL for SEO (without page reload)
    const newUrl = `${window.location.pathname}?article=${currentArticle.id}&title=${encodeURIComponent(currentArticle.title)}&source=blog_modal`;
    window.history.pushState(
      { articleId: currentArticle.id, articleTitle: currentArticle.title, type: 'blog_modal' },
      currentArticle.title,
      newUrl
    );

    // Analytics tracking
    trackBlogView();

    // Cleanup
    return () => {
      document.title = originalTitle;
      if (metaDescription) {
        metaDescription.content = originalDescription;
      }
    };
  }, [currentArticle]);

  // Update current article when prop changes or when related article is selected
  useEffect(() => {
    setCurrentArticle(article);
    setShowReadMore(false); // Reset read more state
    setIsLoading(true); // Reset loading state for new article
    setImageError(false); // Reset image error state
  }, [article]);

  // Handle article changes and reset states
  useEffect(() => {
    if (currentArticle) {
      setIsLoading(true);
      setImageError(false);
      setShowReadMore(false);
    }
  }, [currentArticle?.id]); // Only trigger when article ID changes

  // Check scroll indicators when content loads (desktop only)
  useEffect(() => {
    if (!isMobile && !isLoading) {
      setTimeout(() => {
        const scrollableAreas = document.querySelectorAll('.overflow-y-auto');
        scrollableAreas.forEach(area => {
          const scrollIndicator = area.parentElement?.querySelector('.scroll-indicator');
          if (scrollIndicator) {
            const hasScrollableContent = area.scrollHeight > area.clientHeight;
            scrollIndicator.style.display = hasScrollableContent ? 'block' : 'none';
          }
        });
      }, 100);
    }
  }, [isLoading, isMobile]);

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

  // Handle modal content scroll on mobile
  const handleModalScroll = (e) => {
    if (isMobile) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setShowScrollIndicator(!isNearBottom);
    }
  };

  // Analytics tracking function
  const trackBlogView = async () => {
    try {
      const trackingData = {
        articleId: currentArticle.id,
        articleTitle: currentArticle.title,
        section: currentArticle.section || 'top_story',
        action: 'blog_modal_view',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        source: 'blog_modal',
        readingTime: 0, // Will be updated on close
        engagement: 'high' // Modal view indicates high engagement
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Blog analytics tracking failed:', error);
    }
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
    // Instagram doesn't support direct link sharing, so we copy to clipboard for Instagram stories
    navigator.clipboard.writeText(`${currentArticle.title} - ${window.location.href}`).then(() => {
      alert('Content copied to clipboard! You can now paste it in your Instagram story or post.');
      trackSocialShare('instagram');
    });
  };

  const shareOnTikTok = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentArticle.title);
    // TikTok doesn't have direct sharing API, so we copy to clipboard
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
        articleId: currentArticle.id,
        articleTitle: currentArticle.title,
        action: 'social_share',
        platform: platform,
        timestamp: new Date().toISOString(),
        source: 'blog_modal'
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

  // Handle related article click
  const handleRelatedArticleClick = async (relatedArticle) => {
    try {
      // Track related article click
      const trackingData = {
        currentArticleId: currentArticle.id,
        relatedArticleId: relatedArticle.id,
        relatedArticleTitle: relatedArticle.title,
        action: 'related_article_click',
        timestamp: new Date().toISOString(),
        source: 'blog_modal_related'
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Create enhanced article object for blog modal
      const blogArticle = {
        ...relatedArticle,
        category: 'Related News',
        section: 'related_article',
        author: 'Editorial Team',
        publishedAt: 'Today'
      };

      // Switch to the related article
      setCurrentArticle(blogArticle);
      setIsLoading(true);
      setShowReadMore(false);
      
      // Auto-scroll to top on mobile when new article loads
      if (isMobile && modalScrollRef.current) {
        setTimeout(() => {
          modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
      }
      
    } catch (error) {
      console.error('Related article click tracking failed:', error);
    }
  };

  const toggleReadMore = () => {
    setShowReadMore(!showReadMore);
    
    // Track read more engagement
    trackSocialShare(showReadMore ? 'read_less' : 'read_more');
  };

  useEffect(() => {
    // Handle escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // Sample thumbnail images for related articles
  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1586339949216-35c890863684?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=60&h=45&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  if (!currentArticle) return null;

  // Generate related articles if not provided
  const defaultRelatedArticles = relatedArticles.length > 0 ? relatedArticles : [
    {
      id: 1,
      title: "Breaking: Major Economic Policy Changes Announced by Government Officials",
      summary: "Comprehensive analysis of new economic policies and their impact on markets."
    },
    {
      id: 2,
      title: "Entertainment Industry Sees Major Shift in Streaming Platform Strategies",
      summary: "Latest developments in streaming wars and content distribution changes."
    },
    {
      id: 3,
      title: "Technology Breakthrough in Artificial Intelligence Research Announced",
      summary: "Scientists achieve major milestone in AI development with new algorithms."
    },
    {
      id: 4,
      title: "Sports Championship Finals Draw Record Television Viewership Numbers",
      summary: "Historic viewership numbers reflect growing interest in sports entertainment."
    },
    {
      id: 5,
      title: "Climate Change Summit Produces New International Environmental Agreements",
      summary: "World leaders agree on ambitious new targets for carbon emissions reduction."
    },
    {
      id: 6,
      title: "Healthcare Innovation Shows Promise in Treatment of Chronic Diseases",
      summary: "Medical researchers announce breakthrough treatments for multiple conditions."
    }
  ];

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
          className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl relative w-full" 
          style={{
            height: 'fit-content',
            maxHeight: isMobile 
              ? '95vh'  // Restrict to viewport on mobile
              : (isBreakingNews ? 'calc(90vh + 15px)' : 'calc(90vh + 70px)'),
            borderRadius: '0.5rem',
            overflow: isMobile ? 'hidden' : 'hidden'  // Hide overflow to maintain rounded corners
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
              {/* Main Content - Mobile Layout */}
              <div className="w-full lg:w-[69%] border-r-0 lg:border-r border-gray-200">
              
              {/* Hero Image */}
              <div className="relative w-full h-60 overflow-hidden pt-6 flex items-start justify-center">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                )}
                
                {imageError ? (
                  <div className="h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500">Image not available</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={currentArticle.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=446&h=250&fit=crop'}
                    alt={currentArticle.title}
                    className={`object-cover rounded ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    style={{ width: '446px', height: '200px' }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </div>

              {/* Article Content */}
              <div className="p-3 md:p-4 -mt-4 relative">
                
                {/* Title - Fixed Position */}
                <h1 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 leading-tight mb-3">
                  {currentArticle.title}
                </h1>

                {/* Scrollable Content Area */}
                <div 
                  className={isMobile ? "px-4 relative" : "overflow-y-auto px-4 relative"}
                  style={{ 
                    maxHeight: isMobile 
                      ? 'none'  // No height restriction on mobile - show full content
                      : (isBreakingNews ? 'calc(265px + 70px)' : 'calc(320px + 70px)'),
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                  onScroll={!isMobile ? (e) => {
                    const scrollIndicator = e.target.parentElement.querySelector('.scroll-indicator');
                    if (scrollIndicator) {
                      const { scrollTop, scrollHeight, clientHeight } = e.target;
                      const hasScrollableContent = scrollHeight > clientHeight;
                      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
                      
                      if (!hasScrollableContent) {
                        scrollIndicator.style.display = 'none';
                      } else {
                        scrollIndicator.style.display = 'block';
                        scrollIndicator.style.opacity = isScrolledToBottom ? '0' : '0.6';
                      }
                    }
                  } : undefined}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {/* Article Body */}
                  <div className="prose prose-sm max-w-none">
                    
                    {/* First Paragraph */}
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                      {currentArticle.summary || "This is a comprehensive analysis of the breaking news story that has captured national attention. Our editorial team has conducted extensive research to bring you the most accurate and up-to-date information available. The developments continue to unfold as various stakeholders respond to these significant changes."}
                    </p>

                    {/* Second Paragraph */}
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                      The implications of these developments extend far beyond the immediate scope, affecting multiple sectors and communities. Expert analysis suggests that these changes will have lasting effects on policy, public opinion, and future decision-making processes. Stay tuned as we continue to monitor this evolving situation and provide updates as they become available.
                    </p>

                    {/* Third Paragraph - Always Visible */}
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                      Further investigation reveals that industry leaders are closely monitoring these developments and preparing strategic responses. Market analysts predict significant volatility in the coming weeks as investors digest the full implications of these announcements. Government officials have scheduled additional briefings to address public concerns and provide clarity on implementation timelines.
                    </p>
                    
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-4 text-justify">
                      International observers are watching closely as these changes could influence global markets and diplomatic relations. Expert commentary suggests that this represents a significant shift in policy direction that will require careful monitoring and analysis in the months ahead.
                    </p>

                    {/* Additional Content for Scrolling Demo */}
                    <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                      The broader economic implications of these developments are becoming increasingly apparent as financial markets react to the news. Industry leaders are calling for measured responses and careful consideration of long-term consequences. This situation continues to evolve rapidly, with new information emerging daily.
                    </p>

                    <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                      Regional authorities have announced additional measures to address public concerns and ensure smooth implementation of necessary changes. Stakeholders across various sectors are collaborating to minimize disruption while maximizing the benefits of these significant developments.
                    </p>

                    <p className="text-xs font-medium text-gray-900 leading-tight mb-4 text-justify">
                      As the situation continues to develop, experts recommend staying informed through reliable sources and maintaining a balanced perspective on these important changes. The full impact of these developments will likely become clearer in the coming weeks and months.
                    </p>

                  </div>
                </div>

                {/* Scroll Indicator - Desktop Only */}
                <div className="scroll-indicator absolute right-4 pointer-events-none transition-opacity duration-300 hidden lg:block" style={{ bottom: '40px', opacity: '0.6' }}>
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

            {/* Related Articles Sidebar - Latest News Style */}
            <div className="w-full lg:w-[31%] bg-gray-50 flex flex-col relative border-t lg:border-t-0 border-gray-200">
              
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
                <h3 className="text-sm font-semibold text-gray-900">Related Articles</h3>
              </div>
              
              <div 
                className={isMobile ? "bg-gray-50 flex-1" : "overflow-y-auto bg-gray-50 flex-1"}
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  minHeight: isMobile 
                    ? 'auto'  // No min height restriction on mobile
                    : (isBreakingNews ? 'calc(265px + 70px)' : 'calc(320px + 70px)')
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="p-2">
                  <ul className="space-y-1">
                    {defaultRelatedArticles.map((relatedArticle, index) => (
                      <li
                        key={relatedArticle.id}
                        className={`group cursor-pointer py-1 px-1 hover:bg-gray-100 transition-colors duration-200 ${
                          index < defaultRelatedArticles.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                        onClick={() => handleRelatedArticleClick(relatedArticle)}
                      >
                        <div className="flex items-start space-x-2 text-left">
                          <img
                            src={getThumbnail(index)}
                            alt=""
                            className="flex-shrink-0 w-16 h-12 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
                              {relatedArticle.title}
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
      </div>
    </div>
  );
};

export default BlogModal;
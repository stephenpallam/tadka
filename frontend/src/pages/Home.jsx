import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useDragDrop } from '../contexts/DragDropContext';
import { createSEOArticleURL } from '../utils/seoUtils';
import dataService from '../services/dataService';
import DraggableSection from '../components/DraggableSection';
import SectionControlPanel from '../components/SectionControlPanel';
import { createSectionRegistry } from '../utils/SectionRegistry';
import useIpadDetection from '../hooks/useIpadDetection';

// Component imports
import TadkaPics from '../components/TadkaPics';
import TopStories from '../components/TopStories';
import LatestNews from '../components/LatestNews';
import ViralVideos from '../components/ViralVideos';
import TravelPics from '../components/TravelPics';
import BoxOffice from '../components/BoxOffice';
import SportsSchedules from '../components/SportsSchedules';
import EventsInterviews from '../components/EventsInterviews';
import TrailersTeasers from '../components/TrailersTeasers';
import MovieSchedules from '../components/MovieSchedules';
import Sports from '../components/Sports';
import MovieReviews from '../components/MovieReviews';
import AI from '../components/AI';
import StockMarket from '../components/StockMarket';
import Fashion from '../components/Fashion';
import SponsoredAds from '../components/SponsoredAds';

// Modal imports
import ImageModal from '../components/ImageModal';
import ArticleModal from '../components/ArticleModal';
import BlogModal from '../components/BlogModal';

import ImageGalleryModal from '../components/ImageGalleryModal';
import VerticalImageGalleryModal from '../components/VerticalImageGalleryModal';

const Home = ({ layoutEditMode = false, onLayoutSave }) => {
  const navigate = useNavigate();
  const { getSectionHeaderClasses } = useTheme();
  const { sectionOrder, moveSectionToIndex } = useDragDrop();
  const isIpad = useIpadDetection();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Loading state for state-related sections refresh
  const [stateRelatedSectionsLoading, setStateRelatedSectionsLoading] = useState(false);
  
  // Modal state for Tadka Pics
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  
  // Modal state for Articles
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('');

  // Modal state for Blog
  const [selectedBlogArticle, setSelectedBlogArticle] = useState(null);
  const [blogModalOpen, setBlogModalOpen] = useState(false);

  // Modal state for Image Gallery
  const [selectedImageGalleryArticle, setSelectedImageGalleryArticle] = useState(null);
  const [imageGalleryModalOpen, setImageGalleryModalOpen] = useState(false);

  // Modal state for Vertical Image Gallery
  const [selectedVerticalImageGalleryArticle, setSelectedVerticalImageGalleryArticle] = useState(null);
  const [verticalImageGalleryModalOpen, setVerticalImageGalleryModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const homeData = await dataService.getHomePageData();
        setData(homeData);
        setError(null);
      } catch (err) {
        console.error('Error loading home page data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Listen for state preference changes and refresh state-related sections
  useEffect(() => {
    const handleStatePreferenceChange = async (event) => {
      try {
        const { newState } = event.detail;
        
        // Set loading state for state-related sections
        setStateRelatedSectionsLoading(true);
        
        // Parse the new state to get user states array
        const userStates = dataService.parseUserStates(newState);
        
        // Refresh only state-related sections (Politics and Movies)
        const refreshedData = await dataService.refreshStateRelatedSections(userStates);
        
        // Update only the state-related data without affecting other sections
        setData(prevData => ({
          ...prevData,
          politicsData: refreshedData.politicsData,
          moviesData: refreshedData.moviesData
        }));
        
        console.log('✅ State-related sections refreshed for state:', newState);
      } catch (error) {
        console.error('Error refreshing state-related sections:', error);
      } finally {
        // Remove loading state after refresh is complete
        setStateRelatedSectionsLoading(false);
      }
    };

    // Listen for custom state preference change event
    window.addEventListener('statePreferenceChanged', handleStatePreferenceChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('statePreferenceChanged', handleStatePreferenceChange);
    };
  }, []);

  // Restore scroll position when returning to homepage
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('homePageScrollPosition');
    if (savedScrollPosition) {
      const scrollPos = parseInt(savedScrollPosition, 10);
      console.log(`[SCROLL] Restoring homepage scroll position: ${scrollPos}`);
      
      // Use multiple attempts to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
      }, 100);
      
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
      }, 300);
      
      setTimeout(() => {
        window.scrollTo(0, scrollPos);
        // Clear after successful restore
        sessionStorage.removeItem('homePageScrollPosition');
      }, 500);
    }
  }, []);

  // Analytics tracking function for home page
  const trackImageClick = async (imageId, imageName, action = 'view') => {
    try {
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

  // Handle image click from FeaturedImages component
  const handleImageClick = (image, images) => {
    setSelectedImage(image);
    setGalleryImages(images);
    setImageModalOpen(true);
    trackImageClick(image.id, image.name, 'home_modal_open');
  };

  const handleModalClose = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
    setGalleryImages([]);
    // Reset URL when modal closes
    window.history.pushState({}, 'Home - Blog CMS', window.location.pathname);
  };

  // Analytics tracking function for articles
  const trackArticleClick = async (articleId, articleTitle, section, action = 'view') => {
    try {
      const trackingData = {
        articleId: articleId,
        articleTitle: articleTitle,
        section: section,
        action: action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        source: 'home_page_article'
      };

      // Send to backend API
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Update browser history for SEO/analytics tracking
      const newUrl = `${window.location.pathname}?article=${articleId}&title=${encodeURIComponent(articleTitle)}&section=${section}`;
      window.history.pushState(
        { articleId, articleTitle, section, action }, 
        `${articleTitle} - Blog CMS`, 
        newUrl
      );

    } catch (error) {
      console.error('Article analytics tracking failed:', error);
    }
  };

  // Handle article click from any component - with scroll restoration and SEO URLs
  const handleArticleClick = (article, section) => {
    // Save current scroll position in sessionStorage
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('homePageScrollPosition', currentScroll.toString());
    console.log(`[SCROLL] Saved homepage scroll position: ${currentScroll}`);
    
    // Track the article click for analytics (without modifying browser history)
    trackArticleClickSimple(article.id, article.title, section, 'navigate_to_article_page');
    
    // Check if this is a gallery article (photo content type with gallery)
    if (article.content_type === 'photo' && article.gallery) {
      console.log(`[GALLERY] Navigating to gallery article: ${article.title}`);
      navigate(`/gallery-article/${article.id}`);
      return;
    }
    
    // Create SEO-friendly URL and navigate
    const seoUrl = createSEOArticleURL(article.id, article.title, section);
    console.log(`[SEO] Navigating to SEO URL: ${seoUrl}`);
    
    navigate(seoUrl);
  };

  // Simplified analytics tracking without browser history manipulation
  const trackArticleClickSimple = async (articleId, articleTitle, section, action) => {
    try {
      const trackingData = {
        articleId,
        articleTitle,
        section,
        action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        source: 'home_page_article'
      };

      // Send to backend API only
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      console.log(`[ANALYTICS] Tracked article click: ${articleTitle}`);
    } catch (error) {
      console.error('Article analytics tracking failed:', error);
    }
  };

  const handleArticleModalClose = () => {
    setArticleModalOpen(false);
    setSelectedArticle(null);
    setCurrentSection('');
    // Reset URL when modal closes
    window.history.pushState({}, 'Home - Blog CMS', window.location.pathname);
  };

  const handleBlogModalClose = () => {
    setBlogModalOpen(false);
    setSelectedBlogArticle(null);
    // Reset URL when modal closes
    window.history.pushState({}, 'Home - Blog CMS', window.location.pathname);
  };

  const handleImageGalleryModalClose = () => {
    setImageGalleryModalOpen(false);
    setSelectedImageGalleryArticle(null);
    // Reset URL when modal closes
    window.history.pushState({}, 'Home - Blog CMS', window.location.pathname);
  };

  const handleVerticalImageGalleryModalClose = () => {
    setVerticalImageGalleryModalOpen(false);
    setSelectedVerticalImageGalleryArticle(null);
    // Reset URL when modal closes
    window.history.pushState({}, 'Home - Blog CMS', window.location.pathname);
  };

  const handleNextImage = (currentId) => {
    const currentIndex = galleryImages.findIndex(img => img.id === currentId);
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    const nextImage = galleryImages[nextIndex];
    
    setSelectedImage(nextImage);
    trackImageClick(nextImage.id, nextImage.name, 'home_next_image');
  };

  const handlePrevImage = (currentId) => {
    const currentIndex = galleryImages.findIndex(img => img.id === currentId);
    const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    const prevImage = galleryImages[prevIndex];
    
    setSelectedImage(prevImage);
    trackImageClick(prevImage.id, prevImage.name, 'home_prev_image');
  };

  const handleThumbnailClick = (imageId) => {
    const clickedImage = galleryImages.find(img => img.id === imageId);
    if (clickedImage) {
      setSelectedImage(clickedImage);
      trackImageClick(clickedImage.id, clickedImage.name, 'home_thumbnail_click');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-gray-800">Loading Personalized Content</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-start pt-20">
        <div className="ml-8 bg-white border border-gray-300 p-6 max-w-md">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Create handlers object for section registry
  const handlers = {
    handleArticleClick,
    handleImageClick,
    handleNextImage: handleNextImage,
    handlePrevImage: handlePrevImage
  };

  // Create section registry with current data, handlers, iPad detection, and loading states
  const sectionRegistry = createSectionRegistry(data, handlers, isIpad, stateRelatedSectionsLoading);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Layout Edit Mode Overlay */}
      {layoutEditMode && (
        <>
          {/* Semi-transparent overlay */}
          <div className="fixed inset-0 bg-white bg-opacity-30 z-40 pointer-events-none"></div>
          
          {/* Instructions with Close Button */}
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-md shadow-md px-4 py-2 z-50">
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2 text-gray-800">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
                <span className="text-sm font-medium">Use arrows to move sections</span>
              </div>
              <button
                onClick={() => onLayoutSave && onLayoutSave()}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="Close Edit Mode"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* All sections are draggable vertically - rows stick together as units */}
      <div className={`space-y-2 ${layoutEditMode ? 'relative z-30 pointer-events-auto' : ''}`}>
        {sectionOrder.map((sectionId) => {
          const section = sectionRegistry[sectionId];
          if (!section) return null;

          // Each section (including rows) is rendered as a single draggable unit
          return (
            <DraggableSection 
              key={section.id} 
              sectionId={section.id} 
              className="w-full"
              layoutEditMode={layoutEditMode}
            >
              {section.component}
            </DraggableSection>
          );
        })}
      </div>

      {/* Image Modal for Tadka Pics */}
      {imageModalOpen && selectedImage && (
        <ImageModal
          image={selectedImage}
          images={galleryImages}
          onClose={handleModalClose}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          onImageChange={handleThumbnailClick}
        />
      )}

      {/* Article Modal for all article content */}
      {articleModalOpen && selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={handleArticleModalClose}
        />
      )}

      {/* Blog Modal for Breaking News Articles */}
      {blogModalOpen && selectedBlogArticle && (
        <BlogModal
          article={selectedBlogArticle}
          onClose={handleBlogModalClose}
          relatedArticles={data?.politicalNews?.slice(0, 4) || []}
        />
      )}

      {/* Image Gallery Modal for Travel Pics */}
      {imageGalleryModalOpen && selectedImageGalleryArticle && (
        <ImageGalleryModal
          article={selectedImageGalleryArticle}
          onClose={handleImageGalleryModalClose}
          relatedImages={data?.features?.slice(0, 6) || []}
        />
      )}

      {/* Vertical Image Gallery Modal for Portrait Content */}
      {verticalImageGalleryModalOpen && selectedVerticalImageGalleryArticle && (
        <VerticalImageGalleryModal
          article={selectedVerticalImageGalleryArticle}
          onClose={handleVerticalImageGalleryModalClose}
          relatedImages={data?.entertainmentNews?.slice(0, 6) || []}
        />
      )}
    </div>
  );
};

export default Home;
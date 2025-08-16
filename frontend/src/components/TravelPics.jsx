import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ArticleImage from './ArticleImage';

const TravelPics = ({ tadkaPicsData = {}, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('travel-pics');
  const [featuredItems, setFeaturedItems] = useState([]);

  // Extract data for each tab from tadkaPicsData
  const travelPicsArticles = tadkaPicsData.travel_pics || [];
  const photoshootsArticles = tadkaPicsData.photoshoots || [];

  useEffect(() => {
    // Use real data from API instead of sample data
    const currentData = activeTab === 'travel-pics' ? travelPicsArticles : photoshootsArticles;
    setFeaturedItems(currentData);
  }, [tadkaPicsData, activeTab, travelPicsArticles, photoshootsArticles]);

  // Get articles based on active tab
  const getTabArticles = () => {
    return activeTab === 'travel-pics' ? travelPicsArticles : photoshootsArticles;
  };

  const currentReviews = getTabArticles();

  const handleArticleClick = (article) => {
    // Check if article has a gallery - if so, navigate to gallery post page
    if (article.gallery && article.gallery.images && article.gallery.images.length > 0) {
      navigate(`/gallery-post/${article.id}`);
    } else if (onArticleClick) {
      // Fallback to existing modal behavior for articles without galleries
      onArticleClick(article, activeTab === 'travel-pics' ? 'travel_pics' : 'photoshoots');
    }
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('travel-pics')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'travel-pics' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.travel_pics', 'Travel Pics')}
        </button>
        <button
          onClick={() => setActiveTab('photoshoots')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'photoshoots'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.photoshoots', 'Photoshoots')}
        </button>
      </div>
      
      <div 
        className={`p-2 overflow-y-hidden ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: '312px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <ul className="space-y-1">
          {currentReviews.slice(0, 4).map((review, index) => (
            <li
              key={review.id}
              className={`group cursor-pointer py-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
              onClick={() => handleArticleClick(review)}
            >
              <div className="flex items-start space-x-2 text-left">
                <div className="relative flex-shrink-0">
                  <ArticleImage
                    src={review.image_url || review.image}
                    alt={review.title}
                    width="w-20"
                    height="h-16"
                    className="object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                    contentType={activeTab === 'travel-pics' ? 'travel-pics' : 'photoshoots'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 leading-tight hover:text-gray-700 transition-colors duration-300" style={{fontSize: '14px', fontWeight: '600'}}>
                    {review.title}
                  </h4>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* More Button Overlay - Square with Rounded Corners */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => {
              // Save current scroll position
              const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
              sessionStorage.setItem('homePageScrollPosition', currentScroll.toString());
              console.log(`[SCROLL] Travel Pics More button - saved scroll: ${currentScroll}`);
              
              // Navigate to the page
              window.location.href = '/gallery-posts';
            }}
            className="group inline-flex items-center justify-center w-8 h-8 bg-white bg-opacity-95 hover:bg-opacity-100 rounded border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-xl"
          >
            <svg 
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 text-gray-600 group-hover:text-gray-800"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelPics;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Fashion = ({ hotTopicsData = {}, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('fashion');

  // Get data from API instead of mock data
  const hotTopicsArticles = hotTopicsData.hot_topics || [];
  const bollywoodArticles = hotTopicsData.bollywood || [];

  const handleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'hot-topics');
    }
  };

  // Get articles based on active tab
  const getTabArticles = () => {
    if (activeTab === 'fashion') {
      return hotTopicsArticles; // Hot Topics articles
    } else {
      return bollywoodArticles; // Bollywood articles
    }
  };

  const currentArticles = getTabArticles();

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div 
      className={`${getSectionContainerClasses()} relative`} 
      style={{ 
        height: '357px !important'
      }}
    >
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('fashion')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'fashion' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.fashion', 'Hot Topics')}
        </button>
        <button
          onClick={() => setActiveTab('beauty')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'beauty'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.beauty', 'Bollywood')}
        </button>
      </div>
      
      <div 
        className={`overflow-y-auto ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: '312px !important',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="p-2">
          <ul className="space-y-1">
            {currentArticles.slice(0, 4).map((article, index) => (
              <li
                key={article.id}
                className={`group cursor-pointer py-1 px-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                onClick={() => handleClick(article)}
              >
                <div className="flex items-start space-x-2 text-left">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getThumbnail(index)}
                      alt={article.title}
                      className="w-20 h-16 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200" style={{fontSize: '14px', fontWeight: '600'}}>
                      {article.title}
                    </h4>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* More Button Overlay - Square with Rounded Corners */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => {
              // Save current scroll position
              const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
              sessionStorage.setItem('homePageScrollPosition', currentScroll.toString());
              console.log(`[SCROLL] Fashion More button - saved scroll: ${currentScroll}`);
              
              // Navigate to the page
              window.location.href = '/fashion-travel-topics';
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

export default Fashion;
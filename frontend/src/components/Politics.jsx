import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ArticleImage from './ArticleImage';
import LoadingSpinner from './LoadingSpinner';

const Politics = ({ politicsData = {}, onArticleClick, isLoading = false }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('state'); // 'state' or 'national'

  // Filter out future-dated articles (for home page display)
  const filterCurrentArticles = (articles) => {
    const now = new Date();
    return articles.filter(article => {
      if (!article.published_at) return true; // Keep articles without dates
      const publishedDate = new Date(article.published_at);
      return publishedDate <= now; // Exclude future-dated articles
    });
  };

  // Extract data from props - now using real API data with date filtering
  const rawStateArticles = politicsData.state_politics || [];
  const rawNationalArticles = politicsData.national_politics || [];
  
  const stateArticles = filterCurrentArticles(rawStateArticles);
  const nationalArticles = filterCurrentArticles(rawNationalArticles);

  // Get articles based on active tab
  const getTabArticles = () => {
    if (activeTab === 'state') {
      return stateArticles; // State politics articles (filtered by user's states)
    } else {
      return nationalArticles; // National politics articles
    }
  };

  const handlePoliticsArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'politics');
    }
  };

  const currentArticles = getTabArticles();

  return (
    <div className={`${getSectionContainerClasses()} relative`}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('state')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'state' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.state_politics', 'State Politics')}
        </button>
        <button
          onClick={() => setActiveTab('national')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'national'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.national_politics', 'National Politics')}
        </button>
      </div>
      
      <div 
        className={`p-2 overflow-y-hidden ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: '314px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="text-sm text-gray-500 mt-3">Refreshing {activeTab === 'state' ? 'state politics' : 'national politics'} articles...</p>
            </div>
          </div>
        ) : currentArticles.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-sm">No {activeTab === 'state' ? 'state politics' : 'national politics'} articles available.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {currentArticles.slice(0, 4).map((article, index) => (
              <li
                key={article.id}
                className={`group cursor-pointer py-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                onClick={() => handlePoliticsArticleClick(article)}
              >
                <div className="flex items-start space-x-2 text-left">
                  <div className="relative flex-shrink-0">
                    <ArticleImage
                      src={article.image_url || article.image}
                      alt={article.title}
                      width="w-20"
                      height="h-16"
                      className="object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                      contentType={activeTab === 'state' ? 'state-politics' : 'national-politics'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 leading-tight hover:text-gray-700 transition-colors duration-300" style={{fontSize: '14px', fontWeight: '600'}}>
                      {article.title}
                    </h4>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* More Button Overlay - Icon Style to match Movies section */}
      {currentArticles.length > 0 && (
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <Link 
              to="/politics"
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
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Politics;
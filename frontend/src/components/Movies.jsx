import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ArticleImage from './ArticleImage';
import LoadingSpinner from './LoadingSpinner';

const Movies = ({ moviesData, onArticleClick, isLoading = false }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('movie-news');
  
  // Extract movie news and bollywood movies from props data
  const movieNewsArticles = moviesData?.movie_news || [];
  const bollywoodMoviesArticles = moviesData?.bollywood_movies || [];

  // Get articles based on active tab
  const getTabArticles = () => {
    if (activeTab === 'movie-news') {
      return movieNewsArticles; // Movie News articles
    } else {
      return bollywoodMoviesArticles; // Bollywood articles
    }
  };

  const currentArticles = getTabArticles();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'movies');
    }
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('movie-news')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'movie-news' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          Movie News
        </button>
        <button
          onClick={() => setActiveTab('bollywood')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'bollywood'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.bollywood', 'Bollywood')}
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
        <ul className="space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="large" />
                <p className="text-sm text-gray-500 mt-3">Refreshing {activeTab === 'movie-news' ? 'movie news' : 'bollywood'} articles...</p>
              </div>
            </div>
          ) : currentArticles.length > 0 ? (
            currentArticles.slice(0, 4).map((article, index) => (
              <li
                key={article.id}
                className={`group cursor-pointer py-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                onClick={() => handleArticleClick(article)}
              >
                <div className="flex items-start space-x-2 text-left">
                  <div className="relative flex-shrink-0">
                    <ArticleImage
                      src={article.image_url || article.image}
                      alt={article.title}
                      width="w-20"
                      height="h-16"
                      className="object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                      contentType={activeTab === 'movie-news' ? 'movie-news' : 'bollywood'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 leading-tight hover:text-gray-700 transition-colors duration-300" style={{fontSize: '14px', fontWeight: '600'}}>
                      {article.title}
                    </h4>
                  </div>
                </div>
              </li>
            ))
          ) : (
            // Show loading or no articles message
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">
                {activeTab === 'movie-news' 
                  ? 'No movie news articles available' 
                  : 'No bollywood articles available'
                }
              </p>
            </div>
          )}
        </ul>
      </div>
      
      {/* More Button Overlay - Square with Rounded Corners */}
      {currentArticles.length > 0 && (
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <Link 
              to={activeTab === 'movie-news' ? '/movie-news' : '/bollywood'}
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

export default Movies;
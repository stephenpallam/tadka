import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const AI = ({ reviews, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('ai');
  const [featuredItems, setFeaturedItems] = useState([]);
  const [aiArticles, setAIArticles] = useState([]);
  const [stockMarketArticles, setStockMarketArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch AI and Stock Market articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/sections/ai-stock`);
        if (response.ok) {
          const data = await response.json();
          setAIArticles(data.ai || []);
          setStockMarketArticles(data.stock_market || []);
        } else {
          console.error('Failed to fetch AI articles');
        }
      } catch (error) {
        console.error('Error fetching AI articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    if (reviews) {
      setFeaturedItems(reviews);
    }
  }, [reviews]);

  const handleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'ai');
    }
  };

  // Get articles based on active tab
  const getTabArticles = () => {
    if (activeTab === 'ai') {
      return aiArticles; // Real AI articles from API
    } else {
      return stockMarketArticles; // Real Stock Market articles from API
    }
  };

  const currentItems = getTabArticles();

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '357px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'ai' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.ai', 'AI')}
        </button>
        <button
          onClick={() => setActiveTab('ai-tools')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'ai-tools'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.ai_tools', 'Stock Market')}
        </button>
      </div>
      
      <div 
        className={`overflow-y-hidden ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: 'calc(357px - 45px)',
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
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ul className="space-y-1">
              {currentItems.slice(0, 4).map((article, index) => (
                <li
                  key={article.id}
                  className={`group cursor-pointer py-1 px-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                  onClick={() => handleClick(article)}
                >
                  <div className="flex items-start space-x-2 text-left">
                    <div className="relative flex-shrink-0">
                      <img
                        src={article.main_image_url || getThumbnail(index)}
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
          )}
        </div>
      </div>
      
      {/* More Button Overlay - Square with Rounded Corners */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/ai-and-stock-market-news" 
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
    </div>
  );
};

export default AI;
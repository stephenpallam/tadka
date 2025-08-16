import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import mockData from '../data/comprehensiveMockData';

const TVShows = ({ articles, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('tv');
  const [tvData, setTvData] = useState({ tv: [], bollywood: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTvData();
  }, []);

  const fetchTvData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/sections/tv-shows`);
      if (response.ok) {
        const data = await response.json();
        setTvData(data);
      }
    } catch (error) {
      console.error('Error fetching TV shows data:', error);
      // Fallback to using articles prop
      if (articles && articles.length > 0) {
        const halfLength = Math.ceil(articles.length / 2);
        setTvData({
          tv: articles.slice(0, halfLength),
          bollywood: articles.slice(halfLength)
        });
      } else {
        // Use mock data as final fallback
        const talkOfTown = mockData.talkOfTown || [];
        const halfLength = Math.ceil(talkOfTown.length / 2);
        setTvData({
          tv: talkOfTown.slice(0, halfLength),
          bollywood: talkOfTown.slice(halfLength)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, activeTab === 'tv' ? 'tv_shows' : 'bollywood_tv');
    }
  };

  // Get articles based on active tab
  const getTabArticles = () => {
    if (loading) {
      return []; // Show empty while loading
    }
    
    if (activeTab === 'tv') {
      return tvData.tv || [];
    } else {
      return tvData.bollywood || [];
    }
  };

  const currentArticles = getTabArticles();

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '351px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('tv')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'tv' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.tv_shows', 'TV')}
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
          {t('sections.bollywood_tv', 'Bollywood')}
        </button>
      </div>
      
      <div 
        className={`overflow-y-hidden relative ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: 'calc(351px - 45px)',
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
            <div className="flex justify-center items-center h-full">
              <div className="text-sm text-gray-500">Loading TV shows...</div>
            </div>
          ) : currentArticles.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-sm text-gray-500">No TV shows available</div>
            </div>
          ) : (
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
                        src={article.image || getThumbnail(index)}
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
      
      {/* More Button Overlay - Square with Rounded Corners - Bottom Right */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/tv-shows" 
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

export default TVShows;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import mockData from '../data/comprehensiveMockData';

const BoxOffice = ({ articles, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('box-office');
  const [talkOfTown, setTalkOfTown] = useState([]);

  useEffect(() => {
    if (articles) {
      setTalkOfTown(articles);
    } else {
      // Use talk of town data from mockData
      setTalkOfTown(mockData.talkOfTown || []);
    }
  }, [articles]);

  const handleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'box_office');
    }
  };

  // Get articles based on active tab
  const getTabArticles = () => {
    if (!talkOfTown || talkOfTown.length === 0) return [];
    
    const halfLength = Math.ceil(talkOfTown.length / 2);
    if (activeTab === 'box-office') {
      return talkOfTown.slice(0, halfLength); // First half for Box Office
    } else {
      return talkOfTown.slice(halfLength); // Second half for Bollywood
    }
  };

  const currentArticles = getTabArticles();

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '352px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('box-office')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'box-office' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.box_office', 'Box Office')}
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
        className={`overflow-y-hidden relative ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: 'calc(352px - 45px)',
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
                  <img
                    src={getThumbnail(index)}
                    alt={article.title}
                    className="flex-shrink-0 w-20 h-16 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                  />
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
      
      {/* More Button Overlay - Square with Rounded Corners - Fixed positioning to match Fashion */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/box-office" 
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

export default BoxOffice;
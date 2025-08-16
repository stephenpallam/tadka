import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SportsSchedules = ({ sportsData, onArticleClick }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('cricket');
  
  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'sports_schedules');
    }
  };

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1586188984888-e4a8b7c9b25e?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  // Get articles from sportsData prop or fallback to mock data
  const cricketArticles = sportsData?.cricket || [
    { id: 101, title: "World Cup Final Creates Historic Sporting Moment" },
    { id: 102, title: "Young Talent Shines in International Cricket Championship" },
    { id: 103, title: "Record-Breaking Performance Stuns Cricket Fans Worldwide" },
    { id: 111, title: "Elite Cricket Academy Produces Next Generation Stars" }
  ];

  const otherSportsArticles = sportsData?.other_sports || [
    { id: 104, title: "Olympic Athletes Prepare for Upcoming International Games" },
    { id: 105, title: "Basketball Championship Finals Deliver Thrilling Competition" },
    { id: 106, title: "Swimming Records Broken at National Championships" },
    { id: 114, title: "Tennis Tournament Features Rising International Stars" }
  ];

  const getTabArticles = () => {
    return activeTab === 'cricket' ? cricketArticles : otherSportsArticles;
  };

  const currentArticles = getTabArticles();

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ minHeight: '355px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('cricket')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'cricket' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.cricket', 'Cricket')}
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'other'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.other_sports', 'Other Sports')}
        </button>
      </div>
      
      <div 
        className={`overflow-y-hidden h-[calc(355px-45px)] md:h-[calc(277px-45px)] lg:h-[calc(355px-45px)] ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
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
                className={`group cursor-pointer py-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                onClick={() => handleArticleClick(article)}
              >
                <div className="flex items-start space-x-2 text-left">
                  <img
                    src={article.image_url || getThumbnail(index)}
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
      
      {/* More Button Overlay - Square with Rounded Corners */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => {
              sessionStorage.setItem('homeScrollPosition', window.pageYOffset.toString());
              window.location.href = '/sports';
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

export default SportsSchedules;
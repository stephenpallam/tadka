import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const StockMarket = ({ articles, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [activeTab, setActiveTab] = useState('market');

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, activeTab === 'market' ? 'stock_market' : 'india');
    }
  };

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1559589688-f26e539c0cb4?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1509909756405-be0199881695?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  // Fashion articles sample
  const fashionArticles = [
    { id: 101, title: "Fashion Week Highlights Sustainable Design Trends" },
    { id: 102, title: "Celebrity Designer Collaboration Creates Style Sensation" },
    { id: 103, title: "Vintage Fashion Revival Captures Global Attention" },
    { id: 104, title: "Luxury Brand Unveils Eco-Friendly Collection" },
    { id: 105, title: "Street Style Photography Influences High Fashion" },
    { id: 106, title: "Fashion Industry Embraces Digital Innovation" }
  ];

  // Travel articles
  const travelArticles = [
    { id: 201, title: "Hidden Gems: Unexplored Destinations Gaining Popularity" },
    { id: 202, title: "Sustainable Tourism Practices Transform Travel Industry" },
    { id: 203, title: "Adventure Travel Experiences Create Lasting Memories" },
    { id: 204, title: "Cultural Tourism Connects Travelers with Local Traditions" },
    { id: 205, title: "Travel Photography Tips for Social Media Success" },
    { id: 206, title: "Budget Travel Hacks for Maximum Adventure" }
  ];

  const getTabArticles = () => {
    return activeTab === 'market' ? fashionArticles : travelArticles;
  };

  const currentArticles = getTabArticles();

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '357px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('market')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'market' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.us_stocks', 'Fashion')}
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'live'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.indian_stocks', 'Travel')}
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
          <ul className="space-y-1">
            {currentArticles.slice(0, 4).map((article, index) => (
                <li
                  key={article.id}
                  className={`group cursor-pointer py-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="flex items-start text-left">
                    <div className="flex items-start space-x-2 flex-1">
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
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
      
      {/* More Button Overlay - Square with Rounded Corners */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/fashion-travel-topics" 
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

export default StockMarket;
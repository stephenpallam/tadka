import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import mockData from '../data/comprehensiveMockData';

const LatestNews = ({ onArticleClick }) => {
  const { getSectionHeaderClasses } = useTheme();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Use political news data from mockData
    setArticles(mockData.politicalNews || []);
  }, []);

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article, 'latest_news');
    }
  };

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1586339949216-35c2747cb8de?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=80&h=64&fit=crop',
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className="bg-white border border-gray-300" style={{ height: '722px' }}>
      <div className={`${getSectionHeaderClasses().containerClass} px-3 py-2 border-b text-left flex items-center justify-between`}>
        <h3 className={`text-sm font-semibold ${getSectionHeaderClasses().textClass}`}>Latest News</h3>
        <Link 
          to="/latest-news" 
          className={`group flex items-center text-xs ${getSectionHeaderClasses().moreButtonClass} transition-colors duration-200`}
        >
          <svg 
            className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
      
      <div 
        className="overflow-y-hidden" 
        style={{ 
          height: 'calc(722px - 45px)',
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
            {articles.slice(0, 8).map((article, index) => (
              <li
                key={article.id}
                className="group cursor-pointer hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                style={{ paddingTop: '1.7px', paddingBottom: '4px', paddingLeft: '4px', paddingRight: '4px' }}
                onClick={() => handleArticleClick(article)}
              >
                <div className="flex items-start space-x-2 text-left">
                  <img
                    src={getThumbnail(index)}
                    alt=""
                    className="flex-shrink-0 w-20 h-16 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200" style={{fontSize: '14px', fontWeight: '600'}}>
                      {article.title}
                    </h4>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
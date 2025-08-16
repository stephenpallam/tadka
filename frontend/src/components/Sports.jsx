import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import mockData from '../data/comprehensiveMockData';

const Sports = ({ reviews, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [movieReviews, setMovieReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('health');

  // Sample articles data
  const sampleHealthArticles = [
    { id: 901, title: "Revolutionary Fitness Program Shows Amazing Weight Loss Results" },
    { id: 902, title: "Mental Health Awareness Campaign Reaches Million People Globally" },
    { id: 903, title: "Healthy Lifestyle Changes Reduce Disease Risk by 40 Percent" }
  ];

  const sampleFoodArticles = [
    { id: 904, title: "Nutritious Superfood Recipe Collection Promotes Healthy Eating" },
    { id: 905, title: "Local Organic Farm Movement Creates Sustainable Food Options" },
    { id: 906, title: "Celebrity Chef's Healthy Cooking Show Inspires Home Chefs" }
  ];

  useEffect(() => {
    if (reviews) {
      setMovieReviews(reviews);
    } else {
      // Use movie reviews data from mockData
      setMovieReviews(mockData.movieReviews || []);
    }
  }, [reviews]);

  // Get articles based on active tab
  const getTabArticles = () => {
    if (activeTab === 'health') {
      return sampleHealthArticles; // Health articles
    } else {
      return sampleFoodArticles; // Food articles
    }
  };

  const currentReviews = getTabArticles();

  const handleClick = (review) => {
    if (onArticleClick) {
      onArticleClick(review, activeTab === 'health' ? 'health' : 'food');
    }
  };

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1515810143205-c9095cb61d34?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0d8e4b15d0a?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1518810765-8aedc8f72bcc?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '357px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('health')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'health' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.health', 'Health')}
        </button>
        <button
          onClick={() => setActiveTab('food')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'food'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.food', 'Food')}
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
            {currentReviews.slice(0, 4).map((review, index) => (
              <li
                key={review.id}
                className={`group cursor-pointer py-1 px-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                onClick={() => handleClick(review)}
              >
                <div className="flex items-start space-x-2 text-left">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getThumbnail(index)}
                      alt={review.title}
                      className="w-20 h-16 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200" style={{fontSize: '14px', fontWeight: '600'}}>
                      {review.title}
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
          <Link 
            to="/health-food-topics" 
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

export default Sports;
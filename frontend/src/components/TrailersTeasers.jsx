import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import mockData from '../data/comprehensiveMockData';

const TrailersTeasers = ({ reviews, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('trailers');
  const [trailersData, setTrailersData] = useState({ trailers: [], bollywood: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrailersData();
  }, []);

  const fetchTrailersData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/sections/trailers-teasers`);
      if (response.ok) {
        const data = await response.json();
        setTrailersData(data);
      }
    } catch (error) {
      console.error('Error fetching trailers data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample articles data (fallback)
  const sampleTrailersArticles = [
    { id: 801, title: "Epic Superhero Film Trailer Breaks YouTube View Records" },
    { id: 802, title: "Romantic Comedy Teaser Promises Heartwarming Entertainment" },
    { id: 803, title: "Action Thriller Preview Shows Stunning Visual Effects" }
  ];

  const sampleBollywoodArticles = [
    { id: 804, title: "Pathaan Trailer Sets Internet on Fire" },
    { id: 805, title: "Jawan Teaser Creates Mass Hysteria" },
    { id: 806, title: "Tiger 3 Action Trailer Breaks Records" }
  ];

  useEffect(() => {
    if (reviews) {
      setFeaturedItems(reviews);
    } else {
      // Use features data from mockData for trailers/teasers
      setFeaturedItems(mockData.features || []);
    }
  }, [reviews]);

  // Get articles based on active tab
  const getTabArticles = () => {
    if (loading) {
      // Return sample data while loading
      return activeTab === 'trailers' ? sampleTrailersArticles : sampleBollywoodArticles;
    }
    
    if (activeTab === 'trailers') {
      return trailersData.trailers.length > 0 ? trailersData.trailers : sampleTrailersArticles;
    } else {
      return trailersData.bollywood.length > 0 ? trailersData.bollywood : sampleBollywoodArticles;
    }
  };

  const currentItems = getTabArticles();

  const handleClick = (review) => {
    if (onArticleClick) {
      // Navigate to the article page with correct category
      onArticleClick(review, activeTab === 'trailers' ? 'trailers_teasers' : 'bollywood_trailers');
    }
  };

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1518810765-8aedc8f72bcc?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1515810143205-c9095cb61d34?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1594736797933-d0d8e4b15d0a?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=64&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '351px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('trailers')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'trailers' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.trailers_teasers', 'Trailers & Teasers')}
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'songs'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.bollywood_trailers', 'Bollywood')}
        </button>
      </div>
      
      <div 
        className={`overflow-y-hidden ${getSectionBodyClasses().backgroundClass}`}
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
          <ul className="space-y-1">
            {currentItems.slice(0, 4).map((review, index) => (
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
      
      {/* More Button Overlay - Square with Rounded Corners - Fixed positioning to match Fashion */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/trailers-teasers-and-new-songs" 
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

export default TrailersTeasers;
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const OTTMovieReviews = ({ ottMovieReviewsData = {}, onImageClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'webseries'
  const sliderRef = useRef(null);

  // Extract data from props or use fallback sample data
  const ottMovieReviews = ottMovieReviewsData.ott_movie_reviews || [];
  const webSeriesReviews = ottMovieReviewsData.web_series || [];
  
  // Sample OTT Movie Reviews data (fallback)
  const sampleOTTMovieReviews = [
    { id: 1, title: 'The Gray Man Review', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop' },
    { id: 2, title: 'Red Notice Review', image_url: 'https://images.unsplash.com/photo-1594736797933-d0c1372bbf52?w=400&h=300&fit=crop' },
    { id: 3, title: 'Don\'t Look Up Review', image_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop' },
    { id: 4, title: 'The Adam Project Review', image_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=300&fit=crop' },
    { id: 5, title: 'Extraction 2 Review', image_url: 'https://images.unsplash.com/photo-1489599511804-b5e70a09c787?w=400&h=300&fit=crop' },
    { id: 6, title: 'The Irishman Review', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
    { id: 7, title: 'Marriage Story Review', image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=300&fit=crop' },
    { id: 8, title: 'The Trial of Chicago 7 Review', image_url: 'https://images.unsplash.com/photo-1533895328261-4524dd57665a?w=400&h=300&fit=crop' }
  ];

  // Sample Web Series Reviews data (fallback)
  const sampleWebSeriesReviews = [
    { id: 1, title: 'Stranger Things Review', image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop' },
    { id: 2, title: 'The Crown Review', image_url: 'https://images.unsplash.com/photo-1594736797933-d0c1372bbf52?w=400&h=300&fit=crop' },
    { id: 3, title: 'Money Heist Review', image_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop' },
    { id: 4, title: 'Squid Game Review', image_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=300&fit=crop' },
    { id: 5, title: 'The Witcher Review', image_url: 'https://images.unsplash.com/photo-1489599511804-b5e70a09c787?w=400&h=300&fit=crop' },
    { id: 6, title: 'Ozark Review', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop' },
    { id: 7, title: 'The Mandalorian Review', image_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=300&fit=crop' },
    { id: 8, title: 'House of Cards Review', image_url: 'https://images.unsplash.com/photo-1533895328261-4524dd57665a?w=400&h=300&fit=crop' }
  ];
  
  const itemsPerSlide = 6; // Increased from 5 to 6 for more items
  const getCurrentData = () => {
    if (activeTab === 'webseries') {
      return webSeriesReviews.length > 0 ? webSeriesReviews : sampleWebSeriesReviews;
    } else {
      return ottMovieReviews.length > 0 ? ottMovieReviews : sampleOTTMovieReviews;
    }
  };
  
  const currentData = getCurrentData();
  const maxIndex = Math.max(0, currentData.length - itemsPerSlide);

  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // Generate random rating for each movie (between 1.0 and 5.0)
  const getRandomRating = (index) => {
    // Use index to ensure consistent ratings for each movie
    const ratings = [4.2, 3.8, 4.5, 2.9, 3.6, 4.1, 3.3, 4.7, 2.5, 3.9, 4.0, 3.2, 4.4, 2.8, 3.7];
    return ratings[index % ratings.length];
  };

  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const getDisplayData = () => {
    const data = getCurrentData();
    return data.slice(currentIndex, currentIndex + itemsPerSlide);
  };

  return (
    <div className="bg-white pt-0 pb-2 -mt-[10px] -mb-[18px]">
      {/* Header Container with Normal Width */}
      <div className="max-w-5xl-plus mx-auto px-8">
        {/* Header with tabs matching BoxOffice style */}
        <div className={`${getSectionHeaderClasses().containerClass} border rounded-lg flex relative mb-3`}>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-l-lg ${
              activeTab === 'general' 
                ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
                : getSectionHeaderClasses().unselectedTabClass
            }`}
            style={{fontSize: '14px', fontWeight: '500'}}
          >
            {t('sections.ott_reviews', 'OTT Reviews')}
          </button>
          <button
            onClick={() => setActiveTab('webseries')}
            className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-r-lg ${
              activeTab === 'webseries'
                ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
                : getSectionHeaderClasses().unselectedTabClass
            }`}
            style={{fontSize: '14px', fontWeight: '500'}}
          >
            {t('sections.bollywood_reviews', 'Bollywood')}
          </button>
          <Link 
            to="/ott-reviews" 
            className={`absolute top-1/2 transform -translate-y-1/2 right-4 group flex items-center justify-center text-xs ${getSectionHeaderClasses().moreButtonClass} transition-colors duration-200`}
          >
            <svg 
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
        
        {/* Multiple Videos Horizontal Scroll Container - Matching TrendingVideos Structure */}
        <div 
          className="relative overflow-x-auto"
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex space-x-3 pb-2 scrollbar-hide">
            {getDisplayData().map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0"
                style={{ minWidth: '200px' }} // Reverted back to original 200px
              >
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-400 transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={item.image_url || item.image}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ width: '200px', height: '120px' }} // Reverted back to original dimensions
                    />
                    
                    {/* Rating Badge - Yellow Square Background */}
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                      {getRandomRating(currentIndex + index)}
                    </div>
                    
                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                      <h3 className="text-white font-bold text-xs text-center leading-tight">
                        {item.title || item.name}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {maxIndex > 0 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default OTTMovieReviews;
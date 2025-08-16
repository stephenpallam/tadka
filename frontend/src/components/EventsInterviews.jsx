import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import dataService from '../services/dataService';

const EventsInterviews = ({ eventsInterviewsData = {} }) => {
  const { t } = useLanguage();
  const { theme, getSectionHeaderClasses } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const scrollContainerRef = useRef(null);
  
  // Get data from API instead of mock data
  const eventsVideos = eventsInterviewsData.events_interviews || [];
  const bollywoodVideos = eventsInterviewsData.bollywood || [];
  
  const currentData = activeTab === 'bollywood' ? bollywoodVideos : eventsVideos;

  // Get YouTube thumbnail from video URL
  const getYouTubeThumbnail = (youtubeUrl) => {
    if (!youtubeUrl) return 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop';
    
    const videoId = youtubeUrl.includes('youtube.com/watch?v=') 
      ? youtubeUrl.split('v=')[1]?.split('&')[0]
      : youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop';
  };

  // Handle video click - navigate to specific video page
  const handleVideoClick = (video) => {
    navigate(`/video/${video.id}`);
  };

  const getCurrentData = () => {
    return currentData; // Return all data since we removed pagination
  };

  return (
    <div className="bg-white pt-0 pb-2 -mt-[9px] -mb-[17px]">
      {/* Header Container with Normal Width */}
      <div className="max-w-5xl-plus mx-auto px-8">
        {/* Header with tabs matching TrendingVideos style */}
        <div className={`${getSectionHeaderClasses().containerClass} border rounded-lg flex relative mb-3`}>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-l-lg ${
              activeTab === 'events' 
                ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
                : getSectionHeaderClasses().unselectedTabClass
            }`}
            style={{fontSize: '14px', fontWeight: '500'}}
          >
            {t('sections.events_interviews', 'Events & Interviews')}
          </button>
          <button
            onClick={() => setActiveTab('bollywood')}
            className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-r-lg ${
              activeTab === 'bollywood'
                ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
                : getSectionHeaderClasses().unselectedTabClass
            }`}
            style={{fontSize: '14px', fontWeight: '500'}}
          >
            {t('sections.bollywood', 'Bollywood')}
          </button>
          <Link 
            to="/events-interviews" 
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
        
        {/* Multiple Videos Horizontal Scroll Container - Same as TrendingVideos */}
        <div 
          className="relative overflow-x-auto"
          ref={scrollContainerRef}
        >
          <div className="flex space-x-3 pb-2 scrollbar-hide">
            {getCurrentData().map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 cursor-pointer"
                style={{ minWidth: '200px' }}
                onClick={() => handleVideoClick(item)}
              >
                <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={item.youtube_url ? getYouTubeThumbnail(item.youtube_url) : (item.image_url || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop')}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ width: '200px', height: '120px' }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default EventsInterviews;
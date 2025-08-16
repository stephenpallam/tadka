import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PlaceholderImage } from '../utils/imageUtils';
import VideoModal from './VideoModal';

const ViralShorts = ({ viralShortsData = {}, onImageClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('viral-shorts'); // 'viral-shorts' or 'bollywood'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Get data from API instead of mock data
  const viralShortsVideos = viralShortsData.viral_shorts || [];
  const bollywoodVideos = viralShortsData.bollywood || [];
  
  // Debug logging in useEffect to avoid re-render loops
  useEffect(() => {
    console.log('🎬 ViralShorts received data:', viralShortsData);
    console.log('🎬 viralShortsVideos:', viralShortsVideos.length, 'videos');
    console.log('🎬 bollywoodVideos:', bollywoodVideos.length, 'videos');
  }, [viralShortsData, viralShortsVideos.length, bollywoodVideos.length]);
  
  const currentData = activeTab === 'bollywood' ? bollywoodVideos : viralShortsVideos;
  const sliderRef = useRef(null);

  // Get YouTube thumbnail from video URL
  const getYouTubeThumbnail = (youtubeUrl) => {
    if (!youtubeUrl) return 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=600&fit=crop';
    
    let videoId = null;
    
    // Handle different YouTube URL formats
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtube.com/shorts/')) {
      videoId = youtubeUrl.split('shorts/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=600&fit=crop';
  };

  // Handle video click - open in modal for viral shorts
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const getCurrentData = () => {
    return currentData; // Return all data since we removed pagination
  };

  return (
    <div className="bg-white pt-0 pb-2 -mt-[9px] -mb-[17px]">
      {/* Header Container with Normal Width */}
      <div className="max-w-5xl-plus mx-auto px-8">
        {/* Header with Tabs and More Button */}
        <div className={`${getSectionHeaderClasses().containerClass} border rounded-lg flex relative mb-3`}>
        <button
          onClick={() => setActiveTab('viral-shorts')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-l-lg ${
            activeTab === 'viral-shorts'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.viral_shorts', 'Viral Shorts')}
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
          to={`/${activeTab === 'bollywood' ? 'bollywood' : 'viral-shorts'}`} 
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

      {/* Viral Shorts Grid - Vertical like YouTube Shorts */}
      <div className="bg-white p-3">
        {/* Multiple Videos Grid Container - Vertical Layout */}
        <div 
          className="overflow-x-auto"
          ref={sliderRef}
        >
          <div className={`flex space-x-3 pb-2 scrollbar-hide`}>
            {getCurrentData().map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 cursor-pointer"
                style={{ minWidth: '120px' }} // Narrower width for vertical videos
                onClick={() => handleVideoClick(item)}
              >
                <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    {/* Vertical aspect ratio for YouTube Shorts style */}
                    <img
                      src={item.youtube_url ? getYouTubeThumbnail(item.youtube_url) : (item.image_url || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=600&fit=crop')}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{ width: '120px', height: '200px' }} // Vertical aspect ratio
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=600&fit=crop';
                      }}
                    />
                    
                    {/* No title overlay - clean like trending videos */}
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

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        video={selectedVideo}
      />
    </div>
  );
};

export default ViralShorts;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import mockData from '../data/comprehensiveMockData';

const NewVideoSongs = ({ reviews, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses } = useTheme();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('video-songs');
  const [videoSongsData, setVideoSongsData] = useState({ video_songs: [], bollywood: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoSongsData();
  }, []);

  const fetchVideoSongsData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/sections/new-video-songs`);
      if (response.ok) {
        const data = await response.json();
        setVideoSongsData(data);
      }
    } catch (error) {
      console.error('Error fetching video songs data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample articles data (fallback)
  const sampleVideoSongsArticles = [
    { id: 901, title: "Latest Punjabi Music Video Goes Viral" },
    { id: 902, title: "Independent Artist's Music Video Breaks Internet" },
    { id: 903, title: "Chart-Topping Music Video Features Breathtaking Cinematography" }
  ];

  const sampleBollywoodArticles = [
    { id: 904, title: "Pathaan Title Track Creates Dance Craze" },
    { id: 905, title: "Jawan's 'Zinda Banda' Breaks Music Records" },
    { id: 906, title: "Latest Bollywood Music Video Trends Worldwide" }
  ];

  useEffect(() => {
    if (reviews) {
      setFeaturedItems(reviews);
    } else {
      // Use features data from mockData for video songs
      setFeaturedItems(mockData.features || []);
    }
  }, [reviews]);

  // Get articles based on active tab
  const getTabArticles = () => {
    if (loading) {
      // Return sample data while loading
      return activeTab === 'video-songs' ? sampleVideoSongsArticles : sampleBollywoodArticles;
    }
    
    if (activeTab === 'video-songs') {
      return videoSongsData.video_songs.length > 0 ? videoSongsData.video_songs : sampleVideoSongsArticles;
    } else {
      return videoSongsData.bollywood.length > 0 ? videoSongsData.bollywood : sampleBollywoodArticles;
    }
  };

  const currentItems = getTabArticles();

  const handleClick = (review) => {
    if (onArticleClick) {
      // Navigate to the article page with correct category
      onArticleClick(review, activeTab === 'video-songs' ? 'new_video_songs' : 'bollywood_video_songs');
    }
  };

  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1518329147777-4c8fbfac0c8b?w=80&h=64&fit=crop',
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=80&h=64&fit=crop',
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
          onClick={() => setActiveTab('video-songs')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'video-songs' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.new_video_songs', 'New Video Songs')}
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
          {t('sections.bollywood_video_songs', 'Bollywood')}
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
      
      {/* More Button Overlay - Square with Rounded Corners - Bottom Right */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/latest-new-video-songs" 
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

export default NewVideoSongs;
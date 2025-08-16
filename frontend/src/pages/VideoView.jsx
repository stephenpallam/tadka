import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PlaceholderImage } from '../utils/imageUtils';
import { STATE_CODE_MAPPING, parseStoredStates, DEFAULT_SELECTED_STATES } from '../utils/statesConfig';

const VideoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [article, setArticle] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update page title and meta tags for SEO
  useEffect(() => {
    if (article) {
      // Update page title
      document.title = `${article.title} | Tadka News`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.summary || article.content?.substring(0, 160) || '');
      } else {
        const newMetaDescription = document.createElement('meta');
        newMetaDescription.name = 'description';
        newMetaDescription.content = article.summary || article.content?.substring(0, 160) || '';
        document.head.appendChild(newMetaDescription);
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      const articleTags = Array.isArray(article.tags) ? article.tags.join(', ') : '';
      const keywords = `${article.title}, ${article.category || 'videos'}, Tadka News, ${articleTags}`;
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        const newMetaKeywords = document.createElement('meta');
        newMetaKeywords.name = 'keywords';
        newMetaKeywords.content = keywords;
        document.head.appendChild(newMetaKeywords);
      }
    }

    return () => {
      // Reset title when component unmounts
      document.title = 'Tadka News';
    };
  }, [article]);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        
        // Fetch the article
        const articleResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/${id}`
        );
        
        if (articleResponse.ok) {
          const articleData = await articleResponse.json();
          console.log('🎬 Current video data:', {
            id: articleData.id,
            title: articleData.title,
            category: articleData.category
          });
          setArticle(articleData);
          
          // Fetch related videos based on article category with state filtering
          await fetchRelatedVideos(articleData);
          
        } else {
          setError('Video not found');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading video data:', err);
        setError('Failed to load video. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideoData();
    }
  }, [id]);

  // Function to fetch related videos based on the current video's category
  const fetchRelatedVideos = async (currentVideo) => {
    try {
      console.log('🎬 === STARTING RELATED VIDEOS FETCH ===');
      console.log('🎬 Current video:', {
        id: currentVideo.id,
        title: currentVideo.title,
        category: currentVideo.category
      });
      
      // Get user's state preferences from localStorage
      const userStateString = localStorage.getItem('tadka_state') || JSON.stringify(DEFAULT_SELECTED_STATES);
      const userStates = parseStoredStates(userStateString);
      
      console.log('🎬 User states for related videos:', userStates);
      
      let relatedVideosData = [];
      
      // Fetch related videos based on the current video's category
      if (currentVideo.category === 'trending-videos' || currentVideo.category === 'bollywood-trending-videos') {
        console.log('🎬 Category matches trending videos - using trending videos endpoint');
        
        // For trending videos, use the same endpoint as homepage with state filtering
        const userStateCodes = userStates.map(state => {
          return STATE_CODE_MAPPING[state] || state.toLowerCase();
        });
        
        let url = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/sections/trending-videos?limit=20`;
        if (userStateCodes && userStateCodes.length > 0) {
          url += `&states=${userStateCodes.join(',')}`;
        }
        
        console.log('🎬 Making API call to:', url);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('🎬 Trending videos API response:', data);
          
          // Combine both trending_videos and bollywood arrays
          relatedVideosData = [
            ...(data.trending_videos || []),
            ...(data.bollywood || [])
          ];
        }
      } else if (currentVideo.category === 'viral-shorts' || currentVideo.category === 'bollywood-viral-shorts') {
        console.log('🎬 Category matches viral shorts - using viral shorts endpoint with state filtering');
        
        // For viral shorts, use viral shorts endpoint with state filtering
        const userStateCodes = userStates.map(state => {
          return STATE_CODE_MAPPING[state] || state.toLowerCase();
        });
        
        let url = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/sections/viral-shorts?limit=20`;
        if (userStateCodes && userStateCodes.length > 0) {
          url += `&states=${userStateCodes.join(',')}`;
        }
        
        console.log('🎬 Making API call to viral shorts:', url);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('🎬 Viral shorts API response:', data);
          
          // Show only the specific category videos, not both
          if (currentVideo.category === 'viral-shorts') {
            // If viewing viral-shorts video, show only viral-shorts related videos
            relatedVideosData = data.viral_shorts || [];
          } else if (currentVideo.category === 'bollywood-viral-shorts') {
            // If viewing bollywood-viral-shorts video, show only bollywood related videos
            relatedVideosData = data.bollywood || [];
          }
        }
      } else if (currentVideo.category === 'events-interviews' || currentVideo.category === 'events-interviews-bollywood') {
        console.log('🎬 Category matches events-interviews - using events-interviews endpoint');
        
        // For events-interviews videos, use events-interviews endpoint
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/sections/events-interviews?limit=20`);
        if (response.ok) {
          const data = await response.json();
          console.log('🎬 Events-interviews API response:', data);
          
          // Show specific category videos only, not both
          if (currentVideo.category === 'events-interviews-bollywood') {
            // If viewing bollywood events-interviews video, show only bollywood related videos
            relatedVideosData = data.bollywood || [];
          } else if (currentVideo.category === 'events-interviews') {
            // If viewing regular events-interviews video, show only events_interviews related videos
            relatedVideosData = data.events_interviews || [];
          }
        }
      } else if (currentVideo.category === 'usa' || currentVideo.category === 'row') {
        console.log('🎬 Category matches USA/ROW videos - using USA/ROW videos endpoint');
        
        // For USA/ROW videos, use USA/ROW videos endpoint
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/sections/usa-row-videos?limit=20`);
        if (response.ok) {
          const data = await response.json();
          relatedVideosData = [
            ...(data.usa || []),
            ...(data.row || [])
          ];
        }
      } else {
        console.log('🎬 Using fallback - fetching from same category:', currentVideo.category);
        // Fallback: fetch from the same category
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/category/${currentVideo.category}`
        );
        if (response.ok) {
          relatedVideosData = await response.json();
        }
      }
      
      console.log('🎬 Raw related videos data:', {
        category: currentVideo.category,
        totalVideos: relatedVideosData.length,
        allVideos: relatedVideosData.map(v => ({ 
          id: v.id, 
          title: v.title, 
          hasYouTube: !!v.youtube_url,
          youtubeUrl: v.youtube_url ? v.youtube_url.substring(0, 50) + '...' : 'NO URL'
        }))
      });
      
      // Filter out the current video and only show videos with youtube_url
      const filteredRelated = relatedVideosData
        .filter(video => {
          const isNotCurrent = video.id !== currentVideo.id;
          const hasYouTube = !!video.youtube_url;
          console.log(`🎬 Video ${video.id} (${video.title}): isNotCurrent=${isNotCurrent}, hasYouTube=${hasYouTube}, currentVideoId=${currentVideo.id}`);
          return isNotCurrent && hasYouTube;
        })
        .slice(0, 20); // Show up to 20 related videos
        
      console.log('🎬 FINAL filtered related videos:', {
        count: filteredRelated.length,
        videos: filteredRelated.map(v => ({ id: v.id, title: v.title }))
      });
      
      setRelatedVideos(filteredRelated);
      
      console.log('🎬 === RELATED VIDEOS FETCH COMPLETED ===');
      
    } catch (err) {
      console.error('🎬 ERROR in fetchRelatedVideos:', err);
      console.error('🎬 Error stack:', err.stack);
      setRelatedVideos([]);
    }
  };

  // Auto scroll to top when video page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extract YouTube video ID and create embed URL with minimal parameters
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    
    let videoId = null;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1]?.split('?')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    if (!videoId) return '';
    
    // Use minimal parameters for clean YouTube player
    return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&showinfo=0`;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (youtubeUrl) => {
    if (!youtubeUrl) return 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop';
    
    let videoId = null;
    
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtube.com/shorts/')) {
      videoId = youtubeUrl.split('shorts/')[1]?.split('?')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop';
  };

  const handleRelatedVideoClick = (video) => {
    // Update the current video content instead of navigating
    setArticle(video);
    
    // Update the URL without page reload
    window.history.pushState(
      { videoId: video.id, videoTitle: video.title },
      video.title,
      `/video/${video.id}`
    );
    
    // Update page title
    document.title = `${video.title} | Tadka News`;
    
    // Scroll to top of the page
    window.scrollTo(0, 0);
    
    // Fetch new related videos for the new video
    fetchRelatedVideos(video);
  };

  const fetchRelatedVideosDeprecated = async (currentVideo) => {
    try {
      console.log('🎬 Fetching related videos for:', {
        id: currentVideo.id,
        title: currentVideo.title,
        category: currentVideo.category
      });
      
      const relatedResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/category/${currentVideo.category}`
      );
      
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        console.log('🎬 New related videos raw data:', {
          category: currentVideo.category,
          totalVideos: relatedData.length,
          allVideos: relatedData.map(v => ({ id: v.id, title: v.title, hasYouTube: !!v.youtube_url }))
        });
        
        // Filter out the current video and only show videos with youtube_url
        const filteredRelated = relatedData
          .filter(video => video.id !== currentVideo.id && video.youtube_url)
          .slice(0, 20);
          
        console.log('🎬 New filtered related videos:', {
          count: filteredRelated.length,
          videos: filteredRelated.map(v => ({ id: v.id, title: v.title }))
        });
        
        setRelatedVideos(filteredRelated);
      }
    } catch (err) {
      console.error('Error loading related videos:', err);
    }
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  // Social sharing functions
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || 'Check out this video';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Force light theme for content areas regardless of user's theme selection
  const lightThemeClasses = {
    pageBackground: 'bg-gray-50',
    cardBackground: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200'
  };

  const themeClasses = lightThemeClasses;

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${themeClasses.textPrimary}`}>Loading Video...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📹</div>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>Video Not Available</h2>
          <p className={`${themeClasses.textSecondary} mb-6`}>{error}</p>
          <button
            onClick={handleBackNavigation}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.pageBackground}`}>
      {/* Main Container - Same layout as ArticlePage */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 80%/20% split on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          
          {/* Video Section - 80% width on desktop, full width on mobile */}
          <div className="lg:col-span-4">
            {/* Video Section Header - Sticky with published date and bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-4 lg:mb-6`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4" style={{ paddingBottom: '8px' }}>
                <h1 className="text-sm lg:text-base font-bold text-black text-left leading-tight mb-2">
                  {article.title}
                </h1>
                <p className="text-xs text-gray-900 opacity-75 flex items-center mb-2">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Published on {formatDate(article.published_at || article.created_at)}
                </p>
              </div>
            </div>

            {/* YouTube Video Player - Responsive container with aspect ratio */}
            <div className="mb-4 lg:mb-6">
              <div 
                className="relative w-full bg-black" 
                style={{ 
                  paddingBottom: '56.25%', /* 16:9 aspect ratio */
                  backgroundColor: '#000000'
                }}
              >
                <iframe
                  src={getYouTubeEmbedUrl(article.youtube_url)}
                  title={article.title}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    border: 'none',
                    backgroundColor: '#000000'
                  }}
                />
                {/* Black overlay for letterboxing effect */}
                <div 
                  className="absolute inset-0 -z-10" 
                  style={{ 
                    backgroundColor: '#000000'
                  }}
                />
              </div>
            </div>

            {/* Share Icons - Directly after video and summary */}
            <div className="border-t border-gray-300 pt-4 mb-2 lg:mb-8" style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pt-4 pb-2 lg:py-4 flex justify-start space-x-2.5">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                  title="Share on Facebook"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="w-6 h-6 bg-black text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors duration-200"
                  title="Share on X"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-6 h-6 bg-blue-700 text-white rounded-md flex items-center justify-center hover:bg-blue-800 transition-colors duration-200"
                  title="Share on LinkedIn"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-6 h-6 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 transition-colors duration-200"
                  title="Share on WhatsApp"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('telegram')}
                  className="w-6 h-6 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                  title="Share on Telegram"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleShare('reddit')}
                  className="w-6 h-6 bg-orange-500 text-white rounded-md flex items-center justify-center hover:bg-orange-600 transition-colors duration-200"
                  title="Share on Reddit"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.526-.73a.326.326 0 0 0-.218-.095z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Related Videos Section - 20% width on desktop, full width on mobile */}
          <div className="lg:col-span-1 border-t border-gray-300 lg:border-t-0 pt-4 lg:pt-0">
            {/* Related Videos Section Header - Sticky */}
            <div className={`sticky top-16 z-30 border-b-2 border-gray-300`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))', marginBottom: '16px' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h2 className="text-sm lg:text-base font-bold text-black text-left leading-tight">
                    Related Videos
                  </h2>
                </div>
                <p className="text-xs text-gray-900 opacity-75 text-left">
                  Videos you may like
                </p>
              </div>
            </div>

            {/* Related Videos List - Responsive grid layout */}
            <div className="space-y-0">
              <div className="space-y-0">
                {relatedVideos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-0">
                    {relatedVideos.map((relatedVideo, index) => (
                      <div
                        key={relatedVideo.id}
                        onClick={() => handleRelatedVideoClick(relatedVideo)}
                        className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 ${
                          index < relatedVideos.length - 1 ? 'lg:border-b lg:border-gray-200' : ''
                        }`}
                      >
                        <div className="flex justify-start lg:justify-start">
                          <img
                            src={getYouTubeThumbnail(relatedVideo.youtube_url)}
                            alt={relatedVideo.title}
                            className="object-cover group-hover:scale-105 transition-transform duration-200 w-full lg:w-auto"
                            style={{ 
                              // Mobile: full width with aspect ratio, Desktop: fixed size
                              width: 'var(--thumb-width, 100%)',
                              height: 'var(--thumb-height, auto)',
                              aspectRatio: '16/9'
                            }}
                            onError={(e) => {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'bg-gray-500 flex items-center justify-center w-full lg:w-auto';
                              placeholder.style.width = 'var(--thumb-width, 100%)';
                              placeholder.style.height = 'var(--thumb-height, auto)';
                              placeholder.style.aspectRatio = '16/9';
                              placeholder.innerHTML = `<span class="text-white font-bold text-lg">V</span>`;
                              e.target.parentNode.replaceChild(placeholder, e.target);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-gray-600 text-sm">No related videos found</p>
                    <p className="text-xs text-gray-400 mt-1">Debug: {relatedVideos.length} videos loaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for responsive thumbnail sizing */}
        <style jsx>{`
          @media (max-width: 1023px) {
            .grid img,
            .grid div[class*="bg-gray-500"] {
              --thumb-width: 100%;
              --thumb-height: auto;
            }
          }
          
          @media (min-width: 1024px) {
            .grid img,
            .grid div[class*="bg-gray-500"] {
              --thumb-width: 100%;
              --thumb-height: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default VideoView;
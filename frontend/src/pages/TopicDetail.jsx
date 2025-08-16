import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import dataService from '../services/dataService';
import { PlaceholderImage } from '../utils/imageUtils';
import ImageModal from '../components/ImageModal';

const TopicDetail = () => {
  const navigate = useNavigate();
  const { slug, movieName } = useParams();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [topic, setTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isContentTypeOpen, setIsContentTypeOpen] = useState(false);
  const [filteredContent, setFilteredContent] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Determine if this is a movie route or topic route
  const isMovieRoute = !!movieName;
  const identifier = isMovieRoute ? decodeURIComponent(movieName || '') : slug;

  // Filter options matching ViewMovieContent
  const filterOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'halfYear', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' }
  ];

  // Content type filter options
  const contentTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'post', label: 'Posts' },
    { value: 'photo', label: 'Photos' },
    { value: 'video', label: 'Videos' },
    { value: 'movie_review', label: 'Movie Reviews' }
  ];

  useEffect(() => {
    if (identifier) {
      fetchTopicContent();
    }
  }, [identifier, isMovieRoute]);

  useEffect(() => {
    // Fetch related topics after topic is loaded
    if (topic) {
      fetchRelatedTopics();
    }
  }, [topic]);

  useEffect(() => {
    // Filter content when articles, galleries, or filters change
    if (articles.length > 0 || galleries.length > 0) {
      // Separate articles and galleries for different display
      let filteredArticles = filterContentByDate(articles, selectedFilter);
      filteredArticles = filterContentByType(filteredArticles.map(article => ({ ...article, type: 'article' })), selectedContentType);
      
      let filteredGalleries = filterContentByDate(galleries, selectedFilter);
      filteredGalleries = filterContentByType(filteredGalleries.map(gallery => ({ ...gallery, type: 'gallery' })), selectedContentType);
      
      // Combine for count display and other uses
      const combined = [...filteredArticles, ...filteredGalleries];
      setFilteredContent(combined);
    } else {
      setFilteredContent([]);
    }
  }, [articles, galleries, selectedFilter, selectedContentType]);

  // Gallery-specific functions
  const handleGalleryImageClick = (gallery, imageIndex = 0) => {
    // Convert gallery data to match ImageModal expectations
    if (gallery.images && gallery.images.length > 0) {
      const galleryImages = gallery.images.map((img, index) => ({
        id: `${gallery.id}-${index}`,
        name: `${gallery.title} - Image ${index + 1}`,
        slug: `${gallery.title.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        image: img.data || img.url,
        fullImage: img.data || img.url,
        category: gallery.artists ? gallery.artists.join(', ') : 'Gallery',
        publishedAt: gallery.created_at || gallery.updated_at
      }));
      
      setSelectedImage({ 
        ...galleryImages[imageIndex], 
        allImages: galleryImages 
      });
    }
  };

  // Handle next image navigation for gallery modal
  const handleNextImage = (currentId) => {
    if (!selectedImage || !selectedImage.allImages) return;
    
    const images = selectedImage.allImages;
    const currentIndex = images.findIndex(img => img.id === currentId);
    const nextIndex = (currentIndex + 1) % images.length;
    const nextImage = images[nextIndex];
    
    setSelectedImage({ ...nextImage, allImages: images });
  };

  // Handle previous image navigation for gallery modal
  const handlePrevImage = (currentId) => {
    if (!selectedImage || !selectedImage.allImages) return;
    
    const images = selectedImage.allImages;
    const currentIndex = images.findIndex(img => img.id === currentId);
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const prevImage = images[prevIndex];
    
    setSelectedImage({ ...prevImage, allImages: images });
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedImage(null);
  };

  // Handle click outside for filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterDropdown = document.getElementById('filter-dropdown');
      const contentTypeDropdown = document.getElementById('content-type-dropdown');
      
      if (filterDropdown && !filterDropdown.contains(event.target)) {
        setIsFilterOpen(false);
      }
      
      if (contentTypeDropdown && !contentTypeDropdown.contains(event.target)) {
        setIsContentTypeOpen(false);
      }
    };

    if (isFilterOpen || isContentTypeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen, isContentTypeOpen]);

  const fetchTopicContent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isMovieRoute) {
        // For movie routes, search for articles related to the movie name
        const movieArticles = await dataService.searchArticles(identifier, 50);
        setArticles(movieArticles);
        
        // Create a mock topic object for movies
        setTopic({
          id: `movie-${identifier}`,
          title: identifier,
          description: `All content related to ${identifier}`,
          category: 'Movies',
          articles_count: movieArticles.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // For topic routes, fetch topic by slug
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/slug/${identifier}`);
        if (response.ok) {
          const topicData = await response.json();
          setTopic(topicData);
          
          // Fetch articles for this topic
          const articlesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${topicData.id}/articles?limit=50`);
          if (articlesResponse.ok) {
            const topicArticles = await articlesResponse.json();
            setArticles(topicArticles);
          }

          // Fetch galleries for this topic
          const galleriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${topicData.id}/galleries`);
          if (galleriesResponse.ok) {
            const topicGalleries = await galleriesResponse.json();
            setGalleries(topicGalleries);
          }
        } else {
          setError('Topic not found');
        }
      }
    } catch (err) {
      console.error('Error loading topic content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTopics = async () => {
    try {
      if (!topic?.category) {
        setRelatedTopics([]);
        return;
      }

      // Get related topics from the same category
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics?limit=10&category=${topic.category}`);
      if (response.ok) {
        const allTopics = await response.json();
        // Filter out current topic and limit to 8
        const filtered = allTopics.filter(t => t.id !== topic.id).slice(0, 8);
        setRelatedTopics(filtered);
      } else {
        setRelatedTopics([]);
      }
    } catch (error) {
      console.error('Error loading related topics:', error);
      setRelatedTopics([]);
    }
  };

  // Filter content by date
  const filterContentByDate = (content, filter) => {
    if (filter === 'all') return content;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return content.filter(item => {
      const itemDate = new Date(item.publishedAt || item.published_at || item.created_at);
      itemDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
      
      switch (filter) {
        case 'thisWeek':
          const currentWeekStart = new Date(today);
          const dayOfWeek = today.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          currentWeekStart.setDate(today.getDate() - daysToMonday);
          
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
          
          return itemDate >= currentWeekStart && itemDate <= currentWeekEnd;
        case 'today':
          return itemDate.getTime() === today.getTime();
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return itemDate.getTime() === yesterday.getTime();
        case 'week':
          return daysDiff >= 0 && daysDiff <= 7;
        case 'month':
          return daysDiff >= 0 && daysDiff <= 30;
        case 'quarter':
          return daysDiff >= 0 && daysDiff <= 90;
        case 'halfYear':
          return daysDiff >= 0 && daysDiff <= 180;
        case 'year':
          return daysDiff >= 0 && daysDiff <= 365;
        default:
          return true;
      }
    });
  };

  // Filter content by type
  const filterContentByType = (content, contentType) => {
    if (contentType === 'all') return content;
    
    return content.filter(item => {
      if (item.type === 'gallery') {
        // For galleries, map gallery type to content type filter
        return contentType === 'photo'; // Galleries are considered photos
      }
      // For articles, use the content_type field
      return item.content_type === contentType || (contentType === 'post' && item.content_type === 'article');
    });
  };

  // Handle filter change
  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    setIsFilterOpen(false);
  };

  // Handle content type filter change
  const handleContentTypeChange = (contentType) => {
    setSelectedContentType(contentType);
    setIsContentTypeOpen(false);
  };

  // Get current filter label
  const getCurrentFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'All Content';
  };

  // Get current content type label
  const getCurrentContentTypeLabel = () => {
    const option = contentTypeOptions.find(opt => opt.value === selectedContentType);
    return option ? option.label : 'All Types';
  };

  const handleRelatedTopicClick = (relatedTopic) => {
    // Navigate to the related topic, replacing current route
    const newPath = isMovieRoute ? `/movie/${encodeURIComponent(relatedTopic.title)}` : `/topic/${relatedTopic.slug}`;
    navigate(newPath);
  };

  const handleArticleClick = (article) => {
    navigate(`/article/${article.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (article) => {
    if (article.image_url) return article.image_url;
    if (article.image) return article.image;
    if (article.main_image_url) return article.main_image_url;
    return '/api/placeholder/300/200';
  };

  // Force light theme for content areas
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
          <p className={`text-lg font-medium ${themeClasses.textPrimary}`}>Loading Content...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">{isMovieRoute ? '🎬' : '📝'}</div>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-4`}>No Content Found</h2>
          <p className={`${themeClasses.textSecondary} mb-6`}>
            We couldn't find any content for "{identifier}". {isMovieRoute ? 'The movie might not have any posts, photos, or videos yet.' : 'The topic might not exist or have any articles yet.'}
          </p>
          <button
            onClick={() => navigate(isMovieRoute ? '/' : '/topics')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            {isMovieRoute ? 'Back to Home' : 'Back to Topics'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.pageBackground}`}>
      {/* Main Container */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 70%/30% split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Content Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Content Header - Sticky with filter and bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h1 className="text-base font-bold text-black text-left leading-tight">
                    {topic.title}
                  </h1>
                </div>
                
                {/* Content count and Filters on same line */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-900 opacity-75 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {filteredContent.length} {getCurrentFilterLabel().toLowerCase()}
                  </p>

                  {/* Filter Dropdowns */}
                  <div className="flex items-center space-x-4">
                    {/* Content Type Filter Dropdown */}
                    <div id="content-type-dropdown" className="relative">
                      <button
                        onClick={() => setIsContentTypeOpen(!isContentTypeOpen)}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{getCurrentContentTypeLabel()}</span>
                        <svg className={`w-3 h-3 ${isContentTypeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      {/* Content Type Dropdown Menu */}
                      {isContentTypeOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="py-1">
                            {contentTypeOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleContentTypeChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                  selectedContentType === option.value 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                                {selectedContentType === option.value && (
                                  <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date Filter Dropdown */}
                    <div id="filter-dropdown" className="relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                        </svg>
                        <span>{getCurrentFilterLabel()}</span>
                        <svg className={`w-3 h-3 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      {/* Date Filter Dropdown Menu */}
                      {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="py-1">
                            {filterOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleFilterChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                  selectedFilter === option.value 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                                {selectedFilter === option.value && (
                                  <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles and Galleries Display */}
            <div className="space-y-8 mb-8">
              
              {/* Galleries Section */}
              {galleries.length > 0 && (selectedContentType === 'all' || selectedContentType === 'photo') && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Galleries</h3>
                    <p className="text-sm text-gray-600">
                      {galleries.filter(gallery => filterContentByDate([{ ...gallery, type: 'gallery' }], selectedFilter).length > 0 && filterContentByType([{ ...gallery, type: 'gallery' }], selectedContentType).length > 0).length} galleries
                    </p>
                  </div>
                  
                  {/* Gallery Grid - Similar to TadkaPics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {galleries
                      .filter(gallery => {
                        const filtered = filterContentByDate([{ ...gallery, type: 'gallery' }], selectedFilter);
                        const typeFiltered = filterContentByType(filtered, selectedContentType);
                        return typeFiltered.length > 0;
                      })
                      .map((gallery) => (
                        <div
                          key={gallery.id}
                          onClick={() => handleGalleryImageClick(gallery, 0)}
                          className="group cursor-pointer bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                          <div className="aspect-[3/4] relative">
                            {gallery.images && gallery.images.length > 0 ? (
                              <img
                                src={gallery.images[0].data || gallery.images[0].url}
                                alt={gallery.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-full h-full rounded bg-gray-500 flex items-center justify-center';
                                  placeholder.innerHTML = '<span class="text-white font-bold text-2xl">G</span>';
                                  e.target.parentNode.replaceChild(placeholder, e.target);
                                }}
                              />
                            ) : (
                              <div className="w-full h-full rounded bg-gray-500 flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">G</span>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <h4 className="text-white font-medium text-sm truncate mb-1">
                                {gallery.title}
                              </h4>
                              {gallery.artists && Array.isArray(gallery.artists) && gallery.artists.length > 0 && (
                                <p className="text-white/80 text-xs truncate">
                                  {gallery.artists.join(', ')}
                                </p>
                              )}
                              {gallery.images && gallery.images.length > 1 && (
                                <div className="flex items-center mt-1">
                                  <svg className="w-3 h-3 mr-1 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-white/80 text-xs">{gallery.images.length} photos</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Articles Section */}
              {articles.length > 0 && (selectedContentType === 'all' || (selectedContentType !== 'photo')) && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Articles & Posts</h3>
                    <p className="text-sm text-gray-600">
                      {articles.filter(article => filterContentByDate([{ ...article, type: 'article' }], selectedFilter).length > 0 && filterContentByType([{ ...article, type: 'article' }], selectedContentType).length > 0).length} articles
                    </p>
                  </div>
                  
                  {/* Articles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles
                      .filter(article => {
                        const filtered = filterContentByDate([{ ...article, type: 'article' }], selectedFilter);
                        const typeFiltered = filterContentByType(filtered, selectedContentType);
                        return typeFiltered.length > 0;
                      })
                      .map((article) => (
                        <div 
                          key={article.id} 
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm cursor-pointer group transition-all duration-200"
                          style={{ padding: '0.5rem' }}
                          onClick={() => handleArticleClick(article)}
                        >
                          <div className="flex items-start space-x-3 text-left pr-3">
                            {getImageUrl(article) && getImageUrl(article) !== '/api/placeholder/300/200' ? (
                              <img
                                src={getImageUrl(article)}
                                alt={article.title}
                                className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                                onError={(e) => {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'w-20 h-16 rounded bg-gray-500 flex items-center justify-center flex-shrink-0';
                                  const placeholderText = article.content_type === 'video' ? 'V' : article.content_type === 'photo' ? 'P' : article.content_type === 'movie_review' ? 'M' : 'A';
                                  placeholder.innerHTML = `<span class="text-white font-bold text-lg">${placeholderText}</span>`;
                                  e.target.parentNode.replaceChild(placeholder, e.target);
                                }}
                              />
                            ) : (
                              <PlaceholderImage 
                                contentType={article.content_type || 'post'} 
                                className="w-20 h-16"
                              />
                            )}
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2" style={{ fontSize: '0.9rem' }}>
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  {article.content_type || 'Article'}
                                </span>
                                {article.artists && Array.isArray(article.artists) && article.artists.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {article.artists.join(', ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 text-left">
                                {formatDate(article.publishedAt || article.published_at || article.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* No Content State */}
              {filteredContent.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="text-4xl mb-4">📰</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                  <p className="text-gray-600">
                    No articles or galleries match the selected filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Topics Section - 30% width */}
          <div className="lg:col-span-3 border-t border-gray-300 lg:border-t-0 pt-2 lg:pt-0">
            {/* Related Topics Section Header - Sticky */}
            <div className={`sticky top-16 z-30 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h2 className="text-base font-bold text-black text-left leading-tight">
                    Related Topics
                  </h2>
                </div>
                <p className="text-xs text-gray-900 opacity-75 text-left">
                  Topics you may like
                </p>
              </div>
            </div>

            {/* Related Topics List */}
            <div className="space-y-0">
              <div className="space-y-0">
                {relatedTopics.length > 0 ? (
                  relatedTopics.map((relatedTopic, index) => (
                    <div
                      key={relatedTopic.id}
                      onClick={() => handleRelatedTopicClick(relatedTopic)}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 ${
                        index < relatedTopics.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex space-x-3">
                        {relatedTopic.image ? (
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${relatedTopic.image}`}
                            alt={relatedTopic.title}
                            className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Replace with placeholder on error
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-20 h-16 rounded bg-gray-500 flex items-center justify-center flex-shrink-0';
                              placeholder.innerHTML = '<span class="text-white font-bold text-lg">T</span>';
                              e.target.parentNode.replaceChild(placeholder, e.target);
                            }}
                          />
                        ) : (
                          <PlaceholderImage 
                            isTopicCard={true} 
                            className="w-20 h-16"
                          />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2" style={{ fontSize: '0.9rem' }}>
                            {relatedTopic.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {relatedTopic.category}
                            </span>
                            <span className="text-gray-500">
                              {relatedTopic.articles_count} post{relatedTopic.articles_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm text-left">
                    No related topics found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal for Galleries */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          images={selectedImage.allImages}
          isOpen={!!selectedImage}
          onClose={handleModalClose}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </div>
  );
};

export default TopicDetail;
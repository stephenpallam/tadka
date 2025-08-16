import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const ViewMovieContent = () => {
  const navigate = useNavigate();
  const { movieName } = useParams();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [movieContent, setMovieContent] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [movieInfo, setMovieInfo] = useState(null); // For movie banner and language info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredContent, setFilteredContent] = useState([]);

  // Decode movie name from URL
  const decodedMovieName = decodeURIComponent(movieName || '');

  useEffect(() => {
    const fetchMovieContent = async () => {
      try {
        setLoading(true);
        
        // Initialize movieInfo to null for this fetch
        let currentMovieInfo = null;
        
        // Fetch movie info from theater releases
        try {
          const theaterResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/theater-releases`);
          const ottResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/ott-releases`);
          
          if (theaterResponse.ok) {
            const theaterReleases = await theaterResponse.json();
            const matchingTheaterRelease = theaterReleases.find(release => 
              release.movie_name.toLowerCase().includes(decodedMovieName.toLowerCase()) ||
              decodedMovieName.toLowerCase().includes(release.movie_name.toLowerCase())
            );
            if (matchingTheaterRelease) {
              currentMovieInfo = {
                language: matchingTheaterRelease.language,
                banner: matchingTheaterRelease.movie_banner,
                type: 'Theater'
              };
            }
          }
          
          // If not found in theater releases, check OTT releases
          if (!currentMovieInfo && ottResponse.ok) {
            const ottReleases = await ottResponse.json();
            const matchingOttRelease = ottReleases.find(release => 
              release.movie_name.toLowerCase().includes(decodedMovieName.toLowerCase()) ||
              decodedMovieName.toLowerCase().includes(release.movie_name.toLowerCase())
            );
            if (matchingOttRelease) {
              currentMovieInfo = {
                language: matchingOttRelease.language,
                banner: matchingOttRelease.ott_platform,
                type: 'OTT'
              };
            }
          }
          
          // Set the movie info state
          setMovieInfo(currentMovieInfo);
        } catch (err) {
          console.warn('Error fetching movie release info:', err);
        }
        
        // Fetch all articles tagged with the movie name
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/movie/${encodeURIComponent(decodedMovieName)}`);
        
        if (response.ok) {
          const movieArticles = await response.json();
          setMovieContent(movieArticles);
          
          // Initialize filtered content with all articles
          setFilteredContent(movieArticles);
        } else {
          // Fallback: search by movie name in title or tags
          const fallbackResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/search?q=${encodeURIComponent(decodedMovieName)}`);
          if (fallbackResponse.ok) {
            const fallbackArticles = await fallbackResponse.json();
            setMovieContent(fallbackArticles);
            setFilteredContent(fallbackArticles);
          } else {
            throw new Error('No content found for this movie');
          }
        }
        
        // Get related articles (entertainment category as fallback)
        try {
          const relatedResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/related-articles/movie-content`);
          if (relatedResponse.ok) {
            const configuredRelated = await relatedResponse.json();
            setRelatedArticles(configuredRelated);
          } else {
            // Fallback to entertainment category
            const fallbackResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/category/entertainment?limit=20`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setRelatedArticles(fallbackData);
            }
          }
        } catch (err) {
          console.warn('Error fetching related articles:', err);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading movie content:', err);
        setError('Failed to load content for this movie. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (decodedMovieName) {
      fetchMovieContent();
    }
  }, [decodedMovieName]);

  // Update filtered content when filter changes
  useEffect(() => {
    const filtered = filterContentByType(movieContent, selectedFilter);
    setFilteredContent(filtered);
  }, [movieContent, selectedFilter]);

  // Auto scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter options for content type
  const filterOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'posts', label: 'Posts' },
    { value: 'photos', label: 'Photos' },
    { value: 'videos', label: 'Videos' }
  ];

  // Function to filter content by type
  const filterContentByType = (content, filter) => {
    if (!content || content.length === 0) {
      return [];
    }

    switch (filter) {
      case 'posts':
        // Articles without images or YouTube URLs are considered posts
        return content.filter(item => !item.image && !item.youtube_url);
      case 'photos':
        // Articles with images are considered photos
        return content.filter(item => item.image && !item.youtube_url);
      case 'videos':
        // Articles with YouTube URLs are considered videos
        return content.filter(item => item.youtube_url);
      case 'all':
      default:
        return content;
    }
  };

  // Handle filter change
  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    setIsFilterOpen(false);
  };

  // Get current filter label
  const getCurrentFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'All Content';
  };

  const handleRelatedArticleClick = (article) => {
    navigate(`/article/${article.id}`);
  };

  const handleContentClick = (article) => {
    navigate(`/article/${article.id}`);
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

  // Sample thumbnail images for related articles
  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1586339949216-35c890863684?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=60&h=45&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
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
  const sectionHeaderClasses = getSectionHeaderClasses();

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${themeClasses.textPrimary}`}>Loading Movie Content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-4`}>No Content Found</h2>
          <p className={`${themeClasses.textSecondary} mb-6`}>
            We couldn't find any content for "{decodedMovieName}". The movie might not have any posts, photos, or videos yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Back to Home
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
          
          {/* Movie Content Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Movie Content Header - Sticky with filter and bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 pt-2 pb-2">
                <div className="mb-1">
                  <h1 className="text-base font-bold text-black text-left leading-tight">
                    {decodedMovieName}
                  </h1>
                </div>
                
                {/* Content count and Filter on same line */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-900 opacity-75 flex items-center">
                    {/* Display Language | Banner name if movie info is available */}
                    {movieInfo ? (
                      <span>{movieInfo.language} | {movieInfo.banner}</span>
                    ) : (
                      // Fallback to first content item language and count
                      <>
                        {filteredContent.length > 0 && filteredContent[0].language && (
                          <span>{filteredContent[0].language} | </span>
                        )}
                        {filteredContent.length} {getCurrentFilterLabel().toLowerCase()}
                      </>
                    )}
                  </p>

                  {/* Filter Dropdown */}
                  <div className="relative">
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

                    {/* Dropdown Menu */}
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

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filteredContent.length > 0 ? (
                filteredContent.map((article) => (
                  <div 
                    key={article.id} 
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm cursor-pointer group transition-all duration-200"
                    style={{ padding: '0.5rem' }}
                    onClick={() => handleContentClick(article)}
                  >
                    <div className="flex items-start space-x-3 text-left pr-3">
                      <img
                        src={article.image || 'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=200&fit=crop'}
                        alt={article.title}
                        className="flex-shrink-0 w-32 h-24 object-cover rounded group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight hover:text-blue-600 mb-2 transition-colors duration-200 text-left">
                          {article.title}
                        </h3>
                        <div className="flex items-center mb-2">
                          {article.youtube_url && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 mr-2">
                              Video
                            </span>
                          )}
                          {article.image && !article.youtube_url && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 mr-2">
                              Photo
                            </span>
                          )}
                          {!article.image && !article.youtube_url && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 mr-2">
                              Post
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 text-left">
                          <p className="mb-1">
                            {formatDate(article.published_at || article.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <div className="text-6xl mb-4">
                    {selectedFilter === 'videos' ? '🎬' : selectedFilter === 'photos' ? '📸' : '📝'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No {getCurrentFilterLabel()} Found</h3>
                  <p className="text-gray-600 mb-4">
                    No {getCurrentFilterLabel().toLowerCase()} are available for "{decodedMovieName}".
                  </p>
                  <p className="text-sm text-gray-500">
                    Try selecting a different content type or check back later for new content.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Posts Section - 30% width (Sidebar) */}
          <div className="lg:col-span-3">
            {/* Related Posts Header - Sticky */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="py-2">
                <h2 className="text-base font-bold text-black text-left leading-tight">
                  Related Posts
                </h2>
                <p className="text-xs text-gray-600 text-left mt-1">
                  Movies you may like
                </p>
              </div>
            </div>
            
            {/* Related Posts List */}
            <div className="space-y-3">
              {relatedArticles.slice(0, 10).map((article, index) => (
                <div 
                  key={article.id} 
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm cursor-pointer group transition-all duration-200"
                  onClick={() => handleRelatedArticleClick(article)}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={article.image || getThumbnail(index)}
                      alt={article.title}
                      className="flex-shrink-0 w-16 h-12 object-cover rounded group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-medium text-left leading-tight mb-1 group-hover:text-blue-600 transition-colors duration-200`}>
                        {article.title}
                      </h4>
                      <p className={`text-xs text-gray-600 text-left`}>
                        {new Date(article.published_at || article.publishedAt || new Date()).toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMovieContent;
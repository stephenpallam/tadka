import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const GalleryPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [galleryPost, setGalleryPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchGalleryPost = async () => {
      try {
        setLoading(true);
        
        // Fetch the specific article by ID
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/${id}`);
        if (!response.ok) {
          throw new Error('Gallery post not found');
        }
        
        const article = await response.json();
        
        // Check if article has a gallery
        if (!article.gallery || !article.gallery.images || article.gallery.images.length === 0) {
          throw new Error('This article does not have an image gallery');
        }
        
        setGalleryPost(article);
        
        // Fetch related posts from the same category
        const relatedResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/sections/${article.category}?limit=6`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          // Filter out current post and only show posts with galleries
          const filteredRelated = relatedData.filter(post => 
            post.id !== article.id && post.gallery && post.gallery.images && post.gallery.images.length > 0
          ).slice(0, 4);
          setRelatedPosts(filteredRelated);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading gallery post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGalleryPost();
    }
  }, [id]);

  // Auto scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageNavigation = (direction) => {
    if (!galleryPost?.gallery?.images) return;
    
    const totalImages = galleryPost.gallery.images.length;
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleRelatedPostClick = (post) => {
    navigate(`/gallery-post/${post.id}`);
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

  // Force light theme for content areas
  const lightThemeClasses = {
    pageBackground: 'bg-gray-50',
    cardBackground: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200'
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${lightThemeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${lightThemeClasses.textPrimary}`}>Loading Gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${lightThemeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📸</div>
          <h2 className={`text-2xl font-bold ${lightThemeClasses.textPrimary} mb-2`}>Gallery Not Found</h2>
          <p className={`${lightThemeClasses.textSecondary} mb-6`}>{error}</p>
          <button
            onClick={() => navigate('/gallery-posts')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Browse All Galleries
          </button>
        </div>
      </div>
    );
  }

  if (!galleryPost) return null;

  const currentImage = galleryPost.gallery.images[currentImageIndex];
  const totalImages = galleryPost.gallery.images.length;

  return (
    <div className={`min-h-screen ${lightThemeClasses.pageBackground}`}>
      {/* Main Container - Match LatestNews layout */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">

        {/* Two Section Layout with Gap - 70%/30% split (matching LatestNews) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Main Gallery Section - 70% width */}
          <div className="lg:col-span-7">
            
            {/* Gallery Header - Sticky with bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h1 className="text-lg font-bold text-black text-left leading-tight">
                    {galleryPost.title}
                  </h1>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span>{formatDate(galleryPost.published_at)}</span>
                </div>
              </div>
            </div>

            {/* Image Slider */}
            <div className={`${lightThemeClasses.cardBackground} rounded-lg overflow-hidden ${lightThemeClasses.border} mb-6`}>
              {/* Main Image */}
              <div className="relative">
                <img
                  src={currentImage.url}
                  alt={currentImage.alt || galleryPost.title}
                  className="w-full h-96 md:h-[500px] object-cover cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                />
                
                {/* Navigation Arrows */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {totalImages}
                </div>
              </div>

              {/* Image Caption - Removed */}

              {/* Thumbnail Navigation - Removed for article content space */}
            </div>

            {/* Article Content Section */}
            <div className={`${lightThemeClasses.cardBackground} rounded-lg p-6 ${lightThemeClasses.border}`}>
              <div className={`${lightThemeClasses.textSecondary} leading-relaxed`}>
                {galleryPost.content || galleryPost.summary || "Gallery showcasing beautiful moments and captivating visuals."}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Related Posts - 30% width */}
          <div className="lg:col-span-3">
            {/* Related Posts Section - Sticky header with bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h2 className="text-base font-bold text-black text-left leading-tight">
                    Related Posts
                  </h2>
                </div>
                <p className="text-xs text-gray-900 opacity-75 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Galleries you may like
                </p>
              </div>
            </div>

            {/* Related Posts List */}
            <div className={`${lightThemeClasses.cardBackground} rounded-lg ${lightThemeClasses.border} overflow-hidden`}>
              <div className="divide-y divide-gray-200">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => handleRelatedPostClick(post)}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-3 ${
                        index < relatedPosts.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex space-x-3">
                        <img
                          src={post.gallery?.first_image?.url || post.image_url}
                          alt={post.title}
                          className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-20 h-16 bg-gray-500 flex items-center justify-center rounded flex-shrink-0';
                            placeholder.innerHTML = '<span class="text-white font-bold text-lg">G</span>';
                            e.target.parentNode.replaceChild(placeholder, e.target);
                          }}
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2`} style={{ fontSize: '0.9rem' }}>
                            {post.title}
                          </h4>
                          <p className={`text-xs text-gray-600 text-left`}>
                            {post.gallery?.images?.length || 0} photos
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4">
                    <p className={`text-gray-600 text-sm text-left`}>
                      No related galleries found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full flex items-center justify-center">
            
            {/* Image Container with Touch Support */}
            <div className="relative overflow-hidden max-w-full max-h-full">
              
              {/* Close Button - Top Right within image */}
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-2 right-2 z-70 bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200 rounded-lg p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Main Image */}
              <img
                src={currentImage.url}
                alt={currentImage.alt || galleryPost.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>

            {/* Previous Button - Bottom Left */}
            {totalImages > 1 && (
              <button
                onClick={() => handleImageNavigation('prev')}
                className="absolute bottom-8 left-8 z-70 text-white opacity-70 hover:opacity-100 hover:text-gray-300 transition-all duration-200 transform hover:scale-110"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Image Caption - Bottom Center */}
            {currentImage.caption && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-70 text-white text-center">
                <p className="text-lg font-semibold bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {currentImage.caption}
                </p>
              </div>
            )}

            {/* Next Button - Bottom Right */}
            {totalImages > 1 && (
              <button
                onClick={() => handleImageNavigation('next')}
                className="absolute bottom-8 right-8 z-70 text-white opacity-70 hover:opacity-100 hover:text-gray-300 transition-all duration-200 transform hover:scale-110"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPost;
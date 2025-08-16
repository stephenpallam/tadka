import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ImageModal from '../components/ImageModal';

const GalleryArticle = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { getSectionHeaderClasses } = useTheme();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${id}`);
      
      if (!response.ok) {
        throw new Error('Article not found');
      }
      
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handlePrevImage = () => {
    if (article?.gallery?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? article.gallery.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (article?.gallery?.images) {
      setCurrentImageIndex((prev) => 
        prev === article.gallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!article || !article.gallery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Gallery Found</h2>
          <p className="text-gray-600 mb-6">This article doesn't have a gallery associated with it.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { gallery } = article;
  const currentImage = gallery.images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            to="/travel-pics" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            ← Back to Travel Pics
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{article.title}</h1>
          <p className="text-gray-600 mt-2">{gallery.gallery_title}</p>
        </div>
      </div>

      {/* Main Gallery Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Current Image */}
              <div className="relative">
                <img
                  src={currentImage.url}
                  alt={currentImage.alt || `Gallery image ${currentImageIndex + 1}`}
                  className="w-full h-96 lg:h-[500px] object-cover cursor-pointer"
                  onClick={() => handleImageClick(currentImageIndex)}
                />
                
                {/* Navigation arrows */}
                {gallery.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} of {gallery.images.length}
                </div>
              </div>
              
              {/* Image caption */}
              {currentImage.caption && (
                <div className="p-4">
                  <p className="text-gray-700">{currentImage.caption}</p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gallery ({gallery.images.length} images)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {gallery.images.map((image, index) => (
                  <div
                    key={image.id || index}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Article Info */}
            <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-medium">Author:</span> {article.author}</div>
                <div><span className="font-medium">Category:</span> {article.category}</div>
                <div>
                  <span className="font-medium">Published:</span> {' '}
                  {new Date(article.published_at).toLocaleDateString()}
                </div>
              </div>
              
              {article.summary && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">{article.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal for Full Screen View */}
      {showImageModal && (
        <ImageModal
          images={gallery.images}
          currentIndex={currentImageIndex}
          onClose={() => setShowImageModal(false)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}
    </div>
  );
};

export default GalleryArticle;
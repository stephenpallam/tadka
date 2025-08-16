import React, { useEffect, useState } from 'react';

const ArticleModal = ({ article, onClose, onNext, onPrev, onArticleChange }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (onPrev) onPrev(article.id);
          break;
        case 'ArrowRight':
          if (onNext) onNext(article.id);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [article.id, onClose, onNext, onPrev]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNextClick = () => {
    setIsLoading(true);
    if (onNext) onNext(article.id);
  };

  const handlePrevClick = () => {
    setIsLoading(true);
    if (onPrev) onPrev(article.id);
  };

  // Format publication date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently published';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Article Container */}
      <div className="relative max-w-4xl max-h-full flex items-center justify-center w-full">
        
        {/* Previous Button */}
        {onPrev && (
          <button
            onClick={handlePrevClick}
            className="absolute left-4 z-60 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all duration-200 transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Main Article Content */}
        <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-w-full max-h-[90vh] overflow-y-auto">
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Article Header Image */}
          <div className="relative">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 object-cover"
              onLoad={() => setIsLoading(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
              <div className="flex items-center space-x-2 text-white text-sm mb-2">
                <span className="bg-blue-600 px-2 py-1 rounded text-xs font-medium uppercase">
                  {article.category || 'Article'}
                </span>
                <span>•</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Author and Meta Info */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {(article.author || 'Author').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{article.author || 'Staff Writer'}</p>
                  <p className="text-sm text-gray-600">Senior Correspondent</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-4">
                <span>👁️ {article.viewCount || 0} views</span>
                <span>⏱️ 3 min read</span>
              </div>
            </div>

            {/* Article Summary */}
            <div className="mb-6">
              <p className="text-lg text-gray-700 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                {article.summary}
              </p>
            </div>

            {/* Main Article Content */}
            <div className="prose prose-lg max-w-none">
              {/* Generate article content based on title and summary */}
              <p className="text-gray-800 leading-relaxed mb-4">
                {article.content || `In a significant development, ${article.title.toLowerCase()} has captured widespread attention across various sectors. This comprehensive analysis delves into the intricate details and far-reaching implications of these recent events.`}
              </p>
              
              <p className="text-gray-800 leading-relaxed mb-4">
                {`The story unfolds with remarkable complexity, as sources close to the matter reveal that ${article.summary}. Industry experts are closely monitoring the situation, anticipating potential impacts on related sectors and stakeholders.`}
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Key Highlights</h2>
              <ul className="list-disc list-inside text-gray-800 mb-4 space-y-2">
                <li>Comprehensive analysis of the current situation and its implications</li>
                <li>Expert opinions and industry perspectives on the developments</li>
                <li>Potential impacts on various stakeholders and market segments</li>
                <li>Future outlook and anticipated developments in this area</li>
              </ul>

              <p className="text-gray-800 leading-relaxed mb-4">
                As developments continue to unfold, stakeholders across the industry are adapting their strategies to align with these changes. The situation remains dynamic, with experts predicting further developments in the coming weeks.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Industry Impact</h2>
              <p className="text-gray-800 leading-relaxed mb-4">
                The broader implications of these developments extend beyond immediate participants, potentially influencing market dynamics, consumer behavior, and regulatory considerations. Analysts suggest that this could mark a significant turning point in the industry.
              </p>

              <p className="text-gray-800 leading-relaxed">
                Stay tuned for continued coverage as this story develops, with expert analysis and real-time updates on all significant developments in this evolving situation.
              </p>
            </div>

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 font-medium">Tags:</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">News</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Analysis</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{article.category || 'General'}</span>
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Share this article:</span>
                <div className="flex space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                    Share
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        {onNext && (
          <button
            onClick={handleNextClick}
            className="absolute right-4 z-60 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all duration-200 transform hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleModal;
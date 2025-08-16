import React from 'react';

const FeaturedMovieReview = ({ review, onArticleClick }) => {
  if (!review) return null;

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(review, 'featured_movie_review');
    }
  };

  // Use a high-quality movie sample image if the review image is not available
  const sampleImage = "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=320&h=180&fit=crop";
  const imageUrl = review.image && !review.image.includes('placeholder') ? review.image : sampleImage;

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">☆</span>
      );
    }
    
    return stars;
  };

  return (
    <div 
      className="bg-white border border-gray-300 overflow-hidden hover:shadow-sm transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative group">
        <img
          src={imageUrl}
          alt={review.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ width: '320px', height: '180px' }}
        />
        <div className="absolute top-2 right-2">
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
            {review.rating || '4.5'}/5
          </div>
        </div>
        {/* Star Rating Overlay at Bottom */}
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center bg-black bg-opacity-75 px-2 py-1 rounded">
            {renderStars(review.rating || 4.5)}
          </div>
        </div>
        {/* Hover overlay for click indication */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div className="p-3 text-left">
        <h2 className="text-sm font-semibold text-gray-900 leading-tight hover:text-gray-700 transition-colors duration-300">
          {review.title}
        </h2>
      </div>
    </div>
  );
};

export default FeaturedMovieReview;
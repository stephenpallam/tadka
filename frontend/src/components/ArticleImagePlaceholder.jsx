import React from 'react';

const ArticleImagePlaceholder = ({ 
  contentType = 'Article', 
  className = '',
  width = 'w-full',
  height = 'h-48'
}) => {
  // Get first letter of content type
  const getFirstLetter = (type) => {
    if (!type) return 'A';
    
    // Handle specific content types
    switch (type.toLowerCase()) {
      case 'movie-reviews':
      case 'movie-reviews-bollywood':
        return 'R';
      case 'movies':
      case 'bollywood-movies':
        return 'M';
      case 'ott-reviews':
        return 'O';
      case 'trailers':
      case 'trailers-teasers':
        return 'T';
      case 'box-office':
        return 'B';
      case 'sports':
        return 'S';
      case 'politics':
        return 'P';
      case 'viral-videos':
        return 'V';
      case 'trending-videos':
        return 'T';
      case 'tadka-pics':
        return 'T';
      case 'new-video-songs':
        return 'N';
      case 'tv-shows':
        return 'T';
      case 'events-interviews':
        return 'E';
      case 'health-food':
        return 'H';
      case 'fashion-travel':
        return 'F';
      case 'hot-topics':
        return 'H';
      case 'ai-stock-market':
        return 'A';
      case 'nri-news':
        return 'N';
      case 'world-news':
        return 'W';
      case 'photoshoots':
        return 'P';
      case 'travel-pics':
        return 'T';
      default:
        return type.charAt(0).toUpperCase();
    }
  };

  const letter = getFirstLetter(contentType);

  return (
    <div 
      className={`${width} ${height} bg-gray-300 flex items-center justify-center rounded-lg ${className}`}
    >
      <span className="text-white text-4xl font-bold select-none">
        {letter}
      </span>
    </div>
  );
};

export default ArticleImagePlaceholder;
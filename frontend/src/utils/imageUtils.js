// Utility function to get placeholder based on content type
export const getContentTypeLetter = (contentType, isTopicCard = false) => {
  if (isTopicCard) return 'T';
  
  switch (contentType?.toLowerCase()) {
    case 'video':
      return 'V';
    case 'photo':
      return 'P';
    case 'movie_review':
      return 'M';
    case 'post':
    case 'article':
    default:
      return 'A';
  }
};

// Reusable ImageWithFallback component
export const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  contentType, 
  isTopicCard = false,
  style,
  onError,
  ...props 
}) => {
  const handleImageError = (e) => {
    // Replace with placeholder div
    const letter = getContentTypeLetter(contentType, isTopicCard);
    const placeholder = document.createElement('div');
    placeholder.className = className + ' bg-gray-500 flex items-center justify-center';
    placeholder.innerHTML = `<span class="text-white font-bold text-lg">${letter}</span>`;
    
    if (style) {
      Object.assign(placeholder.style, style);
    }
    
    e.target.parentNode.replaceChild(placeholder, e.target);
    
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={src || '/api/placeholder/300/200'}
      alt={alt}
      className={className}
      style={style}
      onError={handleImageError}
      {...props}
    />
  );
};

// Fallback placeholder component for when no image is provided
export const PlaceholderImage = ({ 
  contentType, 
  isTopicCard = false, 
  className = "w-20 h-16",
  title = ""
}) => {
  const letter = getContentTypeLetter(contentType, isTopicCard);
  
  return (
    <div className={`${className} rounded bg-gray-500 flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold text-lg">
        {letter}
      </span>
    </div>
  );
};
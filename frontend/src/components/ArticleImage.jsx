import React, { useState } from 'react';
import ArticleImagePlaceholder from './ArticleImagePlaceholder';

const ArticleImage = ({ 
  src, 
  alt = '', 
  contentType = 'Article',
  className = '',
  width = 'w-full',
  height = 'h-48',
  placeholderClassName = '',
  imgClassName = 'object-cover rounded-lg'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Show placeholder if no src, image failed to load, or still loading
  if (!src || imageError) {
    return (
      <ArticleImagePlaceholder 
        contentType={contentType}
        className={placeholderClassName}
        width={width}
        height={height}
      />
    );
  }

  return (
    <div className={`${width} ${height} ${className}`}>
      {imageLoading && (
        <ArticleImagePlaceholder 
          contentType={contentType}
          className={placeholderClassName}
          width={width}
          height={height}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`${width} ${height} ${imgClassName} ${imageLoading ? 'hidden' : 'block'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
};

export default ArticleImage;
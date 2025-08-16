import React from 'react';

const BigStory = ({ story, onArticleClick }) => {
  if (!story) return null;

  const handleClick = () => {
    if (onArticleClick) {
      onArticleClick(story, 'big_story');
    }
  };

  // Use a high-quality sample image if the story image is not available or generic
  const sampleImage = "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=320&h=180&fit=crop";
  const imageUrl = story.image && !story.image.includes('placeholder') ? story.image : sampleImage;

  return (
    <div 
      className="bg-white border border-gray-300 overflow-hidden hover:shadow-sm transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative group">
        <img
          src={imageUrl}
          alt={story.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ width: '320px', height: '180px' }}
        />
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
          {story.title}
        </h2>
      </div>
    </div>
  );
};

export default BigStory;
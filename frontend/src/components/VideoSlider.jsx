import React, { useState } from 'react';

const VideoSlider = () => {
  // Sample images data for interviews
  const images = [
    {
      id: 'interview1',
      title: 'Latest Movie Star Exclusive Interview',
      image: 'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=180&fit=crop'
    },
    {
      id: 'interview2',
      title: 'Celebrity Behind the Scenes Feature',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=180&fit=crop'
    },
    {
      id: 'interview3',
      title: 'Political Analysis Weekly Feature',
      image: 'https://images.unsplash.com/photo-1586339949216-35c890863684?w=300&h=180&fit=crop'
    },
    {
      id: 'interview4',
      title: 'Entertainment News Update Story',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=180&fit=crop'
    },
    {
      id: 'interview5',
      title: 'Movie Review Critics Choice Feature',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=180&fit=crop'
    },
    {
      id: 'interview6',
      title: 'Breaking Industry News Feature',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=180&fit=crop'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesPerSlide = 2;
  const maxIndex = images.length - imagesPerSlide; // Maximum index to avoid empty slots

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const getCurrentImages = () => {
    return images.slice(currentIndex, currentIndex + imagesPerSlide);
  };

  return (
    <div className="bg-white">
      {/* Header matching Movie Schedules style */}
      <div className="bg-gray-100 px-3 py-2 border border-gray-300 text-left">
        <h3 className="text-sm font-semibold text-gray-900">Top interviews of the week</h3>
      </div>
      
      {/* Content area with same height as Movie Schedules */}
      <div className="h-[229px] overflow-hidden mt-[15px]">
        <div className="h-full pt-[5px] px-0 pb-4">
          <div className="relative h-full overflow-hidden">
            {/* Image Cards Container */}
            <div className="flex h-full gap-[11px]">
              {getCurrentImages().map((image) => (
                <div
                  key={image.id}
                  className="group cursor-pointer h-full flex-1"
                >
                  <div className="relative w-full h-full overflow-hidden rounded-lg hover:shadow-sm transition-all duration-300">
                    {/* Full-size image */}
                    <img
                      src={image.image}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                    />
                    
                    {/* Enhanced dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent rounded-lg"></div>
                    
                    {/* Text overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform transition-transform duration-200 group-hover:translate-y-0">
                      <h4 className="font-medium text-white text-sm leading-tight line-clamp-2">
                        {image.title}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            {maxIndex > 0 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 z-10"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button 
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm transition-all duration-200 z-10"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default VideoSlider;
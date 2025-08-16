import React from 'react';

const EntertainmentNews = ({ articles }) => {
  // Sample thumbnail images for entertainment articles
  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1586339949216-35c890863684?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=60&h=45&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className="bg-white border border-gray-300">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 text-left">
        <h3 className="text-sm font-semibold text-gray-900">Entertainment News</h3>
      </div>
      
      <div className="h-[540px] overflow-y-auto">
        <div className="p-3">
          <ul className="space-y-2">
            {articles.map((article, index) => (
              <li
                key={article.id}
                className="group cursor-pointer py-2 px-2 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3 text-left">
                  <img
                    src={getThumbnail(index)}
                    alt=""
                    className="flex-shrink-0 w-16 h-12 object-cover border border-gray-300 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
                      {article.title}
                    </h4>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EntertainmentNews;
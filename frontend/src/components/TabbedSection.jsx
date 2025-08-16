import React from 'react';

const TabbedSection = ({ topNews }) => {
  const truncateTitle = (title, maxLength = 50) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="bg-white border border-gray-300">
      {/* Header - No tabs, just Top News title */}
      <div className="border-b border-gray-300">
        <div className="px-3 py-2 bg-black text-white">
          <h3 className="text-xs font-medium">Top News</h3>
        </div>
      </div>

      {/* Content - Increased height to match opinion section */}
      <div className="h-96 overflow-y-auto">
        <div className="p-3">
          <ul className="space-y-1">
            {topNews.map((article, index) => (
              <li
                key={article.id}
                className="group cursor-pointer py-1 px-2 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-2 text-left">
                  <span className="flex-shrink-0 w-5 h-5 bg-black text-white rounded-sm text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
                      {truncateTitle(article.title)}
                    </h4>
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

export default TabbedSection;
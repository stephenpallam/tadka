import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SponsoredAds = ({ 
  movieNews = [], 
  movieGossip = [], 
  andhraNews = [], 
  telanganaNews = [], 
  gossip = [], 
  reviews = [], 
  movieSchedules = [], 
  features = [], 
  mostPopular = [], 
  largeFeatureImage = {}
}) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionBodyClasses } = useTheme();
  const leftSections = [
    { title: 'Movies', data: movieNews },
    { title: 'Movie Gossip', data: movieGossip },
    { title: 'Andhra News', data: andhraNews },
    { title: 'Telangana News', data: telanganaNews },
    { title: 'Gossip', data: gossip },
    { title: 'Reviews', data: reviews }
  ];

  const rightSections = [
    { title: 'Movie Schedules', data: movieSchedules },
    { title: 'Features', data: features }
  ];

  // Sponsored ads data
  const sponsoredAds = [
    {
      id: 1,
      title: "Revolutionary Tech Solutions for Modern Businesses",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=200&fit=crop",
      description: "Discover cutting-edge technology solutions that can transform your business operations and boost productivity."
    },
    {
      id: 2,
      title: "Premium Healthcare Services Now Available",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop",
      description: "Experience world-class healthcare with state-of-the-art facilities and expert medical professionals."
    },
    {
      id: 3,
      title: "Exclusive Educational Programs for Career Growth",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
      description: "Advance your career with our comprehensive educational programs designed for professional development."
    },
    {
      id: 4,
      title: "Luxury Real Estate Investment Opportunities",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=200&fit=crop",
      description: "Explore premium real estate investments with guaranteed returns and exceptional growth potential."
    }
  ];

  const ArticleList = ({ articles }) => (
    <ul className="space-y-1 text-left">
      {articles.map((article) => (
        <li key={article.id} className={`group cursor-pointer ${getSectionBodyClasses().hoverClass} transition-colors duration-200 py-1`}>
          <h4 className="text-xs text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
            {article.title}
          </h4>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="py-6 mt-[6px]">
      <div className="max-w-5xl-plus mx-auto px-8">
        
        {/* Sponsored Ads Header - Matching width of other sections */}
        <div className={`${getSectionHeaderClasses().containerClass} px-3 py-2 border rounded-lg text-left mb-[14px] -mt-6`}>
          <h3 className={`text-sm font-semibold ${getSectionHeaderClasses().textClass}`}>{t('sections.sponsored_ads', 'Sponsored Ads')}</h3>
        </div>
        
        {/* Sponsored Ads Grid - Matching page width */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {sponsoredAds.map((ad) => (
            <div key={ad.id} className={`${getSectionBodyClasses().backgroundClass} border border-gray-300 rounded-lg overflow-hidden hover:shadow-sm ${getSectionBodyClasses().hoverClass} transition-all duration-300 cursor-pointer group`}>
              <div className="relative">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-32 lg:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-left">
                <h2 className="text-sm font-semibold text-gray-900 leading-tight hover:text-gray-700 transition-colors duration-200 mb-1">
                  {ad.title}
                </h2>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Economic Growth section removed */}
        </div>
      </div>
    </div>
  );
};

export default SponsoredAds;
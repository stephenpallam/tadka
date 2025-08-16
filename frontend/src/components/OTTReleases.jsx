import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const OTTReleases = ({ articles, onArticleClick }) => {
  const { t } = useLanguage();
  const { getSectionHeaderClasses, getSectionContainerClasses, getSectionBodyClasses, theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ott');
  const [releaseData, setReleaseData] = useState({ ott: {}, bollywood: {} });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchReleaseData();
  }, []);

  const fetchReleaseData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/releases/ott-bollywood`);
      if (response.ok) {
        const data = await response.json();
        setReleaseData(data);
      }
    } catch (error) {
      console.error('Error fetching OTT release data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      // Navigate to the movie content page instead of article page
      navigate(`/movie/${encodeURIComponent(article.title || article.movie_name)}`);
    }
  };

  // Get current tab releases (combines this week and coming soon)
  const getCurrentTabReleases = () => {
    if (loading) return [];
    
    const currentTabData = releaseData[activeTab];
    if (!currentTabData) return [];
    
    const thisWeek = currentTabData.this_week || [];
    const comingSoon = currentTabData.coming_soon || [];
    
    // Combine and limit to 4 items
    return [...thisWeek, ...comingSoon].slice(0, 4);
  };

  const currentReleases = getCurrentTabReleases();

  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className={`${getSectionContainerClasses()} relative`} style={{ height: '352px' }}>
      {/* Header with Tabs */}
      <div className={`${getSectionHeaderClasses().containerClass} border-b flex`}>
        <button
          onClick={() => setActiveTab('ott')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tl-lg ${
            activeTab === 'ott'
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}`
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.ott_releases', 'OTT Releases')}
        </button>
        <button
          onClick={() => setActiveTab('bollywood')}
          className={`flex-1 px-3 py-2 transition-colors duration-200 text-left rounded-tr-lg ${
            activeTab === 'bollywood' 
              ? `${getSectionHeaderClasses().containerClass} ${getSectionHeaderClasses().selectedTabTextClass} ${getSectionHeaderClasses().selectedTabBorderClass}` 
              : getSectionHeaderClasses().unselectedTabClass
          }`}
          style={{fontSize: '14px', fontWeight: '500'}}
        >
          {t('sections.bollywood_ott', 'Bollywood')}
        </button>
      </div>
      
      <div 
        className={`overflow-y-hidden relative ${getSectionBodyClasses().backgroundClass}`}
        style={{ 
          height: 'calc(352px - 45px)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Loading OTT releases...</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-1">
              {currentReleases.length > 0 ? (
                currentReleases.map((release, index) => (
                  <li
                    key={release.id}
                    className={`group cursor-pointer py-1 px-1 ${getSectionBodyClasses().hoverClass} transition-colors duration-200 border-b ${getSectionBodyClasses().dividerClass} last:border-b-0`}
                    onClick={() => handleArticleClick(release)}
                  >
                    <div className="flex items-start justify-between text-left">
                      <div className="flex items-start space-x-2 flex-1">
                        <div className="relative flex-shrink-0 w-20 h-16 rounded overflow-hidden border border-gray-300">
                          {release.movie_image ? (
                            <>
                              <img
                                src={release.movie_image}
                                alt={release.movie_name || release.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: 'none'}}>
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16l13-8z" />
                                </svg>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16l13-8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200" style={{fontSize: '14px', fontWeight: '600'}}>
                            {release.movie_name || release.title}
                          </h4>
                          {release.ott_platform && (
                            <p className="text-xs text-gray-500 mt-1">{release.ott_platform}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">{release.language || 'Hindi'}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <div className="text-xs text-gray-500">
                          {formatReleaseDate(release.release_date || release.published_at)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="text-sm text-gray-500">No OTT releases available</div>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
      
      {/* More Button Overlay - Square with Rounded Corners - Bottom Right */}
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <Link 
            to="/ott-releases" 
            className="group inline-flex items-center justify-center w-8 h-8 bg-white bg-opacity-95 hover:bg-opacity-100 rounded border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-xl"
          >
            <svg 
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 text-gray-600 group-hover:text-gray-800"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OTTReleases;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const TrailersTeasers = () => {
  const navigate = useNavigate();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('trailers'); // 'trailers' or 'bollywood'
  const [trailersArticles, setTrailersArticles] = useState([]);
  const [bollywoodArticles, setBollywoodArticles] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false to show sample data immediately
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('thisWeek');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState([]);

  // Sample articles data as fallback - moved up to be available immediately
  const sampleTrailersArticles = [
    {
      id: 901,
      title: "Epic Superhero Film Trailer Breaks YouTube View Records",
      summary: "The latest superhero blockbuster trailer has shattered viewing records within 24 hours.",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Entertainment Reporter",
      slug: "epic-superhero-trailer-breaks-records"
    },
    {
      id: 902,
      title: "Romantic Comedy Teaser Promises Heartwarming Entertainment",
      summary: "New romantic comedy teaser showcases stellar cast and promising storyline.",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Film Critic",
      slug: "romantic-comedy-teaser-heartwarming"
    },
    {
      id: 903,
      title: "Action Thriller Preview Shows Stunning Visual Effects",
      summary: "High-octane action thriller teaser reveals groundbreaking visual effects.",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Movie Analyst",
      slug: "action-thriller-stunning-effects"
    },
    {
      id: 904,
      title: "Horror Film Trailer Terrifies Audiences Worldwide",
      summary: "Latest horror movie trailer creates buzz with spine-chilling scenes.",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Horror Specialist",
      slug: "horror-film-trailer-terrifies"
    },
    {
      id: 905,
      title: "Animated Film Teaser Delights Family Audiences",
      summary: "New animated adventure teaser promises fun for the whole family.",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Family Entertainment Writer",
      slug: "animated-film-teaser-family-fun"
    }
  ];

  const sampleBollywoodArticles = [
    {
      id: 906,
      title: "Pathaan Trailer Sets Internet on Fire with Action Sequences",
      summary: "Shah Rukh Khan's comeback film trailer breaks all social media records.",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Bollywood Reporter",
      slug: "pathaan-trailer-internet-fire"
    },
    {
      id: 907,
      title: "Jawan Teaser Creates Mass Hysteria Among Fans",
      summary: "SRK's mass entertainer teaser sends fans into a frenzy.",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Cinema Journalist",
      slug: "jawan-teaser-mass-hysteria"
    },
    {
      id: 908,
      title: "Tiger 3 Action Trailer Breaks Previous Records",
      summary: "Salman Khan's spy thriller trailer promises high-octane entertainment.",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Action Movie Critic",
      slug: "tiger-3-trailer-breaks-records"
    },
    {
      id: 909,
      title: "Brahmastra VFX Trailer Showcases Indian Cinema's Future",
      summary: "Ranbir Kapoor's fantasy epic trailer demonstrates cutting-edge visual effects.",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      author: "VFX Specialist",
      slug: "brahmastra-vfx-trailer-future"
    },
    {
      id: 910,
      title: "RRR International Trailer Captivates Global Audiences",
      summary: "SS Rajamouli's period drama trailer gains worldwide appreciation.",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      author: "International Cinema Writer",
      slug: "rrr-international-trailer-global"
    }
  ];

  // Initialize with sample data immediately
  useEffect(() => {
    console.log('Initializing with sample data...');
    setTrailersArticles(sampleTrailersArticles);
    setBollywoodArticles(sampleBollywoodArticles);
    setRelatedArticles(sampleTrailersArticles.slice(0, 5));
  }, []);

  useEffect(() => {
    const fetchTrailersData = async () => {
      try {
        setLoading(true);
        console.log('Fetching trailers data...');
        
        // Fetch articles from the backend API using trailers categories
        const trailersResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/category/trailers-teasers?limit=50`);
        console.log('Trailers response status:', trailersResponse.status);
        
        if (trailersResponse.ok) {
          const trailersData = await trailersResponse.json();
          console.log('Trailers data received:', trailersData.length);
          setTrailersArticles(trailersData);
        } else {
          console.log('Trailers response not ok, using sample data');
          setTrailersArticles(sampleTrailersArticles);
        }

        const bollywoodResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/category/bollywood-trailers-teasers?limit=50`);
        console.log('Bollywood response status:', bollywoodResponse.status);
        
        if (bollywoodResponse.ok) {
          const bollywoodData = await bollywoodResponse.json();
          console.log('Bollywood data received:', bollywoodData.length);
          setBollywoodArticles(bollywoodData);
        } else {
          console.log('Bollywood response not ok, using sample data');
          setBollywoodArticles(sampleBollywoodArticles);
        }
        
        // Get related articles from configured categories for trailers page
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/related-articles/trailers-teasers`);
          if (response.ok) {
            const configuredRelated = await response.json();
            setRelatedArticles(configuredRelated);
          } else {
            // Fallback to movies reviews if trailers related articles not configured
            const fallbackResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/related-articles/movies`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setRelatedArticles(fallbackData);
            } else {
              console.log('Using sample related articles');
              setRelatedArticles(sampleTrailersArticles.slice(0, 5));
            }
          }
        } catch (relatedError) {
          console.error('Error fetching related articles:', relatedError);
          setRelatedArticles(sampleTrailersArticles.slice(0, 5));
        }

        setError(null);
        console.log('Data fetching completed successfully');
      } catch (error) {
        console.error('Error fetching trailers data:', error);
        setError('Failed to load trailers data. Please try again later.');
        // Set sample data even on error
        setTrailersArticles(sampleTrailersArticles);
        setBollywoodArticles(sampleBollywoodArticles);
        setRelatedArticles(sampleTrailersArticles.slice(0, 5));
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    fetchTrailersData();
  }, []);

  // Filter articles based on date
  const filterArticlesByDate = (articles, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return articles.filter((article) => {
      if (!article.publishedAt) return false;
      
      const articleDate = new Date(article.publishedAt);
      const timeDiff = now - articleDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      switch (filter) {
        case 'thisWeek':
          const currentWeekStart = new Date(today);
          const dayOfWeek = today.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          currentWeekStart.setDate(today.getDate() - daysToMonday);
          return articleDate >= currentWeekStart && articleDate <= now;
        case 'today':
          return daysDiff === 0;
        case 'yesterday':
          return daysDiff === 1;
        case 'week':
          return daysDiff >= 0 && daysDiff <= 7;
        case 'month':
          return daysDiff >= 0 && daysDiff <= 30;
        case 'quarter':
          return daysDiff >= 0 && daysDiff <= 90;
        case 'halfYear':
          return daysDiff >= 0 && daysDiff <= 180;
        case 'year':
          return daysDiff >= 0 && daysDiff <= 365;
        default:
          return false;
      }
    });
  };

  // Get current articles based on active tab
  const getCurrentTabArticles = () => {
    if (activeTab === 'trailers') {
      return trailersArticles.length > 0 ? trailersArticles : sampleTrailersArticles;
    } else {
      return bollywoodArticles.length > 0 ? bollywoodArticles : sampleBollywoodArticles;
    }
  };

  // Filter articles based on selected time filter
  useEffect(() => {
    const currentArticles = getCurrentTabArticles();
    const filtered = filterArticlesByDate(currentArticles, selectedFilter);
    setFilteredArticles(filtered);
  }, [activeTab, trailersArticles, bollywoodArticles, selectedFilter]);

  const filterOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'halfYear', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' }
  ];

  const getCurrentFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'This Week';
  };

  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    setIsFilterOpen(false);
  };

  const handleArticleClick = (article) => {
    const category = activeTab === 'trailers' ? 'trailers-teasers' : 'bollywood-trailers';
    navigate(`/article/${article.slug}`, { 
      state: { 
        article, 
        category,
        from: 'trailers-teasers-page' 
      } 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Force light theme for content areas regardless of user's theme selection
  const lightThemeClasses = {
    pageBackground: 'bg-gray-50',
    cardBackground: 'bg-white',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200'
  };

  const themeClasses = lightThemeClasses;

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className={`mt-4 text-lg ${themeClasses.textPrimary}`}>Loading Trailers & Teasers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg ${themeClasses.textPrimary} mb-4`}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.pageBackground}`}>
      {/* Main Container */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 70%/30% split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Trailers Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Section Header - Sticky with tabs and filter */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-3.5">
                <div className="mb-2">
                  {/* Tabs only */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab('trailers')}
                      className={`text-base font-bold transition-colors duration-200 ${
                        activeTab === 'trailers'
                          ? 'text-black'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Trailers & Teasers
                    </button>
                    <button
                      onClick={() => setActiveTab('bollywood')}
                      className={`text-base font-bold transition-colors duration-200 ${
                        activeTab === 'bollywood'
                          ? 'text-black'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Bollywood
                    </button>
                  </div>
                </div>
                
                {/* Article count and Filter on same line */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-900 opacity-75 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    {filteredArticles.length} {activeTab === 'trailers' ? 'trailers' : 'bollywood trailers'} from {getCurrentFilterLabel().toLowerCase()}
                  </p>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                      </svg>
                      <span>{getCurrentFilterLabel()}</span>
                      <svg className={`w-3 h-3 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {filterOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleFilterChange(option.value)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                selectedFilter === option.value 
                                  ? 'bg-blue-50 text-blue-700 font-medium' 
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="space-y-4">
              {filteredArticles.map((article, index) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className={`group cursor-pointer ${themeClasses.cardBackground} rounded-lg border ${themeClasses.border} overflow-hidden hover:shadow-lg transition-all duration-300`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${themeClasses.textPrimary} group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2`}>
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className={`text-sm ${themeClasses.textSecondary} line-clamp-2 mb-2 text-left`}>
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{article.author || 'Entertainment Desk'}</span>
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${themeClasses.textPrimary} mb-2`}>No {activeTab === 'trailers' ? 'trailers' : 'bollywood trailers'} found</p>
                <p className={`${themeClasses.textSecondary}`}>Try selecting a different time period</p>
              </div>
            )}
          </div>
          
          {/* Related Posts Section - 30% width */}
          <div className="lg:col-span-3">
            {/* Related Posts Header - Sticky with header and subtitle */}
            <div className={`sticky top-16 z-30 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h2 className="text-base font-bold text-black text-left leading-tight">
                    Related Posts
                  </h2>
                </div>
                <p className="text-xs text-gray-900 opacity-75 text-left">
                  Content you may like
                </p>
              </div>
            </div>

            {/* Related Posts List */}
            <div className="space-y-0">
              <div className="space-y-0">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((article, index) => (
                    <div
                      key={article.id || index}
                      onClick={() => handleArticleClick(article)}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-4 border-b border-gray-200 last:border-b-0`}
                    >
                      <div className="flex space-x-3">
                        <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex-shrink-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2`} style={{ fontSize: '0.9rem' }}>
                            {article.title}
                          </h4>
                          <p className={`text-xs text-gray-600 text-left`}>
                            {formatDate(article.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-gray-600 text-sm text-left p-4`}>
                    No related posts found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailersTeasers;
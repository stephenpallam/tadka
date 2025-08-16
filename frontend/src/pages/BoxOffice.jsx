import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const BoxOffice = () => {
  const navigate = useNavigate();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('box-office'); // 'box-office' or 'bollywood'
  const [boxOfficeArticles, setBoxOfficeArticles] = useState([]);
  const [bollywoodArticles, setBollywoodArticles] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(false); // Start with false to show sample data immediately
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('thisWeek');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState([]);

  // Sample articles data as fallback - moved up to be available immediately
  const sampleBoxOfficeArticles = [
    {
      id: 1001,
      title: "Avatar 3 Dominates Global Box Office with Record Opening Weekend",
      summary: "James Cameron's latest installment breaks international box office records across multiple territories.",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Box Office Reporter",
      slug: "avatar-3-dominates-global-box-office"
    },
    {
      id: 1002,
      title: "Fast X Speeds Past $500 Million Worldwide Collection",
      summary: "The action franchise continues its box office dominance with impressive international numbers.",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Entertainment Analyst",
      slug: "fast-x-speeds-past-500-million"
    },
    {
      id: 1003,
      title: "Guardians of Galaxy Vol 3 Maintains Strong Box Office Performance",
      summary: "Marvel's space adventure continues to attract audiences in its third weekend.",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Marvel Correspondent",
      slug: "guardians-galaxy-vol-3-strong-performance"
    },
    {
      id: 1004,
      title: "John Wick 4 Surpasses Franchise Box Office Expectations",
      summary: "Keanu Reeves' action thriller delivers the highest grossing entry in the series.",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Action Movie Critic",
      slug: "john-wick-4-surpasses-expectations"
    },
    {
      id: 1005,
      title: "Scream VI Opens Strong in Horror Movie Box Office Rankings",
      summary: "The latest slasher sequel proves the franchise still has box office appeal.",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Horror Specialist",
      slug: "scream-vi-opens-strong-horror"
    }
  ];

  const sampleBollywoodArticles = [
    {
      id: 1006,
      title: "Pathaan Creates Box Office History with ₹1000 Crore Club Entry",
      summary: "Shah Rukh Khan's comeback film becomes fastest Bollywood movie to cross ₹1000 crores worldwide.",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Bollywood Trade Analyst",
      slug: "pathaan-creates-box-office-history"
    },
    {
      id: 1007,
      title: "Jawan Breaks All Previous SRK Box Office Records",
      summary: "Shah Rukh Khan's mass entertainer delivers the biggest opening day in his career.",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Trade Expert",
      slug: "jawan-breaks-srk-records"
    },
    {
      id: 1008,
      title: "Tiger 3 Roars at Box Office with ₹300 Crore Weekend",
      summary: "Salman Khan's spy thriller delivers massive numbers in its opening weekend.",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Box Office Tracker",
      slug: "tiger-3-roars-300-crore-weekend"
    },
    {
      id: 1009,
      title: "Gadar 2 Emerges as Surprise Box Office Champion",
      summary: "Sunny Deol's sequel becomes one of the highest grossing films of the year.",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Film Trade Magazine",
      slug: "gadar-2-surprise-box-office-champion"
    },
    {
      id: 1010,
      title: "Rocky Aur Rani Ki Prem Kahani Wins Hearts and Box Office",
      summary: "Karan Johar's romantic drama proves content-driven films can succeed commercially.",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Bollywood Correspondent",
      slug: "rocky-rani-wins-hearts-box-office"
    }
  ];

  // Initialize with sample data immediately
  useEffect(() => {
    console.log('BoxOffice: Initializing with sample data...');
    setBoxOfficeArticles(sampleBoxOfficeArticles);
    setBollywoodArticles(sampleBollywoodArticles);
    setRelatedArticles(sampleBoxOfficeArticles.slice(0, 5));
    console.log('BoxOffice: Sample data set successfully');
  }, []);

  useEffect(() => {
    const fetchBoxOfficeData = async () => {
      try {
        setLoading(true);
        console.log('Fetching box office data...');
        
        // Fetch articles from the backend API using box office categories
        const boxOfficeResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/category/box-office?limit=50`);
        console.log('Box Office response status:', boxOfficeResponse.status);
        
        if (boxOfficeResponse.ok) {
          const boxOfficeData = await boxOfficeResponse.json();
          console.log('Box Office data received:', boxOfficeData.length);
          setBoxOfficeArticles(boxOfficeData);
        } else {
          console.log('Box Office response not ok, using sample data');
          setBoxOfficeArticles(sampleBoxOfficeArticles);
        }

        const bollywoodResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/articles/category/bollywood-box-office?limit=50`);
        console.log('Bollywood response status:', bollywoodResponse.status);
        
        if (bollywoodResponse.ok) {
          const bollywoodData = await bollywoodResponse.json();
          console.log('Bollywood data received:', bollywoodData.length);
          setBollywoodArticles(bollywoodData);
        } else {
          console.log('Bollywood response not ok, using sample data');
          setBollywoodArticles(sampleBollywoodArticles);
        }
        
        // Get related articles from configured categories for box office page
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/related-articles/box-office`);
          if (response.ok) {
            const configuredRelated = await response.json();
            setRelatedArticles(configuredRelated);
          } else {
            // Fallback to movies reviews if box office related articles not configured
            const fallbackResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/related-articles/movies`);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setRelatedArticles(fallbackData);
            } else {
              console.log('Using sample related articles');
              setRelatedArticles(sampleBoxOfficeArticles.slice(0, 5));
            }
          }
        } catch (relatedError) {
          console.error('Error fetching related articles:', relatedError);
          setRelatedArticles(sampleBoxOfficeArticles.slice(0, 5));
        }

        setError(null);
        console.log('Data fetching completed successfully');
      } catch (error) {
        console.error('Error fetching box office data:', error);
        setError('Failed to load box office data. Please try again later.');
        // Set sample data even on error
        setBoxOfficeArticles(sampleBoxOfficeArticles);
        setBollywoodArticles(sampleBollywoodArticles);
        setRelatedArticles(sampleBoxOfficeArticles.slice(0, 5));
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    fetchBoxOfficeData();
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
    if (activeTab === 'box-office') {
      return boxOfficeArticles.length > 0 ? boxOfficeArticles : sampleBoxOfficeArticles;
    } else {
      return bollywoodArticles.length > 0 ? bollywoodArticles : sampleBollywoodArticles;
    }
  };

  // Filter articles based on selected time filter
  useEffect(() => {
    const currentArticles = getCurrentTabArticles();
    const filtered = filterArticlesByDate(currentArticles, selectedFilter);
    setFilteredArticles(filtered);
  }, [activeTab, boxOfficeArticles, bollywoodArticles, selectedFilter]);

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
    const category = activeTab === 'box-office' ? 'box-office' : 'bollywood-box-office';
    navigate(`/article/${article.slug}`, { 
      state: { 
        article, 
        category,
        from: 'box-office-page' 
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
          <p className={`mt-4 text-lg ${themeClasses.textPrimary}`}>Loading Box Office...</p>
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
          
          {/* Box Office Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Section Header - Sticky with tabs and filter */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-3.5">
                <div className="mb-2">
                  {/* Tabs only */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab('box-office')}
                      className={`text-base font-bold transition-colors duration-200 ${
                        activeTab === 'box-office'
                          ? 'text-black'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Box Office
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                    {filteredArticles.length} {activeTab === 'box-office' ? 'box office reports' : 'bollywood collections'} from {getCurrentFilterLabel().toLowerCase()}
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
                      <div className="w-20 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5.5a.5.5 0 11-1 0 .5.5 0 011 0zm4 0a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 9.5A.5.5 0 017 9h.5C8.328 9 9 9.672 9 10.5v1C9 12.328 8.328 13 7.5 13H7a.5.5 0 01-.5-.5v-3zM11 9h.5c.828 0 1.5.672 1.5 1.5v1c0 .828-.672 1.5-1.5 1.5H11a.5.5 0 01-.5-.5v-3a.5.5 0 01.5-.5z" clipRule="evenodd"/>
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
                          <span>{article.author || 'Box Office Desk'}</span>
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
                <p className={`text-lg ${themeClasses.textPrimary} mb-2`}>No {activeTab === 'box-office' ? 'box office reports' : 'bollywood collections'} found</p>
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
                        <div className="w-16 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded flex-shrink-0 flex items-center justify-center">
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

export default BoxOffice;
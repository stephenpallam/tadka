import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleImage from '../components/ArticleImage';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import dataService from '../services/dataService';
import { PlaceholderImage } from '../utils/imageUtils';

const LatestNews = () => {
  const navigate = useNavigate();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('thisWeek');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState([]);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        // Fetch articles from both politics and movies categories
        const [politicsArticles, moviesArticles] = await Promise.all([
          dataService.getArticlesByCategory('politics', 30),
          dataService.getArticlesByCategory('movies', 30)
        ]);
        
        // Combine both categories and sort by published date (newest first)
        const combinedArticles = [...politicsArticles, ...moviesArticles].sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.published_at);
          const dateB = new Date(b.publishedAt || b.published_at);
          return dateB - dateA; // Sort descending (newest first)
        });
        
        setArticles(combinedArticles);
        
        // Get related articles from configured categories for latest-news page
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/related-articles/latest-news`);
          if (response.ok) {
            const configuredRelated = await response.json();
            setRelatedArticles(configuredRelated);
          } else {
            // Fallback to entertainment category if no configuration found
            const related = await dataService.getArticlesByCategory('entertainment', 20);
            setRelatedArticles(related);
          }
        } catch (err) {
          console.warn('Error fetching configured related articles, using fallback:', err);
          // Fallback to entertainment category
          const related = await dataService.getArticlesByCategory('entertainment', 20);
          setRelatedArticles(related);
        }
        
        // Initialize filtered articles with 'This Week' filter
        const initialFiltered = filterArticlesByDate(combinedArticles, 'thisWeek');
        setFilteredArticles(initialFiltered);
        
        setError(null);
      } catch (err) {
        console.error('Error loading latest news:', err);
        setError('Failed to load latest news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  // Update filtered articles when articles or filter changes
  useEffect(() => {
    const filtered = filterArticlesByDate(articles, selectedFilter);
    setFilteredArticles(filtered);
  }, [articles, selectedFilter]);

  // Auto scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sample thumbnail images for related topics
  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1586339949216-35c890863684?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=60&h=45&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  // Filter options for the dropdown
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

  // Function to filter articles by date
  const filterArticlesByDate = (articles, filter) => {
    console.log('Filtering latest news articles (politics + movies):', articles.length, 'with filter:', filter);
    
    if (!articles || articles.length === 0) {
      console.log('No latest news articles to filter');
      return [];
    }

    // Use mock date as "today" to match current date (June 30, 2026)
    const now = new Date('2026-06-30T23:59:59Z');
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const filtered = articles.filter((article, index) => {
      // Use actual publishedAt date from article data
      let articleDate;
      if (article.publishedAt || article.published_at) {
        articleDate = new Date(article.publishedAt || article.published_at);
        console.log(`Latest news article "${article.title}" published on: ${articleDate.toDateString()}`);
      } else {
        console.log(`Latest news article "${article.title}" has no publishedAt date`);
        return false; // Don't include articles without dates
      }
      
      // Reset time to start of day for accurate comparison
      const articleDateOnly = new Date(articleDate.getFullYear(), articleDate.getMonth(), articleDate.getDate());
      const timeDiff = now - articleDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      console.log(`Latest news article date: ${articleDateOnly.toDateString()}, Days ago: ${daysDiff}`);

      switch (filter) {
        case 'thisWeek':
          // This week means current week (Monday to Sunday)
          const currentWeekStart = new Date(today);
          const dayOfWeek = today.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          currentWeekStart.setDate(today.getDate() - daysToMonday);
          
          // Calculate week end (Sunday)
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
          
          const isThisWeek = articleDateOnly >= currentWeekStart && articleDateOnly <= currentWeekEnd;
          console.log(`This week check: ${isThisWeek}, week start: ${currentWeekStart.toDateString()}, week end: ${currentWeekEnd.toDateString()}, article: ${articleDateOnly.toDateString()}`);
          return isThisWeek;
        case 'today':
          const isToday = articleDateOnly.getTime() === today.getTime();
          console.log(`Today check: ${isToday}, article date: ${articleDateOnly.toDateString()}, today: ${today.toDateString()}`);
          return isToday;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const isYesterday = articleDateOnly.getTime() === yesterday.getTime();
          console.log(`Yesterday check: ${isYesterday}, article date: ${articleDateOnly.toDateString()}, yesterday: ${yesterday.toDateString()}`);
          return isYesterday;
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
          return false; // Don't show articles for unknown filters
      }
    });
    
    console.log('Filtered latest news result:', filtered.length, 'articles from politics + movies categories');
    return filtered; // Return actual filtered results, no fallback
  };

  // Handle filter change
  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    setIsFilterOpen(false);
    const filtered = filterArticlesByDate(articles, filterValue);
    setFilteredArticles(filtered);
  };

  // Get current filter label
  const getCurrentFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'This Week';
  };

  const handleRelatedArticleClick = (article) => {
    // Navigate to article page
    navigate(`/article/${article.id}`);
  };

  const handleArticleClick = (article) => {
    // Navigate to article page
    navigate(`/article/${article.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
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
  const sectionHeaderClasses = getSectionHeaderClasses();

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${themeClasses.textPrimary}`}>Loading Latest News...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.pageBackground} flex items-center justify-center`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">📰</div>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>Unable to Load News</h2>
          <p className={`${themeClasses.textSecondary} mb-6`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.pageBackground}`}>
      {/* Main Container - Remove top padding for consistency with article pages */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 70%/30% split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Latest News Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Latest News Section Header - Sticky with filter and bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h1 className="text-base font-bold text-black text-left leading-tight">
                    Latest News
                  </h1>
                </div>
                
                {/* Article count and Filter on same line */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-900 opacity-75 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {filteredArticles.length} articles from {getCurrentFilterLabel().toLowerCase()}
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
                              {selectedFilter === option.value && (
                                <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Grid - Remove left padding so articles start from left edge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {filteredArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm cursor-pointer group transition-all duration-200"
                  style={{ padding: '0.5rem' }}
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="flex items-start space-x-3 text-left pr-3">
                    <ArticleImage
                      src={article.image}
                      alt={article.title}
                      contentType={article.content_type || 'article'}
                      width="flex-shrink-0 w-32"
                      height="h-24"
                      imgClassName="object-cover rounded group-hover:scale-105 transition-transform duration-200"
                      placeholderClassName="group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight hover:text-blue-600 mb-2 transition-colors duration-200 text-left">
                        {article.title}
                      </h3>
                      <div className="text-xs text-gray-500 text-left">
                        <p className="mb-1">
                          {formatDate(article.publishedAt || article.published_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Articles Section - 30% width */}
          <div className="lg:col-span-3 border-t border-gray-300 lg:border-t-0 pt-2 lg:pt-0">
            {/* Related Articles Section Header - Sticky */}
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

            {/* Related Articles List */}
            <div className="space-y-0">
              <div className="space-y-0">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map((article, index) => (
                    <div
                      key={article.id}
                      onClick={() => handleRelatedArticleClick(article)}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 ${
                        index < relatedArticles.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex space-x-3">
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-20 h-16 bg-gray-500 flex items-center justify-center rounded flex-shrink-0';
                              placeholder.innerHTML = `<span class="text-white font-bold text-lg">${article.content_type === 'video' ? 'V' : article.content_type === 'photo' ? 'P' : article.content_type === 'movie_review' ? 'M' : 'A'}</span>`;
                              e.target.parentNode.replaceChild(placeholder, e.target);
                            }}
                          />
                        ) : (
                          <PlaceholderImage 
                            contentType={article.content_type || 'post'} 
                            className="w-20 h-16"
                          />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2`} style={{ fontSize: '0.9rem' }}>
                            {article.title}
                          </h4>
                          <p className={`text-xs text-gray-600 text-left`}>
                            {formatDate(article.publishedAt || article.published_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-gray-600 text-sm text-left`}>
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

export default LatestNews;
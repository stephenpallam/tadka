import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dataService from '../services/dataService';
import { PlaceholderImage } from '../utils/imageUtils';

const Topics = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('thisWeek');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    fetchTopics();
    fetchCategories();
    fetchRelatedArticles();
  }, [selectedCategory]); // Removed searchTerm dependency

  useEffect(() => {
    // Filter topics by date when topics or date filter changes
    if (topics.length > 0) {
      const filtered = filterTopicsByDate(topics, selectedDateFilter);
      setFilteredTopics(filtered);
    }
  }, [topics, selectedDateFilter]);

  // Date filter options matching Latest News
  const dateFilterOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'halfYear', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' }
  ];

  const fetchTopics = async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/topics?limit=100`;
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topic-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      // Get related articles from configured categories for topics page
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/related-articles/topics`);
      if (response.ok) {
        const configuredRelated = await response.json();
        setRelatedArticles(configuredRelated);
      } else {
        // Fallback to entertainment category if no configuration found
        const related = await dataService.getArticlesByCategory('entertainment', 10);
        setRelatedArticles(related);
      }
    } catch (error) {
      console.warn('Error fetching configured related articles, using fallback:', error);
      // Fallback to entertainment category
      try {
        const related = await dataService.getArticlesByCategory('entertainment', 10);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Error loading fallback articles:', err);
        setRelatedArticles([]);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRelatedArticleClick = (article) => {
    navigate(`/article/${article.id}`);
  };

  // Handle category filter change
  const handleCategoryChange = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setIsCategoryOpen(false);
  };

  // Handle date filter change
  const handleDateFilterChange = (filterValue) => {
    setSelectedDateFilter(filterValue);
    setIsDateFilterOpen(false);
  };

  // Filter topics by date
  const filterTopicsByDate = (topicsToFilter, filter) => {
    if (!filter) return topicsToFilter;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    return topicsToFilter.filter(topic => {
      const topicDate = new Date(topic.created_at);
      topicDate.setHours(0, 0, 0, 0); // Set to start of day
      
      const daysDiff = Math.floor((today - topicDate) / (1000 * 60 * 60 * 24));
      
      switch (filter) {
        case 'thisWeek':
          // This week means current week (Monday to Sunday)
          const currentWeekStart = new Date(today);
          const dayOfWeek = today.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          currentWeekStart.setDate(today.getDate() - daysToMonday);
          
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
          
          return topicDate >= currentWeekStart && topicDate <= currentWeekEnd;
        case 'today':
          return topicDate.getTime() === today.getTime();
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return topicDate.getTime() === yesterday.getTime();
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
          return true;
      }
    });
  };

  // Get current category label
  const getCurrentCategoryLabel = () => {
    if (!selectedCategory) return 'All Categories';
    const category = categories.find(cat => cat.name === selectedCategory);
    return category ? category.name : 'All Categories';
  };

  // Get current date filter label
  const getCurrentDateFilterLabel = () => {
    const option = dateFilterOptions.find(opt => opt.value === selectedDateFilter);
    return option ? option.label : 'This Week';
  };

  // Placeholder thumbnail function - you can customize this
  const getThumbnail = (index) => {
    const thumbnails = [
      '/api/placeholder/300/200',
      '/api/placeholder/300/200',
      '/api/placeholder/300/200',
      '/api/placeholder/300/200',
      '/api/placeholder/300/200'
    ];
    return thumbnails[index % thumbnails.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 70%/30% split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Topics Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Topics Section Header - Sticky with filter and bottom border */}
            <div className="sticky top-16 z-40 border-b-2 border-gray-300 mb-3" style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h1 className="text-base font-bold text-black text-left leading-tight">
                    Topics
                  </h1>
                </div>
                
                {/* Topic count and Filters on same line */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-900 opacity-75 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C2.077 13.509 2 14.132 2 14.828V18a2 2 0 002 2h12a2 2 0 002-2v-3.172c0-.696-.077-1.319-.707-1.949l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.47-.156a4 4 0 00-2.171-.102l1.027-1.028A3 3 0 009 8.172z" clipRule="evenodd" />
                    </svg>
                    {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} from {getCurrentDateFilterLabel().toLowerCase()}
                  </p>

                  {/* Filter Dropdowns */}
                  <div className="flex items-center space-x-4">
                    {/* Date Filter Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{getCurrentDateFilterLabel()}</span>
                        <svg className={`w-3 h-3 ${isDateFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      {/* Date Filter Dropdown Menu */}
                      {isDateFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="py-1">
                            {dateFilterOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleDateFilterChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                  selectedDateFilter === option.value 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                                {selectedDateFilter === option.value && (
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

                    {/* Category Filter Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                        </svg>
                        <span>{getCurrentCategoryLabel()}</span>
                        <svg className={`w-3 h-3 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      {/* Category Dropdown Menu */}
                      {isCategoryOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="py-1">
                            <button
                              onClick={() => handleCategoryChange('')}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                !selectedCategory 
                                  ? 'bg-blue-50 text-blue-700 font-medium' 
                                  : 'text-gray-700'
                              }`}
                            >
                              All Categories
                              {!selectedCategory && (
                                <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </button>
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.name)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                  selectedCategory === category.name 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {category.name}
                                {selectedCategory === category.name && (
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
            </div>

            {/* Topics Grid */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading topics...</p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Topics Found</h3>
                <p className="text-gray-600">
                  {selectedCategory 
                    ? 'Try selecting a different category or time period.' 
                    : 'No topics are available for the selected time period.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {filteredTopics.map(topic => (
                  <Link
                    key={topic.id}
                    to={`/topic/${topic.slug}`}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm cursor-pointer group transition-all duration-200"
                    style={{ padding: '0.5rem' }}
                  >
                    <div className="flex items-start space-x-3 text-left pr-3">
                      {topic.image ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${topic.image}`}
                          alt={topic.title}
                          className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            // Replace with placeholder on error
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-20 h-16 rounded bg-gray-500 flex items-center justify-center flex-shrink-0';
                            placeholder.innerHTML = '<span class="text-white font-bold text-lg">T</span>';
                            e.target.parentNode.replaceChild(placeholder, e.target);
                          }}
                        />
                      ) : (
                        <PlaceholderImage 
                          isTopicCard={true} 
                          className="w-20 h-16"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2" style={{ fontSize: '0.9rem' }}>
                          {topic.title}
                        </h4>
                        
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="inline-flex items-center px-2.5 py-1 rounded border border-blue-300 text-blue-700 bg-blue-50 font-medium">
                            {topic.category}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded border border-green-300 text-green-700 bg-green-50 font-medium">
                            {topic.articles_count} Post{topic.articles_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Related Articles Section - 30% width */}
          <div className="lg:col-span-3 border-t border-gray-300 lg:border-t-0 pt-2 lg:pt-0">
            {/* Related Articles Section Header - Sticky */}
            <div className="sticky top-16 z-30 border-b-2 border-gray-300 mb-3" style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
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
                        <img
                          src={getThumbnail(index)}
                          alt={article.title}
                          className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2" style={{ fontSize: '0.9rem' }}>
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-600 text-left">
                            {formatDate(article.publishedAt || article.published_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm text-left">
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

export default Topics;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TopicsManagement = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]); // Store all topics for pagination
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]); // Fetch from API instead of hardcoded
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Topic content management states
  const [showContentManagementModal, setShowContentManagementModal] = useState(false);
  const [selectedTopicForContent, setSelectedTopicForContent] = useState(null);
  const [topicContent, setTopicContent] = useState({ articles: [], galleries: [] });
  const [contentLoading, setContentLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'mr', name: 'Marathi' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' },
    { code: 'ur', name: 'Urdu' }
  ];

  // Fetch CMS configuration including states from API
  const fetchCMSConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/config`);
      const data = await response.json();
      setStates(data.states);
    } catch (error) {
      console.error('Error fetching CMS config:', error);
    }
  };

  useEffect(() => {
    fetchCMSConfig();
  }, []);

  useEffect(() => {
    fetchTopics();
    fetchCategories();
  }, [selectedState, selectedCategory, itemsPerPage]);

  // Handle pagination without refetching all data
  useEffect(() => {
    if (allTopics.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageTopics = allTopics.slice(startIndex, endIndex);
      
      setTopics(currentPageTopics);
      setTotalCount(allTopics.length);
      setTotalPages(Math.ceil(allTopics.length / itemsPerPage));
    }
  }, [currentPage, itemsPerPage, allTopics]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedState, selectedCategory, itemsPerPage]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/topics?limit=1000`; // Fetch all topics
      
      if (selectedState) {
        url += `&language=${selectedState}`;
      }
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch topics');
      
      const data = await response.json();
      
      // Store all topics for pagination
      setAllTopics(data);
      setTotalCount(data.length);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      
      // Calculate current page topics
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageTopics = data.slice(startIndex, endIndex);
      setTopics(currentPageTopics);
      
      setError(null);
    } catch (err) {
      setError('Failed to load topics. Please try again.');
      console.error('Error fetching topics:', err);
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
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleCreateTopic = () => {
    navigate('/cms/create-topic');
  };

  const startEdit = (topic) => {
    navigate(`/cms/edit-topic/${topic.id}`);
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${topicId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchTopics();
        } else {
          setError('Failed to delete topic');
        }
      } catch (err) {
        setError('Error deleting topic');
        console.error('Error:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Topic content management functions
  const handleManageTopicContent = async (topic) => {
    setSelectedTopicForContent(topic);
    setShowContentManagementModal(true);
    setContentLoading(true);
    
    try {
      // Fetch articles associated with this topic
      const articlesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${topic.id}/articles`);
      const articles = articlesResponse.ok ? await articlesResponse.json() : [];
      
      // Fetch galleries associated with this topic
      const galleriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${topic.id}/galleries`);
      const galleries = galleriesResponse.ok ? await galleriesResponse.json() : [];
      
      setTopicContent({ articles, galleries });
    } catch (error) {
      console.error('Error fetching topic content:', error);
      setTopicContent({ articles: [], galleries: [] });
    } finally {
      setContentLoading(false);
    }
  };

  const handleRemoveArticleFromTopic = async (articleId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${selectedTopicForContent.id}/articles/${articleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        setTopicContent(prev => ({
          ...prev,
          articles: prev.articles.filter(article => article.id !== articleId)
        }));
        
        // Update topics count
        setTopics(prev => prev.map(topic => 
          topic.id === selectedTopicForContent.id 
            ? { ...topic, articles_count: topic.articles_count - 1 }
            : topic
        ));
      }
    } catch (error) {
      console.error('Error removing article from topic:', error);
    }
  };

  const handleRemoveGalleryFromTopic = async (galleryId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${selectedTopicForContent.id}/galleries/${galleryId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        setTopicContent(prev => ({
          ...prev,
          galleries: prev.galleries.filter(gallery => gallery.id !== galleryId)
        }));
      }
    } catch (error) {
      console.error('Error removing gallery from topic:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Filters - Sticky */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sticky top-16 z-40">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/cms/topics/create')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                + Create Topic
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No topics found</p>
            <p className="text-gray-400 text-sm mt-2">Create your first topic to get started</p>
          </div>
        ) : (
          <div>
            {/* Sticky Table Header */}
            <div className="bg-gray-50 sticky top-28 z-30 border-b border-gray-200 shadow-sm px-6 py-3 overflow-x-auto min-w-full">
              <div className="grid grid-cols-5 gap-4 min-w-[700px]">
                <div className="text-left min-w-[180px]">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">TOPIC</span>
                </div>
                <div className="text-left min-w-[100px]">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">CATEGORY</span>
                </div>
                <div className="text-left min-w-[100px]">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">TARGET STATE</span>
                </div>
                <div className="text-left min-w-[100px]">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">CREATED</span>
                </div>
                <div className="text-left min-w-[180px]">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</span>
                </div>
              </div>
            </div>
            
            {/* Topics List */}
            <div className="divide-y divide-gray-200 overflow-x-auto">
              {topics.map((topic, index) => (
                <div 
                  key={topic.id} 
                  className={`grid grid-cols-5 gap-4 px-6 py-4 min-w-[700px] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100 transition-colors duration-150`}
                >
                  <div className="text-left min-w-[180px]">
                    <div className="flex items-center">
                      {topic.image && (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${topic.image}`}
                          alt={topic.title}
                          className="h-10 w-10 rounded-full mr-3 object-cover flex-shrink-0"
                        />
                      )}
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {topic.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {topic.articles_count} Posts
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-left min-w-[100px]">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
                    </span>
                  </div>
                  <div className="text-left text-gray-900 text-sm min-w-[100px]">
                    {topic.language === 'all' || topic.language === 'national' ? 'All States' : (states.find(s => s.code === topic.language)?.name || topic.language)}
                  </div>
                  <div className="text-left text-gray-500 text-sm min-w-[100px]">
                    {formatDate(topic.created_at)}
                  </div>
                  <div className="text-left min-w-[180px]">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleManageTopicContent(topic)}
                        className="inline-flex items-center justify-center px-3 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                      >
                        Manage Content
                      </button>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => startEdit(topic)}
                          className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="inline-flex items-center justify-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pagination for Topics */}
        {topics.length > 0 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <label htmlFor="topics-per-page" className="text-sm font-medium text-gray-700">Show:</label>
                <select
                  id="topics-per-page"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
                <span className="text-sm text-gray-700">
                  topics per page (showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount})
                </span>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Topic Content Management Modal */}
      {showContentManagementModal && selectedTopicForContent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">📁</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 text-left">
                      Manage Topic Content: {selectedTopicForContent.title}
                    </h2>
                    <p className="text-sm text-gray-500 text-left">
                      View and manage all content associated with this topic
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowContentManagementModal(false);
                    setSelectedTopicForContent(null);
                    setTopicContent({ articles: [], galleries: [] });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {contentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading topic content...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Articles Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">
                      Articles ({topicContent.articles.length})
                    </h3>
                    {topicContent.articles.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Article
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topicContent.articles.map((article) => (
                              <tr key={article.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-left">
                                  <div className="text-sm font-medium text-gray-900">
                                    {article.title}
                                  </div>
                                  {article.summary && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {article.summary}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                                  {article.author}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                                  {formatDate(article.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                                  <button
                                    onClick={() => handleRemoveArticleFromTopic(article.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No articles associated with this topic</p>
                      </div>
                    )}
                  </div>

                  {/* Galleries Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">
                      Galleries ({topicContent.galleries.length})
                    </h3>
                    {topicContent.galleries.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gallery
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Images
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {topicContent.galleries.map((gallery) => (
                              <tr key={gallery.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-left">
                                  <div className="text-sm font-medium text-gray-900">
                                    {gallery.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {gallery.gallery_id}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {gallery.gallery_type || 'Gallery'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left">
                                  {gallery.images?.length || 0} images
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                                  {formatDate(gallery.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left">
                                  <button
                                    onClick={() => handleRemoveGalleryFromTopic(gallery.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No galleries associated with this topic</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowContentManagementModal(false);
                    setSelectedTopicForContent(null);
                    setTopicContent({ articles: [], galleries: [] });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicsManagement;
import React, { useState, useEffect } from 'react';

const TopicSelector = ({ selectedTopics = [], onTopicsChange, disabled = false }) => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create topic form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    language: 'en'
  });
  const [formImage, setFormImage] = useState(null);

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

  useEffect(() => {
    fetchTopics();
    fetchCategories();
  }, [selectedCategory]);

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
    } catch (err) {
      console.error('Error loading topics:', err);
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

  const handleTopicToggle = (topic) => {
    const isSelected = selectedTopics.some(t => t.id === topic.id);
    
    if (isSelected) {
      // Remove topic
      const newSelection = selectedTopics.filter(t => t.id !== topic.id);
      onTopicsChange(newSelection);
    } else {
      // Add topic
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  const handleCreateTopic = async () => {
    try {
      const topicResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (topicResponse.ok) {
        const newTopic = await topicResponse.json();
        
        // Upload image if provided
        if (formImage) {
          const imageFormData = new FormData();
          imageFormData.append('file', formImage);
          
          await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${newTopic.id}/upload-image`, {
            method: 'POST',
            body: imageFormData,
          });
          
          // Refresh topic data
          const updatedResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${newTopic.id}`);
          if (updatedResponse.ok) {
            const updatedTopic = await updatedResponse.json();
            // Auto-select the newly created topic
            onTopicsChange([...selectedTopics, updatedTopic]);
            // Reset form and close modal
            resetForm();
            fetchTopics();
            return;
          }
        }
        
        // Auto-select the newly created topic
        onTopicsChange([...selectedTopics, newTopic]);
        
        // Reset form and close modal
        resetForm();
        fetchTopics();
      } else {
        alert('Failed to create topic');
      }
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('Error creating topic');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      language: 'en'
    });
    setFormImage(null);
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topics (Optional)
        </label>
        
        {/* Category Filter */}
        <div className="mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Topic Selection */}
        <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading topics...</p>
            </div>
          ) : (
            <>
              {/* Create New Topic Option */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  disabled={disabled}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-dashed border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Create New Topic
                </button>
              </div>

              {/* Topics List */}
              {topics.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {selectedCategory ? `No topics found in ${selectedCategory}` : 'No topics available'}
                </p>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <label key={topic.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTopics.some(t => t.id === topic.id)}
                        onChange={() => handleTopicToggle(topic)}
                        disabled={disabled}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {topic.image && (
                          <img
                            src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${topic.image}`}
                            alt={topic.title}
                            className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {topic.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {topic.category} • {topic.articles_count} articles
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Topics Display */}
        {selectedTopics.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Selected Topics:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTopics.map((topic) => (
                <span
                  key={topic.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {topic.title}
                  <button
                    type="button"
                    onClick={() => handleTopicToggle(topic)}
                    disabled={disabled}
                    className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Topic Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Create New Topic</h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTopic();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter topic title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the topic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormImage(e.target.files[0])}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSelector;
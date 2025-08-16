import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';

const Education = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEducationArticles = async () => {
      try {
        setLoading(true);
        const educationArticles = await dataService.getArticlesByCategory('education', 20);
        setArticles(educationArticles);
        setError(null);
      } catch (err) {
        console.error('Error loading education articles:', err);
        setError('Failed to load education content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEducationArticles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-gray-800">Loading Education Content</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-start pt-20">
        <div className="ml-8 bg-white border border-gray-300 p-6 max-w-md">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* Header */}
        <div className="bg-gray-100 px-3 py-2 border border-gray-300 text-left mb-6">
          <h1 className="text-xl font-bold text-gray-900">Education</h1>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 text-xs font-medium rounded">
                  Education
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.author}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-400">
                  <span>👁️ {article.viewCount} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Articles Message */}
        {articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Education Articles Found</h3>
            <p className="text-gray-600">Education content will be available soon. Stay tuned!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
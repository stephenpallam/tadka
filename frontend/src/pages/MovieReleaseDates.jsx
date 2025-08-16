import React, { useState, useEffect } from 'react';
import dataService from '../services/dataService';

const MovieReleaseDates = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieReleaseDates = async () => {
      try {
        setLoading(true);
        const releaseArticles = await dataService.getArticlesByCategory('movies', 50);
        setArticles(releaseArticles);
        setError(null);
      } catch (err) {
        console.error('Error loading movie release dates:', err);
        setError('Failed to load movie release dates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieReleaseDates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-gray-800">Loading Movie Release Dates</p>
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
        <div className="bg-gray-100 px-3 py-2 border border-gray-300 text-left mb-6">
          <h3 className="text-sm font-semibold text-gray-900">Movie Release Dates</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-300 overflow-hidden hover:shadow-sm transition-shadow duration-300 cursor-pointer">
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-24 object-cover"
                />
              </div>
              
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 hover:text-gray-700 transition-colors duration-200">
                  {article.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieReleaseDates;
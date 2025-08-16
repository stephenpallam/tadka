import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SimpleArticlePage = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-8">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Back
      </button>
      <h1 className="text-3xl font-bold mb-4">
        Article {articleId}
      </h1>
      <p>This is a simple test article page to verify routing is working.</p>
    </div>
  );
};

export default SimpleArticlePage;
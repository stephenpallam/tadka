import React, { useState, useEffect } from 'react';
import CustomModal from './CustomModal';

const RelatedVideosManagement = ({ article, onClose, onSave }) => {
  const [availableVideos, setAvailableVideos] = useState([]);
  const [currentRelatedVideos, setCurrentRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideoType, setSelectedVideoType] = useState('all'); // 'all', 'trending', 'viral-shorts'
  const [pendingChanges, setPendingChanges] = useState(new Set());

  useEffect(() => {
    fetchAvailableVideos();
    fetchCurrentRelatedVideos();
  }, [selectedVideoType, searchTerm, article.id]);

  const fetchAvailableVideos = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      // Fetch videos from different endpoints based on selected type
      let endpoints = [];
      
      if (selectedVideoType === 'all' || selectedVideoType === 'trending') {
        endpoints.push('/api/articles/sections/trending-videos');
      }
      
      if (selectedVideoType === 'all' || selectedVideoType === 'viral-shorts') {
        endpoints.push('/api/articles/sections/viral-shorts');
      }
      
      const allVideos = [];
      
      for (const endpoint of endpoints) {
        const response = await fetch(`${backendUrl}${endpoint}?limit=50`);
        if (response.ok) {
          const data = await response.json();
          
          // Add trending videos
          if (data.trending_videos) {
            allVideos.push(...data.trending_videos.map(video => ({
              ...video,
              video_type: 'trending',
              display_type: 'Trending Video'
            })));
          }
          
          if (data.bollywood_trending) {
            allVideos.push(...data.bollywood_trending.map(video => ({
              ...video,
              video_type: 'trending',
              display_type: 'Trending Video (Bollywood)'
            })));
          }
          
          // Add viral shorts videos
          if (data.viral_shorts) {
            allVideos.push(...data.viral_shorts.map(video => ({
              ...video,
              video_type: 'viral-shorts',
              display_type: 'Viral Shorts'
            })));
          }
          
          if (data.bollywood) {
            allVideos.push(...data.bollywood.map(video => ({
              ...video,
              video_type: 'viral-shorts',
              display_type: 'Viral Shorts (Bollywood)'
            })));
          }
        }
      }
      
      // Filter out current article and apply search
      const filteredVideos = allVideos
        .filter(video => video.id !== article.id)
        .filter(video => 
          searchTerm === '' || 
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.summary.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      setAvailableVideos(filteredVideos);
    } catch (error) {
      console.error('Error fetching available videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentRelatedVideos = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/articles/${article.id}/related-videos`);
      if (response.ok) {
        const data = await response.json();
        setCurrentRelatedVideos(data.related_videos || []);
      }
    } catch (error) {
      console.error('Error fetching current related videos:', error);
      // If endpoint doesn't exist yet, start with empty array
      setCurrentRelatedVideos([]);
    }
  };

  const isVideoRelated = (video) => {
    return currentRelatedVideos.some(related => related.id === video.id) || pendingChanges.has(video.id);
  };

  const handleVideoToggle = (video) => {
    const newPendingChanges = new Set(pendingChanges);
    
    if (isVideoRelated(video)) {
      // Remove from related videos
      newPendingChanges.add(`remove_${video.id}`);
      newPendingChanges.delete(video.id);
    } else {
      // Add to related videos
      newPendingChanges.add(video.id);
      newPendingChanges.delete(`remove_${video.id}`);
    }
    
    setPendingChanges(newPendingChanges);
  };

  const handleSave = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      // Calculate final related videos list
      let finalRelatedVideos = [...currentRelatedVideos];
      
      // Apply additions
      pendingChanges.forEach(change => {
        if (!change.toString().startsWith('remove_')) {
          const videoId = parseInt(change);
          const video = availableVideos.find(v => v.id === videoId);
          if (video && !finalRelatedVideos.some(rv => rv.id === videoId)) {
            finalRelatedVideos.push(video);
          }
        }
      });
      
      // Apply removals
      pendingChanges.forEach(change => {
        if (change.toString().startsWith('remove_')) {
          const videoId = parseInt(change.toString().replace('remove_', ''));
          finalRelatedVideos = finalRelatedVideos.filter(rv => rv.id !== videoId);
        }
      });
      
      const response = await fetch(`${backendUrl}/api/articles/${article.id}/related-videos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          related_videos: finalRelatedVideos.map(video => video.id)
        }),
      });

      if (response.ok) {
        onSave && onSave(finalRelatedVideos);
        onClose();
      } else {
        console.error('Failed to save related videos');
        alert('Failed to save related videos. Please try again.');
      }
    } catch (error) {
      console.error('Error saving related videos:', error);
      alert('Error saving related videos. Please try again.');
    }
  };

  const handleCancel = () => {
    setPendingChanges(new Set());
    onClose();
  };

  return (
    <CustomModal onClose={handleCancel} className="max-w-6xl">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Manage Related Videos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure related videos for: <span className="font-semibold">{article.title}</span>
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Video Type Filter */}
            <select
              value={selectedVideoType}
              onChange={(e) => setSelectedVideoType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Video Types</option>
              <option value="trending">Trending Videos</option>
              <option value="viral-shorts">Viral Shorts</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Current Related Videos */}
              {(currentRelatedVideos.length > 0 || pendingChanges.size > 0) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Currently Related Videos ({currentRelatedVideos.length} + {Array.from(pendingChanges).filter(c => !c.toString().startsWith('remove_')).length} pending)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentRelatedVideos
                      .filter(video => !pendingChanges.has(`remove_${video.id}`))
                      .map((video) => (
                      <div key={video.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${video.youtube_url?.split('/').pop()?.split('?')[0]}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=320&h=180&fit=crop';
                            }}
                          />
                        </div>
                        <h4 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">{video.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{video.display_type || 'Related Video'}</span>
                          <button
                            onClick={() => handleVideoToggle(video)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Videos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Available Videos ({availableVideos.length})
                </h3>
                {availableVideos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No videos available matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableVideos.map((video) => (
                      <div
                        key={video.id}
                        className={`border rounded-lg p-3 transition-colors duration-200 ${
                          isVideoRelated(video)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden">
                          <img
                            src={`https://img.youtube.com/vi/${video.youtube_url?.split('/').pop()?.split('?')[0]}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=320&h=180&fit=crop';
                            }}
                          />
                        </div>
                        <h4 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{video.summary}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded ${
                            video.video_type === 'trending' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {video.display_type}
                          </span>
                          <button
                            onClick={() => handleVideoToggle(video)}
                            className={`px-3 py-1 rounded transition-colors duration-200 ${
                              isVideoRelated(video)
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {isVideoRelated(video) ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {pendingChanges.size > 0 && (
                <span className="text-blue-600 font-medium">
                  {pendingChanges.size} pending changes
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={pendingChanges.size === 0}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default RelatedVideosManagement;
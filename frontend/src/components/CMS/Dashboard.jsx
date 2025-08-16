import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CustomModal from './CustomModal';
import TopicsManagement from './TopicsManagement';
import TopicSelector from './TopicSelector';
import RelatedVideosManagement from './RelatedVideosManagement';
import { getStateNames } from '../../utils/statesConfig';

// Topic Management Modal Component
const TopicManagementModal = ({ article, currentTopics, onClose, onTopicToggle }) => {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pendingChanges, setPendingChanges] = useState(new Set());

  useEffect(() => {
    fetchAvailableTopics();
    // Reset pending changes when component mounts or topics change
    setPendingChanges(new Set());
  }, [selectedCategory, searchTerm]);

  const fetchAvailableTopics = async () => {
    try {
      setLoading(true);
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/topics?limit=100`;
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const topics = await response.json();
        setAvailableTopics(topics);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTopicAssociated = (topicId) => {
    const originallyAssociated = currentTopics.some(topic => topic.id === topicId);
    const hasPendingChange = pendingChanges.has(topicId);
    
    // If there's a pending change, flip the original state
    return hasPendingChange ? !originallyAssociated : originallyAssociated;
  };

  const handleTopicClick = (topic) => {
    const topicId = topic.id;
    
    // Toggle pending change
    const newPendingChanges = new Set(pendingChanges);
    if (newPendingChanges.has(topicId)) {
      newPendingChanges.delete(topicId);
    } else {
      newPendingChanges.add(topicId);
    }
    setPendingChanges(newPendingChanges);
  };

  const handleSave = async () => {
    // Apply all pending changes
    for (const topicId of pendingChanges) {
      const originallyAssociated = currentTopics.some(topic => topic.id === topicId);
      await onTopicToggle(topicId, originallyAssociated);
    }
    
    // Clear pending changes and close modal
    setPendingChanges(new Set());
    onClose();
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const topicCategories = ['Movies', 'Politics', 'Sports', 'TV', 'Travel'];

  // Sort topics to show selected ones first
  const sortedTopics = [...availableTopics].sort((a, b) => {
    const aSelected = isTopicAssociated(a.id);
    const bSelected = isTopicAssociated(b.id);
    
    // Selected topics first
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with title, search and filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-100 flex-shrink-0 sticky top-0 z-40">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Manage Topics for "{article.title}"
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Search and Filters directly in header */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {topicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area - shows selected topics at top */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading topics...</p>
            </div>
          ) : sortedTopics.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No topics found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedTopics.map(topic => {
                const isAssociated = isTopicAssociated(topic.id);
                return (
                  <div
                    key={topic.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                      isAssociated ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      {topic.image && (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/uploads/${topic.image}`}
                          alt={topic.title}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 text-left">
                          {topic.title}
                        </div>
                        <div className="text-xs text-gray-500 text-left flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 border">
                            {capitalizeFirst(topic.category)}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 border">
                            {topic.articles_count} Posts
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        {isAssociated ? 'Selected' : 'Click to add'}
                      </span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isAssociated 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {isAssociated && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - stays at bottom */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-100 flex justify-end space-x-3 flex-shrink-0 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'posts';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [articles, setArticles] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedState, setSelectedState] = useState(''); // New state filter
  const [searchQuery, setSearchQuery] = useState(''); // New search functionality
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [allArticles, setAllArticles] = useState([]); // Store all articles for frontend pagination
  
  // Pagination states for releases
  const [releasesCurrentPage, setReleasesCurrentPage] = useState(1);
  const [releasesItemsPerPage, setReleasesItemsPerPage] = useState(15);
  const [releasesTotalPages, setReleasesTotalPages] = useState(1);
  const [releasesTotalCount, setReleasesTotalCount] = useState(0);
  const [allTheaterReleases, setAllTheaterReleases] = useState([]);
  const [allOttReleases, setAllOttReleases] = useState([]);
  const [theaterReleases, setTheaterReleases] = useState([]);
  const [ottReleases, setOttReleases] = useState([]);
  
  // Pagination states for galleries
  const [galleriesCurrentPage, setGalleriesCurrentPage] = useState(1);
  const [galleriesItemsPerPage, setGalleriesItemsPerPage] = useState(15);
  const [galleriesTotalPages, setGalleriesTotalPages] = useState(1);
  const [galleriesTotalCount, setGalleriesTotalCount] = useState(0);
  const [allVerticalGalleries, setAllVerticalGalleries] = useState([]);
  const [allHorizontalGalleries, setAllHorizontalGalleries] = useState([]);
  const [verticalGalleries, setVerticalGalleries] = useState([]);
  const [horizontalGalleries, setHorizontalGalleries] = useState([]);
  
  // Pagination states for topics
  const [topicsCurrentPage, setTopicsCurrentPage] = useState(1);
  const [topicsItemsPerPage, setTopicsItemsPerPage] = useState(15);
  const [topicsTotalPages, setTopicsTotalPages] = useState(1);
  const [topicsTotalCount, setTopicsTotalCount] = useState(0);
  const [allTopics, setAllTopics] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Manage Related Articles state
  const [relatedArticlesConfig, setRelatedArticlesConfig] = useState({});
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedRelatedCategories, setSelectedRelatedCategories] = useState([]);
  const [selectedArticleCount, setSelectedArticleCount] = useState(5);
  const [showRelatedForm, setShowRelatedForm] = useState(false);
  const [editingRelatedConfig, setEditingRelatedConfig] = useState(null);
  
  // Manage Release Posts state
  const [releaseActiveTab, setReleaseActiveTab] = useState('theater');
  const [ottPlatforms, setOttPlatforms] = useState([]);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [selectedReleaseLanguage, setSelectedReleaseLanguage] = useState('');
  const [showTheaterForm, setShowTheaterForm] = useState(false);
  const [showOttForm, setShowOttForm] = useState(false);
  
  // Release form states
  const [theaterForm, setTheaterForm] = useState({
    movie_name: '',
    release_date: '',
    movie_banner: '', // Changed to string for text input
    language: 'Hindi',
    movie_image: null
  });
  
  const [ottForm, setOttForm] = useState({
    movie_name: '',
    ott_platform: '',
    language: 'Hindi',
    release_date: '',
    movie_image: null
  });

  // Custom banner and platform states
  const [customPlatform, setCustomPlatform] = useState('');
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);
  const [allOttPlatforms, setAllOttPlatforms] = useState([]);
  
  const [customBanner, setCustomBanner] = useState('');
  const [showCustomBanner, setShowCustomBanner] = useState(false);
  const [allBanners, setAllBanners] = useState([]);
  
  // Video Posts state management
  const [videoPostsActiveTab, setVideoPostsActiveTab] = useState('vertical-gallery');
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showHorizontalGalleryForm, setShowHorizontalGalleryForm] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [editingHorizontalGallery, setEditingHorizontalGallery] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedHorizontalArtist, setSelectedHorizontalArtist] = useState('');
  const [selectedHorizontalName, setSelectedHorizontalName] = useState('');
  
  // Gallery form states
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    images: []
  });

  const [horizontalGalleryForm, setHorizontalGalleryForm] = useState({
    title: '',
    images: []
  });

  // Gallery topic states
  const [selectedGalleryTopics, setSelectedGalleryTopics] = useState([]);
  const [selectedHorizontalGalleryTopics, setSelectedHorizontalGalleryTopics] = useState([]);
  
  // Artist management states for galleries
  const [availableArtists, setAvailableArtists] = useState([]);
  const [showGalleryArtistModal, setShowGalleryArtistModal] = useState(false);
  const [newGalleryArtist, setNewGalleryArtist] = useState('');
  const [selectedGalleryArtists, setSelectedGalleryArtists] = useState([]);
  
  // Single artist selection for galleries (replacing multiple artists)
  const [selectedGalleryArtist, setSelectedGalleryArtist] = useState('');
  const [selectedHorizontalGalleryArtist, setSelectedHorizontalGalleryArtist] = useState('');
  
  // Horizontal gallery artist modal states
  const [showHorizontalGalleryArtistModal, setShowHorizontalGalleryArtistModal] = useState(false);
  const [newHorizontalGalleryArtist, setNewHorizontalGalleryArtist] = useState('');
  
  // Gallery topic management states (similar to posts)
  const [showGalleryTopicModal, setShowGalleryTopicModal] = useState(false);
  const [selectedGalleryForTopics, setSelectedGalleryForTopics] = useState(null);
  const [galleryTopics, setGalleryTopics] = useState([]);
  
  // Article topic management states
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedArticleForTopics, setSelectedArticleForTopics] = useState(null);
  const [articleTopics, setArticleTopics] = useState([]);
  
  // Article related videos management states
  const [showRelatedVideosModal, setShowRelatedVideosModal] = useState(false);
  const [selectedArticleForRelatedVideos, setSelectedArticleForRelatedVideos] = useState(null);
  
  // Edit states
  const [editingRelease, setEditingRelease] = useState(null);
  const [editingType, setEditingType] = useState(null);
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showConfirmation: false,
    onConfirm: null
  });
  
  // Website pages (excluding admin, login, register)
  const websitePages = [
    { slug: 'latest-news', name: 'Latest News' },
    { slug: 'topics', name: 'Topics' },
    { slug: 'politics', name: 'Politics' },
    { slug: 'movies', name: 'Movies' },
    { slug: 'sports', name: 'Sports' },
    { slug: 'gallery', name: 'Gallery' },
    { slug: 'reviews', name: 'Movie Reviews' },
    { slug: 'ott-reviews', name: 'OTT Reviews' },
    { slug: 'trailers-teasers', name: 'Trailers & Teasers' },
    { slug: 'box-office', name: 'Box Office' },
    { slug: 'latest-new-video-songs', name: 'New Video Songs' },
    { slug: 'tv-shows', name: 'TV Shows' },
    { slug: 'ott-releases', name: 'OTT Releases' },
    { slug: 'theater-releases', name: 'Theater Releases' },
    { slug: 'events-interviews', name: 'Events & Interviews' },
    { slug: 'trending-videos', name: 'Trending Videos' },
    { slug: 'tadka-pics', name: 'Tadka Pics' },
    { slug: 'travel', name: 'Travel Pics' },
    { slug: 'ai', name: 'AI' },
    { slug: 'stock-market', name: 'Stock Market' },
    { slug: 'fashion', name: 'Fashion' }
  ];

  // Load galleries from backend on component mount
  useEffect(() => {
    fetchGalleries(); // Load galleries from backend instead of localStorage
    fetchRelatedArticlesConfig(); // Load related articles config
  }, []);

  // Clean up old localStorage entries on component mount
  useEffect(() => {
    // Clean up old problematic localStorage entries to prevent quota issues
    try {
      localStorage.removeItem('tadka_vertical_galleries');
      localStorage.removeItem('tadka_horizontal_galleries');
      console.log('Cleaned up old localStorage gallery entries');
    } catch (error) {
      console.warn('Error cleaning up localStorage:', error);
    }
  }, []);

  // Store only lightweight gallery metadata in localStorage to prevent quota exceeded error
  useEffect(() => {
    // Store only essential data to prevent localStorage quota issues
    if (verticalGalleries.length > 0) {
      try {
        const lightweightData = verticalGalleries.map(gallery => ({
          id: gallery.id,
          galleryId: gallery.galleryId,
          title: gallery.title,
          artists: gallery.artists,
          galleryType: gallery.galleryType,
          imageCount: gallery.images ? gallery.images.length : 0
        }));
        localStorage.setItem('tadka_vertical_galleries_meta', JSON.stringify(lightweightData));
      } catch (error) {
        console.warn('Failed to store vertical galleries metadata in localStorage:', error);
      }
    }
  }, [verticalGalleries]);

  useEffect(() => {
    // Store only essential data to prevent localStorage quota issues
    if (horizontalGalleries.length > 0) {
      try {
        const lightweightData = horizontalGalleries.map(gallery => ({
          id: gallery.id,
          galleryId: gallery.galleryId,
          title: gallery.title,
          artists: gallery.artists,
          galleryType: gallery.galleryType,
          imageCount: gallery.images ? gallery.images.length : 0
        }));
        localStorage.setItem('tadka_horizontal_galleries_meta', JSON.stringify(lightweightData));
      } catch (error) {
        console.warn('Failed to store horizontal galleries metadata in localStorage:', error);
      }
    }
  }, [horizontalGalleries]);

  // Main data fetching useEffect
  useEffect(() => {
    fetchCMSConfig();
    fetchArticles();
    fetchRelatedArticlesConfig();
    fetchAvailableArtists(); // Fetch available artists for gallery forms
    if (activeTab === 'releases') {
      fetchReleases(); // Use new pagination-enabled function
    }
  }, [selectedLanguage, selectedCategory, selectedContentType, selectedDateFilter, selectedStatus, selectedState, searchQuery, itemsPerPage, activeTab, releaseActiveTab, releasesItemsPerPage]);

  // Reset to page 1 when filters change (but not when page changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLanguage, selectedCategory, selectedContentType, selectedDateFilter, selectedStatus, searchQuery, itemsPerPage]);

  // Handle pagination without refetching all data
  useEffect(() => {
    if (allArticles.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageArticles = allArticles.slice(startIndex, endIndex);
      
      console.log('Updating page view:', {
        currentPage,
        startIndex,
        endIndex,
        articlesOnPage: currentPageArticles.length,
        totalArticles: allArticles.length
      });
      
      setArticles(currentPageArticles);
    }
  }, [currentPage, itemsPerPage, allArticles]);

  // Handle releases pagination
  useEffect(() => {
    const currentData = releaseActiveTab === 'theater' ? allTheaterReleases : allOttReleases;
    if (currentData.length > 0) {
      const startIndex = (releasesCurrentPage - 1) * releasesItemsPerPage;
      const endIndex = startIndex + releasesItemsPerPage;
      const currentPageData = currentData.slice(startIndex, endIndex);
      
      if (releaseActiveTab === 'theater') {
        setTheaterReleases(currentPageData);
      } else {
        setOttReleases(currentPageData);
      }
      
      setReleasesTotalCount(currentData.length);
      setReleasesTotalPages(Math.ceil(currentData.length / releasesItemsPerPage));
    }
  }, [releasesCurrentPage, releasesItemsPerPage, allTheaterReleases, allOttReleases, releaseActiveTab]);

  // Reset releases pagination when switching tabs
  useEffect(() => {
    setReleasesCurrentPage(1);
  }, [releaseActiveTab, selectedDateFilter, selectedReleaseLanguage, releasesItemsPerPage]);

  // Handle galleries pagination
  useEffect(() => {
    const filteredVerticalGalleries = verticalGalleries.filter(gallery => selectedArtist === '' || gallery.artist === selectedArtist);
    const filteredHorizontalGalleries = horizontalGalleries.filter(gallery => selectedHorizontalArtist === '' || gallery.artist === selectedHorizontalArtist);
    
    if (videoPostsActiveTab === 'vertical-gallery') {
      setGalleriesTotalCount(filteredVerticalGalleries.length);
      setGalleriesTotalPages(Math.ceil(filteredVerticalGalleries.length / galleriesItemsPerPage));
    } else if (videoPostsActiveTab === 'horizontal-gallery') {
      setGalleriesTotalCount(filteredHorizontalGalleries.length);
      setGalleriesTotalPages(Math.ceil(filteredHorizontalGalleries.length / galleriesItemsPerPage));
    }
  }, [galleriesCurrentPage, galleriesItemsPerPage, verticalGalleries, horizontalGalleries, videoPostsActiveTab, selectedArtist, selectedHorizontalArtist]);

  // Reset galleries pagination when switching tabs or changing filters
  useEffect(() => {
    setGalleriesCurrentPage(1);
  }, [videoPostsActiveTab, selectedArtist, selectedHorizontalArtist, galleriesItemsPerPage]);

  const fetchCMSConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/config`);
      const data = await response.json();
      setLanguages(data.languages);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching CMS config:', error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // For reliable pagination, let's fetch all articles and paginate on frontend
      const params = new URLSearchParams({
        language: selectedLanguage,
        limit: '1000' // Fetch a large number to get all articles
      });
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (selectedContentType) {
        params.append('content_type', selectedContentType);
      }
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      if (selectedState) {
        params.append('state', selectedState);
      }

      console.log('Fetching all articles with params:', params.toString());

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/articles?${params}`);
      let result = await response.json();
      
      console.log('Received result:', result);

      // Handle response format
      let allData = [];
      if (result.articles && Array.isArray(result.articles)) {
        allData = result.articles;
      } else if (Array.isArray(result)) {
        allData = result;
      } else {
        console.error('Unexpected response format:', result);
        allData = [];
      }
      
      // Apply content type filter
      if (selectedContentType) {
        allData = allData.filter(article => 
          article.content_type && article.content_type.toLowerCase() === selectedContentType.toLowerCase()
        );
        console.log(`Content type filter applied: ${allData.length} items`);
      }

      // Apply status filter
      if (selectedStatus) {
        allData = allData.filter(article => {
          if (selectedStatus === 'published') {
            return article.status === 'published' || !article.status;
          }
          return article.status && article.status.toLowerCase() === selectedStatus.toLowerCase();
        });
        console.log(`Status filter applied: ${allData.length} items`);
      }

      // Apply search filter (independent of other filters)
      if (searchQuery.trim()) {
        allData = allData.filter(article => 
          article.title && article.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
        console.log(`Search filter applied: ${allData.length} items matching "${searchQuery}"`);
      }
      
      // Apply date filter if selected
      if (selectedDateFilter && allData.length > 0) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const originalLength = allData.length;
        
        allData = allData.filter(article => {
          const publishDate = new Date(article.published_at || article.created_at);
          const publishDateOnly = new Date(publishDate.getFullYear(), publishDate.getMonth(), publishDate.getDate());
          const scheduleDate = article.scheduled_publish_at ? new Date(article.scheduled_publish_at) : null;
          const timeDiff = now - publishDate;
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          
          switch (selectedDateFilter) {
            case 'thisWeek':
              // This week means current week (Monday to Sunday)
              const currentWeekStart = new Date(today);
              const dayOfWeek = today.getDay();
              const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              currentWeekStart.setDate(today.getDate() - daysToMonday);
              
              // Calculate week end (Sunday)
              const currentWeekEnd = new Date(currentWeekStart);
              currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
              
              return publishDateOnly >= currentWeekStart && publishDateOnly <= currentWeekEnd;
            case 'today':
              return publishDateOnly.getTime() === today.getTime();
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return publishDateOnly.getTime() === yesterday.getTime();
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
            case 'future_scheduled':
              return scheduleDate && scheduleDate > now;
            default:
              return true;
          }
        });
        
        console.log(`Date filter applied: ${originalLength} -> ${allData.length} items`);
      }
      
      // Store all articles for pagination
      setAllArticles(allData);
      setTotalCount(allData.length);
      setTotalPages(Math.ceil(allData.length / itemsPerPage));
      
      // Calculate current page articles
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageArticles = allData.slice(startIndex, endIndex);
      
      console.log('Pagination:', {
        total: allData.length,
        currentPage,
        itemsPerPage,
        startIndex,
        endIndex,
        currentPageArticles: currentPageArticles.length
      });
      
      setArticles(currentPageArticles);
      
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setAllArticles([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticlesConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/related-articles-config`);
      const data = await response.json();
      console.log('Fetched related articles config:', data); // Debug log
      setRelatedArticlesConfig(data);
    } catch (error) {
      console.error('Error fetching related articles config:', error);
    }
  };

  // Release data fetching functions
  const fetchReleaseData = async () => {
    setReleaseLoading(true);
    try {
      // Fetch theater releases
      const theaterResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/theater-releases`);
      const theaterData = await theaterResponse.json();
      setTheaterReleases(theaterData);

      // Fetch OTT releases
      const ottResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/ott-releases`);
      const ottData = await ottResponse.json();
      setOttReleases(ottData);

      // Set default OTT platforms
      const defaultPlatforms = [
        "Netflix",
        "Prime Video", 
        "Disney+ Hotstar",
        "Zee5",
        "SonyLiv",
        "Voot",
        "ALTBalaji",
        "MX Player",
        "Eros Now",
        "Hoichoi",
        "Sun NXT",
        "Aha",
        "Apple TV+",
        "YouTube Premium",
        "Jio Cinema"
      ];

      // Set default movie banners (Indian and US production houses)
      const defaultBanners = [
        // Indian Production Houses
        "Yash Raj Films",
        "Dharma Productions",
        "Red Chillies Entertainment",
        "Excel Entertainment",
        "Phantom Films",
        "Balaji Motion Pictures",
        "T-Series",
        "Eros International",
        "UTV Motion Pictures",
        "Reliance Entertainment",
        "Rajshri Productions",
        "Viacom18 Motion Pictures",
        "Zee Studios",
        "Sony Pictures Networks India",
        "Mythri Movie Makers",
        "Geetha Arts",
        "Hombale Films",
        "UV Creations",
        // US Production Houses
        "Warner Bros Pictures",
        "Universal Pictures",
        "Sony Pictures",
        "Paramount Pictures",
        "20th Century Studios",
        "Walt Disney Pictures",
        "Columbia Pictures",
        "New Line Cinema",
        "Focus Features",
        "Lionsgate",
        "Marvel Studios",
        "Lucasfilm",
        "Metro-Goldwyn-Mayer"
      ];

      setOttPlatforms(defaultPlatforms);
      setAllOttPlatforms(defaultPlatforms);
      setAllBanners(defaultBanners);
    } catch (error) {
      console.error('Error fetching release data:', error);
      // Set defaults even on error
      const defaultPlatforms = [
        "Netflix", "Prime Video", "Disney+ Hotstar", "Zee5", "SonyLiv", "Voot",
        "ALTBalaji", "MX Player", "Eros Now", "Hoichoi", "Sun NXT", "Aha",
        "Apple TV+", "YouTube Premium", "Jio Cinema"
      ];
      
      const defaultBanners = [
        "Yash Raj Films", "Dharma Productions", "Red Chillies Entertainment", "Excel Entertainment",
        "T-Series", "Eros International", "Warner Bros Pictures", "Universal Pictures",
        "Sony Pictures", "Paramount Pictures", "20th Century Studios", "Walt Disney Pictures"
      ];
      
      setOttPlatforms(defaultPlatforms);
      setAllOttPlatforms(defaultPlatforms);
      setAllBanners(defaultBanners);
    } finally {
      setReleaseLoading(false);
    }
  };

  // Fetch releases with pagination
  const fetchReleases = async () => {
    setReleaseLoading(true);
    try {
      // Fetch theater releases
      const theaterResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/theater-releases?limit=1000`);
      let theaterData = await theaterResponse.json();
      
      // Fetch OTT releases
      const ottResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/ott-releases?limit=1000`);
      let ottData = await ottResponse.json();
      
      // Handle response format
      theaterData = Array.isArray(theaterData) ? theaterData : (theaterData.releases || []);
      ottData = Array.isArray(ottData) ? ottData : (ottData.releases || []);
      
      // Apply date filter if selected
      if (selectedDateFilter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisWeekEnd = new Date(thisWeekStart);
        thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
        const nextWeekStart = new Date(thisWeekEnd);
        nextWeekStart.setDate(thisWeekEnd.getDate() + 1);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        
        const filterByDate = (releases) => {
          return releases.filter(release => {
            const releaseDate = new Date(release.release_date);
            
            switch (selectedDateFilter) {
              case 'this-week':
                return releaseDate >= thisWeekStart && releaseDate <= thisWeekEnd;
              case 'next-week':
                return releaseDate >= nextWeekStart && releaseDate <= nextWeekEnd;
              case 'last-30-days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                return releaseDate >= thirtyDaysAgo && releaseDate <= today;
              default:
                return true;
            }
          });
        };
        
        theaterData = filterByDate(theaterData);
        ottData = filterByDate(ottData);
      }
      
      // Store all releases for pagination
      setAllTheaterReleases(theaterData);
      setAllOttReleases(ottData);
      
      // Set total counts
      setReleasesTotalCount(releaseActiveTab === 'theater' ? theaterData.length : ottData.length);
      setReleasesTotalPages(Math.ceil((releaseActiveTab === 'theater' ? theaterData.length : ottData.length) / releasesItemsPerPage));
      
      // Calculate current page data
      const currentData = releaseActiveTab === 'theater' ? theaterData : ottData;
      const startIndex = (releasesCurrentPage - 1) * releasesItemsPerPage;
      const endIndex = startIndex + releasesItemsPerPage;
      const currentPageData = currentData.slice(startIndex, endIndex);
      
      if (releaseActiveTab === 'theater') {
        setTheaterReleases(currentPageData);
      } else {
        setOttReleases(currentPageData);
      }
      
    } catch (error) {
      console.error('Error fetching releases:', error);
      setAllTheaterReleases([]);
      setAllOttReleases([]);
      setTheaterReleases([]);
      setOttReleases([]);
    } finally {
      setReleaseLoading(false);
    }
  };

  // Modal helper functions
  const showModal = (type, title, message, showConfirmation = false, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      showConfirmation,
      onConfirm
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      showConfirmation: false,
      onConfirm: null
    });
  };

  const saveRelatedArticlesConfig = async () => {
    if (!selectedPage) {
      showModal('warning', 'Page Required', 'Please select a page first.');
      return false;
    }

    if (selectedRelatedCategories.length === 0) {
      showModal('warning', 'Categories Required', 'Please select at least one category.');
      return false;
    }

    try {
      const configData = {
        page: selectedPage,
        categories: selectedRelatedCategories,
        articleCount: selectedArticleCount
      };

      console.log('Saving config data:', configData); // Debug log

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/related-articles-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });

      if (response.ok) {
        const action = editingRelatedConfig ? 'updated' : 'saved';
        showModal('success', 'Configuration Saved', `Related articles configuration has been ${action} successfully!`);
        
        // Update local state immediately
        setRelatedArticlesConfig(prev => ({
          ...prev,
          [selectedPage]: {
            categories: selectedRelatedCategories,
            articleCount: selectedArticleCount
          }
        }));
        
        // Also fetch from server to ensure consistency
        fetchRelatedArticlesConfig();
        
        // Reset form
        setSelectedPage('');
        setSelectedRelatedCategories([]);
        setSelectedArticleCount(5);
        setEditingRelatedConfig(null);
        
        return true;
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving related articles config:', error);
      showModal('error', 'Save Failed', 'Failed to save configuration. Please try again.');
      return false;
    }
  };

  const handlePageChange = (page) => {
    setSelectedPage(page);
    const config = relatedArticlesConfig[page];
    if (config) {
      setSelectedRelatedCategories(config.categories || []);
      setSelectedArticleCount(config.articleCount || 5);
    } else {
      setSelectedRelatedCategories([]);
      setSelectedArticleCount(5);
    }
  };

  const handleDeleteConfiguration = async (pageSlug) => {
    const pageName = websitePages.find(p => p.slug === pageSlug)?.name || pageSlug;
    
    showModal(
      'warning',
      'Delete Configuration',
      `Are you sure you want to delete the related articles configuration for "${pageName}"? This action cannot be undone.`,
      true,
      async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/related-articles-config/${pageSlug}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            showModal('success', 'Configuration Deleted', 'Configuration has been deleted successfully!');
            fetchRelatedArticlesConfig();
            // Reset selected page if it was the deleted one
            if (selectedPage === pageSlug) {
              setSelectedPage('');
              setSelectedRelatedCategories([]);
              setSelectedArticleCount(5);
            }
          } else {
            throw new Error('Failed to delete configuration');
          }
        } catch (error) {
          console.error('Error deleting configuration:', error);
          showModal('error', 'Delete Failed', 'Failed to delete configuration. Please try again.');
        }
      }
    );
  };

  // Related Posts Form handlers
  const handleRelatedFormCancel = () => {
    setShowRelatedForm(false);
    setEditingRelatedConfig(null);
    setSelectedPage('');
    setSelectedRelatedCategories([]);
    setSelectedArticleCount(5);
  };

  const handleEditRelatedConfig = (pageSlug, config) => {
    console.log('Editing config for:', pageSlug, 'with config:', config); // Debug log
    setEditingRelatedConfig(pageSlug);
    setSelectedPage(pageSlug);
    setSelectedRelatedCategories(config.categories || []);
    setSelectedArticleCount(config.articleCount || 5);
    setShowRelatedForm(true);
    console.log('Set selectedPage to:', pageSlug); // Debug log
  };

  // Release form handlers
  const handleTheaterFormSubmit = async (e) => {
    e.preventDefault();
    if (!theaterForm.movie_name || !theaterForm.release_date || !theaterForm.movie_banner) {
      showModal('warning', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('movie_name', theaterForm.movie_name);
      formData.append('release_date', theaterForm.release_date);
      formData.append('movie_banner', theaterForm.movie_banner);
      formData.append('language', theaterForm.language);
      
      if (!editingRelease) {
        formData.append('created_by', 'Current User'); // Replace with actual user
      }
      
      if (theaterForm.movie_image) {
        formData.append('movie_image', theaterForm.movie_image);
      }

      const url = editingRelease 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/cms/theater-releases/${editingRelease.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/cms/theater-releases`;
      
      const method = editingRelease ? 'PUT' : 'POST';

      console.log('Making theater release request:', {
        url,
        method,
        formData: Object.fromEntries(formData.entries())
      });

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      if (response.ok) {
        const action = editingRelease ? 'updated' : 'added';
        showModal('success', `Theater Release ${action.charAt(0).toUpperCase() + action.slice(1)}`, `Theater release has been ${action} successfully!`);
        setTheaterForm({ movie_name: '', release_date: '', movie_banner: '', language: 'Hindi', movie_image: null });
        handleCancelEdit();
        setShowTheaterForm(false); // Close the form page
        fetchReleaseData();
      } else {
        const errorText = await response.text();
        console.error('Theater Release Error Response:', response.status, errorText);
        throw new Error(`Failed to save theater release: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving theater release:', error);
      console.error('Error details:', error.message);
      const action = editingRelease ? 'update' : 'create';
      showModal('error', 'Save Failed', `Failed to ${action} theater release. Please try again. Error: ${error.message}`);
    }
  };

  const handleOttFormSubmit = async (e) => {
    e.preventDefault();
    if (!ottForm.movie_name || !ottForm.ott_platform || !ottForm.release_date) {
      showModal('warning', 'Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('movie_name', ottForm.movie_name);
      formData.append('ott_platform', ottForm.ott_platform);
      formData.append('language', ottForm.language);
      formData.append('release_date', ottForm.release_date);
      
      if (!editingRelease) {
        formData.append('created_by', 'Current User'); // Replace with actual user
      }
      
      if (ottForm.movie_image) {
        formData.append('movie_image', ottForm.movie_image);
      }

      const url = editingRelease 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/cms/ott-releases/${editingRelease.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/cms/ott-releases`;
      
      const method = editingRelease ? 'PUT' : 'POST';

      console.log('Making OTT release request:', {
        url,
        method,
        formData: Object.fromEntries(formData.entries())
      });

      const response = await fetch(url, {
        method: method,
        body: formData
      });

      if (response.ok) {
        const action = editingRelease ? 'updated' : 'added';
        showModal('success', `OTT Release ${action.charAt(0).toUpperCase() + action.slice(1)}`, `OTT release has been ${action} successfully!`);
        setOttForm({ movie_name: '', ott_platform: '', language: 'Hindi', release_date: '', movie_image: null });
        handleCancelEdit();
        setShowOttForm(false); // Close the form page
        fetchReleaseData();
      } else {
        const errorText = await response.text();
        console.error('OTT Release Error Response:', response.status, errorText);
        throw new Error(`Failed to save OTT release: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving OTT release:', error);
      console.error('Error details:', error.message);
      const action = editingRelease ? 'update' : 'create';
      showModal('error', 'Save Failed', `Failed to ${action} OTT release. Please try again. Error: ${error.message}`);
    }
  };

  const handleDeleteRelease = async (releaseId, releaseType) => {
    const releaseTypeText = releaseType === 'theater' ? 'Theater' : 'OTT';
    
    showModal(
      'warning',
      `Delete ${releaseTypeText} Release`,
      `Are you sure you want to delete this ${releaseTypeText.toLowerCase()} release? This action cannot be undone.`,
      true,
      async () => {
        try {
          const endpoint = releaseType === 'theater' ? 'theater-releases' : 'ott-releases';
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/${endpoint}/${releaseId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            showModal('success', 'Release Deleted', `${releaseTypeText} release has been deleted successfully!`);
            fetchReleaseData();
          } else {
            throw new Error(`Failed to delete ${releaseTypeText.toLowerCase()} release`);
          }
        } catch (error) {
          console.error(`Error deleting ${releaseTypeText.toLowerCase()} release:`, error);
          showModal('error', 'Delete Failed', `Failed to delete ${releaseTypeText.toLowerCase()} release. Please try again.`);
        }
      }
    );
  };

  // Custom platform handlers
  const handleAddCustomPlatform = () => {
    if (customPlatform.trim() && !allOttPlatforms.includes(customPlatform.trim())) {
      const newPlatforms = [...allOttPlatforms, customPlatform.trim()];
      setAllOttPlatforms(newPlatforms);
      setOttPlatforms(newPlatforms);
      setOttForm({...ottForm, ott_platform: customPlatform.trim()});
      setCustomPlatform('');
      setShowCustomPlatform(false);
    }
  };

  const handlePlatformSelect = (platform) => {
    if (platform === 'add_custom') {
      setShowCustomPlatform(true);
    } else {
      setOttForm({...ottForm, ott_platform: platform});
      setShowCustomPlatform(false);
    }
  };

  // Custom banner handlers
  const handleAddCustomBanner = () => {
    if (customBanner.trim() && !allBanners.includes(customBanner.trim())) {
      const newBanners = [...allBanners, customBanner.trim()];
      setAllBanners(newBanners);
      setTheaterForm({...theaterForm, movie_banner: customBanner.trim()});
      setCustomBanner('');
      setShowCustomBanner(false);
    }
  };

  const handleBannerSelect = (banner) => {
    if (banner === 'add_custom') {
      setShowCustomBanner(true);
    } else {
      setTheaterForm({...theaterForm, movie_banner: banner});
      setShowCustomBanner(false);
    }
  };

  // Edit handlers
  const handleEditRelease = (release, type) => {
    setEditingRelease(release);
    setEditingType(type);
    
    if (type === 'theater') {
      setTheaterForm({
        movie_name: release.movie_name,
        release_date: release.release_date,
        movie_banner: release.movie_banner || '',
        language: release.language || 'Hindi',
        movie_image: null
      });
    } else {
      setOttForm({
        movie_name: release.movie_name,
        ott_platform: release.ott_platform,
        language: release.language || 'Hindi',
        release_date: release.release_date,
        movie_image: null
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRelease(null);
    setEditingType(null);
    setTheaterForm({ movie_name: '', release_date: '', movie_banner: '', language: 'Hindi', movie_image: null });
    setOttForm({ movie_name: '', ott_platform: '', language: 'Hindi', release_date: '', movie_image: null });
  };

  // Language options

  // Get available pages (exclude already configured ones)
  const getAvailablePages = (includeEditing = false) => {
    const configuredPages = Object.keys(relatedArticlesConfig);
    if (includeEditing && editingRelatedConfig) {
      // When editing, include the page being edited in available options
      return websitePages.filter(page => 
        !configuredPages.includes(page.slug) || page.slug === editingRelatedConfig
      );
    }
    return websitePages.filter(page => !configuredPages.includes(page.slug));
  };

  const handleCategoryToggle = (categorySlug) => {
    setSelectedRelatedCategories(prev => {
      if (prev.includes(categorySlug)) {
        return prev.filter(c => c !== categorySlug);
      } else {
        return [...prev, categorySlug];
      }
    });
  };

  const handleDeleteArticle = async (articleId) => {
    const article = articles.find(a => a.id === articleId);
    const articleTitle = article?.title || 'this article';
    
    showModal(
      'warning',
      'Delete Article',
      `Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`,
      true,
      async () => {
        try {
          await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/articles/${articleId}`, {
            method: 'DELETE'
          });
          // Removed the success modal - just refresh the list
          fetchArticles(); // Refresh list
        } catch (error) {
          console.error('Error deleting article:', error);
          showModal('error', 'Delete Failed', 'Failed to delete article. Please try again.');
        }
      }
    );
  };

  // Topic management handlers
  const handleManageTopics = async (article) => {
    setSelectedArticleForTopics(article);
    
    // Load existing topics for this article
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${article.id}/topics`);
      if (response.ok) {
        const topics = await response.json();
        setArticleTopics(topics);
      } else {
        setArticleTopics([]);
      }
    } catch (error) {
      console.error('Error loading article topics:', error);
      setArticleTopics([]);
    }
    
    setShowTopicModal(true);
  };

  const handleTopicModalClose = () => {
    setShowTopicModal(false);
    setSelectedArticleForTopics(null);
    setArticleTopics([]);
  };

  // Related videos management handlers
  const handleManageRelatedVideos = async (article) => {
    setSelectedArticleForRelatedVideos(article);
    setShowRelatedVideosModal(true);
  };

  const handleCloseRelatedVideosModal = () => {
    setShowRelatedVideosModal(false);
    setSelectedArticleForRelatedVideos(null);
  };

  const handleSaveRelatedVideos = (relatedVideos) => {
    // Refresh articles list to show updated related videos count
    fetchArticles();
  };

  const handleTopicAssociation = async (topicId, isAssociated) => {
    if (!selectedArticleForTopics) return;

    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/topics/${topicId}/articles/${selectedArticleForTopics.id}`;
      const method = isAssociated ? 'DELETE' : 'POST';

      const response = await fetch(url, { method });
      
      if (response.ok) {
        // Reload article topics
        const topicsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles/${selectedArticleForTopics.id}/topics`);
        if (topicsResponse.ok) {
          const updatedTopics = await topicsResponse.json();
          setArticleTopics(updatedTopics);
        }
      } else {
        showModal('error', 'Association Failed', `Failed to ${isAssociated ? 'remove' : 'add'} topic association.`);
      }
    } catch (error) {
      console.error('Error managing topic association:', error);
      showModal('error', 'Association Failed', `Failed to ${isAssociated ? 'remove' : 'add'} topic association.`);
    }
  };

  // Gallery data fetching
  const fetchGalleries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries`);
      if (response.ok) {
        const galleries = await response.json();
        
        // Separate galleries by type and add compatibility fields
        const vertical = galleries
          .filter(g => g.gallery_type === 'vertical')
          .map(g => ({
            ...g,
            artist: g.artists && g.artists.length > 0 ? g.artists[0] : '',
            createdAt: g.created_at,
            updatedAt: g.updated_at
          }));
          
        const horizontal = galleries
          .filter(g => g.gallery_type === 'horizontal')
          .map(g => ({
            ...g,
            artist: g.artists && g.artists.length > 0 ? g.artists[0] : '',
            name: g.artists && g.artists.length > 0 ? g.artists[0] : '', // Legacy compatibility
            createdAt: g.created_at,
            updatedAt: g.updated_at
          }));
        
        setVerticalGalleries(vertical);
        setHorizontalGalleries(horizontal);
        
        console.log('Loaded galleries from backend:', { vertical: vertical.length, horizontal: horizontal.length });
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      // Fallback to localStorage if backend fails
      loadGalleriesFromLocalStorage();
    }
  };

  const loadGalleriesFromLocalStorage = () => {
    // Try to load lightweight metadata instead of full gallery objects
    const savedVerticalGalleries = localStorage.getItem('tadka_vertical_galleries_meta');
    const savedHorizontalGalleries = localStorage.getItem('tadka_horizontal_galleries_meta');
    
    if (savedVerticalGalleries) {
      try {
        const lightweightData = JSON.parse(savedVerticalGalleries);
        // Convert lightweight data back to basic gallery format (without images)
        const basicGalleries = lightweightData.map(meta => ({
          id: meta.id,
          galleryId: meta.galleryId,
          title: meta.title,
          artists: meta.artists,
          galleryType: meta.galleryType,
          images: [], // Empty images array since we only stored metadata
          imageCount: meta.imageCount || 0
        }));
        setVerticalGalleries(basicGalleries);
        console.log('Loaded vertical galleries metadata from localStorage:', basicGalleries.length);
      } catch (error) {
        console.error('Error loading vertical galleries metadata from localStorage:', error);
        // Try fallback to old format (but it might cause quota issues)
        const oldFormat = localStorage.getItem('tadka_vertical_galleries');
        if (oldFormat) {
          try {
            setVerticalGalleries(JSON.parse(oldFormat));
          } catch (oldError) {
            console.error('Error with old format too:', oldError);
          }
        }
      }
    }
    
    if (savedHorizontalGalleries) {
      try {
        const lightweightData = JSON.parse(savedHorizontalGalleries);
        // Convert lightweight data back to basic gallery format (without images)
        const basicGalleries = lightweightData.map(meta => ({
          id: meta.id,
          galleryId: meta.galleryId,
          title: meta.title,
          artists: meta.artists,
          galleryType: meta.galleryType,
          images: [], // Empty images array since we only stored metadata
          imageCount: meta.imageCount || 0
        }));
        setHorizontalGalleries(basicGalleries);
        console.log('Loaded horizontal galleries metadata from localStorage:', basicGalleries.length);
      } catch (error) {
        console.error('Error loading horizontal galleries metadata from localStorage:', error);
        // Try fallback to old format (but it might cause quota issues)
        const oldFormat = localStorage.getItem('tadka_horizontal_galleries');
        if (oldFormat) {
          try {
            setHorizontalGalleries(JSON.parse(oldFormat));
          } catch (oldError) {
            console.error('Error with old format too:', oldError);
          }
        }
      }
    }
  };

  // Artist management functions for galleries
  const fetchAvailableArtists = async () => {
    try {
      const artists = [];
      
      // Fetch artists from existing posts
      const articlesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/articles`);
      if (articlesResponse.ok) {
        const articles = await articlesResponse.json();
        
        // Extract artists from posts
        articles.forEach(article => {
          if (article.artists) {
            try {
              const articleArtists = JSON.parse(article.artists);
              artists.push(...articleArtists);
            } catch (e) {
              // Skip if JSON parsing fails
            }
          }
        });
      }
      
      // Fetch artists from existing galleries
      const galleriesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries`);
      if (galleriesResponse.ok) {
        const galleries = await galleriesResponse.json();
        
        // Extract artists from galleries
        galleries.forEach(gallery => {
          if (gallery.artists && Array.isArray(gallery.artists)) {
            artists.push(...gallery.artists);
          }
        });
      }
      
      // Remove duplicates and set
      const uniqueArtists = [...new Set(artists)].filter(artist => artist && artist.trim());
      setAvailableArtists(uniqueArtists);
      console.log('Available artists loaded:', uniqueArtists); // Debug log
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const handleGalleryArtistAdd = () => {
    if (newGalleryArtist.trim() && !availableArtists.includes(newGalleryArtist.trim())) {
      const newArtist = newGalleryArtist.trim();
      setAvailableArtists(prev => [...prev, newArtist]);
      setSelectedGalleryArtist(newArtist); // Set as selected artist
      setNewGalleryArtist('');
      setShowGalleryArtistModal(false);
    }
  };

  const handleHorizontalGalleryArtistAdd = () => {
    if (newHorizontalGalleryArtist.trim() && !availableArtists.includes(newHorizontalGalleryArtist.trim())) {
      const newArtist = newHorizontalGalleryArtist.trim();
      setAvailableArtists(prev => [...prev, newArtist]);
      setSelectedHorizontalGalleryArtist(newArtist); // Set as selected artist
      setNewHorizontalGalleryArtist('');
      setShowHorizontalGalleryArtistModal(false);
    }
  };

  // Gallery topic management functions
  const handleGalleryTopicsManagement = async (gallery) => {
    setSelectedGalleryForTopics(gallery);
    setShowGalleryTopicModal(true);
    
    // Fetch topics associated with this gallery using the database ID
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries/${gallery.id}/topics`);
      if (response.ok) {
        const topics = await response.json();
        setGalleryTopics(topics);
      } else {
        console.error('Failed to fetch gallery topics');
        setGalleryTopics([]);
      }
    } catch (error) {
      console.error('Error fetching gallery topics:', error);
      setGalleryTopics([]);
    }
  };

  const handleGalleryTopicAssociation = async (topicId, isAssociated) => {
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/topics/${topicId}/galleries/${selectedGalleryForTopics.id}`;
      const method = isAssociated ? 'DELETE' : 'POST';

      const response = await fetch(url, { method });
      
      if (response.ok) {
        if (isAssociated) {
          // Remove topic from gallery topics
          setGalleryTopics(prev => prev.filter(topic => topic.id !== topicId));
          showModal('success', 'Topic Removed', 'Topic has been removed from gallery successfully.');
        } else {
          // Add topic to gallery topics (fetch the topic first)
          const topicResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/topics/${topicId}`);
          if (topicResponse.ok) {
            const topic = await topicResponse.json();
            setGalleryTopics(prev => [...prev, topic]);
            showModal('success', 'Topic Added', 'Topic has been added to gallery successfully.');
          } else {
            showModal('error', 'Association Failed', 'Failed to fetch topic details.');
          }
        }
      } else {
        showModal('error', 'Association Failed', `Failed to ${isAssociated ? 'remove' : 'add'} topic association.`);
      }
    } catch (error) {
      console.error('Error managing gallery topic association:', error);
      showModal('error', 'Association Failed', `Failed to ${isAssociated ? 'remove' : 'add'} topic association.`);
    }
  };

  // Gallery management functions
  const generateGalleryId = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `VIG-${timestamp}-${randomSuffix}`;
  };

  const handleCreateGallery = () => {
    setShowGalleryForm(true);
    setEditingGallery(null);
    setGalleryForm({
      title: '',
      images: []
    });
    setSelectedGalleryArtist('');
  };

  const handleEditGallery = (gallery) => {
    setShowGalleryForm(true);
    setEditingGallery(gallery);
    setGalleryForm({
      title: gallery.title,
      images: [...gallery.images]
    });
    
    // Set selected artist for editing - handle artists array
    if (gallery.artists && gallery.artists.length > 0) {
      setSelectedGalleryArtist(gallery.artists[0]); // Take first artist
    } else {
      setSelectedGalleryArtist('');
    }
    
    // Ensure artists are fetched for the dropdown
    if (availableArtists.length === 0) {
      fetchAvailableArtists();
    }
  };

  const handleDeleteGallery = async (galleryId) => {
    const gallery = verticalGalleries.find(g => g.id === galleryId);
    const galleryTitle = gallery?.title || 'this gallery';
    
    showModal(
      'warning',
      'Delete Gallery',
      `Are you sure you want to delete "${galleryTitle}"? This action cannot be undone.`,
      true,
      async () => {
        try {
          // Delete from backend using gallery_id
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries/${gallery.gallery_id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Remove from local state
            setVerticalGalleries(prev => prev.filter(g => g.id !== galleryId));
            showModal('success', 'Gallery Deleted', 'Gallery has been deleted successfully!');
          } else {
            throw new Error('Failed to delete gallery from server');
          }
        } catch (error) {
          console.error('Error deleting gallery:', error);
          showModal('error', 'Delete Failed', 'Failed to delete gallery. Please try again.');
        }
      }
    );
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            data: e.target.result,
            size: file.size
          };
          setGalleryForm(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageDelete = (imageId) => {
    setGalleryForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.title || !selectedGalleryArtist || galleryForm.images.length === 0) {
      showModal('warning', 'Missing Fields', 'Please fill in all required fields, select an artist, and upload at least one image.');
      return;
    }

    try {
      const galleryData = {
        gallery_id: editingGallery ? editingGallery.gallery_id : generateGalleryId(),
        title: galleryForm.title,
        artists: [selectedGalleryArtist], // Single artist as array for backend compatibility
        images: galleryForm.images,
        gallery_type: "vertical"
      };

      if (editingGallery) {
        // Update existing gallery via API
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries/${editingGallery.gallery_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: galleryData.title,
            artists: galleryData.artists,
            images: galleryData.images,
            gallery_type: galleryData.gallery_type
          }),
        });

        if (response.ok) {
          const updatedGallery = await response.json();
          // Update local state
          setVerticalGalleries(prev => prev.map(g => 
            g.gallery_id === editingGallery.gallery_id 
              ? { ...updatedGallery, id: updatedGallery.id, artist: selectedGalleryArtist }
              : g
          ));
          showModal('success', 'Gallery Updated', 'Gallery has been updated successfully!');
        } else {
          throw new Error('Failed to update gallery');
        }
      } else {
        // Create new gallery via API
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(galleryData),
        });

        if (response.ok) {
          const newGallery = await response.json();
          // Add to local state with compatibility fields
          const galleryForState = {
            ...newGallery,
            artist: selectedGalleryArtist, // For compatibility with current frontend
            createdAt: newGallery.created_at,
            updatedAt: newGallery.updated_at
          };
          setVerticalGalleries(prev => [...prev, galleryForState]);
          showModal('success', 'Gallery Created', `Gallery has been created successfully! ID: ${galleryData.gallery_id}`);
        } else {
          throw new Error('Failed to create gallery');
        }
      }

      setShowGalleryForm(false);
      setEditingGallery(null);
      setGalleryForm({ title: '', images: [] });
      setSelectedGalleryArtist('');
    } catch (error) {
      console.error('Error saving gallery:', error);
      showModal('error', 'Save Failed', 'Failed to save gallery. Please try again.');
    }
  };

  const handleGalleryFormCancel = () => {
    setShowGalleryForm(false);
    setEditingGallery(null);
    setGalleryForm({ title: '', images: [] });
    setSelectedGalleryArtist('');
  };

  // Horizontal Gallery management functions
  const generateHorizontalGalleryId = () => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `HIG-${timestamp}-${randomSuffix}`;
  };

  const handleCreateHorizontalGallery = () => {
    setShowHorizontalGalleryForm(true);
    setEditingHorizontalGallery(null);
    setHorizontalGalleryForm({
      title: '',
      images: []
    });
    setSelectedHorizontalGalleryArtist('');
  };

  const handleEditHorizontalGallery = (gallery) => {
    setShowHorizontalGalleryForm(true);
    setEditingHorizontalGallery(gallery);
    setHorizontalGalleryForm({
      title: gallery.title,
      images: [...gallery.images]
    });
    
    // Set selected artist for editing - handle artists array
    if (gallery.artists && gallery.artists.length > 0) {
      setSelectedHorizontalGalleryArtist(gallery.artists[0]); // Take first artist
    } else {
      setSelectedHorizontalGalleryArtist('');
    }
    
    // Ensure artists are fetched for the dropdown
    if (availableArtists.length === 0) {
      fetchAvailableArtists();
    }
  };

  const handleDeleteHorizontalGallery = async (galleryId) => {
    const gallery = horizontalGalleries.find(g => g.id === galleryId);
    const galleryTitle = gallery?.title || 'this gallery';
    
    showModal(
      'warning',
      'Delete Gallery',
      `Are you sure you want to delete "${galleryTitle}"? This action cannot be undone.`,
      true,
      async () => {
        try {
          // Delete from backend using gallery_id
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries/${gallery.gallery_id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            // Remove from local state
            setHorizontalGalleries(prev => prev.filter(g => g.id !== galleryId));
            showModal('success', 'Gallery Deleted', 'Gallery has been deleted successfully!');
          } else {
            throw new Error('Failed to delete horizontal gallery from server');
          }
        } catch (error) {
          console.error('Error deleting horizontal gallery:', error);
          showModal('error', 'Delete Failed', 'Failed to delete gallery. Please try again.');
        }
      }
    );
  };

  const handleHorizontalImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            data: e.target.result,
            size: file.size
          };
          setHorizontalGalleryForm(prev => ({
            ...prev,
            images: [...prev.images, newImage]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleHorizontalImageDelete = (imageId) => {
    setHorizontalGalleryForm(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleHorizontalGallerySubmit = async (e) => {
    e.preventDefault();
    if (!horizontalGalleryForm.title || !selectedHorizontalGalleryArtist || horizontalGalleryForm.images.length === 0) {
      showModal('warning', 'Missing Fields', 'Please fill in all required fields, select an artist, and upload at least one image.');
      return;
    }

    try {
      const galleryData = {
        gallery_id: editingHorizontalGallery ? editingHorizontalGallery.gallery_id : generateHorizontalGalleryId(),
        title: horizontalGalleryForm.title,
        artists: [selectedHorizontalGalleryArtist], // Single artist as array for backend compatibility
        images: horizontalGalleryForm.images,
        gallery_type: "horizontal"
      };

      if (editingHorizontalGallery) {
        // Update existing gallery via API
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries/${editingHorizontalGallery.gallery_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: galleryData.title,
            artists: galleryData.artists,
            images: galleryData.images,
            gallery_type: galleryData.gallery_type
          }),
        });

        if (response.ok) {
          const updatedGallery = await response.json();
          // Update local state
          setHorizontalGalleries(prev => prev.map(g => 
            g.gallery_id === editingHorizontalGallery.gallery_id 
              ? { ...updatedGallery, id: updatedGallery.id, artist: selectedHorizontalGalleryArtist, name: selectedHorizontalGalleryArtist }
              : g
          ));
          showModal('success', 'Gallery Updated', 'Gallery has been updated successfully!');
        } else {
          throw new Error('Failed to update horizontal gallery');
        }
      } else {
        // Create new gallery via API
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(galleryData),
        });

        if (response.ok) {
          const newGallery = await response.json();
          // Add to local state with compatibility fields
          const galleryForState = {
            ...newGallery,
            artist: selectedHorizontalGalleryArtist, // For compatibility with current frontend
            name: selectedHorizontalGalleryArtist, // Legacy compatibility
            createdAt: newGallery.created_at,
            updatedAt: newGallery.updated_at
          };
          setHorizontalGalleries(prev => [...prev, galleryForState]);
          showModal('success', 'Gallery Created', `Gallery has been created successfully! ID: ${galleryData.gallery_id}`);
        } else {
          throw new Error('Failed to create horizontal gallery');
        }
      }

      setShowHorizontalGalleryForm(false);
      setEditingHorizontalGallery(null);
      setHorizontalGalleryForm({ title: '', images: [] });
      setSelectedHorizontalGalleryArtist('');
    } catch (error) {
      console.error('Error saving horizontal gallery:', error);
      showModal('error', 'Save Failed', 'Failed to save gallery. Please try again.');
    }
  };

  const handleHorizontalGalleryFormCancel = () => {
    setShowHorizontalGalleryForm(false);
    setEditingHorizontalGallery(null);
    setHorizontalGalleryForm({ title: '', images: [] });
    setSelectedHorizontalGalleryArtist('');
  };

  // Theater Release form page functions
  const handleCreateTheaterRelease = () => {
    setShowTheaterForm(true);
    setEditingRelease(null);
    setEditingType(null);
    setTheaterForm({
      movie_name: '',
      release_date: '',
      movie_banner: '',
      language: 'Hindi',
      movie_image: null
    });
  };

  const handleTheaterFormCancel = () => {
    setShowTheaterForm(false);
    setEditingRelease(null);
    setEditingType(null);
    setTheaterForm({
      movie_name: '',
      release_date: '',
      movie_banner: '',
      language: 'Hindi',
      movie_image: null
    });
  };

  // OTT Release form page functions
  const handleCreateOttRelease = () => {
    setShowOttForm(true);
    setEditingRelease(null);
    setEditingType(null);
    setOttForm({
      movie_name: '',
      release_date: '',
      ott_platform: '',
      language: 'Hindi',
      movie_image: null
    });
  };

  const handleOttFormCancel = () => {
    setShowOttForm(false);
    setEditingRelease(null);
    setEditingType(null);
    setOttForm({
      movie_name: '',
      release_date: '',
      ott_platform: '',
      language: 'Hindi',
      movie_image: null
    });
  };

  const handleEditOttRelease = (release) => {
    setShowOttForm(true);
    setEditingRelease(release);
    setEditingType('ott');
    setOttForm({
      movie_name: release.movie_name,
      release_date: release.release_date,
      ott_platform: release.ott_platform,
      language: release.language,
      movie_image: null
    });
  };

  const handleDeleteOttRelease = (releaseId) => {
    const release = ottReleases.find(r => r.id === releaseId);
    const movieName = release?.movie_name || 'this release';
    
    showModal(
      'warning',
      'Delete OTT Release',
      `Are you sure you want to delete "${movieName}"? This action cannot be undone.`,
      true,
      async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/ott-releases/${releaseId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setOttReleases(prev => prev.filter(r => r.id !== releaseId));
            showModal('success', 'Release Deleted', 'OTT release has been deleted successfully!');
          } else {
            throw new Error('Failed to delete OTT release');
          }
        } catch (error) {
          console.error('Error deleting OTT release:', error);
          showModal('error', 'Delete Failed', 'Failed to delete OTT release. Please try again.');
        }
      }
    );
  };

  // Theater Release Edit/Delete handlers
  const handleEditTheaterRelease = (release) => {
    setShowTheaterForm(true);
    setEditingRelease(release);
    setEditingType('theater');
    setTheaterForm({
      movie_name: release.movie_name,
      release_date: release.release_date,
      movie_banner: release.movie_banner,
      language: release.language,
      movie_image: null
    });
  };

  const handleDeleteTheaterRelease = (releaseId) => {
    const release = theaterReleases.find(r => r.id === releaseId);
    const movieName = release?.movie_name || 'this release';
    
    showModal(
      'warning',
      'Delete Theater Release',
      `Are you sure you want to delete "${movieName}"? This action cannot be undone.`,
      true,
      async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/theater-releases/${releaseId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setTheaterReleases(prev => prev.filter(r => r.id !== releaseId));
            showModal('success', 'Release Deleted', 'Theater release has been deleted successfully!');
          } else {
            throw new Error('Failed to delete theater release');
          }
        } catch (error) {
          console.error('Error deleting theater release:', error);
          showModal('error', 'Delete Failed', 'Failed to delete theater release. Please try again.');
        }
      }
    );
  };

  // Date filtering function
  const filterReleasesByDate = (releases) => {
    if (!selectedDateFilter) return releases;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    return releases.filter(release => {
      const releaseDate = new Date(release.release_date);
      const releaseDateOnly = new Date(releaseDate.getFullYear(), releaseDate.getMonth(), releaseDate.getDate());
      
      switch (selectedDateFilter) {
        case 'this-week':
          return releaseDate >= startOfWeek && releaseDate <= endOfWeek;
        case 'next-week':
          const nextWeekStart = new Date(endOfWeek);
          nextWeekStart.setDate(nextWeekStart.getDate() + 1);
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
          return releaseDate >= nextWeekStart && releaseDate <= nextWeekEnd;
        case 'next-30-days':
          const next30 = new Date();
          next30.setDate(next30.getDate() + 30);
          return releaseDate >= new Date() && releaseDate <= next30;
        case 'future-dates':
          return releaseDateOnly > today;
        case 'last-30-days':
          const last30 = new Date();
          last30.setDate(last30.getDate() - 30);
          return releaseDate >= last30 && releaseDate <= new Date();
        case 'last-3-months':
          const last3Months = new Date();
          last3Months.setMonth(last3Months.getMonth() - 3);
          return releaseDate >= last3Months && releaseDate <= new Date();
        case 'last-6-months':
          const last6Months = new Date();
          last6Months.setMonth(last6Months.getMonth() - 6);
          return releaseDate >= last6Months && releaseDate <= new Date();
        case 'last-1-year':
          const lastYear = new Date();
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          return releaseDate >= lastYear && releaseDate <= new Date();
        default:
          return true;
      }
    });
  };

  // Language filtering function for releases
  const filterReleasesByLanguage = (releases) => {
    if (!selectedReleaseLanguage) return releases;
    return releases.filter(release => 
      release.language && release.language.toLowerCase() === selectedReleaseLanguage.toLowerCase()
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Draft';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-5xl-plus mx-auto px-8">
        {/* Page Title */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-gray-900 text-left">Manage Content</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('releases')}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'releases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Movie Releases
              </button>
              <button
                onClick={() => setActiveTab('video-posts')}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'video-posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Image Galleries
              </button>
              <button
                onClick={() => setActiveTab('related')}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'related'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Related Posts
              </button>
              <button
                onClick={() => setActiveTab('topics')}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'topics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Topics
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <>
            {/* Header with Filters - Sticky */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sticky top-16 z-40">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="space-y-3">
                  {/* First Row: Main Filters and Create Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <select
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {languages
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(lang => (
                            <option key={lang.code} value={lang.code}>
                              {lang.code === 'en' ? lang.name : `${lang.name} (${lang.native_name})`}
                            </option>
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
                          {categories
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(cat => (
                            <option key={cat.slug} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <select
                          value={selectedContentType}
                          onChange={(e) => setSelectedContentType(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Content Types</option>
                          <option value="movie_review">Movie Review</option>
                          <option value="photo">Photo Gallery</option>
                          <option value="post">Post</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      
                      <div>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Status</option>
                          <option value="approved">Approved</option>
                          <option value="draft">Draft</option>
                          <option value="in_review">In Review</option>
                          <option value="published">Published</option>
                          <option value="scheduled">Scheduled</option>
                        </select>
                      </div>
                      
                      <div>
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All States</option>
                          {getStateNames().map(stateName => (
                            <option key={stateName} value={stateName}>
                              {stateName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <Link
                      to="/cms/create"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      + Create New Post
                    </Link>
                  </div>

                  {/* Second Row: Search and Date Filter */}
                  <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts by name..."
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                      />
                    </div>
                    
                    {/* Date Filter */}
                    <div>
                      <select
                        value={selectedDateFilter}
                        onChange={(e) => setSelectedDateFilter(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Dates</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="thisWeek">This Week</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="quarter">Last 3 Months</option>
                        <option value="halfYear">Last 6 Months</option>
                        <option value="year">Last Year</option>
                        <option value="future_scheduled">Future Scheduled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Table - Fixed Structure */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading articles...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No articles found for the selected filters.
                </div>
              ) : (
                <div>
                  {/* Sticky Table Header */}
                  <div className="bg-gray-50 sticky top-28 z-30 border-b border-gray-200 shadow-sm px-4 py-3 overflow-x-auto min-w-full">
                    <div className="grid grid-cols-12 gap-4 min-w-[800px]">
                      <div className="col-span-5 text-left">
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">POST</span>
                      </div>
                      <div className="col-span-4 text-left">
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">DETAILS</span>
                      </div>
                      <div className="col-span-3 text-left">
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Articles List */}
                  <div className="divide-y divide-gray-200 overflow-x-auto">
                    {articles.map((article, index) => (
                      <div 
                        key={article.id} 
                        className={`grid grid-cols-12 gap-4 px-4 py-4 min-w-[800px] ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-gray-100 transition-colors duration-150`}
                      >
                        {/* Post Column */}
                        <div className="col-span-5">
                          <div className="text-left">
                            <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 mb-1 text-left">
                              <Link to={`/cms/edit/${article.id}`}>
                                {article.title}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs text-left">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                {categories.find(c => c.slug === article.category)?.name || article.category}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {languages.find(l => l.code === article.language)?.native_name || article.language}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                {article.content_type === 'video' ? 'Video' : 
                                 article.content_type === 'photo' ? 'Photo Gallery' : 
                                 article.content_type === 'movie_review' ? 'Movie Review' : 
                                 'Post'}
                              </span>
                              {article.is_featured && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                  💰 Sponsored
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                                article.is_published 
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : article.is_scheduled
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}>
                                {article.is_published 
                                  ? 'Published' 
                                  : article.is_scheduled 
                                    ? 'Scheduled' 
                                    : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Details Column */}
                        <div className="col-span-4">
                          <div className="space-y-1 text-left">
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
                                By {article.author}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200">
                                {article.is_scheduled 
                                  ? `Scheduled: ${formatDate(article.scheduled_publish_at)}`
                                  : formatDate(article.published_at)
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions Column */}
                        <div className="col-span-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleManageTopics(article)}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                            >
                              Topics
                            </button>
                            {/* Show Related Videos button only for video articles */}
                            {article.youtube_url && (
                              <button
                                onClick={() => handleManageRelatedVideos(article)}
                                className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded border border-purple-200 hover:bg-purple-50"
                                title="Manage Related Videos"
                              >
                                Related Videos
                              </button>
                            )}
                            <Link
                              to={`/cms/edit/${article.id}`}
                              className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/cms/preview/${article.id}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded border border-green-200 hover:bg-green-50"
                            >
                              Preview
                            </Link>
                            <button
                              onClick={() => handleDeleteArticle(article.id, article.title)}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination and Items Per Page */}
            {!loading && articles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Items per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-sm text-gray-700">
                      posts per page (showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount})
                    </span>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 text-sm rounded-md border ${
                          currentPage === 1
                            ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                              onClick={() => {
                                console.log('Clicking page:', pageNum, 'Current page:', currentPage);
                                setCurrentPage(pageNum);
                              }}
                              className={`px-3 py-1 text-sm rounded-md border ${
                                currentPage === pageNum
                                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 text-sm rounded-md border ${
                          currentPage === totalPages
                            ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Manage Related Articles Tab */}
        {/* Manage Related Articles Tab */}
        {activeTab === 'related' && (
          <>
            {/* Related Posts List View */}
            {!showRelatedForm && (
              <div className="space-y-6">
                {/* Header Section - Fixed positioning like posts list */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Header with light grey background */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                    <h2 className="text-lg font-medium text-gray-900 text-left">
                      Related Posts Configuration
                    </h2>
                  </div>

                  {/* Filter and Create Button Section - Sticky like posts */}
                  <div className="bg-white p-4 border-b border-gray-200 sticky top-16 z-40">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {/* Page Filter */}
                        <div>
                          <select
                            value=""
                            onChange={(e) => {
                              // Filter functionality can be added here if needed
                            }}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">All Pages</option>
                            {getAvailablePages().map(page => (
                              <option key={page.slug} value={page.slug}>
                                {page.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Create Related Posts Button */}
                      <button
                        onClick={() => setShowRelatedForm(true)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Create Related Posts
                      </button>
                    </div>
                  </div>

                  {/* Related Posts List */}
                  {(() => {
                    console.log('Current relatedArticlesConfig:', relatedArticlesConfig); // Debug log
                    return Object.keys(relatedArticlesConfig).length === 0;
                  })() ? (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Related Posts Configured</h3>
                      <p className="text-gray-500 mb-4">Create your first related posts configuration to get started.</p>
                    </div>
                  ) : (
                    <>
                      {/* Table Header - Sticky like posts list */}
                      <div className="bg-gray-50 grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-28 z-30 border-b border-gray-200">
                        <div className="col-span-3 text-left">PAGE</div>
                        <div className="col-span-4 text-left">CATEGORIES</div>
                        <div className="col-span-2 text-left">ARTICLES PER CATEGORY</div>
                        <div className="col-span-3 text-right">ACTIONS</div>
                      </div>
                      
                      {/* Table Content */}
                      <div className="divide-y divide-gray-200">
                        {Object.entries(relatedArticlesConfig).map(([pageSlug, config], index) => (
                          <div 
                            key={pageSlug}
                            className={`grid grid-cols-12 gap-4 px-6 py-4 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-gray-100 transition-colors duration-150`}
                          >
                            <div className="col-span-3 flex items-center">
                              <div className="text-left">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {websitePages.find(p => p.slug === pageSlug)?.name || pageSlug}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Total: {(config.categories?.length || 0) * (config.articleCount || 5)} articles
                                </p>
                              </div>
                            </div>
                            
                            <div className="col-span-4 flex items-center">
                              <div className="flex flex-wrap gap-1">
                                {config.categories?.map(catSlug => (
                                  <span key={catSlug} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    {categories.find(c => c.slug === catSlug)?.name || catSlug}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="col-span-2 flex items-center">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                {config.articleCount || 5} per category
                              </span>
                            </div>
                            
                            <div className="col-span-3 flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditRelatedConfig(pageSlug, config)}
                                className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteConfiguration(pageSlug)}
                                className="inline-flex items-center justify-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Related Posts Form */}
            {showRelatedForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Form Header with light grey background */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {editingRelatedConfig ? 'Edit Related Page' : 'New Related Page'}
                      </h2>
                    </div>
                    <button
                      onClick={handleRelatedFormCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Form Content */}
                <div className="p-6">
                  <form onSubmit={async (e) => { 
                    e.preventDefault(); 
                    const success = await saveRelatedArticlesConfig();
                    if (success) {
                      setShowRelatedForm(false);
                    }
                  }} className="space-y-6">
                    {/* Page Dropdown - Row 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Select Page *
                      </label>
                      {(() => {
                        const availablePages = getAvailablePages(true);
                        console.log('Available pages for editing:', availablePages.map(p => p.slug), 'selectedPage:', selectedPage);
                        return null;
                      })()}
                      <select
                        value={selectedPage}
                        onChange={(e) => setSelectedPage(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Choose a page...</option>
                        {getAvailablePages(true).map(page => (
                          <option key={page.slug} value={page.slug}>
                            {page.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Categories Selection - Row 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Related Article Categories *
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-48 overflow-y-auto">
                        {categories.length === 0 ? (
                          <p className="text-sm text-gray-500">Loading categories...</p>
                        ) : (
                          <div className="space-y-2">
                            {categories.map(category => (
                              <label key={category.slug} className="flex items-center text-left">
                                <input
                                  type="checkbox"
                                  checked={selectedRelatedCategories.includes(category.slug)}
                                  onChange={() => {
                                    if (selectedRelatedCategories.includes(category.slug)) {
                                      setSelectedRelatedCategories(prev => prev.filter(cat => cat !== category.slug));
                                    } else {
                                      setSelectedRelatedCategories(prev => [...prev, category.slug]);
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Articles per Category - Row 3 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Articles per Category *
                      </label>
                      <select
                        value={selectedArticleCount}
                        onChange={(e) => setSelectedArticleCount(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1 text-left">
                        Number of articles to show from each selected category
                      </p>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleRelatedFormCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedPage || selectedRelatedCategories.length === 0}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          selectedPage && selectedRelatedCategories.length > 0
                            ? 'bg-gray-600 hover:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Manage Release Posts Tab */}
        {activeTab === 'releases' && (
          <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setReleaseActiveTab('theater')}
                    className={`py-3 px-6 text-sm font-medium border-b-2 ${
                      releaseActiveTab === 'theater'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors duration-200`}
                  >
                    Theater Releases
                  </button>
                  <button
                    onClick={() => setReleaseActiveTab('ott')}
                    className={`py-3 px-6 text-sm font-medium border-b-2 ${
                      releaseActiveTab === 'ott'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors duration-200`}
                  >
                    OTT Releases
                  </button>
                </nav>
              </div>
            </div>

            {/* Theater Releases Tab */}
            {releaseActiveTab === 'theater' && (
              <div className="space-y-6">
                {!showTheaterForm ? (
                  <>
                    {/* Section Header with Filter and Create Button - Sticky */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sticky top-16 z-40">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            {/* Date Filter */}
                            <div>
                              <select
                                value={selectedDateFilter}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                              >
                                <option value="">All Dates</option>
                                <option value="this-week">This Week</option>
                                <option value="next-week">Next Week</option>
                                <option value="next-30-days">Next 30 Days</option>
                                <option value="future-dates">Future Dates</option>
                                <option value="last-30-days">Last 30 Days</option>
                                <option value="last-3-months">Last 3 Months</option>
                                <option value="last-6-months">Last 6 Months</option>
                                <option value="last-1-year">Last 1 Year</option>
                              </select>
                            </div>
                            
                            {/* Language Filter */}
                            <div>
                              <select
                                value={selectedReleaseLanguage}
                                onChange={(e) => setSelectedReleaseLanguage(e.target.value)}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All Languages</option>
                                {languages.map(lang => (
                                  <option key={lang.code} value={lang.name}>
                                    {lang.code === 'en' ? lang.name : `${lang.name} (${lang.native_name})`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleCreateTheaterRelease}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            + Create Theater Release
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Theater Releases Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {releaseLoading ? (
                        <div className="p-6 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading theater releases...</p>
                        </div>
                      ) : theaterReleases.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🎬</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Theater Releases</h3>
                          <p className="text-gray-600 mb-4">
                            Start by creating your first theater release.
                          </p>
                          <button
                            onClick={handleCreateTheaterRelease}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            + Create First Theater Release
                          </button>
                        </div>
                      ) : (
                        <div>
                          {/* Sticky Table Header */}
                          <div className="bg-gray-50 sticky top-28 z-30 border-b border-gray-200 shadow-sm px-4 py-3">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">MOVIE NAME</span>
                              </div>
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">BANNER</span>
                              </div>
                              <div className="col-span-1 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">LANGUAGE</span>
                              </div>
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">RELEASE DATE</span>
                              </div>
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">IMAGE</span>
                              </div>
                              <div className="col-span-3 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Theater Releases Content */}
                          <div className="divide-y divide-gray-200">
                            {(() => {
                              let filteredReleases = filterReleasesByDate(theaterReleases);
                              filteredReleases = filterReleasesByLanguage(filteredReleases);
                              
                              return filteredReleases.map((release, index) => (
                                <div 
                                  key={release.id} 
                                  className={`grid grid-cols-12 gap-4 px-4 py-4 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  } hover:bg-gray-100 transition-colors duration-150`}
                                >
                                {/* Movie Name Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    <h3 className="text-sm font-medium text-gray-900 text-left">
                                      {release.movie_name}
                                    </h3>
                                  </div>
                                </div>
                                
                                {/* Banner Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    <span className="text-sm text-gray-700">{release.movie_banner}</span>
                                  </div>
                                </div>
                                
                                {/* Language Column */}
                                <div className="col-span-1">
                                  <div className="text-left">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      {release.language}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Release Date Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    <span className="text-sm text-gray-700">
                                      {new Date(release.release_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Image Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    {release.movie_image ? (
                                      <img 
                                        src={`${process.env.REACT_APP_BACKEND_URL}/${release.movie_image}`} 
                                        alt={release.movie_name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-400">No image</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Actions Column */}
                                <div className="col-span-3 text-left">
                                  <div className="flex justify-start space-x-2">
                                    <button
                                      onClick={() => handleEditTheaterRelease(release)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTheaterRelease(release.id)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Pagination and Items Per Page for Theater Releases */}
                      {!releaseLoading && theaterReleases.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Items per page */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Show</span>
                              <select
                                value={releasesItemsPerPage}
                                onChange={(e) => setReleasesItemsPerPage(Number(e.target.value))}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                              </select>
                              <span className="text-sm text-gray-700">
                                releases per page (showing {((releasesCurrentPage - 1) * releasesItemsPerPage) + 1}-{Math.min(releasesCurrentPage * releasesItemsPerPage, releasesTotalCount)} of {releasesTotalCount})
                              </span>
                            </div>

                            {/* Pagination */}
                            {releasesTotalPages > 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setReleasesCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={releasesCurrentPage === 1}
                                  className={`px-3 py-1 text-sm rounded-md border ${
                                    releasesCurrentPage === 1
                                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  Previous
                                </button>
                                
                                <div className="flex items-center gap-1">
                                  {/* Page numbers */}
                                  {Array.from({ length: Math.min(releasesTotalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (releasesTotalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (releasesCurrentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (releasesCurrentPage >= releasesTotalPages - 2) {
                                      pageNum = releasesTotalPages - 4 + i;
                                    } else {
                                      pageNum = releasesCurrentPage - 2 + i;
                                    }
                                    
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => {
                                          console.log('Clicking releases page:', pageNum, 'Current page:', releasesCurrentPage);
                                          setReleasesCurrentPage(pageNum);
                                        }}
                                        className={`px-3 py-1 text-sm rounded-md border ${
                                          releasesCurrentPage === pageNum
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                </div>
                                
                                <button
                                  onClick={() => setReleasesCurrentPage(prev => Math.min(releasesTotalPages, prev + 1))}
                                  disabled={releasesCurrentPage === releasesTotalPages}
                                  className={`px-3 py-1 text-sm rounded-md border ${
                                    releasesCurrentPage === releasesTotalPages
                                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Theater Release Form Page */
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header with light grey background */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            New Theater Release
                          </h2>
                        </div>
                        <button
                          onClick={handleTheaterFormCancel}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Form Content */}
                    <div className="p-6">
                  <form onSubmit={handleTheaterFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Movie Name *
                        </label>
                        <input
                          type="text"
                          value={theaterForm.movie_name}
                          onChange={(e) => setTheaterForm({...theaterForm, movie_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                          placeholder="Enter movie name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Language *
                        </label>
                        <select
                          value={theaterForm.language}
                          onChange={(e) => setTheaterForm({...theaterForm, language: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                          required
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.name}>
                              {lang.code === 'en' ? lang.name : `${lang.name} (${lang.native_name})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Release Date *
                        </label>
                        <input
                          type="date"
                          value={theaterForm.release_date}
                          onChange={(e) => setTheaterForm({...theaterForm, release_date: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Movie Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setTheaterForm({...theaterForm, movie_image: e.target.files[0]})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Movie Banner *
                        </label>
                        <div className="flex space-x-2">
                          <select
                            value={showCustomBanner ? 'add_custom' : theaterForm.movie_banner}
                            onChange={(e) => handleBannerSelect(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                            required
                          >
                            <option value="">Select Production Banner</option>
                            {allBanners.map(banner => (
                              <option key={banner} value={banner}>{banner}</option>
                            ))}
                            <option value="add_custom">+ Add New Banner</option>
                          </select>
                        </div>
                        {showCustomBanner && (
                          <div className="mt-2 flex space-x-2">
                            <input
                              type="text"
                              value={customBanner}
                              onChange={(e) => setCustomBanner(e.target.value)}
                              placeholder="Enter new banner name"
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomBanner()}
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomBanner}
                              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {setShowCustomBanner(false); setCustomBanner('');}}
                              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      {editingRelease && editingType === 'theater' && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleTheaterFormCancel}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        {editingRelease && editingType === 'theater' ? 'Update Theater Release' : 'Add Theater Release'}
                      </button>
                    </div>
                  </form>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* OTT Releases Tab */}
            {releaseActiveTab === 'ott' && (
              <div className="space-y-6">
                {!showOttForm ? (
                  <>
                    {/* Section Header with Filter and Create Button - Sticky */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sticky top-16 z-40">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            {/* Date Filter */}
                            <div>
                              <select
                                value={selectedDateFilter}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                              >
                                <option value="">All Dates</option>
                                <option value="this-week">This Week</option>
                                <option value="next-week">Next Week</option>
                                <option value="next-30-days">Next 30 Days</option>
                                <option value="future-dates">Future Dates</option>
                                <option value="last-30-days">Last 30 Days</option>
                                <option value="last-3-months">Last 3 Months</option>
                                <option value="last-6-months">Last 6 Months</option>
                                <option value="last-1-year">Last 1 Year</option>
                              </select>
                            </div>
                            
                            {/* Language Filter */}
                            <div>
                              <select
                                value={selectedReleaseLanguage}
                                onChange={(e) => setSelectedReleaseLanguage(e.target.value)}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">All Languages</option>
                                {languages.map(lang => (
                                  <option key={lang.code} value={lang.name}>
                                    {lang.code === 'en' ? lang.name : `${lang.name} (${lang.native_name})`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleCreateOttRelease}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            + Create OTT Release
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* OTT Releases Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {releaseLoading ? (
                        <div className="p-6 text-center">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading OTT releases...</p>
                        </div>
                      ) : ottReleases.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📺</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No OTT Releases</h3>
                          <p className="text-gray-600 mb-4">
                            Start by creating your first OTT release.
                          </p>
                          <button
                            onClick={handleCreateOttRelease}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            + Create First OTT Release
                          </button>
                        </div>
                      ) : (
                        <div>
                          {/* Sticky Table Header */}
                          <div className="bg-gray-50 sticky top-28 z-30 border-b border-gray-200 shadow-sm px-4 py-3">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">MOVIE NAME</span>
                              </div>
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">PLATFORM</span>
                              </div>
                              <div className="col-span-1 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">LANGUAGE</span>
                              </div>
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">RELEASE DATE</span>
                              </div>
                              <div className="col-span-2 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">IMAGE</span>
                              </div>
                              <div className="col-span-3 text-left">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* OTT Releases Content */}
                          <div className="divide-y divide-gray-200">
                            {(() => {
                              let filteredReleases = filterReleasesByDate(ottReleases);
                              filteredReleases = filterReleasesByLanguage(filteredReleases);
                              
                              return filteredReleases.map((release, index) => (
                              <div 
                                key={release.id} 
                                className={`grid grid-cols-12 gap-4 px-4 py-4 ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } hover:bg-gray-100 transition-colors duration-150`}
                              >
                                {/* Movie Name Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    <h3 className="text-sm font-medium text-gray-900 text-left">
                                      {release.movie_name}
                                    </h3>
                                  </div>
                                </div>
                                
                                {/* Platform Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    <span className="text-sm text-gray-700">{release.ott_platform}</span>
                                  </div>
                                </div>
                                
                                {/* Language Column */}
                                <div className="col-span-1">
                                  <div className="text-left">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      {release.language}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Release Date Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    <span className="text-sm text-gray-700">
                                      {new Date(release.release_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Image Column */}
                                <div className="col-span-2">
                                  <div className="text-left">
                                    {release.movie_image ? (
                                      <img 
                                        src={`${process.env.REACT_APP_BACKEND_URL}/${release.movie_image}`} 
                                        alt={release.movie_name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <span className="text-sm text-gray-400">No image</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Actions Column */}
                                <div className="col-span-3 text-left">
                                  <div className="flex justify-start space-x-2">
                                    <button
                                      onClick={() => handleEditOttRelease(release)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteOttRelease(release.id)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Pagination and Items Per Page for OTT Releases */}
                      {!releaseLoading && ottReleases.length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Items per page */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700">Show</span>
                              <select
                                value={releasesItemsPerPage}
                                onChange={(e) => setReleasesItemsPerPage(Number(e.target.value))}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                              </select>
                              <span className="text-sm text-gray-700">
                                releases per page (showing {((releasesCurrentPage - 1) * releasesItemsPerPage) + 1}-{Math.min(releasesCurrentPage * releasesItemsPerPage, releasesTotalCount)} of {releasesTotalCount})
                              </span>
                            </div>

                            {/* Pagination */}
                            {releasesTotalPages > 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setReleasesCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={releasesCurrentPage === 1}
                                  className={`px-3 py-1 text-sm rounded-md border ${
                                    releasesCurrentPage === 1
                                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  Previous
                                </button>
                                
                                <div className="flex items-center gap-1">
                                  {/* Page numbers */}
                                  {Array.from({ length: Math.min(releasesTotalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (releasesTotalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (releasesCurrentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (releasesCurrentPage >= releasesTotalPages - 2) {
                                      pageNum = releasesTotalPages - 4 + i;
                                    } else {
                                      pageNum = releasesCurrentPage - 2 + i;
                                    }
                                    
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => {
                                          console.log('Clicking OTT releases page:', pageNum, 'Current page:', releasesCurrentPage);
                                          setReleasesCurrentPage(pageNum);
                                        }}
                                        className={`px-3 py-1 text-sm rounded-md border ${
                                          releasesCurrentPage === pageNum
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                </div>
                                
                                <button
                                  onClick={() => setReleasesCurrentPage(prev => Math.min(releasesTotalPages, prev + 1))}
                                  disabled={releasesCurrentPage === releasesTotalPages}
                                  className={`px-3 py-1 text-sm rounded-md border ${
                                    releasesCurrentPage === releasesTotalPages
                                      ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* OTT Release Form Page */
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header with light grey background */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">
                            New OTT Release
                          </h2>
                        </div>
                        <button
                          onClick={handleOttFormCancel}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Form Content */}
                    <div className="p-6">

                    <form onSubmit={handleOttFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Movie Name *
                          </label>
                          <input
                            type="text"
                            value={ottForm.movie_name}
                            onChange={(e) => setOttForm({...ottForm, movie_name: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                            placeholder="Enter movie name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Language *
                          </label>
                          <select
                            value={ottForm.language}
                            onChange={(e) => setOttForm({...ottForm, language: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                            required
                          >
                            {languages.map(lang => (
                              <option key={lang.code} value={lang.name}>
                                {lang.code === 'en' ? lang.name : `${lang.name} (${lang.native_name})`}
                              </option>
                            ))}
                            <option value="Assamese">Assamese</option>
                            <option value="English">English</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            OTT Platform *
                          </label>
                          <div className="space-y-2">
                            <select
                              value={ottForm.ott_platform || ''}
                              onChange={(e) => {
                                if (e.target.value === 'add-new') {
                                  setShowCustomPlatform(true);
                                } else {
                                  setOttForm({...ottForm, ott_platform: e.target.value});
                                  setShowCustomPlatform(false);
                                }
                              }}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                              required
                            >
                              <option value="">Select OTT Platform</option>
                              {allOttPlatforms.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                              ))}
                              <option value="add-new">+ Add New Platform</option>
                            </select>
                            {showCustomPlatform && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={customPlatform}
                                  onChange={(e) => setCustomPlatform(e.target.value)}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                                  placeholder="Enter new platform name"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (customPlatform.trim()) {
                                      setAllOttPlatforms(prev => [...new Set([...prev, customPlatform.trim()])]);
                                      setOttForm({...ottForm, ott_platform: customPlatform.trim()});
                                      setCustomPlatform('');
                                      setShowCustomPlatform(false);
                                    }
                                  }}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors duration-200"
                                >
                                  Add
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                            Release Date *
                          </label>
                          <input
                            type="date"
                            value={ottForm.release_date}
                            onChange={(e) => setOttForm({...ottForm, release_date: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Movie Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setOttForm({...ottForm, movie_image: e.target.files[0]})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleOttFormCancel}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit" 
                          className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                          {editingRelease && editingType === 'ott' ? 'Update OTT Release' : 'Create OTT Release'}
                        </button>
                      </div>
                    </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manage Video Posts Tab */}
        {activeTab === 'video-posts' && (
          <div className="space-y-6">
            {!showGalleryForm && !showHorizontalGalleryForm ? (
              <>
                {/* Sub-tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex">
                      <button
                        onClick={() => setVideoPostsActiveTab('vertical-gallery')}
                        className={`py-3 px-6 text-sm font-medium border-b-2 ${
                          videoPostsActiveTab === 'vertical-gallery'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-colors duration-200`}
                      >
                        Vertical Image Gallery
                      </button>
                      <button
                        onClick={() => setVideoPostsActiveTab('horizontal-gallery')}
                        className={`py-3 px-6 text-sm font-medium border-b-2 ${
                          videoPostsActiveTab === 'horizontal-gallery'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } transition-colors duration-200`}
                      >
                        Horizontal Image Gallery
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Vertical Image Gallery Section */}
                {videoPostsActiveTab === 'vertical-gallery' && (
                  <>
                    {/* Header with Filters - Sticky */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sticky top-16 z-40">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-3">
                              <div>
                                <select
                                  value={selectedArtist}
                                  onChange={(e) => setSelectedArtist(e.target.value)}
                                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">All Artists</option>
                                  {[...new Set(verticalGalleries.map(gallery => gallery.artist))].map(artist => (
                                    <option key={artist} value={artist}>
                                      {artist}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCreateGallery}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              + Create Gallery
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Gallery List Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Gallery List - CSS Grid Layout */}
                    {verticalGalleries.length > 0 ? (
                      <div>
                        {/* Sticky Table Header */}
                        <div className="bg-gray-50 sticky top-28 z-30 border-b border-gray-200 shadow-sm px-4 py-3 overflow-x-auto min-w-full">
                          <div className="grid grid-cols-4 gap-4 min-w-[460px]">
                            <div className="text-left min-w-[200px]">
                              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">TITLE</span>
                            </div>
                            <div className="text-left min-w-[100px]">
                              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ARTIST</span>
                            </div>
                            <div className="text-left min-w-[100px]">
                              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">CREATED</span>
                            </div>
                            <div className="text-left min-w-[160px]">
                              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</span>
                            </div>
                          </div>
                        </div>

                        {/* Gallery List */}
                        <div className="divide-y divide-gray-200 overflow-x-auto">
                          {verticalGalleries
                            .filter(gallery => selectedArtist === '' || gallery.artist === selectedArtist)
                            .slice(
                              (galleriesCurrentPage - 1) * galleriesItemsPerPage,
                              galleriesCurrentPage * galleriesItemsPerPage
                            )
                            .map((gallery, index) => (
                              <div 
                                key={gallery.id} 
                                className={`grid grid-cols-4 gap-4 px-4 py-4 min-w-[460px] ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } hover:bg-gray-100 transition-colors duration-150`}
                              >
                                <div className="text-left min-w-[200px]">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {gallery.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {gallery.images.length} {gallery.images.length === 1 ? 'Image' : 'Images'}
                                  </div>
                                </div>
                                <div className="text-left text-gray-900 text-sm min-w-[100px] truncate">
                                  {gallery.artist}
                                </div>
                                <div className="text-left text-gray-500 text-sm min-w-[100px]">
                                  {new Date(gallery.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-left min-w-[160px]">
                                  <div className="flex gap-2 flex-wrap">
                                    <button
                                      onClick={() => handleGalleryTopicsManagement(gallery)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                    >
                                      Topics
                                    </button>
                                    <button
                                      onClick={() => handleEditGallery(gallery)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGallery(gallery.id)}
                                      className="inline-flex items-center justify-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🖼️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Galleries Created</h3>
                        <p className="text-gray-600 mb-4">
                          Start by creating your first vertical image gallery.
                        </p>
                        <button
                          onClick={handleCreateGallery}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          + Create First Gallery
                        </button>
                      </div>
                    )}
                    
                    {/* Pagination for Vertical Galleries */}
                    {verticalGalleries.filter(gallery => selectedArtist === '' || gallery.artist === selectedArtist).length > 0 && (
                      <div className="bg-white px-4 py-3 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Items per page */}
                          <div className="flex items-center gap-2">
                            <label htmlFor="galleries-per-page" className="text-sm font-medium text-gray-700">Show:</label>
                            <select
                              id="galleries-per-page"
                              value={galleriesItemsPerPage}
                              onChange={(e) => setGalleriesItemsPerPage(Number(e.target.value))}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={10}>10</option>
                              <option value={15}>15</option>
                              <option value={20}>20</option>
                            </select>
                            <span className="text-sm text-gray-700">
                              galleries per page (showing {((galleriesCurrentPage - 1) * galleriesItemsPerPage) + 1}-{Math.min(galleriesCurrentPage * galleriesItemsPerPage, verticalGalleries.filter(gallery => selectedArtist === '' || gallery.artist === selectedArtist).length)} of {verticalGalleries.filter(gallery => selectedArtist === '' || gallery.artist === selectedArtist).length})
                            </span>
                          </div>

                          {/* Pagination */}
                          {galleriesTotalPages > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setGalleriesCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={galleriesCurrentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              
                              {/* Page Numbers */}
                              {Array.from({ length: Math.min(5, galleriesTotalPages) }, (_, i) => {
                                let pageNum;
                                if (galleriesTotalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (galleriesCurrentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (galleriesCurrentPage >= galleriesTotalPages - 2) {
                                  pageNum = galleriesTotalPages - 4 + i;
                                } else {
                                  pageNum = galleriesCurrentPage - 2 + i;
                                }
                                
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setGalleriesCurrentPage(pageNum)}
                                    className={`px-3 py-1 text-sm border rounded-md ${
                                      galleriesCurrentPage === pageNum
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              
                              <button
                                onClick={() => setGalleriesCurrentPage(prev => Math.min(galleriesTotalPages, prev + 1))}
                                disabled={galleriesCurrentPage === galleriesTotalPages}
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
                </>
              )}

                {/* Horizontal Image Gallery Section */}
                {videoPostsActiveTab === 'horizontal-gallery' && (
                  <>
                    {/* Header with Filters - Sticky */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sticky top-16 z-40">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-3">
                              <div>
                                <select
                                  value={selectedHorizontalArtist || ''}
                                  onChange={(e) => setSelectedHorizontalArtist(e.target.value)}
                                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">All Artists</option>
                                  {availableArtists.map(artist => (
                                    <option key={artist} value={artist}>
                                      {artist}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCreateHorizontalGallery}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              + Create Gallery
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gallery List Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      {/* Gallery List - CSS Grid Layout */}
                      {horizontalGalleries.length > 0 ? (
                        <div>
                          {/* Sticky Table Header */}
                          <div className="bg-gray-50 sticky top-28 z-30 border-b border-gray-200 shadow-sm px-4 py-3 overflow-x-auto min-w-full">
                            <div className="grid grid-cols-4 gap-4 min-w-[460px]">
                              <div className="text-left min-w-[200px]">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">TITLE</span>
                              </div>
                              <div className="text-left min-w-[100px]">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ARTIST</span>
                              </div>
                              <div className="text-left min-w-[100px]">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">CREATED</span>
                              </div>
                              <div className="text-left min-w-[160px]">
                                <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</span>
                              </div>
                            </div>
                          </div>

                          {/* Gallery List */}
                          <div className="divide-y divide-gray-200 overflow-x-auto">
                            {horizontalGalleries
                              .filter(gallery => selectedHorizontalArtist === '' || gallery.artist === selectedHorizontalArtist)
                              .slice(
                                (galleriesCurrentPage - 1) * galleriesItemsPerPage,
                                galleriesCurrentPage * galleriesItemsPerPage
                              )
                              .map((gallery, index) => (
                                <div 
                                  key={gallery.id} 
                                  className={`grid grid-cols-4 gap-4 px-4 py-4 min-w-[460px] ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                  } hover:bg-gray-100 transition-colors duration-150`}
                                >
                                  <div className="text-left min-w-[200px]">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {gallery.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {gallery.images.length} {gallery.images.length === 1 ? 'Image' : 'Images'}
                                    </div>
                                  </div>
                                  <div className="text-left text-gray-900 text-sm min-w-[100px] truncate">
                                    {gallery.artist}
                                  </div>
                                  <div className="text-left text-gray-500 text-sm min-w-[100px]">
                                    {new Date(gallery.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="text-left min-w-[160px]">
                                    <div className="flex gap-2 flex-wrap">
                                      <button
                                        onClick={() => handleGalleryTopicsManagement(gallery)}
                                        className="inline-flex items-center justify-center px-3 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                      >
                                        Topics
                                      </button>
                                      <button
                                        onClick={() => handleEditHorizontalGallery(gallery)}
                                        className="inline-flex items-center justify-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteHorizontalGallery(gallery.id)}
                                        className="inline-flex items-center justify-center px-3 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🖼️</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Galleries Created</h3>
                          <p className="text-gray-600 mb-4">
                            Start by creating your first horizontal image gallery.
                          </p>
                          <button
                            onClick={handleCreateHorizontalGallery}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            + Create First Gallery
                          </button>
                        </div>
                      )}
                      
                      {/* Pagination for Horizontal Galleries */}
                      {horizontalGalleries.filter(gallery => selectedHorizontalArtist === '' || gallery.artist === selectedHorizontalArtist).length > 0 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Items per page */}
                            <div className="flex items-center gap-2">
                              <label htmlFor="horizontal-galleries-per-page" className="text-sm font-medium text-gray-700">Show:</label>
                              <select
                                id="horizontal-galleries-per-page"
                                value={galleriesItemsPerPage}
                                onChange={(e) => setGalleriesItemsPerPage(Number(e.target.value))}
                                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                              </select>
                              <span className="text-sm text-gray-700">
                                galleries per page (showing {((galleriesCurrentPage - 1) * galleriesItemsPerPage) + 1}-{Math.min(galleriesCurrentPage * galleriesItemsPerPage, horizontalGalleries.filter(gallery => selectedHorizontalArtist === '' || gallery.artist === selectedHorizontalArtist).length)} of {horizontalGalleries.filter(gallery => selectedHorizontalArtist === '' || gallery.artist === selectedHorizontalArtist).length})
                              </span>
                            </div>

                            {/* Pagination */}
                            {galleriesTotalPages > 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setGalleriesCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={galleriesCurrentPage === 1}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Previous
                                </button>
                                
                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, galleriesTotalPages) }, (_, i) => {
                                  let pageNum;
                                  if (galleriesTotalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (galleriesCurrentPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (galleriesCurrentPage >= galleriesTotalPages - 2) {
                                    pageNum = galleriesTotalPages - 4 + i;
                                  } else {
                                    pageNum = galleriesCurrentPage - 2 + i;
                                  }
                                  
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setGalleriesCurrentPage(pageNum)}
                                      className={`px-3 py-1 text-sm border rounded-md ${
                                        galleriesCurrentPage === pageNum
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}
                                
                                <button
                                  onClick={() => setGalleriesCurrentPage(prev => Math.min(galleriesTotalPages, prev + 1))}
                                  disabled={galleriesCurrentPage === galleriesTotalPages}
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
                  </>
                )}

              </>
            ) : showGalleryForm ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {editingGallery ? 'Edit Gallery' : 'Create New Gallery'}
                      </h2>
                    </div>
                    <button
                      onClick={handleGalleryFormCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleGallerySubmit} className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Gallery Title *
                    </label>
                    <input
                      type="text"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter gallery title"
                      required
                    />
                  </div>

                  {/* Artist Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Artist *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedGalleryArtist || ''}
                        onChange={(e) => setSelectedGalleryArtist(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      >
                        <option value="">Select an artist</option>
                        {availableArtists.map(artist => (
                          <option key={artist} value={artist}>
                            {artist}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowGalleryArtistModal(true)}
                        className="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center flex-shrink-0"
                        title="Add New Artist"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Gallery Images *
                    </label>
                    <div className="mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Select multiple images (JPG, PNG, GIF)</p>
                    </div>

                    {/* Uploaded Images List */}
                    {galleryForm.images.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <h4 className="text-sm font-medium text-gray-700 text-left">
                          Uploaded Images ({galleryForm.images.length})
                        </h4>
                        {galleryForm.images.map((image) => (
                          <div key={image.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center space-x-3">
                              <img
                                src={image.data}
                                alt={image.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{image.name}</p>
                                <p className="text-xs text-gray-500">{(image.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleImageDelete(image.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleGalleryFormCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      {editingGallery ? 'Update Gallery' : 'Create Gallery'}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            ) : showHorizontalGalleryForm ? (
              /* Horizontal Gallery Form */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {editingHorizontalGallery ? 'Edit Gallery' : 'Create New Gallery'}
                      </h2>
                    </div>
                    <button
                      onClick={handleHorizontalGalleryFormCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <form onSubmit={handleHorizontalGallerySubmit} className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Gallery Title *
                    </label>
                    <input
                      type="text"
                      value={horizontalGalleryForm.title}
                      onChange={(e) => setHorizontalGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Enter gallery title"
                      required
                    />
                  </div>

                  {/* Artist Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Artist *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedHorizontalGalleryArtist || ''}
                        onChange={(e) => setSelectedHorizontalGalleryArtist(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required
                      >
                        <option value="">Select an artist</option>
                        {availableArtists.map(artist => (
                          <option key={artist} value={artist}>
                            {artist}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowHorizontalGalleryArtistModal(true)}
                        className="w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center flex-shrink-0"
                        title="Add New Artist"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Gallery Images *
                    </label>
                    <div className="mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleHorizontalImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Select multiple images (JPG, PNG, GIF)</p>
                    </div>

                    {/* Uploaded Images List */}
                    {horizontalGalleryForm.images.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <h4 className="text-sm font-medium text-gray-700 text-left">
                          Uploaded Images ({horizontalGalleryForm.images.length})
                        </h4>
                        {horizontalGalleryForm.images.map((image) => (
                          <div key={image.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center space-x-3">
                              <img
                                src={image.data}
                                alt={image.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{image.name}</p>
                                <p className="text-xs text-gray-500">{(image.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleHorizontalImageDelete(image.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleHorizontalGalleryFormCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      {editingHorizontalGallery ? 'Update Gallery' : 'Create Gallery'}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <TopicsManagement />
        )}
      </div>

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        showConfirmation={modal.showConfirmation}
        onConfirm={modal.onConfirm}
      />

      {/* Topic Management Modal */}
      {showTopicModal && selectedArticleForTopics && (
        <TopicManagementModal
          article={selectedArticleForTopics}
          currentTopics={articleTopics}
          onClose={handleTopicModalClose}
          onTopicToggle={handleTopicAssociation}
        />
      )}

      {/* Related Videos Management Modal */}
      {showRelatedVideosModal && selectedArticleForRelatedVideos && (
        <RelatedVideosManagement
          article={selectedArticleForRelatedVideos}
          onClose={handleCloseRelatedVideosModal}
          onSave={handleSaveRelatedVideos}
        />
      )}

      {/* Gallery Artist Modal */}
      {showGalleryArtistModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white text-left">Add Artist</h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGalleryArtistModal(false);
                    setNewGalleryArtist('');
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-800 px-6 py-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleGalleryArtistAdd();
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1 text-left">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGalleryArtist}
                    onChange={(e) => setNewGalleryArtist(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                    placeholder="Enter artist name"
                    autoFocus
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 border-t border-gray-600 px-6 py-4">
              <div className="flex justify-center">
                <button
                  onClick={handleGalleryArtistAdd}
                  disabled={!newGalleryArtist.trim()}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Add Artist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Gallery Artist Modal */}
      {showHorizontalGalleryArtistModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-red-600 font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white text-left">Add Artist</h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowHorizontalGalleryArtistModal(false);
                    setNewHorizontalGalleryArtist('');
                  }}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gray-800 px-6 py-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleHorizontalGalleryArtistAdd();
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-1 text-left">
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHorizontalGalleryArtist}
                    onChange={(e) => setNewHorizontalGalleryArtist(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left"
                    placeholder="Enter artist name"
                    autoFocus
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 border-t border-gray-600 px-6 py-4">
              <div className="flex justify-center">
                <button
                  onClick={handleHorizontalGalleryArtistAdd}
                  disabled={!newHorizontalGalleryArtist.trim()}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Add Artist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Topic Management Modal */}
      {showGalleryTopicModal && selectedGalleryForTopics && (
        <TopicManagementModal
          article={selectedGalleryForTopics}
          currentTopics={galleryTopics}
          onClose={() => {
            setShowGalleryTopicModal(false);
            setSelectedGalleryForTopics(null);
            setGalleryTopics([]);
          }}
          onTopicToggle={handleGalleryTopicAssociation}
          title="Manage Gallery Topics"
          entityName="Gallery"
        />
      )}
    </div>
  );
};

export default Dashboard;
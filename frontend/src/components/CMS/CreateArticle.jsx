import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import NotificationModal from '../NotificationModal';

const CreateArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Changed from articleId to id to match the route
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const [formData, setFormData] = useState({
    title: '',
    short_title: '',
    content: '',
    summary: '',
    author: 'Tadka Team', // Default author
    language: 'en',
    states: 'all',
    category: '',
    content_type: 'post', // New field for content type
    image: '',
    image_gallery: [], // New field for image gallery
    youtube_url: '',
    tags: '',
    artists: [], // New field for artists
    movie_rating: '', // New field for movie rating
    is_featured: false,
    is_published: true,
    is_scheduled: false,
    scheduled_publish_at: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });

  const [selectedState, setSelectedState] = useState('all'); // Changed to single state selection
  const [selectedArtist, setSelectedArtist] = useState(''); // Changed to single artist (string)
  const [availableArtists, setAvailableArtists] = useState([]); // Available artists from API
  const [showArtistModal, setShowArtistModal] = useState(false); // New state for artist modal
  const [newArtistName, setNewArtistName] = useState(''); // New state for new artist name
  
  // Gallery selection states
  const [selectedGallery, setSelectedGallery] = useState(null); // Selected gallery object
  const [showGalleryModal, setShowGalleryModal] = useState(false); // Gallery selection modal
  const [availableGalleries, setAvailableGalleries] = useState([]); // Available galleries from API
  const [gallerySearchTerm, setGallerySearchTerm] = useState(''); // Search term for galleries
  
  // Image gallery management states
  const [newImageUrl, setNewImageUrl] = useState(''); // For adding new images to gallery
  const [editingImageIndex, setEditingImageIndex] = useState(null); // Index of image being edited

  // Accordion states
  const [accordionStates, setAccordionStates] = useState({
    authorTargeting: true,
    category: true,
    contentType: true,
    seo: false
  });

  const showNotification = (type, title, message) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
  };

  const handleNotificationClose = () => {
    const shouldNavigate = notification.type === 'success' && 
                          (notification.title.includes('Created Successfully') || 
                           notification.title.includes('Updated Successfully'));
    
    closeNotification();
    
    // Only navigate to dashboard after successful create/update operations
    if (shouldNavigate) {
      navigate('/cms/dashboard');
    }
  };

  // Separate function to load gallery by ID
  const loadGalleryById = async (galleryId) => {
    try {
      const galleryResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries/by-id/${galleryId}`);
      if (galleryResponse.ok) {
        const gallery = await galleryResponse.json();
        setSelectedGallery(gallery);
      }
    } catch (e) {
      console.error('Error loading gallery:', e);
      setSelectedGallery(null);
    }
  };

  // Load article data for editing
  const loadArticle = async (id) => {
    setLoadingArticle(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/articles/${id}`);
      if (response.ok) {
        const article = await response.json();
        
        // Populate form data
        setFormData({
          title: article.title || '',
          short_title: article.short_title || '',
          content: article.content || '',
          summary: article.summary || '',
          author: article.author || '',
          language: article.language || 'en',
          states: article.states || 'all',
          category: article.category || '',
          content_type: article.content_type || 'post', // Load content type
          image: article.main_image_url || '',
          image_gallery: article.image_gallery ? JSON.parse(article.image_gallery) : [], // Load image gallery safely
          youtube_url: article.youtube_url || '',
          tags: article.tags || '',
          movie_rating: article.movie_rating || '', // Load movie rating
          is_featured: article.is_featured || false,
          is_published: article.is_published || false,
          is_scheduled: article.is_scheduled || false,
          scheduled_publish_at: article.scheduled_publish_at ? new Date(article.scheduled_publish_at).toISOString().slice(0, 16) : '',
          seo_title: article.seo_title || '',
          seo_description: article.seo_description || '',
          seo_keywords: article.seo_keywords || ''
        });
        
        // Set selected state (single selection)
        if (article.states && article.states !== 'all') {
          try {
            const statesArray = JSON.parse(article.states);
            // Take the first state if array exists, otherwise use 'all'
            setSelectedState(statesArray && statesArray.length > 0 ? statesArray[0] : 'all');
          } catch (e) {
            setSelectedState('all');
          }
        } else {
          setSelectedState('all');
        }
        
        // Set selected artist (single selection)
        if (article.artists) {
          try {
            const artistsArray = typeof article.artists === 'string' ? JSON.parse(article.artists) : article.artists;
            // Take the first artist if array exists
            setSelectedArtist(artistsArray && artistsArray.length > 0 ? artistsArray[0] : '');
          } catch (e) {
            setSelectedArtist('');
          }
        }
        
        // Load selected gallery if gallery_id exists
        if (article.gallery_id && availableGalleries.length > 0) {
          const gallery = availableGalleries.find(g => g.id === article.gallery_id);
          if (gallery) {
            setSelectedGallery(gallery);
          }
        }
        
        // Load gallery data separately to avoid blocking form load
        if (article.gallery_id && !availableGalleries.find(g => g.id === article.gallery_id)) {
          loadGalleryById(article.gallery_id);
        }
        
        
        // Set editor content
        if (article.content) {
          const contentBlock = htmlToDraft(article.content);
          if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            setEditorState(EditorState.createWithContent(contentState));
          }
        }
        
      } else {
        throw new Error('Failed to load article');
      }
    } catch (error) {
      console.error('Error loading article:', error);
      showNotification('error', 'Error Loading Article', 'Failed to load article data. Please try again.');
    } finally {
      setLoadingArticle(false);
    }
  };

  useEffect(() => {
    fetchCMSConfig();
    fetchAvailableArtists(); // Fetch available artists
    fetchGalleries(); // Fetch available galleries
    if (isEditMode && id) {
      loadArticle(id);
    }
  }, [isEditMode, id]);

  const fetchCMSConfig = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cms/config`);
      const data = await response.json();
      setLanguages(data.languages);
      setStates(data.states); // Now uses updated backend states
      setCategories(data.categories);
      // Only set default category for new articles, not when editing
      if (data.categories.length > 0 && !isEditMode) {
        setFormData(prev => ({ ...prev, category: data.categories[0].slug }));
      }
    } catch (error) {
      console.error('Error fetching CMS config:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setFormData(prev => ({
      ...prev,
      content: htmlContent
    }));
  };

  const handleStateSelection = (stateCode) => {
    setSelectedState(stateCode);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      is_published: isChecked,
      is_scheduled: isChecked ? false : prev.is_scheduled, // Clear scheduling if publishing immediately
      scheduled_publish_at: isChecked ? '' : prev.scheduled_publish_at
    }));
  };

  const handleScheduleChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      is_scheduled: isChecked,
      is_published: isChecked ? false : prev.is_published, // Clear immediate publish if scheduling
      scheduled_publish_at: isChecked ? prev.scheduled_publish_at : ''
    }));
  };

  // Artist management functions
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
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  // Fetch available galleries
  const fetchGalleries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/galleries`);
      if (response.ok) {
        const galleries = await response.json();
        setAvailableGalleries(galleries);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    }
  };

  // Gallery selection handlers
  const handleGallerySelect = (gallery) => {
    setSelectedGallery(gallery);
    setShowGalleryModal(false);
    setGallerySearchTerm('');
  };

  const handleGalleryRemove = () => {
    setSelectedGallery(null);
  };

  // Image gallery management handlers
  const handleAddImageToGallery = () => {
    if (newImageUrl.trim()) {
      const newImage = {
        id: Date.now(), // Simple ID for the image
        url: newImageUrl.trim(),
        alt: `Gallery image ${formData.image_gallery.length + 1}`
      };
      setFormData(prev => ({
        ...prev,
        image_gallery: [...prev.image_gallery, newImage]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImageFromGallery = (index) => {
    setFormData(prev => ({
      ...prev,
      image_gallery: prev.image_gallery.filter((_, i) => i !== index)
    }));
  };

  const handleEditImage = (index, newUrl) => {
    if (newUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        image_gallery: prev.image_gallery.map((img, i) => 
          i === index ? { ...img, url: newUrl.trim() } : img
        )
      }));
    }
    setEditingImageIndex(null);
  };

  const handleMoveImageUp = (index) => {
    if (index > 0) {
      setFormData(prev => {
        const newGallery = [...prev.image_gallery];
        [newGallery[index - 1], newGallery[index]] = [newGallery[index], newGallery[index - 1]];
        return { ...prev, image_gallery: newGallery };
      });
    }
  };

  const handleMoveImageDown = (index) => {
    if (index < formData.image_gallery.length - 1) {
      setFormData(prev => {
        const newGallery = [...prev.image_gallery];
        [newGallery[index], newGallery[index + 1]] = [newGallery[index + 1], newGallery[index]];
        return { ...prev, image_gallery: newGallery };
      });
    }
  };

  // Filter galleries based on search term
  const filteredGalleries = availableGalleries
    .filter(gallery =>
      gallery.title.toLowerCase().includes(gallerySearchTerm.toLowerCase())
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  // Accordion toggle function
  const toggleAccordion = (section) => {
    setAccordionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddArtist = () => {
    if (newArtistName.trim()) {
      const newArtist = newArtistName.trim();
      
      // Add to available artists list if not already present
      if (!availableArtists.includes(newArtist)) {
        setAvailableArtists(prev => [...prev, newArtist]);
      }
      
      // Set as selected artist
      setSelectedArtist(newArtist);
      
      // Clear form and close modal
      setNewArtistName('');
      setShowArtistModal(false);
    }
  };

  const handleSelectArtist = (artistName) => {
    setSelectedArtist(artistName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Strip HTML tags for summary creation
      const textContent = formData.content.replace(/<[^>]*>/g, '');
      
      const submitData = {
        ...formData,
        summary: textContent.substring(0, 200) + '...', // Generate summary from content
        states: JSON.stringify([selectedState]), // Convert single state to array for backend compatibility
        artists: JSON.stringify(selectedArtist ? [selectedArtist] : []), // Include selected artist as array
        image_gallery: JSON.stringify(formData.image_gallery), // Include image gallery as JSON string
        gallery_id: selectedGallery ? selectedGallery.id : null, // Include selected gallery ID
        seo_title: formData.seo_title || formData.title,
        seo_description: formData.seo_description || textContent.substring(0, 160) + '...',
        // Handle scheduling data
        scheduled_publish_at: formData.is_scheduled && formData.scheduled_publish_at 
          ? new Date(formData.scheduled_publish_at).toISOString() 
          : null
      };

      const url = isEditMode 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/cms/articles/${id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/cms/articles`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        
        let statusText = 'saved as draft';
        if (formData.is_scheduled) {
          statusText = `scheduled for ${new Date(formData.scheduled_publish_at).toLocaleString('en-IN', { 
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} IST`;
        } else if (formData.is_published) {
          statusText = 'published';
        }
        
        showNotification(
          'success',
          isEditMode ? 'Post Updated Successfully!' : 'Post Created Successfully!',
          `Your post "${formData.title}" has been ${isEditMode ? 'updated' : 'created'} and ${statusText}.`
        );
      } else {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} article`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} article:`, error);
      showNotification(
        'error',
        `Error ${isEditMode ? 'Updating' : 'Creating'} Post`,
        `There was an error ${isEditMode ? 'updating' : 'creating'} your post. Please check your connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Store form data in localStorage for preview
    localStorage.setItem('previewArticle', JSON.stringify({
      ...formData,
      states: [selectedState] // Convert single state to array for preview compatibility
    }));
    window.open('/cms/preview/new', '_blank');
  };

  const handleTranslate = () => {
    alert('Translation feature will be implemented with Google Translate API integration');
  };

  return (
    <>
      <style>
        {`
          .wrapper-class {
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
          }
          .toolbar-class {
            border: none;
            border-bottom: 1px solid #d1d5db;
            border-radius: 0.375rem 0.375rem 0 0;
            background: #f9fafb;
            padding: 8px;
          }
          .editor-class {
            min-height: 300px;
            padding: 12px;
            font-size: 14px;
            border: none;
            border-radius: 0 0 0.375rem 0.375rem;
            background: white;
          }
          .editor-class:focus {
            outline: none;
          }
          .rdw-option-wrapper {
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            margin: 0 2px;
            background: white;
          }
          .rdw-option-wrapper:hover {
            background: #f3f4f6;
          }
          .rdw-option-active {
            background: #3b82f6;
            color: white;
          }
          .rdw-dropdown-wrapper {
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            background: white;
          }
          .rdw-dropdown-optionwrapper {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50 pt-2 pb-4">
        <div className="max-w-5xl-plus mx-auto px-8">
          {/* Sticky Header - Same pattern as Latest News */}
          <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-6`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
            <div className="pl-0 pr-4 py-4">
              <div className="mb-2">
                <h1 className="text-base font-bold text-black text-left leading-tight">
                  {isEditMode ? 'Edit Post' : 'New Post'}
                </h1>
              </div>
              
              {/* Back button and status on same line */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-900 opacity-75 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {isEditMode ? 'Editing existing post' : 'Creating new post'}
                </p>

                {/* Back Button with Border */}
                <button
                  onClick={() => navigate('/cms/dashboard')}
                  className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>

        {/* Form */}
        {loadingArticle ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading article data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Author, Language, State Targeting - Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                onClick={() => toggleAccordion('authorTargeting')}
              >
                <h3 className="text-lg font-medium text-gray-900 text-left">Author & Targeting</h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${accordionStates.authorTargeting ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              {accordionStates.authorTargeting && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Author *
                    </label>
                    <select
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Admin">Admin</option>
                      <option value="AI">AI</option>
                      <option value="Tadka Team">Tadka Team</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Language *
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {languages
                        .sort((a, b) => a.native_name.localeCompare(b.native_name))
                        .map(lang => (
                          <option key={lang.code} value={lang.code}>
                            {lang.native_name} ({lang.name})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">State Targeting</label>
                    <select
                      value={selectedState}
                      onChange={(e) => handleStateSelection(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {states
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Category & Content Type - Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                onClick={() => toggleAccordion('category')}
              >
                <h3 className="text-lg font-medium text-gray-900 text-left">Category & Content Type</h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${accordionStates.category ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              {accordionStates.category && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories
                        .filter(cat => cat.slug !== 'latest-news' && cat.name.toLowerCase() !== 'latest news')
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(cat => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Content Type *
                    </label>
                    <select
                      name="content_type"
                      value={formData.content_type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="movie_review">Movie Review</option>
                      <option value="photo">Photo Gallery</option>
                      <option value="post">Post</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Content Details - Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                onClick={() => toggleAccordion('contentType')}
              >
                <h3 className="text-lg font-medium text-gray-900 text-left">Content Details</h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${accordionStates.contentType ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              {accordionStates.contentType && (
                <div className="p-6 space-y-4">
                  
                  {/* Common Fields for All Types: Title, Short Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Short Title
                    </label>
                    <input
                      type="text"
                      name="short_title"
                      value={formData.short_title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* POST Type Fields */}
                  {formData.content_type === 'post' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          Main Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.image && (
                          <div className="mt-2">
                            <img src={formData.image} alt="Preview" className="w-32 h-20 object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* PHOTO GALLERY Type Fields */}
                  {formData.content_type === 'photo' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          Image Gallery
                        </label>
                        <div className="w-full">
                          {selectedGallery ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <span className="text-sm text-blue-800">{selectedGallery.title}</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowGalleryModal(true)}
                                  className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors duration-200"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={handleGalleryRemove}
                                  className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowGalleryModal(true)}
                              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200"
                            >
                              Select Image Gallery
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Direct Image Gallery Management */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          Image Gallery ({formData.image_gallery.length} images)
                        </label>
                        
                        {/* Add new image */}
                        <div className="mb-3 flex gap-2">
                          <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageToGallery}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>

                        {/* Gallery images list */}
                        {formData.image_gallery.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
                            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">No images in gallery. Add images using the URL input above.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {formData.image_gallery.map((image, index) => (
                              <div key={image.id || index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                {/* Image preview */}
                                <img
                                  src={image.url}
                                  alt={image.alt || `Gallery image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMSAyMUgyMVYyM0gyM1YyMUgyMVpNNDMgNDNWNDFINDFWNDNINDNaTTQxIDIxVjIzSDQzVjIxSDQxWk0yMSA0M1Y0MUgyM1Y0M0gyMVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                  }}
                                />
                                
                                {/* Image URL (editable) */}
                                <div className="flex-1 min-w-0">
                                  {editingImageIndex === index ? (
                                    <div className="flex gap-1">
                                      <input
                                        type="url"
                                        defaultValue={image.url}
                                        onBlur={(e) => handleEditImage(index, e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleEditImage(index, e.target.value);
                                          }
                                        }}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => setEditingImageIndex(index)}
                                      className="text-xs text-gray-600 truncate cursor-pointer hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                                      title={image.url}
                                    >
                                      {image.url}
                                    </div>
                                  )}
                                </div>

                                {/* Control buttons */}
                                <div className="flex gap-1">
                                  {/* Move up */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImageUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 14l5-5 5 5" />
                                    </svg>
                                  </button>
                                  
                                  {/* Move down */}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImageDown(index)}
                                    disabled={index === formData.image_gallery.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 10l-5 5-5-5" />
                                    </svg>
                                  </button>
                                  
                                  {/* Remove */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImageFromGallery(index)}
                                    className="p-1 text-red-400 hover:text-red-600"
                                    title="Remove image"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          Artist
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedArtist}
                            onChange={(e) => handleSelectArtist(e.target.value)}
                          >
                            <option value="">Select Artist</option>
                            {availableArtists
                              .sort((a, b) => a.localeCompare(b))
                              .map((artist, index) => (
                                <option key={index} value={artist}>
                                  {artist}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowArtistModal(true)}
                            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                            title="Add New Artist"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* VIDEO Type Fields */}
                  {formData.content_type === 'video' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          YouTube Video URL
                        </label>
                        <input
                          type="url"
                          name="youtube_url"
                          value={formData.youtube_url}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </>
                  )}

                  {/* MOVIE REVIEW Type Fields */}
                  {formData.content_type === 'movie_review' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          Main Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.image && (
                          <div className="mt-2">
                            <img src={formData.image} alt="Preview" className="w-32 h-20 object-cover rounded" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          YouTube Video URL
                        </label>
                        <input
                          type="url"
                          name="youtube_url"
                          value={formData.youtube_url}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                          Movie Rating
                        </label>
                        <select
                          name="movie_rating"
                          value={formData.movie_rating}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Rating</option>
                          {Array.from({ length: 21 }, (_, i) => {
                            const rating = (i * 0.25).toFixed(2);
                            return (
                              <option key={rating} value={rating}>
                                {rating} {rating === '5.00' ? '(Excellent)' : rating === '4.00' ? '(Very Good)' : rating === '3.00' ? '(Good)' : rating === '2.00' ? '(Fair)' : rating === '1.00' ? '(Poor)' : rating === '0.00' ? '(Terrible)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Main Content (Common for All Types) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Main Content *
                    </label>
                    <div className="border border-gray-300 rounded-md">
                      <Editor
                        editorState={editorState}
                        onEditorStateChange={onEditorStateChange}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                        toolbar={{
                          options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'link', 'image', 'history'],
                          inline: {
                            inDropdown: false,
                            options: ['bold', 'italic', 'underline', 'strikethrough']
                          },
                          blockType: {
                            inDropdown: true,
                            options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote']
                          },
                          fontSize: {
                            options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96]
                          },
                          list: {
                            inDropdown: false,
                            options: ['unordered', 'ordered']
                          },
                          textAlign: {
                            inDropdown: false,
                            options: ['left', 'center', 'right', 'justify']
                          },
                          link: {
                            inDropdown: false,
                            showOpenOptionOnHover: true,
                            defaultTargetOption: '_self',
                            options: ['link', 'unlink']
                          },
                          image: {
                            urlEnabled: true,
                            uploadEnabled: false,
                            previewImage: true,
                            inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                            alt: { present: false, mandatory: false }
                          },
                          history: {
                            inDropdown: false,
                            options: ['undo', 'redo']
                          }
                        }}
                        placeholder="Write your article content here..."
                        editorStyle={{
                          minHeight: '300px',
                          padding: '12px',
                          fontSize: '14px',
                          border: 'none',
                          borderRadius: '0 0 0.375rem 0.375rem'
                        }}
                        toolbarStyle={{
                          border: 'none',
                          borderBottom: '1px solid #d1d5db',
                          borderRadius: '0.375rem 0.375rem 0 0',
                          marginBottom: '0'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-left">
                      Use the toolbar above to format your content with headings, bold, italic, lists, links, and more.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SEO Section - Accordion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div 
                className="px-6 py-4 border-b border-gray-200 cursor-pointer flex items-center justify-between hover:bg-gray-50"
                onClick={() => toggleAccordion('seo')}
              >
                <h3 className="text-lg font-medium text-gray-900 text-left">SEO & Tags</h3>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${accordionStates.seo ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              {accordionStates.seo && (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="seo_title"
                      value={formData.seo_title}
                      onChange={handleInputChange}
                      placeholder="Leave empty to use article title"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      SEO Description
                    </label>
                    <textarea
                      name="seo_description"
                      value={formData.seo_description}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="SEO description for search engines"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      name="seo_keywords"
                      value={formData.seo_keywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2, keyword3"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="tag1, tag2, tag3"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Publishing & Sponsored Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">Publishing Settings</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Sponsored Article</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published && !formData.is_scheduled}
                      onChange={handlePublishChange}
                      disabled={formData.is_scheduled}
                      className="form-checkbox h-4 w-4 text-blue-600 disabled:opacity-50"
                    />
                    <span className="text-sm text-gray-700">Publish Immediately</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_scheduled"
                      checked={formData.is_scheduled}
                      onChange={handleScheduleChange}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Schedule for Later</span>
                  </label>
                </div>

                {/* Scheduling Section */}
                {formData.is_scheduled && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Scheduled Publish Date & Time (IST) *
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduled_publish_at"
                      value={formData.scheduled_publish_at}
                      onChange={handleInputChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.is_scheduled}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      The post will be automatically published at the scheduled time if auto-publishing is enabled by admin.
                    </p>
                  </div>
                )}
              </div>
            </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Post' : 'Create Post')}
              </button>

              <button
                type="button"
                onClick={handlePreview}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Preview
              </button>

              <button
                type="button"
                onClick={handleTranslate}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Generate Translation
              </button>

              <button
                type="button"
                onClick={() => navigate('/cms/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
        </>
        )}

        {/* Notification Modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={handleNotificationClose}
          type={notification.type}
          title={notification.title}
          message={notification.message}
        />

        {/* Gallery Selection Modal */}
        {showGalleryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">G</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 text-left">Select Image Gallery</h2>
                      <p className="text-sm text-gray-600">Choose a gallery to associate with this photo post</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowGalleryModal(false);
                      setGallerySearchTerm('');
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Search */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search galleries..."
                    value={gallerySearchTerm}
                    onChange={(e) => setGallerySearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-6 max-h-96 overflow-y-auto">
                {filteredGalleries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGalleries.map((gallery) => (
                      <div
                        key={gallery.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                        onClick={() => handleGallerySelect(gallery)}
                      >
                        <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden">
                          {gallery.images && gallery.images.length > 0 ? (
                            <img
                              src={gallery.images[0].data || gallery.images[0].url}
                              alt={gallery.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{display: gallery.images && gallery.images.length > 0 ? 'none' : 'flex'}}>
                            <span className="text-gray-400 font-bold text-2xl">G</span>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1 text-left">{gallery.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{gallery.images ? gallery.images.length : 0} images</span>
                          {gallery.artists && gallery.artists.length > 0 && (
                            <span>{gallery.artists.join(', ')}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="w-full mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGallerySelect(gallery);
                          }}
                        >
                          Select Gallery
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {gallerySearchTerm ? 'No galleries found matching your search.' : 'No galleries available.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Artist Modal */}
        {showArtistModal && (
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
                      setShowArtistModal(false);
                      setNewArtistName('');
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
                  handleAddArtist();
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1 text-left">
                      Artist Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newArtistName}
                      onChange={(e) => setNewArtistName(e.target.value)}
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
                    onClick={handleAddArtist}
                    disabled={!newArtistName.trim()}
                    className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Add Artist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Selection Modal */}
        {showGalleryModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 text-left">Select Image Gallery</h2>
                  <button
                    onClick={() => {
                      setShowGalleryModal(false);
                      setGallerySearchTerm('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Search */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search galleries..."
                    value={gallerySearchTerm}
                    onChange={(e) => setGallerySearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {filteredGalleries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No galleries found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGalleries.map((gallery) => (
                      <div
                        key={gallery.id}
                        onClick={() => handleGallerySelect(gallery)}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200"
                      >
                        <div className="aspect-w-16 aspect-h-9 mb-3">
                          {gallery.images && gallery.images.length > 0 ? (
                            <img
                              src={gallery.images[0].url || gallery.images[0]}
                              alt={gallery.title}
                              className="w-full h-32 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400">No Image</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 text-left">{gallery.title}</h3>
                        <p className="text-sm text-gray-500 text-left mt-1">
                          {gallery.images ? gallery.images.length : 0} images
                        </p>
                        {gallery.artists && gallery.artists.length > 0 && (
                          <p className="text-xs text-blue-600 text-left mt-1">
                            Artists: {gallery.artists.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default CreateArticle;
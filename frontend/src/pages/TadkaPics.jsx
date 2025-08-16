import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import ImageModal from '../components/ImageModal';

const TadkaPics = () => {
  const navigate = useNavigate();
  const { artistSlug, imageId } = useParams();
  const location = useLocation();
  const { theme, getSectionHeaderClasses } = useTheme();
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('thisWeek');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [relatedImages, setRelatedImages] = useState([]);

  // Utility function to create SEO-friendly slugs
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  // Analytics tracking function
  const trackImageView = (image, action = 'view') => {
    // Google Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'image_view', {
        'event_category': 'Tadka Pics',
        'event_label': image.name,
        'custom_parameter': action
      });
    }
    
    // Additional tracking can be added here
    console.log(`Analytics: ${action} - ${image.name}`);
  };

  // Actress images data - expanded from TadkaPics component with added dates and slugs
  const actressImages = [
    {
      id: 1,
      name: "Emma Stone",
      slug: "emma-stone",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: 2,
      name: "Zendaya",
      slug: "zendaya",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: 3,
      name: "Margot Robbie",
      slug: "margot-robbie",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
    },
    {
      id: 4,
      name: "Lupita Nyong'o",
      slug: "lupita-nyongo",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
    },
    {
      id: 5,
      name: "Saoirse Ronan",
      slug: "saoirse-ronan",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
    },
    {
      id: 6,
      name: "Anya Taylor-Joy",
      slug: "anya-taylor-joy",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
    },
    {
      id: 7,
      name: "Brie Larson",
      slug: "brie-larson",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days ago
    },
    {
      id: 8,
      name: "Gal Gadot",
      slug: "gal-gadot",
      image: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    },
    {
      id: 9,
      name: "Scarlett Johansson",
      slug: "scarlett-johansson",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 days ago
    },
    {
      id: 10,
      name: "Jennifer Lawrence",
      slug: "jennifer-lawrence",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop",
      category: "Hollywood",
      publishedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() // 50 days ago
    },
    // Bollywood actresses
    {
      id: 11,
      name: "Deepika Padukone",
      slug: "deepika-padukone",
      image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&h=1200&fit=crop",
      category: "Bollywood",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    {
      id: 12,
      name: "Priyanka Chopra",
      slug: "priyanka-chopra",
      image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=1200&fit=crop",
      category: "Bollywood",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    },
    {
      id: 13,
      name: "Kareena Kapoor",
      slug: "kareena-kapoor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop",
      category: "Bollywood",
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
    },
    {
      id: 14,
      name: "Alia Bhatt",
      slug: "alia-bhatt",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=1200&fit=crop",
      category: "Bollywood",
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() // 18 days ago
    },
    {
      id: 15,
      name: "Katrina Kaif",
      slug: "katrina-kaif",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=1200&fit=crop",
      category: "Bollywood",
      publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() // 22 days ago
    },
    // Tollywood actresses
    {
      id: 16,
      name: "Samantha Ruth Prabhu",
      slug: "samantha-ruth-prabhu",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1200&fit=crop",
      category: "Tollywood",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
    },
    {
      id: 17,
      name: "Rashmika Mandanna",
      slug: "rashmika-mandanna",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=1200&fit=crop",
      category: "Tollywood",
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
    },
    {
      id: 18,
      name: "Pooja Hegde",
      slug: "pooja-hegde",
      image: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1530785602389-07594beb8b73?w=800&h=1200&fit=crop",
      category: "Tollywood",
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
    },
    {
      id: 19,
      name: "Kajal Aggarwal",
      slug: "kajal-aggarwal",
      image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=1200&fit=crop",
      category: "Tollywood",
      publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // 35 days ago
    },
    {
      id: 20,
      name: "Tamannaah Bhatia",
      slug: "tamannaah-bhatia",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=450&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1200&fit=crop",
      category: "Tollywood",
      publishedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
    }
  ];

  // Time-based filter options
  const timeFilterOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'halfYear', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' }
  ];

  // Filter options for individual artists
  const filterOptions = [
    { value: 'all', label: 'All Artists' },
    { value: 'Emma Stone', label: 'Emma Stone' },
    { value: 'Zendaya', label: 'Zendaya' },
    { value: 'Margot Robbie', label: 'Margot Robbie' },
    { value: 'Lupita Nyong\'o', label: 'Lupita Nyong\'o' },
    { value: 'Saoirse Ronan', label: 'Saoirse Ronan' },
    { value: 'Anya Taylor-Joy', label: 'Anya Taylor-Joy' },
    { value: 'Brie Larson', label: 'Brie Larson' },
    { value: 'Gal Gadot', label: 'Gal Gadot' },
    { value: 'Scarlett Johansson', label: 'Scarlett Johansson' },
    { value: 'Jennifer Lawrence', label: 'Jennifer Lawrence' },
    { value: 'Deepika Padukone', label: 'Deepika Padukone' },
    { value: 'Priyanka Chopra', label: 'Priyanka Chopra' },
    { value: 'Kareena Kapoor', label: 'Kareena Kapoor' },
    { value: 'Alia Bhatt', label: 'Alia Bhatt' },
    { value: 'Katrina Kaif', label: 'Katrina Kaif' },
    { value: 'Samantha Ruth Prabhu', label: 'Samantha Ruth Prabhu' },
    { value: 'Rashmika Mandanna', label: 'Rashmika Mandanna' },
    { value: 'Pooja Hegde', label: 'Pooja Hegde' },
    { value: 'Kajal Aggarwal', label: 'Kajal Aggarwal' },
    { value: 'Tamannaah Bhatia', label: 'Tamannaah Bhatia' }
  ];

  useEffect(() => {
    setAllImages(actressImages);
    // Set related images (random selection)
    const shuffled = [...actressImages].sort(() => 0.5 - Math.random());
    setRelatedImages(shuffled.slice(0, 8));

    // Handle direct URL access to specific images
    if (artistSlug && imageId) {
      const image = actressImages.find(img => img.slug === artistSlug && img.id === parseInt(imageId));
      if (image) {
        setSelectedImage({ ...image, allImages: actressImages });
        trackImageView(image, 'direct_url_access');
      }
    } else if (artistSlug) {
      const image = actressImages.find(img => img.slug === artistSlug);
      if (image) {
        setSelectedImage({ ...image, allImages: actressImages });
        trackImageView(image, 'direct_artist_access');
      }
    }
  }, [artistSlug, imageId]);

  // Filter by time
  const filterImagesByDate = (images, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return images.filter((image) => {
      if (!image.publishedAt) return false;
      
      const imageDate = new Date(image.publishedAt);
      const timeDiff = now - imageDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      switch (filter) {
        case 'thisWeek':
          const currentWeekStart = new Date(today);
          const dayOfWeek = today.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          currentWeekStart.setDate(today.getDate() - daysToMonday);
          return imageDate >= currentWeekStart && imageDate <= now;
        case 'today':
          return daysDiff === 0;
        case 'yesterday':
          return daysDiff === 1;
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
          return false;
      }
    });
  };

  // Combined filter effect - both artist and time
  useEffect(() => {
    let filtered = allImages;
    
    // First filter by time
    filtered = filterImagesByDate(filtered, selectedTimeFilter);
    
    // Then filter by artist
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(image => image.name === selectedFilter);
    }
    
    setFilteredImages(filtered);
  }, [selectedFilter, selectedTimeFilter, allImages]);

  // Handle filter change
  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    setIsFilterOpen(false);
  };

  // Handle time filter change
  const handleTimeFilterChange = (filterValue) => {
    setSelectedTimeFilter(filterValue);
    setIsTimeFilterOpen(false);
  };

  // Get current filter label
  const getCurrentFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'All Artists';
  };

  // Get current time filter label
  const getCurrentTimeFilterLabel = () => {
    const option = timeFilterOptions.find(opt => opt.value === selectedTimeFilter);
    return option ? option.label : 'This Week';
  };

  const handleImageClick = (image) => {
    setSelectedImage({ ...image, allImages: filteredImages });
    // Update URL for SEO
    navigate(`/tadka-pics/${image.slug}/${image.id}`, { replace: true });
    // Track analytics
    trackImageView(image, 'gallery_click');
  };

  const handleRelatedImageClick = (image) => {
    setSelectedImage({ ...image, allImages: relatedImages });
    // Update URL for SEO
    navigate(`/tadka-pics/${image.slug}/${image.id}`, { replace: true });
    // Track analytics
    trackImageView(image, 'related_click');
  };

  // Handle next image navigation
  const handleNextImage = (currentId) => {
    const images = selectedImage?.allImages || filteredImages;
    const currentIndex = images.findIndex(img => img.id === currentId);
    const nextIndex = (currentIndex + 1) % images.length;
    const nextImage = images[nextIndex];
    
    setSelectedImage({ ...nextImage, allImages: images });
    // Update URL for SEO
    navigate(`/tadka-pics/${nextImage.slug}/${nextImage.id}`, { replace: true });
    // Track analytics
    trackImageView(nextImage, 'next_navigation');
  };

  // Handle previous image navigation  
  const handlePrevImage = (currentId) => {
    const images = selectedImage?.allImages || filteredImages;
    const currentIndex = images.findIndex(img => img.id === currentId);
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const prevImage = images[prevIndex];
    
    setSelectedImage({ ...prevImage, allImages: images });
    // Update URL for SEO
    navigate(`/tadka-pics/${prevImage.slug}/${prevImage.id}`, { replace: true });
    // Track analytics
    trackImageView(prevImage, 'prev_navigation');
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedImage(null);
    // Reset URL to main gallery page
    navigate('/tadka-pics', { replace: true });
  };

  const formatDate = (dateString) => {
    return new Date().toLocaleString('en-IN', {
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

  return (
    <div className={`min-h-screen ${themeClasses.pageBackground}`}>
      {/* Main Container */}
      <div className="max-w-5xl-plus mx-auto px-8 pb-6">
        
        {/* Two Section Layout with Gap - 70%/30% split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Tadka Pics Section - 70% width */}
          <div className="lg:col-span-7">
            {/* Section Header - Sticky with filter and bottom border */}
            <div className={`sticky top-16 z-40 border-b-2 border-gray-300 mb-3`} style={{ backgroundColor: 'rgb(249 250 251 / var(--tw-bg-opacity, 1))' }}>
              <div className="pl-0 pr-4 py-4">
                <div className="mb-2">
                  <h1 className="text-base font-bold text-black text-left leading-tight">
                    Tadka Pics
                  </h1>
                </div>
                
                {/* Image count and Filters on same line */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-900 opacity-75 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {filteredImages.length} galleries from {getCurrentFilterLabel().toLowerCase()} • {getCurrentTimeFilterLabel().toLowerCase()}
                  </p>

                  {/* Filter Dropdowns */}
                  <div className="flex items-center space-x-3">
                    {/* Time Filter Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>{getCurrentTimeFilterLabel()}</span>
                        <svg className={`w-3 h-3 ${isTimeFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      {/* Time Filter Dropdown Menu */}
                      {isTimeFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <div className="py-1">
                            {timeFilterOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleTimeFilterChange(option.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                  selectedTimeFilter === option.value 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artist Filter Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-900 opacity-75 hover:opacity-100 focus:outline-none"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>{getCurrentFilterLabel()}</span>
                        <svg className={`w-3 h-3 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>

                      {/* Artist Filter Dropdown Menu */}
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

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(image)}
                  className={`group cursor-pointer ${themeClasses.cardBackground} rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300`}
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={image.image}
                      alt={image.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h3 className="text-white font-medium text-sm truncate">
                        {image.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${themeClasses.textPrimary} mb-2`}>No galleries found</p>
                <p className={`${themeClasses.textSecondary}`}>Try selecting a different artist</p>
              </div>
            )}
          </div>
          
          {/* Related Pics Section - 30% width */}
          <div className="lg:col-span-3">
            <div className={`sticky top-16 ${themeClasses.cardBackground} rounded-lg border ${themeClasses.border} overflow-hidden`}>
              {/* Related Pics Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className={`font-bold text-base ${themeClasses.textPrimary} mb-1 text-left`}>
                  Related Pics
                </h2>
                <p className={`text-xs ${themeClasses.textSecondary} text-left`}>
                  Pics you may like
                </p>
              </div>
              
              {/* Related Pics List */}
              <div className="divide-y divide-gray-200">
                {relatedImages.length > 0 ? (
                  relatedImages.map((image, index) => (
                    <div
                      key={image.id}
                      onClick={() => handleRelatedImageClick(image)}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2`}
                    >
                      <div className="flex space-x-3">
                        <img
                          src={image.image}
                          alt={image.name}
                          className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className={`font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight mb-2 text-left line-clamp-2`} style={{ fontSize: '0.9rem' }}>
                            {image.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={`text-gray-600 text-sm text-left p-4`}>
                    No related pics found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          images={selectedImage.allImages}
          isOpen={!!selectedImage}
          onClose={handleModalClose}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </div>
  );
};

export default TadkaPics;
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dataService from '../services/dataService';
import ImageModal from '../components/ImageModal';

const ImageGalleryPage = () => {
  const navigate = useNavigate();
  const { galleryId } = useParams();
  const [searchParams] = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [relatedGalleries, setRelatedGalleries] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const contentRef = useRef(null);
  
  // Image Modal state for full-screen image viewing
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Gallery images
  const galleryImages = [
    {
      id: 1,
      fullImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      name: 'Beautiful Mountain Landscape',
      isVertical: false
    },
    {
      id: 2,
      fullImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      name: 'Serene Lake View',
      isVertical: false
    },
    {
      id: 3,
      fullImage: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop',
      name: 'Tropical Paradise Beach',
      isVertical: false
    },
    {
      id: 4,
      fullImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      name: 'Forest Adventure Trail',
      isVertical: false
    },
    {
      id: 5,
      fullImage: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop',
      name: 'Desert Sunset Vista',
      isVertical: false
    },
    {
      id: 6,
      fullImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
      name: 'Ocean Waves Crashing',
      isVertical: false
    }
  ];

  // Load gallery data
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setIsLoading(true);
        
        // Get gallery ID from URL params or search params
        const id = galleryId || searchParams.get('gallery');
        
        if (!id) {
          navigate('/');
          return;
        }

        // Create gallery object (simulated from article data)
        const gallery = {
          id: parseInt(id),
          title: `Travel Photography Collection ${id}`,
          summary: 'Explore stunning travel destinations through our curated photography collection.',
          content: 'This collection showcases breathtaking landscapes, vibrant cultures, and unforgettable moments from around the world. Each image tells a story of adventure, discovery, and the beauty of our planet.',
          category: 'Travel',
          author: 'DesiTrends Photo Team',
          published_at: new Date().toISOString(),
          view_count: Math.floor(Math.random() * 1000) + 100,
          section: 'image_gallery'
        };

        setCurrentGallery(gallery);
        setStartTime(Date.now());

        // Generate related galleries
        const related = [];
        for (let i = 1; i <= 8; i++) {
          if (i !== parseInt(id)) {
            related.push({
              id: i,
              title: `Travel Collection ${i}`,
              summary: `Beautiful photography collection ${i}`
            });
          }
        }
        setRelatedGalleries(related.slice(0, 6));

      } catch (error) {
        console.error('Error loading gallery:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleryData();
  }, [galleryId, searchParams, navigate]);

  // SEO and Analytics tracking
  useEffect(() => {
    if (!currentGallery) return;

    // Update document title for SEO
    document.title = `${currentGallery.title} - DesiTrends`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = currentGallery.summary || 'Explore stunning travel photography on DesiTrends.';
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": currentGallery.title,
      "description": currentGallery.summary,
      "author": {
        "@type": "Person",
        "name": currentGallery.author || "DesiTrends Photo Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "DesiTrends",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "datePublished": currentGallery.published_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };

    // Add structured data to head
    const existingStructuredData = document.querySelector('#gallery-structured-data');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    const script = document.createElement('script');
    script.id = 'gallery-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Update Open Graph meta tags
    updateOpenGraphTags();

    // Analytics tracking
    trackGalleryView();

    // Cleanup
    return () => {
      const structuredDataElement = document.querySelector('#gallery-structured-data');
      if (structuredDataElement) {
        structuredDataElement.remove();
      }
    };
  }, [currentGallery]);

  // Update Open Graph meta tags for social sharing
  const updateOpenGraphTags = () => {
    if (!currentGallery) return;

    const currentImage = galleryImages[currentImageIndex];
    const ogTags = [
      { property: 'og:title', content: currentGallery.title },
      { property: 'og:description', content: currentGallery.summary || 'Explore stunning travel photography on DesiTrends' },
      { property: 'og:image', content: currentImage.fullImage },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'DesiTrends' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: currentGallery.title },
      { name: 'twitter:description', content: currentGallery.summary },
      { name: 'twitter:image', content: currentImage.fullImage }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (tag.property) {
          element.setAttribute('property', tag.property);
        } else {
          element.setAttribute('name', tag.name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });
  };

  // Analytics tracking function
  const trackGalleryView = async () => {
    try {
      const trackingData = {
        galleryId: currentGallery.id,
        galleryTitle: currentGallery.title,
        category: currentGallery.category,
        section: 'image_gallery_page',
        action: 'gallery_page_view',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        source: 'image_gallery_page',
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        deviceType: isMobile ? 'mobile' : 'desktop',
        engagement: 'high',
        contentType: 'travel_photography',
        totalImages: galleryImages.length
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Gallery analytics tracking failed:', error);
    }
  };

  // Navigate between images
  const handlePrevImage = () => {
    const newIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    trackImageNavigation('previous', newIndex);
  };

  const handleNextImage = () => {
    const newIndex = (currentImageIndex + 1) % galleryImages.length;
    setCurrentImageIndex(newIndex);
    trackImageNavigation('next', newIndex);
  };

  // Track image navigation
  const trackImageNavigation = async (direction, imageIndex) => {
    try {
      const trackingData = {
        galleryId: currentGallery.id,
        imageIndex: imageIndex,
        imageName: galleryImages[imageIndex].name,
        action: `image_navigation_${direction}`,
        timestamp: new Date().toISOString(),
        source: 'image_gallery_page'
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Image navigation tracking failed:', error);
    }
  };

  // Handle image click for full-screen view
  const handleImageClick = () => {
    const currentImage = galleryImages[currentImageIndex];
    setSelectedImage(currentImage);
    setImageModalOpen(true);
    trackImageNavigation('fullscreen_view', currentImageIndex);
  };

  // Social sharing functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentGallery.title);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
    trackSocialShare('facebook');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentGallery.title);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
    trackSocialShare('x_twitter');
  };

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentGallery.title);
    const text = encodeURIComponent(`${currentGallery.title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'width=600,height=400');
    trackSocialShare('whatsapp');
  };

  const shareOnInstagram = () => {
    navigator.clipboard.writeText(`${currentGallery.title} - ${window.location.href}`).then(() => {
      alert('Content copied to clipboard! You can now paste it in your Instagram story or post.');
      trackSocialShare('instagram');
    });
  };

  const shareOnTikTok = () => {
    navigator.clipboard.writeText(`${currentGallery.title} - ${window.location.href}`).then(() => {
      alert('Content copied to clipboard! You can now share it on TikTok.');
      trackSocialShare('tiktok');
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
      trackSocialShare('copy_link');
    });
  };

  const trackSocialShare = async (platform) => {
    try {
      const trackingData = {
        galleryId: currentGallery.id,
        galleryTitle: currentGallery.title,
        action: 'social_share',
        platform: platform,
        timestamp: new Date().toISOString(),
        source: 'image_gallery_page',
        url: window.location.href
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });
    } catch (error) {
      console.error('Social share tracking failed:', error);
    }
  };

  // Handle related gallery click
  const handleRelatedGalleryClick = async (relatedGallery) => {
    try {
      // Track related gallery click
      const trackingData = {
        currentGalleryId: currentGallery.id,
        relatedGalleryId: relatedGallery.id,
        relatedGalleryTitle: relatedGallery.title,
        action: 'related_gallery_click',
        timestamp: new Date().toISOString(),
        source: 'gallery_page_related'
      };

      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Navigate to the related gallery
      navigate(`/gallery/${relatedGallery.id}`);
      
    } catch (error) {
      console.error('Related gallery click tracking failed:', error);
    }
  };

  const handleBack = () => {
    // Track back button click
    trackSocialShare('back_to_previous_page');
    navigate(-1);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // Sample thumbnail images for related galleries
  const getThumbnail = (index) => {
    const thumbnails = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=60&h=45&fit=crop',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=60&h=45&fit=crop'
    ];
    return thumbnails[index % thumbnails.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4 mx-auto"></div>
          <p className="text-lg font-medium text-gray-800">Loading Gallery</p>
        </div>
      </div>
    );
  }

  if (!currentGallery) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-start pt-20">
        <div className="ml-8 bg-white border border-gray-300 p-6 max-w-md">
          <div className="text-3xl mb-3">🖼️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Gallery not found</h2>
          <p className="text-gray-600 mb-4 text-sm">The gallery you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={handleBack}
            className="bg-blue-900 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800 transition-colors duration-200"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const currentImage = galleryImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 py-3 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Gallery Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content - 70% width */}
          <main className="lg:w-[70%]" ref={contentRef}>

            {/* Gallery Image Display */}
            <div className="mb-6">
              <div className="relative">
                <img
                  src={currentImage.fullImage}
                  alt={currentImage.name}
                  className="w-full h-96 object-cover rounded-lg shadow-lg cursor-pointer"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onClick={handleImageClick}
                />
                
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                  {currentImageIndex + 1} / {galleryImages.length}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Click to expand indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs opacity-0 hover:opacity-100 transition-opacity duration-300">
                  Click to expand
                </div>
              </div>

              {/* Image dots indicator */}
              <div className="flex justify-center space-x-1 mt-4">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-blue-900 shadow-lg' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Gallery Header */}
            <header className="mb-4">
              <h1 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 leading-tight mb-3">
                {currentGallery.title}
              </h1>
            </header>

            {/* Gallery Content */}
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                {currentGallery.summary}
              </p>
              
              <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                {currentGallery.content}
              </p>

              <p className="text-xs font-medium text-gray-900 leading-tight mb-3 text-justify">
                Discover the beauty of nature through our carefully curated collection of travel photography. Each image captures a unique moment in time, showcasing the diverse landscapes and cultures that make our world extraordinary.
              </p>
            </div>

            {/* Social Sharing - BlogModal Style */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex items-center justify-end">
                <div className="flex space-x-3">
                  <button
                    onClick={shareOnFacebook}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors duration-200"
                    title="Share on Facebook"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  <button
                    onClick={shareOnTwitter}
                    className="bg-black hover:bg-gray-900 text-white p-1 rounded-full transition-colors duration-200"
                    title="Share on X"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>

                  <button
                    onClick={shareOnWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors duration-200"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>

                  <button
                    onClick={shareOnInstagram}
                    className="bg-pink-600 hover:bg-pink-700 text-white p-1 rounded-full transition-colors duration-200"
                    title="Share on Instagram"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </button>

                  <button
                    onClick={shareOnTikTok}
                    className="bg-black hover:bg-gray-900 text-white p-1 rounded-full transition-colors duration-200"
                    title="Share on TikTok"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded-full transition-colors duration-200"
                    title="Copy Link"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Related Galleries Sidebar - 30% width */}
          <aside className="lg:w-[30%]">
            <div className="bg-gray-50 border border-gray-200 rounded overflow-hidden sticky top-32">
              <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">Related Galleries</h3>
              </div>
              
              <div className="overflow-y-auto bg-gray-50" style={{ maxHeight: '400px' }}>
                <div className="p-2">
                  <ul className="space-y-1">
                    {relatedGalleries.map((gallery, index) => (
                      <li
                        key={gallery.id}
                        className={`group cursor-pointer py-1 px-1 hover:bg-gray-100 transition-colors duration-200 ${
                          index < relatedGalleries.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                        onClick={() => handleRelatedGalleryClick(gallery)}
                      >
                        <div className="flex items-start space-x-2 text-left">
                          <img
                            src={getThumbnail(index)}
                            alt=""
                            className="flex-shrink-0 w-16 h-12 object-cover border border-gray-300 rounded group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 leading-tight">
                              {gallery.title}
                            </h4>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Full-screen Image Modal */}
      {imageModalOpen && selectedImage && (
        <div style={{ zIndex: 9999 }}>
          <ImageModal
            image={{
              id: selectedImage.id,
              fullImage: selectedImage.fullImage,
              name: selectedImage.name
            }}
            images={galleryImages.map(img => ({
              id: img.id,
              fullImage: img.fullImage,
              name: img.name
            }))}
            onClose={() => setImageModalOpen(false)}
            onNext={() => {
              const nextIndex = (currentImageIndex + 1) % galleryImages.length;
              setCurrentImageIndex(nextIndex);
              setSelectedImage(galleryImages[nextIndex]);
            }}
            onPrev={() => {
              const prevIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
              setCurrentImageIndex(prevIndex);
              setSelectedImage(galleryImages[prevIndex]);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageGalleryPage;
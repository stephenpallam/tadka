import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageModal from '../components/ImageModal';

const TopInstaPics = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Actress gallery data with names
  const actressGallery = [
    {
      id: 1,
      name: "Emma Stone",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=1200&fit=crop"
    },
    {
      id: 2,
      name: "Zendaya",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1200&fit=crop"
    },
    {
      id: 3,
      name: "Margot Robbie",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop"
    },
    {
      id: 4,
      name: "Lupita Nyong'o",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=800&h=1200&fit=crop"
    },
    {
      id: 5,
      name: "Saoirse Ronan",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=1200&fit=crop"
    },
    {
      id: 6,
      name: "Anya Taylor-Joy",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop"
    },
    {
      id: 7,
      name: "Brie Larson",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=1200&fit=crop"
    },
    {
      id: 8,
      name: "Gal Gadot",
      image: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800&h=1200&fit=crop"
    },
    {
      id: 9,
      name: "Florence Pugh",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1200&fit=crop"
    },
    {
      id: 10,
      name: "Alicia Vikander",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop"
    },
    {
      id: 11,
      name: "Natalie Portman",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=1200&fit=crop"
    },
    {
      id: 12,
      name: "Scarlett Johansson",
      image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=1200&fit=crop"
    },
    {
      id: 13,
      name: "Jennifer Lawrence",
      image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=1200&fit=crop"
    },
    {
      id: 14,
      name: "Anne Hathaway",
      image: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=800&h=1200&fit=crop"
    },
    {
      id: 15,
      name: "Amy Adams",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=1200&fit=crop"
    },
    {
      id: 16,
      name: "Charlize Theron",
      image: "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=800&h=1200&fit=crop"
    },
    {
      id: 17,
      name: "Reese Witherspoon",
      image: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=800&h=1200&fit=crop"
    },
    {
      id: 18,
      name: "Viola Davis",
      image: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=1200&fit=crop"
    },
    {
      id: 19,
      name: "Cate Blanchett",
      image: "https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=800&h=1200&fit=crop"
    },
    {
      id: 20,
      name: "Jessica Chastain",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
      fullImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1200&fit=crop"
    }
  ];

  // Analytics tracking function
  const trackImageClick = async (imageId, imageName, action = 'view') => {
    try {
      // Send tracking data to backend
      const trackingData = {
        imageId: imageId,
        imageName: imageName,
        action: action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      };

      // Send to backend API
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData)
      });

      // Update browser history for SEO/analytics tracking
      const newUrl = `${window.location.pathname}?image=${imageId}&actress=${encodeURIComponent(imageName)}`;
      window.history.pushState(
        { imageId, imageName, action }, 
        `${imageName} - Tadka Pics`, 
        newUrl
      );

    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  };

  const handleImageClick = (image) => {
    // Check if this is Emma Stone (id: 1) which should lead to the actress gallery page
    if (image.id === 1 && image.name === "Emma Stone") {
      // Navigate to actress gallery page
      navigate('/actress-gallery/1');
    } else {
      // Normal modal behavior for other images
      setSelectedImage(image);
      setModalOpen(true);
      trackImageClick(image.id, image.name, 'modal_open');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedImage(null);
    // Reset URL when modal closes
    window.history.pushState({}, 'Tadka Pics', window.location.pathname);
  };

  const handleNextImage = (currentId) => {
    const currentIndex = actressGallery.findIndex(img => img.id === currentId);
    const nextIndex = (currentIndex + 1) % actressGallery.length;
    const nextImage = actressGallery[nextIndex];
    
    setSelectedImage(nextImage);
    trackImageClick(nextImage.id, nextImage.name, 'next_image');
  };

  const handlePrevImage = (currentId) => {
    const currentIndex = actressGallery.findIndex(img => img.id === currentId);
    const prevIndex = currentIndex === 0 ? actressGallery.length - 1 : currentIndex - 1;
    const prevImage = actressGallery[prevIndex];
    
    setSelectedImage(prevImage);
    trackImageClick(prevImage.id, prevImage.name, 'prev_image');
  };

  const handleThumbnailClick = (imageId) => {
    const clickedImage = actressGallery.find(img => img.id === imageId);
    if (clickedImage) {
      setSelectedImage(clickedImage);
      trackImageClick(clickedImage.id, clickedImage.name, 'thumbnail_click');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="bg-gray-100 px-3 py-2 border border-gray-300 text-left mb-6">
          <h3 className="text-sm font-semibold text-gray-900">Tadka Pics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {actressGallery.map((image) => (
            <div
              key={image.id}
              className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleImageClick(image)}
            >
              <div className="relative">
                <img
                  src={image.image}
                  alt={image.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-t from-gray-50 to-white">
                <h3 className="text-sm font-semibold text-gray-900 text-center leading-tight">
                  {image.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {modalOpen && selectedImage && (
        <ImageModal
          image={selectedImage}
          images={actressGallery}
          onClose={handleModalClose}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
          onImageChange={handleThumbnailClick}
        />
      )}
    </div>
  );
};

export default TopInstaPics;
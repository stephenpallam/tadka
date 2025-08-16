import React, { createContext, useContext, useState, useEffect } from 'react';

const DragDropContext = createContext();

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

export const DragDropProvider = ({ children }) => {
  // Default section order - responsive layout: Desktop(3 cols), iPad(2 cols), Mobile(1 col)
  const defaultSectionOrder = [
    'tadka-pics',               // Full width
    'top-stories',              // Full width  
    'politics-movies-row',      // Desktop: Politics+Movies+Sports | iPad: Politics+Movies
    'sports-fashion-row',       // iPad only: Sports+Hot Topics  
    'trending-videos',          // Full width - Trending videos section
    'viral-travel-row',         // Desktop: Travel+Fashion | iPad: Travel only
    'movie-reviews',            // Full width
    'trailers-boxoffice-row',   // Desktop: Trailers+BoxOffice+TheaterReleases | iPad: Trailers+BoxOffice
    'theater-ott-row',          // iPad only: TheaterReleases+OTTReleases
    'ott-movie-reviews',        // Full width
    'videosongs-tv-row',        // Desktop: VideoSongs+TV+OTTReleases | iPad: VideoSongs+TV
    'events-interviews',        // Full width
    'viral-shorts',             // Full width - New Viral Shorts section with state filtering
    'ai-fashion-row',           // Desktop: Health+StockMarket+AI | iPad: Health+StockMarket
    'health-standalone-row',    // iPad only: AI standalone
    'sponsored-ads-row'         // All devices: Sponsored Ads (final row)
  ];

  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSection, setDraggedSection] = useState(null);

  // Load saved section order from localStorage or set current as default
  useEffect(() => {
    const savedOrder = localStorage.getItem('tadka_section_order');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        setSectionOrder(parsedOrder);
      } catch (error) {
        console.error('Error loading section order:', error);
        // If parsing fails, save current default as the new saved order
        localStorage.setItem('tadka_section_order', JSON.stringify(defaultSectionOrder));
      }
    } else {
      // If no saved order exists, save the current default layout
      localStorage.setItem('tadka_section_order', JSON.stringify(defaultSectionOrder));
    }
  }, []);

  // Save section order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tadka_section_order', JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  // Function to force save current layout as default
  const saveCurrentAsDefault = () => {
    localStorage.setItem('tadka_section_order', JSON.stringify(defaultSectionOrder));
    setSectionOrder(defaultSectionOrder);
  };

  // Ensure current layout is saved on initial load
  useEffect(() => {
    // Force save the current default layout to ensure it persists
    const currentSaved = localStorage.getItem('tadka_section_order');
    if (!currentSaved || currentSaved !== JSON.stringify(defaultSectionOrder)) {
      localStorage.setItem('tadka_section_order', JSON.stringify(defaultSectionOrder));
    }
  }, []);

  const moveSectionToIndex = (sectionId, newIndex) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex === -1) return;

    const newOrder = [...sectionOrder];
    // Remove section from current position
    newOrder.splice(currentIndex, 1);
    // Insert at new position
    newOrder.splice(newIndex, 0, sectionId);
    
    setSectionOrder(newOrder);
  };

  const moveUp = (sectionId) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex <= 0) return; // Can't move up if already at top

    const newOrder = [...sectionOrder];
    // Swap with the item above
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    
    setSectionOrder(newOrder);
  };

  const moveDown = (sectionId) => {
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex >= sectionOrder.length - 1) return; // Can't move down if already at bottom

    const newOrder = [...sectionOrder];
    // Swap with the item below
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    
    setSectionOrder(newOrder);
  };

  const swapSections = (sectionId1, sectionId2) => {
    const index1 = sectionOrder.indexOf(sectionId1);
    const index2 = sectionOrder.indexOf(sectionId2);
    
    if (index1 === -1 || index2 === -1) return;

    const newOrder = [...sectionOrder];
    newOrder[index1] = sectionId2;
    newOrder[index2] = sectionId1;
    
    setSectionOrder(newOrder);
  };

  const resetToDefault = () => {
    setSectionOrder(defaultSectionOrder);
  };

  const value = {
    sectionOrder,
    setSectionOrder,
    isDragging,
    setIsDragging,
    draggedSection,
    setDraggedSection,
    moveSectionToIndex,
    moveUp,
    moveDown,
    swapSections,
    resetToDefault,
    saveCurrentAsDefault
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
};

export default DragDropContext;
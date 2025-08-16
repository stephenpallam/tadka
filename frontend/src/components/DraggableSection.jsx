import React from 'react';
import { useDragDrop } from '../contexts/DragDropContext';

const DraggableSection = ({ 
  sectionId, 
  children, 
  className = '',
  showDragHandle = true,
  allowDrop = true,
  layoutEditMode = false
}) => {
  const { 
    isDragging, 
    setIsDragging, 
    draggedSection, 
    setDraggedSection,
    moveSectionToIndex,
    moveUp,
    moveDown,
    sectionOrder
  } = useDragDrop();

  const handleDragStart = (e) => {
    setIsDragging(true);
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
    
    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    setDraggedSection(null);
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    if (!allowDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    if (!allowDrop) return;
    e.preventDefault();
    const droppedSectionId = e.dataTransfer.getData('text/plain');
    
    if (droppedSectionId !== sectionId) {
      // Find the current indices
      const draggedIndex = sectionOrder.indexOf(droppedSectionId);
      const targetIndex = sectionOrder.indexOf(sectionId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Move the dragged section to the position of the target section
        moveSectionToIndex(droppedSectionId, targetIndex);
      }
    }
  };

  const isBeingDragged = draggedSection === sectionId;
  const currentIndex = sectionOrder.indexOf(sectionId);
  const canMoveUp = currentIndex > 0;
  const canMoveDown = currentIndex < sectionOrder.length - 1;

  const handleMoveUp = (e) => {
    e.stopPropagation();
    console.log('Moving up:', sectionId, 'from index:', currentIndex);
    moveUp(sectionId);
  };

  const handleMoveDown = (e) => {
    e.stopPropagation();
    console.log('Moving down:', sectionId, 'from index:', currentIndex);
    moveDown(sectionId);
  };

  return (
    <div
      className={`relative ${className} ${
        isDragging && !isBeingDragged && allowDrop ? 'drag-drop-zone' : ''
      } ${isBeingDragged ? 'dragging' : ''} draggable-controls-container`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        transition: 'all 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Up/Down Arrow Controls - positioned at the rightmost section border, not window border */}
      <div className={`absolute top-2 z-50 transition-opacity duration-200 flex flex-col space-y-2 pointer-events-auto ${layoutEditMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
           style={{ 
             right: 'calc(50vw - min(640px, 50vw) + 2rem + 4px)' // Positions at right edge of max-w-5xl + px-8 container + small offset
           }}>
        <div className="flex flex-col space-y-1 bg-opacity-90 rounded-md shadow-lg p-1">
          {/* Up Arrow */}
          <button
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            className={`p-2 rounded-lg shadow-lg transition-all duration-200 pointer-events-auto ${
              canMoveUp 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
            </svg>
          </button>
          
          {/* Down Arrow */}
          <button
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            className={`p-2 rounded-lg shadow-lg transition-all duration-200 pointer-events-auto ${
              canMoveDown 
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Drop indicator */}
      {isDragging && !isBeingDragged && allowDrop && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-30 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200 z-5">
          <div className="flex items-center justify-center h-full">
            <span className="text-blue-600 font-medium bg-white px-2 py-1 rounded shadow">
              Drop here to reposition
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

// Create a droppable zone component for empty areas
export const DroppableZone = ({ groupName, onDrop, className = '' }) => {
  const { isDragging, draggedSection } = useDragDrop();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedSectionId = e.dataTransfer.getData('text/plain');
    if (onDrop) {
      onDrop(droppedSectionId, groupName);
    }
  };

  if (!isDragging) {
    return null; // Don't show drop zones when not dragging
  }

  return (
    <div 
      className={`${className} min-h-[150px] border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center text-blue-400 bg-blue-50 bg-opacity-50 transition-all duration-200`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className="text-2xl mb-2">⬇️</div>
        <p className="text-sm font-medium">Drop {draggedSection} here</p>
      </div>
    </div>
  );
};

export default DraggableSection;
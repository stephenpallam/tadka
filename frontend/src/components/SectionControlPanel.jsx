import React, { useState } from 'react';
import { useDragDrop } from '../contexts/DragDropContext';

const SectionControlPanel = ({ layoutEditMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { resetToDefault, isDragging } = useDragDrop();

  const handleReset = () => {
    resetToDefault();
    setIsOpen(false);
  };

  // Don't show the control panel in layout edit mode
  if (layoutEditMode) {
    return null;
  }

  return (
    <>
      {/* Control Panel Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
          title="Section Controls"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {!isOpen && <span className="text-sm font-medium">Customize</span>}
        </button>
      </div>

      {/* Control Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Section Controls</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="font-medium text-blue-800 mb-2">How to reorder sections:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Hover over any section to see the drag handle</li>
                <li>• Drag and drop sections to reorder them</li>
                <li>• Your preferences are automatically saved</li>
              </ul>
            </div>

            {/* Status */}
            {isDragging && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-700 font-medium">
                  🎯 Drop the section where you want it to appear
                </p>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors duration-200"
            >
              Reset to Default Order
            </button>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center">
              Section order is saved automatically and will be restored when you return.
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SectionControlPanel;
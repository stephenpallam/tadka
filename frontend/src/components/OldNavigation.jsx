import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const moreDropdownRef = useRef(null);

  const mainMenuItems = [
    { name: 'Latest', path: '/' },
    { name: 'Politics', path: '/politics' },
    { name: 'Movies', path: '/movies' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Gallery', path: '/gallery' }
  ];

  const moreMenuItems = [
    { name: 'AI', path: '/ai' },
    { name: 'Stock Market', path: '/stock-market' },
    { name: 'Education', path: '/education' },
    { name: 'Sports', path: '/sports' },
    { name: 'Beauty', path: '/beauty' },
    { name: 'Fashion', path: '/fashion' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isMoreActive = () => {
    return moreMenuItems.some(item => isActive(item.path));
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 via-white to-orange-50 shadow-lg border-b border-gray-200">
      {/* Single Header Section with Logo and Navigation */}
      <div className="bg-white/90 backdrop-blur-sm h-16 flex items-center">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between md:justify-start">
          {/* Logo and Navigation Combined */}
          <div className="flex items-center space-x-8 pl-3">
            <Link to="/" className="flex items-center space-x-2 group">
              {/* DesiNews Square Logo with DN Letters - Black and Orange */}
              <div className="w-12 h-12 relative group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  {/* Square background with rounded corners */}
                  <rect
                    x="4"
                    y="4"
                    width="40"
                    height="40"
                    rx="8"
                    ry="8"
                    fill="#1a1a1a"
                    className="group-hover:fill-gray-800 transition-colors duration-300"
                  />
                  {/* Orange accent border */}
                  <rect
                    x="4"
                    y="4"
                    width="40"
                    height="40"
                    rx="8"
                    ry="8"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    className="group-hover:stroke-orange-400 transition-colors duration-300"
                  />
                  {/* DN Letters */}
                  <text
                    x="24"
                    y="32"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    fill="#f97316"
                    className="group-hover:fill-orange-400 transition-colors duration-300"
                  >
                    DN
                  </text>
                </svg>
              </div>
              <div className="flex flex-col -space-y-1">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-black group-hover:text-gray-800 transition-colors duration-300">
                    Desi
                  </span>
                  <span className="text-xl font-bold text-orange-500 group-hover:text-orange-400 transition-colors duration-300">
                    News
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-semibold tracking-wide leading-none">
                  Trending Topics
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors duration-200 text-sm font-medium">
                <i className="fas fa-home mr-1"></i>
              </Link>
              {mainMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path) 
                      ? 'text-blue-900 border-b-2 border-orange-500 pb-1' 
                      : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* More Menu Dropdown */}
              <div className="relative" ref={moreDropdownRef}>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    isMoreActive() 
                      ? 'text-blue-900 border-b-2 border-orange-500 pb-1' 
                      : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  <span>More</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {isMoreOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-lg border border-gray-200 rounded-lg py-2 w-48 z-10">
                    {moreMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMoreOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                          isActive(item.path)
                            ? 'text-blue-900 bg-blue-50 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-orange-500'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          {/* Social Icons */}
          <div className="hidden md:flex items-center space-x-3">
            <a href="#" className="text-gray-600 hover:text-blue-900 transition-colors duration-200 text-sm">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-orange-500 transition-colors duration-200 text-sm">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-900 transition-colors duration-200 text-sm">
              <i className="fab fa-youtube"></i>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-black p-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} border-t border-orange-100 mt-3 pt-3 bg-gradient-to-b from-white to-orange-50/30`}>
          <div className="px-4 space-y-2">
            {mainMenuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path) ? 'text-blue-900 font-semibold' : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* More Categories Section */}
            <div className="border-t border-gray-200 my-3 pt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">More Categories</p>
              {moreMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 pl-4 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path) ? 'text-blue-900 font-semibold' : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
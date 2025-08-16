import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const AboutUs = () => {
  const { getSectionHeaderClasses } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg mb-8 p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-400 border-2 border-gray-300 flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-bold text-2xl">T</span>
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className={`text-3xl font-bold ${getSectionHeaderClasses().textClass} mb-4`}>
              🔥 Welcome to Tadka – Your Daily Dose of Trending News with a Personal Twist!
            </h1>
            
            <p className={`text-lg ${getSectionHeaderClasses().textClass} opacity-90 leading-relaxed`}>
              At Tadka, we believe news should feel personal, relevant, and full of flavor—just like your daily tadka!
            </p>
            
            <p className={`text-lg ${getSectionHeaderClasses().textClass} opacity-90 leading-relaxed mt-2`}>
              We bring you the latest, trending news from the world of <span className="font-semibold text-blue-600">Politics</span>, 
              <span className="font-semibold text-purple-600"> Movies</span>, and 
              <span className="font-semibold text-green-600"> Sports</span>—served hot every day and tailored just for you.
            </p>
          </div>
        </div>

        {/* Why Tadka is Different Section */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg mb-8 p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <h2 className={`text-2xl font-bold ${getSectionHeaderClasses().textClass} mb-6 text-center`}>
            🎯 Why Tadka is Different
          </h2>
          
          <div className="space-y-6">
            {/* Personalized News Feed */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-2`}>
                  Personalized News Feed
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} opacity-90 leading-relaxed`}>
                  You choose your state, your language, and your interests—we do the rest. Whether you're from 
                  <span className="font-medium text-orange-600"> Gujarat</span>, 
                  <span className="font-medium text-green-600"> Kerala</span>, 
                  <span className="font-medium text-purple-600"> Punjab</span>, or 
                  <span className="font-medium text-red-600"> Tamil Nadu</span>, you'll get news that matters to you, 
                  in English or your regional language like Gujarati, Tamil, Telugu, Hindi, etc.
                </p>
              </div>
            </div>

            {/* Theme Your Way */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-2`}>
                  Theme Your Way
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} opacity-90 leading-relaxed`}>
                  Make Tadka look the way you like it. Choose your favorite theme colors and enjoy a fully customized reading experience.
                </p>
              </div>
            </div>

            {/* All in One Place */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📰</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-2`}>
                  Politics. Movies. Sports. All in One Place
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} opacity-90 leading-relaxed`}>
                  From election buzz to blockbuster releases, cricket matches to cabinet shuffles—Tadka serves it all in a single flavorful stream.
                </p>
              </div>
            </div>

            {/* Made for Every Indian */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-2`}>
                  Made for Every Indian, Everywhere
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} opacity-90 leading-relaxed`}>
                  Whether you're in <span className="font-medium text-blue-600">Mumbai</span> or 
                  <span className="font-medium text-green-600"> Madurai</span>, 
                  <span className="font-medium text-purple-600"> Chandigarh</span> or 
                  <span className="font-medium text-red-600"> Chennai</span>—Tadka gives you your state's news in your language.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Section */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg mb-8 p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <h2 className={`text-2xl font-bold ${getSectionHeaderClasses().textClass} mb-6 text-center`}>
            📲 Get Started
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl mb-3">👉</div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Select your state</h3>
              <p className="text-sm text-blue-700 opacity-90">Choose from all Indian states</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl mb-3">👉</div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Choose your language</h3>
              <p className="text-sm text-green-700 opacity-90">English or regional language</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl mb-3">👉</div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Pick your favorite theme</h3>
              <p className="text-sm text-purple-700 opacity-90">Light, Dark, or Colorful</p>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className={`text-lg ${getSectionHeaderClasses().textClass} opacity-90`}>
              And enjoy a Tadka-fied news experience that's as vibrant and diverse as India itself.
            </p>
          </div>
        </div>

        {/* Footer Message */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg p-8 border ${getSectionHeaderClasses().borderClass} text-center`}>
          <h2 className={`text-2xl font-bold ${getSectionHeaderClasses().textClass} mb-4`}>
            ❤️ Tadka – India's Personalized News Masala!
          </h2>
          <p className={`text-lg ${getSectionHeaderClasses().textClass} opacity-90 italic`}>
            Because one size doesn't fit all—and neither should your news.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <button 
            onClick={() => {
              // Trigger settings modal
              const event = new CustomEvent('openSettingsModal');
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15.5A3.5 3.5 0 018.5 12A3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0014 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
            </svg>
            Personalize Your Tadka Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
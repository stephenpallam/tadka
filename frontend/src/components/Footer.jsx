import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { theme } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Get the first letter of translated "Tadka" for the logo
  const getLogoLetter = () => {
    return t('title', 'Tadka').charAt(0);
  };

  // Get translated title for footer display
  const getTranslatedTitle = () => {
    return t('title', 'Tadka');
  };

  // Get footer background color based on theme
  const getFooterBgColor = () => {
    switch (theme) {
      case 'blue':
        return '#084e73'; // Custom blue footer background
      default:
        return undefined; // Use default Tailwind class
    }
  };

  // Get footer logo styles based on theme
  const getFooterLogoStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          bgClass: 'bg-gray-800',
          textClass: 'text-white',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#192236' // Match dark theme header color
        };
      case 'blue':
        return {
          bgClass: 'bg-blue-500',
          textClass: 'text-white',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#0d7ebb' // Match blue theme header color
        };
      case 'red':
        return {
          bgClass: 'bg-red-500',
          textClass: 'text-white',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#ff4e51' // Match red theme header color
        };
      case 'colorful':
        return {
          bgClass: 'bg-yellow-400',
          textClass: 'text-red-600',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#f6bf04' // Match colorful theme header color
        };
      default: // light
        return {
          bgClass: 'bg-gray-200',
          textClass: 'text-gray-800',
          borderClass: 'border-0', // Remove border
          roundedClass: 'rounded-lg',
          customBg: '#e5e7eb' // Match light theme header color
        };
    }
  };

  return (
    <footer 
      className="bg-gray-900 text-white"
      style={getFooterBgColor() ? { backgroundColor: getFooterBgColor() } : {}}
    >
      <div className="max-w-5xl-plus mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Company Info Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 text-left">
              <div 
                className={`w-8 h-8 ${getFooterLogoStyles().bgClass} ${getFooterLogoStyles().roundedClass} flex items-center justify-center`}
                style={getFooterLogoStyles().customBg ? { backgroundColor: getFooterLogoStyles().customBg } : {}}
              >
                <span className={`${getFooterLogoStyles().textClass} font-bold text-sm`}>{getLogoLetter()}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold text-lg text-left">{getTranslatedTitle()}</span>
                <span className="text-gray-400 text-sm text-left">{t('footer.website_subtitle', 'Personalized News')}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed text-left">
              {t('footer.description', 'Find Indian News & Updates Near You. Connecting Indian communities with personalized news from Politics, Movies, and Sports across India.')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="text-gray-400 text-sm">support@tadka.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span className="text-gray-400 text-sm">+91 (888) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4 text-left">{t('footer.quick_links', 'QUICK LINKS')}</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.home', 'Home')}</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.about_us', 'About Us')}</Link></li>
              <li><Link to="/politics" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('nav.politics', 'Politics')}</Link></li>
              <li><Link to="/movies" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('nav.movies', 'Movies')}</Link></li>
              <li><Link to="/reviews" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('nav.reviews', 'Reviews')}</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('nav.gallery', 'Gallery')}</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4 text-left">{t('footer.legal', 'LEGAL')}</h3>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.terms_of_use', 'Terms of Use')}</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.privacy_policy', 'Privacy Policy')}</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.cookie_policy', 'Cookie Policy')}</Link></li>
              <li><Link to="/disclaimer" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.disclaimer', 'Disclaimer')}</Link></li>
              <li><Link to="/content-guidelines" className="text-gray-400 hover:text-white text-sm transition-colors duration-200 text-left block">{t('footer.content_guidelines', 'Content Guidelines')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <p className="text-gray-400 text-sm mb-4 md:mb-0 text-left">
              © {currentYear} Tadka. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm text-left">
              {t('footer.made_with_love', 'Made with ❤️ for the Indian community')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CookiePolicy = () => {
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
            
            <h1 className={`text-3xl font-bold ${getSectionHeaderClasses().textClass} mb-2`}>
              Cookie Policy – Tadka
            </h1>
            <p className={`text-sm ${getSectionHeaderClasses().textClass} opacity-75`}>
              Last Updated: January 24, 2025
            </p>
          </div>
        </div>

        {/* Cookie Policy Content */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <div className="prose prose-gray max-w-none">
            <p className={`text-lg ${getSectionHeaderClasses().textClass} mb-6 leading-relaxed`}>
              This Cookie Policy explains how Tadka ("we", "our", "us") uses cookies and similar technologies when you visit our website (tadka.com). This policy describes what cookies are, how we use them, and your choices regarding cookies.
            </p>

            {/* Section 1 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                1. What Are Cookies?
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work efficiently and provide a better user experience.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain on your device until they expire or you delete them).
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                2. How We Use Cookies
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka uses cookies for the following purposes:
              </p>
              
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Essential Cookies
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-2`}>
                  These cookies are necessary for the website to function properly:
                </p>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Authentication and security</p>
                  <p>• Maintaining your session while browsing</p>
                  <p>• Remembering your login status</p>
                  <p>• Basic website functionality</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Preference Cookies
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-2`}>
                  These cookies remember your personalization choices:
                </p>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Your selected state (Gujarat, Kerala, Tamil Nadu, etc.)</p>
                  <p>• Your preferred language (English, Hindi, Gujarati, etc.)</p>
                  <p>• Your chosen theme (Light, Dark, Colorful)</p>
                  <p>• Font size and accessibility preferences</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Analytics Cookies
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-2`}>
                  These cookies help us understand how visitors use our website:
                </p>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Page views and popular content</p>
                  <p>• Time spent on different sections</p>
                  <p>• User navigation patterns</p>
                  <p>• Device and browser information</p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                3. Third-Party Cookies
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We may use third-party services that set their own cookies:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Google Analytics</strong>: For website traffic analysis</p>
                <p>• <strong>Social Media Plugins</strong>: For sharing content on social platforms</p>
                <p>• <strong>Content Delivery Networks</strong>: For faster content loading</p>
                <p>• <strong>Security Services</strong>: For protection against spam and malicious activities</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                These third parties have their own privacy policies and cookie policies that govern their use of cookies.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                4. Managing Your Cookie Preferences
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                You have several options to control and manage cookies:
              </p>
              
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Browser Settings
                </h3>
                <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-2`}>
                  Most browsers allow you to:
                </p>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• View and delete cookies</p>
                  <p>• Block cookies from specific websites</p>
                  <p>• Block third-party cookies</p>
                  <p>• Clear all cookies when you close the browser</p>
                  <p>• Set exceptions for trusted websites</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Browser-Specific Instructions
                </h3>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                  <p>• <strong>Google Chrome</strong>: Settings → Privacy and Security → Cookies and other site data</p>
                  <p>• <strong>Mozilla Firefox</strong>: Options → Privacy & Security → Cookies and Site Data</p>
                  <p>• <strong>Safari</strong>: Preferences → Privacy → Manage Website Data</p>
                  <p>• <strong>Microsoft Edge</strong>: Settings → Site permissions → Cookies and site data</p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                5. Impact of Disabling Cookies
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                While you can disable cookies, please note that this may affect your experience on Tadka:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• You may need to re-enter your preferences each visit</p>
                <p>• Some personalization features may not work properly</p>
                <p>• Login functionality may be affected</p>
                <p>• Theme and language settings may not be saved</p>
                <p>• We may not be able to provide location-specific content</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                6. Mobile Devices
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                For mobile devices, cookie management is typically found in your browser's settings menu. You can also:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Use private/incognito browsing mode</p>
                <p>• Clear browsing data regularly</p>
                <p>• Adjust privacy settings in your mobile browser</p>
                <p>• Use browser extensions that block tracking cookies</p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                7. Updates to This Policy
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                We will notify users of any significant changes by posting the updated policy on our website with a new "Last Updated" date.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                8. Contact Us
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} space-y-2`}>
                <p className="flex items-center space-x-2">
                  <span>📧</span>
                  <a href="mailto:support@tadka.com" className="text-blue-600 hover:text-blue-800">support@tadka.com</a>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+91 (888) 123-4567</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>🌐</span>
                  <a href="https://tadka.com" className="text-blue-600 hover:text-blue-800">tadka.com</a>
                </p>
              </div>
              <div className={`${getSectionHeaderClasses().textClass} mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded`}>
                <p className="font-semibold">Cookie Transparency:</p>
                <p>We believe in being transparent about our cookie usage and are committed to respecting your privacy choices.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
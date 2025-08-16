import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const PrivacyPolicy = () => {
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
              Privacy Policy – Tadka
            </h1>
            <p className={`text-sm ${getSectionHeaderClasses().textClass} opacity-75`}>
              Last Updated: January 24, 2025
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <div className="prose prose-gray max-w-none">
            <p className={`text-lg ${getSectionHeaderClasses().textClass} mb-6 leading-relaxed`}>
              At Tadka, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.
            </p>

            {/* Section 1 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                1. Information We Collect
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We may collect the following types of information:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Basic usage data</strong> (device type, browser information, IP address, and browsing patterns)</p>
                <p>• <strong>State and language preferences</strong> (your selected Indian state and preferred language)</p>
                <p>• <strong>Theme customization settings</strong> (Light, Dark, or Colorful theme preferences)</p>
                <p>• <strong>Optional contact information</strong> (if you subscribe to our newsletter or contact us directly)</p>
                <p>• <strong>Account information</strong> (username and encrypted password if you create an account)</p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                2. How We Use Your Information
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We use your information to:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Personalize your news feed</strong> based on your state and language preferences</p>
                <p>• <strong>Improve our website and user experience</strong> through analytics and user feedback</p>
                <p>• <strong>Communicate with you</strong> (if you have subscribed to our updates or contacted us)</p>
                <p>• <strong>Maintain your account</strong> and provide user-specific features</p>
                <p>• <strong>Ensure website security</strong> and prevent unauthorized access</p>
              </div>
              <div className={`${getSectionHeaderClasses().textClass} mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded`}>
                <p className="font-semibold">Our Commitment:</p>
                <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                3. Cookies and Local Storage
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka uses cookies and local storage to remember your preferences and analyze website traffic. This includes:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Essential cookies</strong>: Required for basic website functionality</p>
                <p>• <strong>Preference cookies</strong>: Remember your theme, state, and language settings</p>
                <p>• <strong>Analytics cookies</strong>: Help us understand how users interact with our website</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                You can disable cookies through your browser settings, though this may affect your user experience on our website.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                4. Data Security
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We use industry-standard security measures to protect your information, including:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Encryption</strong> of sensitive data during transmission</p>
                <p>• <strong>Secure password storage</strong> using industry-standard hashing</p>
                <p>• <strong>Regular security audits</strong> and updates to our systems</p>
                <p>• <strong>Limited access</strong> to personal data by authorized personnel only</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4 text-sm italic`}>
                However, please note that no online platform is 100% secure, and we cannot guarantee absolute security of your data.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                5. Third-Party Services
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We may use third-party services to enhance our website functionality, including:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Analytics tools</strong>: To understand website usage patterns (anonymized data)</p>
                <p>• <strong>Content delivery networks</strong>: To improve website performance</p>
                <p>• <strong>Security services</strong>: To protect against spam and malicious activities</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                These services may collect anonymized usage data in accordance with their own privacy policies.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                6. Your Rights
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                You have the following rights regarding your personal information:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Access</strong>: Request information about what data we have collected about you</p>
                <p>• <strong>Update</strong>: Modify or correct your personal information</p>
                <p>• <strong>Delete</strong>: Request deletion of your personal information</p>
                <p>• <strong>Portability</strong>: Request a copy of your data in a structured format</p>
                <p>• <strong>Withdraw consent</strong>: Opt out of data collection where consent-based</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                Contact us at <a href="mailto:support@tadka.com" className="text-blue-600 hover:text-blue-800">support@tadka.com</a> for any data-related requests.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                7. Children's Privacy
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                8. Data Retention
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We retain your personal information only as long as necessary for the purposes outlined in this policy, including:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Account data</strong>: Until you delete your account or request deletion</p>
                <p>• <strong>Preference data</strong>: Until you clear your browser storage or change settings</p>
                <p>• <strong>Analytics data</strong>: Aggregated and anonymized data may be retained for business insights</p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                9. Updates to This Policy
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                Continued use of the website after changes to this policy indicates your acceptance of the updated terms. We will notify users of significant changes through our website.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                10. Contact Us
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
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
              <div className={`${getSectionHeaderClasses().textClass} mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded`}>
                <p className="font-semibold">Privacy Commitment:</p>
                <p>We are committed to protecting your privacy and will respond to your inquiries within 48 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
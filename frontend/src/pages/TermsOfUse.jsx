import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TermsOfUse = () => {
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
              Terms of Use – Tadka
            </h1>
            <p className={`text-sm ${getSectionHeaderClasses().textClass} opacity-75`}>
              Last Updated: January 24, 2025
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <div className="prose prose-gray max-w-none">
            <p className={`text-lg ${getSectionHeaderClasses().textClass} mb-6 leading-relaxed`}>
              Welcome to Tadka ("we", "our", "us"). By accessing or using our website (tadka.com), you agree to be bound by these Terms of Use. Please read them carefully.
            </p>

            {/* Section 1 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                1. Use of the Site
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                You agree to use Tadka only for lawful purposes. You must not use the website to post or transmit any material that is harmful, unlawful, defamatory, obscene, or otherwise objectionable.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                You are prohibited from:
              </p>
              <ul className={`${getSectionHeaderClasses().textClass} ml-6 mt-2 space-y-1`}>
                <li>• Violating any applicable laws or regulations</li>
                <li>• Impersonating any person or entity</li>
                <li>• Distributing spam, malware, or other harmful content</li>
                <li>• Attempting to gain unauthorized access to our systems</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                2. Personalization Features
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka allows users to customize their news experience by selecting:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• <strong>Preferred state</strong> (e.g., Gujarat, Kerala, Tamil Nadu, Andhra Pradesh, Telangana, etc.)</p>
                <p>• <strong>Preferred language</strong> (e.g., English, Hindi, Gujarati, Tamil, Telugu, etc.)</p>
                <p>• <strong>Theme colors</strong> for the interface (Light, Dark, Colorful)</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                These preferences are stored locally on your device to enhance your user experience and provide personalized content relevant to your interests and location.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                3. Intellectual Property
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                All content on Tadka—including text, graphics, logos, images, videos, and software—is the property of Tadka or its content providers and is protected by copyright and intellectual property laws.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                4. Third-Party Links
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka may contain links to third-party websites, including social media platforms, news sources, and other related services. We are not responsible for the content, privacy practices, or terms of use of those websites.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                Your interactions with third-party websites are governed by their respective terms and policies.
              </p>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                5. User Accounts and Registration
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                To access certain features of Tadka, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                You must provide accurate and complete information when creating your account and keep this information updated.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                6. Modifications
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We reserve the right to modify or discontinue any part of the website at any time without notice. We may also update these Terms at our discretion.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                Continued use of the website after any modifications constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                7. Termination
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We may suspend or terminate your access to Tadka if you violate these Terms or engage in conduct that we deem harmful to the website or other users.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                Upon termination, your right to use the website will cease immediately, but these Terms will remain in effect.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                8. Disclaimer
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka strives to provide accurate and up-to-date news, but we do not guarantee the accuracy, completeness, or reliability of the content. The information is provided "as is" without warranties of any kind.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                We are not liable for any damages arising from your use of the website or reliance on the information provided.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                9. Privacy and Data Protection
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                By using Tadka, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                10. Governing Law
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Mumbai, Maharashtra.
              </p>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed`}>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                Contact Us
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If you have any questions about these Terms of Use, please contact us at:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} space-y-2`}>
                <p>Email: <a href="mailto:support@tadka.com" className="text-blue-600 hover:text-blue-800">support@tadka.com</a></p>
                <p>Phone: +91 (888) 123-4567</p>
                <p>Website: <a href="https://tadka.com" className="text-blue-600 hover:text-blue-800">tadka.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
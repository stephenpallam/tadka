import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Disclaimer = () => {
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
              Disclaimer – Tadka
            </h1>
            <p className={`text-sm ${getSectionHeaderClasses().textClass} opacity-75`}>
              Last Updated: January 24, 2025
            </p>
          </div>
        </div>

        {/* Disclaimer Content */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <div className="prose prose-gray max-w-none">
            <p className={`text-lg ${getSectionHeaderClasses().textClass} mb-6 leading-relaxed`}>
              The information contained on Tadka (tadka.com) is provided on an "as is" basis. By using this website, you acknowledge and accept the following disclaimers and limitations.
            </p>

            {/* Section 1 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                1. General Information Disclaimer
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                The content on Tadka is for general informational and entertainment purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• The accuracy, reliability, or completeness of any information</p>
                <p>• The suitability of the information for any particular purpose</p>
                <p>• The availability or accessibility of the website at all times</p>
                <p>• The freedom from errors, viruses, or other harmful components</p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                2. News and Content Accuracy
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka aggregates and presents news content from various sources covering:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2 mb-4`}>
                <p>• <strong>Politics</strong>: Political news, election updates, and government announcements</p>
                <p>• <strong>Movies</strong>: Film reviews, box office reports, and entertainment news</p>
                <p>• <strong>Sports</strong>: Sports news, match results, and athlete updates</p>
                <p>• <strong>Regional Content</strong>: State-specific news and local developments</p>
              </div>
              <div className={`${getSectionHeaderClasses().textClass} p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded`}>
                <p className="font-semibold">Important Note:</p>
                <p>News content may contain errors, omissions, or become outdated. We encourage users to verify important information from original sources before making decisions based on our content.</p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                3. Third-Party Content and Links
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka may contain links to third-party websites, social media platforms, and external news sources. We are not responsible for:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• The content, accuracy, or availability of external websites</p>
                <p>• The privacy practices of third-party sites</p>
                <p>• Any damages resulting from your use of external links</p>
                <p>• The views or opinions expressed on linked websites</p>
                <p>• Any transactions you may conduct with third parties</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                Links to external sites are provided for convenience and do not constitute endorsement of their content or services.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                4. Personalization and Regional Content
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka offers personalized content based on your selected state and language preferences. Please note:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Content personalization is based on general regional interests and may not reflect individual preferences</p>
                <p>• Regional news may have local biases or perspectives</p>
                <p>• Translation services (where applicable) may not be 100% accurate</p>
                <p>• Local news may be subject to regional reporting standards and practices</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                5. User-Generated Content
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If Tadka allows user comments, reviews, or other user-generated content:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• User opinions do not reflect the views of Tadka</p>
                <p>• We do not verify the accuracy of user-submitted information</p>
                <p>• We are not responsible for user interactions or disputes</p>
                <p>• We reserve the right to moderate or remove content at our discretion</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                6. Limitation of Liability
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                To the fullest extent permitted by law, Tadka and its operators, employees, and affiliates shall not be liable for:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Any direct, indirect, incidental, or consequential damages</p>
                <p>• Loss of profits, data, or business opportunities</p>
                <p>• Damages resulting from reliance on information provided</p>
                <p>• Technical failures, interruptions, or security breaches</p>
                <p>• Actions taken based on content viewed on our website</p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                7. Medical, Legal, and Financial Disclaimers
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Content on Tadka should not be construed as:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Medical advice or health recommendations</p>
                <p>• Legal advice or opinions</p>
                <p>• Financial or investment guidance</p>
                <p>• Professional consultation in any field</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                Always consult qualified professionals for specific advice in these areas.
              </p>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                8. Changes and Updates
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We reserve the right to:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Modify or discontinue any aspect of the website without notice</p>
                <p>• Update this disclaimer at any time</p>
                <p>• Change our content, features, or services</p>
                <p>• Implement new policies or procedures</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                Your continued use of the website after changes constitutes acceptance of the updated disclaimer.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                9. Jurisdiction and Governing Law
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                This disclaimer is governed by the laws of India. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                10. Contact Information
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If you have questions about this disclaimer or need clarification on any content, please contact us:
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
              <div className={`${getSectionHeaderClasses().textClass} mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded`}>
                <p className="font-semibold">Use at Your Own Risk:</p>
                <p>By using Tadka, you acknowledge that you do so at your own risk and agree to the limitations outlined in this disclaimer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
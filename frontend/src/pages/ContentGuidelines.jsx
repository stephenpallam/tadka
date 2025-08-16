import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ContentGuidelines = () => {
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
              Content Guidelines – Tadka
            </h1>
            <p className={`text-sm ${getSectionHeaderClasses().textClass} opacity-75`}>
              Last Updated: January 24, 2025
            </p>
          </div>
        </div>

        {/* Content Guidelines */}
        <div className={`${getSectionHeaderClasses().containerClass} rounded-lg shadow-lg p-8 border ${getSectionHeaderClasses().borderClass}`}>
          <div className="prose prose-gray max-w-none">
            <p className={`text-lg ${getSectionHeaderClasses().textClass} mb-6 leading-relaxed`}>
              Welcome to Tadka's Content Guidelines. These guidelines ensure that our platform remains a safe, informative, and respectful space for all users interested in Indian news, politics, movies, and sports. By using our platform or contributing content, you agree to follow these guidelines.
            </p>

            {/* Section 1 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                1. Our Content Standards
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka is committed to providing accurate, balanced, and relevant content across our focus areas:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-3`}>
                <div>
                  <p><strong>Politics:</strong> Fair coverage of political events, elections, and government activities without promoting any particular political party or ideology.</p>
                </div>
                <div>
                  <p><strong>Movies:</strong> Entertainment content including reviews, box office news, celebrity updates, and film industry developments.</p>
                </div>
                <div>
                  <p><strong>Sports:</strong> Coverage of sports events, player updates, match results, and sports-related news.</p>
                </div>
                <div>
                  <p><strong>Regional Content:</strong> State-specific news and developments relevant to different Indian communities.</p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                2. Prohibited Content
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                The following types of content are strictly prohibited on Tadka:
              </p>
              
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Harmful and Illegal Content
                </h3>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Hate speech targeting individuals or groups based on race, religion, caste, gender, or nationality</p>
                  <p>• Content promoting violence, terrorism, or illegal activities</p>
                  <p>• Harassment, bullying, or personal attacks</p>
                  <p>• Threatening or intimidating language</p>
                  <p>• Content that violates Indian laws or regulations</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Inappropriate Content
                </h3>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Sexually explicit material or pornographic content</p>
                  <p>• Graphic violence or disturbing imagery</p>
                  <p>• Content promoting self-harm or suicide</p>
                  <p>• Substance abuse promotion</p>
                  <p>• Gambling or betting promotions</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Misinformation and Fraud
                </h3>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Deliberately false or misleading information</p>
                  <p>• Fake news or fabricated stories</p>
                  <p>• Conspiracy theories without factual basis</p>
                  <p>• Fraudulent schemes or scams</p>
                  <p>• Impersonation of public figures or organizations</p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                3. User-Generated Content Rules
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If you contribute content through comments, reviews, or submissions, please follow these guidelines:
              </p>
              
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Respectful Communication
                </h3>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Use respectful language in all interactions</p>
                  <p>• Avoid personal attacks or offensive language</p>
                  <p>• Respect diverse opinions and viewpoints</p>
                  <p>• Engage in constructive discussions</p>
                  <p>• Be mindful of cultural sensitivities</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${getSectionHeaderClasses().textClass} mb-3`}>
                  Quality and Relevance
                </h3>
                <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-1`}>
                  <p>• Keep comments relevant to the topic</p>
                  <p>• Provide constructive feedback and opinions</p>
                  <p>• Avoid repetitive or spam-like content</p>
                  <p>• Use proper grammar and spelling when possible</p>
                  <p>• Share credible sources when making claims</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                4. Political Content Guidelines
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Given the sensitive nature of political content, we maintain strict standards:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Present multiple perspectives on political issues</p>
                <p>• Avoid promoting specific political parties or candidates</p>
                <p>• Report factual information from credible sources</p>
                <p>• Distinguish between news reporting and opinion pieces</p>
                <p>• Respect the democratic process and electoral guidelines</p>
                <p>• Avoid inflammatory language that could incite violence</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                5. Regional and Cultural Sensitivity
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                Tadka serves diverse Indian communities with different languages, cultures, and traditions:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Respect regional differences and local customs</p>
                <p>• Avoid stereotyping communities or states</p>
                <p>• Present regional news with appropriate context</p>
                <p>• Use inclusive language that welcomes all users</p>
                <p>• Acknowledge cultural festivals and events respectfully</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                6. Copyright and Intellectual Property
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                We respect intellectual property rights and expect users to do the same:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Only share content you have rights to use</p>
                <p>• Provide proper attribution for external content</p>
                <p>• Respect copyright laws and fair use guidelines</p>
                <p>• Report any copyright violations you encounter</p>
                <p>• Avoid sharing pirated or unauthorized content</p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                7. Enforcement and Moderation
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                To maintain content quality and community standards, we:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Review reported content promptly</p>
                <p>• Remove content that violates these guidelines</p>
                <p>• May suspend or ban users who repeatedly violate rules</p>
                <p>• Use both automated systems and human moderation</p>
                <p>• Provide appeals process for content removal decisions</p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                8. Reporting Violations
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                If you encounter content that violates these guidelines:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Report the content using our reporting tools</p>
                <p>• Provide specific details about the violation</p>
                <p>• Include relevant screenshots or links</p>
                <p>• Avoid engaging with or responding to violating content</p>
                <p>• Contact our support team for urgent matters</p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                9. Updates to Guidelines
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                These Content Guidelines may be updated periodically to:
              </p>
              <div className={`${getSectionHeaderClasses().textClass} ml-6 space-y-2`}>
                <p>• Address new types of content or behavior</p>
                <p>• Comply with changing legal requirements</p>
                <p>• Improve user experience and safety</p>
                <p>• Reflect community feedback and needs</p>
              </div>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mt-4`}>
                We will notify users of significant changes through our website.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className={`text-xl font-semibold ${getSectionHeaderClasses().textClass} mb-4`}>
                10. Contact and Support
              </h2>
              <p className={`${getSectionHeaderClasses().textClass} leading-relaxed mb-4`}>
                For questions about these Content Guidelines or to report violations, contact us:
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
              <div className={`${getSectionHeaderClasses().textClass} mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded`}>
                <p className="font-semibold">Community Commitment:</p>
                <p>Together, we can maintain Tadka as a platform that celebrates Indian diversity while promoting respectful and informative discourse.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGuidelines;
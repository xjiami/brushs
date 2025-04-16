'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      <div className="prose prose-blue max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section className="mb-10">
          <h2>Overview</h2>
          <p>
            This Privacy Policy describes how we collect, use, process, and disclose your information, including personal data, relating to your access to and use of the Procreate Brush website ("Website").
          </p>
          <p>
            We are committed to protecting your privacy rights. Please read this Privacy Policy carefully. By accessing or using our Website, you agree to the data practices described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-10">
          <h2>Information We Collect</h2>
          <p>
            <strong>Personal Information:</strong> We may collect your name, email address, username, and payment information when you register for an account, purchase products, or contact us.
          </p>
          <p>
            <strong>Usage Data:</strong> We automatically collect information about how you access and use the Website, including your IP address, device information, browser type, referring URL, and the pages you view.
          </p>
          <p>
            <strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity on the Website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-10">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li>To provide, maintain, and improve our Website</li>
            <li>To process your subscriptions and purchases</li>
            <li>To send information related to your account</li>
            <li>To provide customer support</li>
            <li>To monitor usage patterns on the Website</li>
            <li>To detect, prevent, and address technical issues</li>
            <li>To provide personalized experiences based on your preferences</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2>Information Sharing and Disclosure</h2>
          <p>We may share your personal information in the following situations:</p>
          <ul>
            <li>
              <strong>Service Providers:</strong> We may share your information with third-party service providers who help us provide services (such as payment processors, hosting services).
            </li>
            <li>
              <strong>Compliance and Safety:</strong> When required by law, in response to legal process, to protect our rights, or to ensure public or user safety.
            </li>
            <li>
              <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.
            </li>
          </ul>
          <p>
            We will not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-10">
          <h2>Data Security</h2>
          <p>
            We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of Internet transmission or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-10">
          <h2>Your Data Rights</h2>
          <p>Depending on applicable laws in your region, you may have the right to:</p>
          <ul>
            <li>Access personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to our processing of your data</li>
            <li>Request restriction of processing your data</li>
            <li>Request portability of your data</li>
          </ul>
          <p>
            To exercise these rights, please contact us through the Website's contact page.
          </p>
        </section>

        <section className="mb-10">
          <h2>Children's Privacy</h2>
          <p>
            Our Website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected personal information from a child, please contact us, and we will take immediate steps to delete that information.
          </p>
        </section>

        <section className="mb-10">
          <h2>Third-Party Links</h2>
          <p>
            Our Website may contain links to third-party websites. We are not responsible for the content or privacy policies of these websites. We recommend that you read the privacy policies of these websites.
          </p>
        </section>

        <section className="mb-10">
          <h2>Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We recommend that you review this Privacy Policy regularly to be aware of any changes.
          </p>
        </section>

        <section className="mb-10">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or suggestions about this Privacy Policy, please contact us at:
          </p>
          <p>
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact Page
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
} 